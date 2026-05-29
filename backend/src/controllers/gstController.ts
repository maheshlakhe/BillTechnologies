import { Request, Response } from 'express';
import { GstService, STATE_CODES } from '../services/gstService';

const gstService = new GstService();

export const generateGstr1 = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const userId = (req as any).user?.id;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and Year are required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await gstService.generateGstr1Json(
      userId,
      parseInt(month as string),
      parseInt(year as string)
    );

    res.json(data);
  } catch (error: any) {
    console.error('GSTR-1 Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const generateGstr2 = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const userId = (req as any).user?.id;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and Year are required' });
    }

    if (!userId) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const data = await gstService.generateGstr2Json(
      userId,
      parseInt(month as string),
      parseInt(year as string)
    );

    res.json(data);
  } catch (error: any) {
    console.error('GSTR-2 Error:', error);
    res.status(500).json({ error: error.message });
  }
};

export const getGstr3bSummary = async (req: Request, res: Response) => {
  try {
    const { month, year } = req.query;
    const userId = (req as any).user?.id;

    if (!month || !year) {
      return res.status(400).json({ error: 'Month and Year are required' });
    }

    const data = await gstService.getGstr3bSummary(
      userId!,
      parseInt(month as string),
      parseInt(year as string)
    );

    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const searchHsn = async (req: Request, res: Response) => {
  try {
    const { q } = req.query;
    if (!q) return res.json([]);
    const data = await gstService.searchHsn(q as string);
    res.json(data);
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
};

export const getGstConstants = async (req: Request, res: Response) => {
    res.json({
        stateCodes: STATE_CODES,
    });
};
