import express from 'express';
import { protect } from '../middleware/auth.js';
import {
  scheduleMeeting,
  getScheduledMeetings,
  updateScheduledMeetingStatus,
  deleteScheduledMeeting,
  getTopics,
  resolveTopic
} from '../controllers/scheduledMeetingController.js';

const router = express.Router();

// Scheduled meetings
router.post('/', protect, scheduleMeeting);
router.get('/', protect, getScheduledMeetings);
router.patch('/:id/status', protect, updateScheduledMeetingStatus);
router.delete('/:id', protect, deleteScheduledMeeting);

// Topics
router.get('/topics', protect, getTopics);
router.patch('/topics/:id/resolve', protect, resolveTopic);

export default router;
