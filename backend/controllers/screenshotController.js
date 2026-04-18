import { analyzeScreenshot } from '../services/aiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const analyzeScreenshotHandler = asyncHandler(async (req, res) => {
  const { image, context } = req.body;

  if (!image) {
    return res.status(400).json({ error: 'Image (base64) is required' });
  }

  const result = await analyzeScreenshot(image, context || '');
  return res.status(200).json(result);
});
