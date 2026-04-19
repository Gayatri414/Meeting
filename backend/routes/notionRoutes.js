import express from 'express';

import { exportMeetingToNotion } from '../controllers/notionController.js';

const router = express.Router();

router.post('/export/:meetingId', exportMeetingToNotion);

export default router;
