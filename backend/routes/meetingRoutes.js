import express from 'express';
import multer from 'multer';

import {
  analyzeMeeting,
  getAllMeetings,
  getMeetingById,
  deleteMeeting,
  togglePin,
  updateTaskStatus,
  transcribeAudio,
  exportPDF,
  syncTasks
} from '../controllers/meetingController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const router = express.Router();

router.post('/transcribe-audio', upload.single('audio'), transcribeAudio);
router.post('/analyze', analyzeMeeting);
router.get('/all', getAllMeetings);
router.get('/:id/export', exportPDF);
router.get('/:id', getMeetingById);
router.delete('/:id', deleteMeeting);
router.patch('/:id/pin', togglePin);
router.patch('/:meetingId/tasks/:taskIndex', updateTaskStatus);
router.post('/:meetingId/sync', syncTasks);

export default router;
