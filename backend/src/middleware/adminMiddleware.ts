import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/**
 * requireAdmin — allows ADMIN role (legacy super-admin)
 * Attaches adminCollegeName to req for downstream queries.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, collegeName: true, department: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    (req as any).adminCollegeName = user.collegeName;
    (req as any).adminDepartment  = user.department;
    next();
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

/**
 * requireStaff — allows ADMIN, HOD, or TEACHER
 * Attaches to req:
 *   staffRole        — the user's role string
 *   staffCollegeName — college name
 *   staffDepartment  — department (HOD/TEACHER see only their dept)
 *   staffClass       — for TEACHER: the single class they manage
 */
export const requireStaff = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  if (!userId) return res.status(401).json({ error: 'Unauthorized' });

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, collegeName: true, department: true, assignedClass: true }
    });

    const allowed = ['ADMIN', 'HOD', 'TEACHER'];
    if (!user || !allowed.includes(user.role)) {
      return res.status(403).json({ error: 'Staff access required' });
    }

    (req as any).staffRole        = user.role;
    (req as any).staffCollegeName = user.collegeName;
    (req as any).staffDepartment  = user.department;
    (req as any).staffClass       = user.assignedClass; // null for ADMIN/HOD
    // Legacy compat — existing adminController reads adminCollegeName
    (req as any).adminCollegeName = user.collegeName;
    (req as any).adminDepartment  = user.department;
    next();
  } catch {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
