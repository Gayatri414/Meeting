import ScheduledMeeting from '../models/ScheduledMeeting.js';
import Topic from '../models/Topic.js';
import asyncHandler from '../middleware/asyncHandler.js';
import { parseNaturalDate, extractAssignee, extractTopics } from '../utils/dateParser.js';
import { analyzeScreenshot } from '../services/aiService.js';

// ─── Upsert topics helper ─────────────────────────────────────────────────────
const upsertTopics = async (topicTitles, meetingId, userId) => {
  const results = [];
  for (const rawTitle of topicTitles) {
    const title = rawTitle.trim();
    if (!title || title.length < 3) continue;

    // Case-insensitive match
    let topic = await Topic.findOne({
      userId,
      title: { $regex: new RegExp(`^${title}$`, 'i') }
    });

    if (topic) {
      topic.discussedCount += 1;
      topic.lastDiscussedAt = new Date();
      if (!topic.meetings.includes(meetingId)) topic.meetings.push(meetingId);
      // Flag as repeated unresolved if discussed > 2 times and still open
      if (topic.discussedCount > 2 && topic.status === 'open') {
        topic.isRepeatedUnresolved = true;
        topic.suggestedAction = 'Create a dedicated task or escalate this issue';
      }
      await topic.save();
    } else {
      topic = await Topic.create({
        userId,
        title,
        status: 'open',
        discussedCount: 1,
        lastDiscussedAt: new Date(),
        meetings: meetingId ? [meetingId] : [],
        isRepeatedUnresolved: false
      });
    }
    results.push(topic);
  }
  return results;
};

// ─── Schedule a meeting ───────────────────────────────────────────────────────
export const scheduleMeeting = asyncHandler(async (req, res) => {
  const { text, screenshot, meetingLink, manualDate } = req.body;

  if (!text && !screenshot) {
    return res.status(400).json({ error: 'text or screenshot is required' });
  }

  let sourceText = text || '';

  // If screenshot provided, extract text from it via AI vision
  if (screenshot && !text) {
    try {
      const { analysis } = await analyzeScreenshot(screenshot, 'Extract all text, dates, times, and meeting details from this screenshot.');
      sourceText = analysis;
    } catch {}
  }

  // Parse date — use manualDate if provided, else parse from text
  let scheduledDate = manualDate ? new Date(manualDate) : parseNaturalDate(sourceText);
  if (!scheduledDate || isNaN(scheduledDate.getTime())) {
    // Default to tomorrow 9am if nothing found
    scheduledDate = new Date();
    scheduledDate.setDate(scheduledDate.getDate() + 1);
    scheduledDate.setHours(9, 0, 0, 0);
  }

  const assignedTo = extractAssignee(sourceText);
  const topicTitles = extractTopics(sourceText);

  // Build title from first topic or text snippet
  const title = topicTitles[0]
    ? `Meeting: ${topicTitles.slice(0, 2).join(' & ')}`
    : sourceText.substring(0, 60) || 'Scheduled Meeting';

  const meeting = await ScheduledMeeting.create({
    userId: req.user?.id,
    title,
    description: sourceText,
    assignedTo,
    scheduledDate,
    meetingLink: meetingLink || '',
    topics: topicTitles,
    sourceText,
    screenshot: screenshot || '',
    status: 'upcoming'
  });

  // Upsert topics in Topic collection
  await upsertTopics(topicTitles, meeting._id, req.user?.id);

  res.status(201).json({ meeting, topics: topicTitles, scheduledDate, assignedTo });
});

// ─── Get all scheduled meetings ───────────────────────────────────────────────
export const getScheduledMeetings = asyncHandler(async (req, res) => {
  const { month, year } = req.query;
  const query = { userId: req.user?.id };

  if (month !== undefined && year !== undefined) {
    const start = new Date(parseInt(year), parseInt(month), 1);
    const end = new Date(parseInt(year), parseInt(month) + 1, 0, 23, 59, 59);
    query.scheduledDate = { $gte: start, $lte: end };
  }

  const meetings = await ScheduledMeeting.find(query).sort({ scheduledDate: 1 });
  res.status(200).json(meetings);
});

// ─── Update status ────────────────────────────────────────────────────────────
export const updateScheduledMeetingStatus = asyncHandler(async (req, res) => {
  const { status } = req.body;
  const meeting = await ScheduledMeeting.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { status },
    { new: true }
  );
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  res.status(200).json(meeting);
});

// ─── Delete scheduled meeting ─────────────────────────────────────────────────
export const deleteScheduledMeeting = asyncHandler(async (req, res) => {
  await ScheduledMeeting.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
  res.status(200).json({ message: 'Deleted' });
});

// ─── Get all topics ───────────────────────────────────────────────────────────
export const getTopics = asyncHandler(async (req, res) => {
  const topics = await Topic.find({ userId: req.user?.id }).sort({ discussedCount: -1, lastDiscussedAt: -1 });
  res.status(200).json(topics);
});

// ─── Resolve a topic ─────────────────────────────────────────────────────────
export const resolveTopic = asyncHandler(async (req, res) => {
  const topic = await Topic.findOneAndUpdate(
    { _id: req.params.id, userId: req.user?.id },
    { status: 'resolved', isRepeatedUnresolved: false },
    { new: true }
  );
  if (!topic) return res.status(404).json({ error: 'Topic not found' });
  res.status(200).json(topic);
});
