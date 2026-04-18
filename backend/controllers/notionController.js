import Meeting from '../models/Meeting.js';
import User from '../models/User.js';
import { exportToNotion } from '../services/aiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const exportMeetingToNotion = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { notionToken, databaseId } = req.body;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  // Use user's stored token if not provided
  let token = notionToken;
  let dbId = databaseId;

  if (!token && req.user?.id) {
    const user = await User.findById(req.user.id);
    token = user?.notionToken;
    dbId = dbId || user?.notionDbId;
  }

  if (!token) return res.status(400).json({ error: 'Notion token is required' });
  if (!dbId) return res.status(400).json({ error: 'Notion database ID is required' });

  const result = await exportToNotion(token, dbId, meeting);
  res.status(200).json(result);
});
