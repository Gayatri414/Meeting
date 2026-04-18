import express from 'express';
import { protect } from '../middleware/auth.js';
import { analyzeScreenshotHandler } from '../controllers/screenshotController.js';

const router = express.Router();
router.post('/analyze', protect, analyzeScreenshotHandler);
export default router;
