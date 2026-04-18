import Meeting from '../models/Meeting.js';
import Topic from '../models/Topic.js';
import { analyzeTranscript, transcribeAudio as transcribeAudioAI, syncToJira, syncToLinear, exportToNotion } from '../services/aiService.js';
import asyncHandler from '../middleware/asyncHandler.js';

export const analyzeMeeting = asyncHandler(async (req, res) => {
  const { transcript, meetingLink, meetingType, duration } = req.body;

  if (!transcript || !transcript.trim()) {
    return res.status(400).json({ error: 'Transcript is required' });
  }

  const analysis = await analyzeTranscript(transcript);

  // Normalize tasks: support both person and user fields
  const tasks = (analysis.tasks || []).map(t => ({
    person: t.person || t.user || 'Unassigned',
    user: t.person || t.user || 'Unassigned',
    task: t.task || '',
    priority: t.priority || 'Medium',
    deadline: t.dueDate || t.deadline || 'unspecified',
    dueDate: t.dueDate || t.deadline || 'unspecified',
    status: 'pending',
    completed: false,
    type: t.type || 'other',
    syncTarget: t.syncTarget || 'none',
    syncReason: t.syncReason || ''
  }));

  // Auto-generate title from summary
  const title = analysis.summary
    ? analysis.summary.split('.')[0].substring(0, 60)
    : `Meeting ${new Date().toLocaleDateString()}`;

  const meeting = await Meeting.create({
    userId: req.user?.id,
    title,
    meetingLink: meetingLink || '',
    meetingType: meetingType || 'other',
    transcript,
    summary: analysis.summary || '',
    tasks,
    followUpMeetings: analysis.followUpMeetings || [],
    decisions: analysis.decisions || [],
    questions: analysis.questions || [],
    unresolved_topics: analysis.unresolved_topics || [],
    suggested_followups: analysis.suggested_followups || [],
    new_meetings: analysis.new_meetings || [],
    risks: analysis.risks || [],
    duration: duration || 0
  });

  res.status(201).json(meeting);

  // Async: upsert unresolved topics into Topic collection (fire-and-forget)
  if ((analysis.unresolved_topics || []).length > 0 && req.user?.id) {
    const userId = req.user.id;
    const topicTitles = analysis.unresolved_topics;
    setImmediate(async () => {
      for (const rawTitle of topicTitles) {
        const title = rawTitle.trim();
        if (!title) continue;
        let topic = await Topic.findOne({ userId, title: { $regex: new RegExp(`^${title}$`, 'i') } });
        if (topic) {
          topic.discussedCount += 1;
          topic.lastDiscussedAt = new Date();
          if (!topic.meetings.includes(meeting._id)) topic.meetings.push(meeting._id);
          if (topic.discussedCount > 2 && topic.status === 'open') {
            topic.isRepeatedUnresolved = true;
            topic.suggestedAction = 'Create a dedicated task or escalate this issue';
          }
          await topic.save();
        } else {
          await Topic.create({ userId, title, meetings: [meeting._id] });
        }
      }
    });
  }
});

export const getAllMeetings = asyncHandler(async (req, res) => {
  const { page = 1, limit = 20, search = '', pinned } = req.query;
  const skip = (parseInt(page) - 1) * parseInt(limit);

  const query = {};
  if (req.user?.id) query.userId = req.user.id;
  if (pinned === 'true') query.pinned = true;
  if (search) {
    query.$or = [
      { summary: { $regex: search, $options: 'i' } },
      { transcript: { $regex: search, $options: 'i' } },
      { title: { $regex: search, $options: 'i' } }
    ];
  }

  const [meetings, total] = await Promise.all([
    Meeting.find(query).sort({ pinned: -1, createdAt: -1 }).skip(skip).limit(parseInt(limit)),
    Meeting.countDocuments(query)
  ]);

  res.status(200).json({ meetings, total, page: parseInt(page), pages: Math.ceil(total / parseInt(limit)) });
});

export const getMeetingById = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  res.status(200).json(meeting);
});

