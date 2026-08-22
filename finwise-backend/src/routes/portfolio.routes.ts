import { Router } from 'express';
import { authenticate } from '../middleware/auth.js';
import { validateBody } from '../middleware/validate.js';
import {
  getPortfolio,
  addAsset,
  deleteAsset,
  createAssetSchema,
} from '../controllers/portfolio.controller.js';

const router = Router();

router.get('/', authenticate, getPortfolio);
router.post('/asset', authenticate, validateBody(createAssetSchema), addAsset);
router.delete('/asset/:id', authenticate, deleteAsset);

export default router;
