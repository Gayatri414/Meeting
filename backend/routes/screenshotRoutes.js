import express from 'express';

import { analyzeScreenshotHandler } from '../controllers/screenshotController.js';

const router = express.Router();
router.post('/analyze', analyzeScreenshotHandler);
export default router;
