import { Response } from 'express';
import { AuthRequest } from '../types';
import * as userService from '../services/userService';

export const exportData = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const format = (req.query.format as string) === 'csv' ? 'csv' : 'json';
    
    const { contentType, filename, content } = await userService.exportUserData(userId, format);

    res.setHeader('Content-Type', contentType);
    res.setHeader('Content-Disposition', `attachment; filename=${filename}`);
    res.send(content);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
