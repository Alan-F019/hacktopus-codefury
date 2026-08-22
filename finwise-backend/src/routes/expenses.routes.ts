import { Router } from 'express';
import multer from 'multer';
import { authenticate } from '../middleware/auth.js';
import { getExpenses, uploadExpenseCSV } from '../controllers/expenses.controller.js';

const router = Router();
const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 5 * 1024 * 1024 } });

router.get('/', authenticate, getExpenses);
router.post('/upload', authenticate, upload.single('file'), uploadExpenseCSV);

export default router;
