import { Response } from 'express';
import { AuthRequest } from '../types';
import * as aiService from '../services/aiService';

export const generateBullets = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { id } = req.params;
    const bullets = await aiService.generateBullets(userId, id);
    res.json({ bullets });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const extractUrl = async (req: AuthRequest, res: Response) => {
  try {
    const { url } = req.body;
    if (!url) {
      return res.status(400).json({ error: 'URL is required' });
    }
    const data = await aiService.extractUrl(url);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const analyzeSkillGap = async (req: AuthRequest, res: Response) => {
  try {
    const userId = req.userId!;
    const { jobDescription } = req.body;
    if (!jobDescription) {
      return res.status(400).json({ error: 'Job description is required' });
    }
    const analysis = await aiService.analyzeSkillGap(userId, jobDescription);
    res.json(analysis);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};
