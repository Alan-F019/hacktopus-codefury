import { Request, Response, NextFunction } from 'express';
import { z } from 'zod';
import { Asset } from '../models/Asset.js';
import { User } from '../models/User.js';
import { calculatePortfolioData } from '../services/portfolio.service.js';

export const createAssetSchema = z.object({
  name: z.string().min(1, 'Asset name is required'),
  type: z.enum(['Stock', 'ETF', 'Mutual Fund', 'Gold', 'Cash', 'Crypto', 'Real Estate']),
  amount: z.number().min(0, 'Asset amount must be non-negative'),
  ticker: z.string().nullable().optional(),
  returnsYTD: z.number().optional(),
});

export const getPortfolio = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;

    const [user, assets] = await Promise.all([
      User.findOne({ firebaseUid: userId }),
      Asset.find({ userId }),
    ]);

    const riskLevel = user?.riskLevel || 'Aggressive';
    const recommendedAllocation = user?.recommendedAllocation || {
      Stock: 40,
      ETF: 30,
      'Mutual Fund': 15,
      Gold: 5,
      Cash: 10,
    };

    const portfolioData = calculatePortfolioData(assets, riskLevel, recommendedAllocation);

    res.status(200).json(portfolioData);
  } catch (error) {
    next(error);
  }
};

export const addAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { name, type, amount, ticker, returnsYTD } = req.body;

    const defaultReturns = returnsYTD ?? Number((Math.random() * 12 + 4).toFixed(1));

    const asset = await Asset.create({
      userId,
      name,
      type,
      amount,
      ticker: ticker || null,
      returnsYTD: defaultReturns,
    });

    res.status(201).json({
      id: asset._id.toString(),
      name: asset.name,
      type: asset.type,
      amount: asset.amount,
      ticker: asset.ticker || null,
      returnsYTD: asset.returnsYTD,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteAsset = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const userId = req.userId!;
    const { id } = req.params;

    const asset = await Asset.findOneAndDelete({
      _id: id,
      userId,
    });

    if (!asset) {
      res.status(404).json({
        error: 'ASSET_NOT_FOUND',
        message: 'Asset not found or not owned by user.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Asset deleted successfully.',
    });
  } catch (error) {
    next(error);
  }
};
