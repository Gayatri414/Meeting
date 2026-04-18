import express from 'express';
import { protect } from '../middleware/auth.js';
import { exportMeetingToNotion } from '../controllers/notionController.js';

const router = express.Router();

router.post('/export/:meetingId', protect, exportMeetingToNotion);

export default router;
