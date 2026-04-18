import express from 'express';
import multer from 'multer';
import jwt from 'jsonwebtoken';
import { protect } from '../middleware/auth.js';
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
router.post('/analyze', protect, analyzeMeeting);
router.get('/all', protect, getAllMeetings);
router.get('/:id/export', protect, exportPDF);
router.get('/:id', protect, getMeetingById);
router.delete('/:id', protect, deleteMeeting);
router.patch('/:id/pin', protect, togglePin);
router.patch('/:meetingId/tasks/:taskIndex', protect, updateTaskStatus);
router.post('/:meetingId/sync', protect, syncTasks);

export default router;
