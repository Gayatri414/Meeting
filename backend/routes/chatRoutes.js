import express from 'express';
import { protect } from '../middleware/auth.js';
import { chatHandler } from '../controllers/chatController.js';

const router = express.Router();
router.post('/', protect, chatHandler);
export default router;
