import { chat } from '../services/aiService.js';
import Meeting from '../models/Meeting.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const chatHandler = asyncHandler(async (req, res) => {
  const { message, history = [], meetingId } = req.body;
  console.log(`[CHAT] Request from user ${req.user?.id}: "${message}"`);

  if (!message || typeof message !== 'string') {
    return res.status(400).json({ error: 'Message is required' });
  }

  let meetingContext = '';
  if (meetingId) {
    try {
      const meeting = await Meeting.findById(meetingId);
      if (meeting) {
        console.log(`[CHAT] Providing context for meeting: ${meeting.title}`);
        meetingContext = `
Meeting Summary: ${meeting.summary}
Tasks: ${meeting.tasks.map(t => `${t.task} (${t.person || t.user})`).join(', ')}
Decisions: ${meeting.decisions.join(', ')}
Unresolved Topics: ${(meeting.unresolved_topics || []).join(', ')}
        `.trim();
      }
    } catch (err) {
      console.error('[CHAT] Error fetching meeting context:', err.message);
    }
  }

  const reply = await chat(message, history, meetingContext);
  console.log('[CHAT] AI Reply generated successfully');
  return res.status(200).json({ reply });
});
