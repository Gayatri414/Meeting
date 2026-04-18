import express from 'express';
import multer from 'multer';
import {
  analyzeMeeting,
  getAllMeetings,
  getMeetingById,
  transcribeAudio
} from '../controllers/meetingController.js';

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 25 * 1024 * 1024 }
});

const router = express.Router();

router.post('/transcribe-audio', upload.single('audio'), transcribeAudio);
router.post('/analyze', analyzeMeeting);
router.get('/all', getAllMeetings);
router.get('/:id', getMeetingById);

export default router;
