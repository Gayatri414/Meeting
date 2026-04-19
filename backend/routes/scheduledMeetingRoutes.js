import express from 'express';

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
router.post('/', scheduleMeeting);
router.get('/', getScheduledMeetings);
router.patch('/:id/status', updateScheduledMeetingStatus);
router.delete('/:id', deleteScheduledMeeting);

// Topics
router.get('/topics', getTopics);
router.patch('/topics/:id/resolve', resolveTopic);

export default router;