export const deleteMeeting = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findOneAndDelete({ _id: req.params.id, userId: req.user?.id });
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  res.status(200).json({ message: 'Meeting deleted' });
});

export const togglePin = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  meeting.pinned = !meeting.pinned;
  await meeting.save();
  res.status(200).json(meeting);
});

export const updateTaskStatus = asyncHandler(async (req, res) => {
  const { meetingId, taskIndex } = req.params;
  const { status, completed } = req.body;

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });
  if (!meeting.tasks[taskIndex]) return res.status(404).json({ error: 'Task not found' });

  meeting.tasks[taskIndex].status = status || (completed ? 'done' : 'pending');
  meeting.tasks[taskIndex].completed = completed ?? (status === 'done');
  await meeting.save();

  res.status(200).json(meeting);
});

export const transcribeAudio = asyncHandler(async (req, res) => {
  if (!req.file?.buffer) {
    return res.status(400).json({ error: 'Audio file is required (field name: audio)' });
  }

  const mimeType = req.file.mimetype || 'audio/wav';
  const { transcript } = await transcribeAudioAI(req.file.buffer, mimeType);
  return res.status(200).json({ transcript });
});

export const syncTasks = asyncHandler(async (req, res) => {
  const { meetingId } = req.params;
  const { target, taskIndices, credentials } = req.body;
  // target: 'jira' | 'linear' | 'notion'
  // taskIndices: array of task indexes to sync (or 'all')
  // credentials: { host, email, token, projectKey } for jira; { apiKey, teamId } for linear; { notionToken, databaseId } for notion

  const meeting = await Meeting.findById(meetingId);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  const tasksToSync = taskIndices === 'all'
    ? meeting.tasks
    : meeting.tasks.filter((_, i) => taskIndices.includes(i));

  if (!tasksToSync.length) return res.status(400).json({ error: 'No tasks to sync' });

  let results = [];

  if (target === 'jira') {
    const { host, email, token, projectKey } = credentials;
    if (!host || !email || !token || !projectKey) return res.status(400).json({ error: 'Jira credentials required: host, email, token, projectKey' });
    results = await syncToJira({ host, email, token, projectKey, tasks: tasksToSync });
  } else if (target === 'linear') {
    const { apiKey, teamId } = credentials;
    if (!apiKey || !teamId) return res.status(400).json({ error: 'Linear credentials required: apiKey, teamId' });
    results = await syncToLinear({ apiKey, teamId, tasks: tasksToSync });
  } else if (target === 'notion') {
    const { notionToken, databaseId } = credentials;
    if (!notionToken || !databaseId) return res.status(400).json({ error: 'Notion credentials required: notionToken, databaseId' });
    const notionResult = await exportToNotion(notionToken, databaseId, { ...meeting.toObject(), tasks: tasksToSync });
    results = tasksToSync.map(t => ({ task: t.task, success: true, url: notionResult.url }));
  } else {
    return res.status(400).json({ error: 'Invalid target. Use: jira, linear, notion' });
  }

  // Mark synced tasks in DB
  const successTasks = results.filter(r => r.success).map(r => r.task);
  meeting.tasks.forEach((t, i) => {
    if (successTasks.includes(t.task)) {
      meeting.tasks[i].syncedAt = new Date();
      const matched = results.find(r => r.task === t.task);
      if (matched?.url) meeting.tasks[i].syncUrl = matched.url;
    }
  });
  meeting.markModified('tasks');
  await meeting.save();

  res.status(200).json({ results, synced: successTasks.length });
});

export const exportPDF = asyncHandler(async (req, res) => {
  const meeting = await Meeting.findById(req.params.id);
  if (!meeting) return res.status(404).json({ error: 'Meeting not found' });

  // Return structured data for PDF generation on frontend
  res.status(200).json({
    title: meeting.title,
    summary: meeting.summary,
    tasks: meeting.tasks,
    decisions: meeting.decisions,
    unresolved_topics: meeting.unresolved_topics,
    suggested_followups: meeting.suggested_followups,
    createdAt: meeting.createdAt
  });
});
