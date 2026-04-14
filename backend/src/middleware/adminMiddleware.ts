import { Request, Response, NextFunction } from 'express';
import prisma from '../lib/prisma';

/**
 * Middleware that ensures the authenticated user has ADMIN role.
 * Must be used after the `authenticate` middleware.
 */
export const requireAdmin = async (req: Request, res: Response, next: NextFunction) => {
  const userId = (req as any).userId;
  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true, collegeName: true }
    });

    if (!user || user.role !== 'ADMIN') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Attach college name for downstream queries
    (req as any).adminCollegeName = user.collegeName;
    next();
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};
