import { chat } from '../services/aiService.js';
import Meeting from '../models/Meeting.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const chatHandler = asyncHandler(async (req, res) => {
  const { message, history = [], meetingId } = req.body;

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  let meetingContext = '';
  if (meetingId) {
    try {
      const meeting = await Meeting.findById(meetingId);
      if (meeting) {
        meetingContext = `
Meeting Summary: ${meeting.summary}
Tasks: ${meeting.tasks.map(t => `${t.task} (${t.person || t.user})`).join(', ')}
Decisions: ${meeting.decisions.join(', ')}
Unresolved Topics: ${(meeting.unresolved_topics || []).join(', ')}
        `.trim();
      }
    } catch {}
  }

  const reply = await chat(message, history, meetingContext);
  return res.status(200).json({ reply });
});
