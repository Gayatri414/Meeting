import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  person: { type: String, default: 'Unassigned' },
  user: { type: String, default: 'Unassigned' },
  task: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  deadline: { type: String, default: 'unspecified' },
  dueDate: { type: String },
  status: { type: String, enum: ['pending', 'done'], default: 'pending' },
  completed: { type: Boolean, default: false },
  type: { type: String, default: 'other' },          // bug|feature|research|design|devops|meeting|other
  syncTarget: { type: String, default: 'none' },     // jira|linear|notion|none
  syncReason: { type: String, default: '' },
  syncedAt: { type: Date },
  syncUrl: { type: String, default: '' }
});

const FollowUpMeetingSchema = new mongoose.Schema({
  title: { type: String },
  reason: { type: String },
  suggestedDate: { type: String },
  participants: [{ type: String }],
  agenda: [{ type: String }]
});

const MeetingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, default: '' },
    meetingLink: { type: String, default: '' },
    meetingType: { type: String, enum: ['google-meet', 'zoom', 'teams', 'other'], default: 'other' },
    transcript: { type: String, required: true },
    summary: { type: String, required: true },
    tasks: [TaskSchema],
    followUpMeetings: [FollowUpMeetingSchema],
    decisions: [{ type: String }],
    questions: [{ type: String }],
    unresolved_topics: [{ type: String }],
    suggested_followups: [{ type: String }],
    new_meetings: [{ type: String }],
    risks: [{ type: String }],
    pinned: { type: Boolean, default: false },
    duration: { type: Number, default: 0 }, // in seconds
    screenshots: [{ type: String }] // base64 or URLs
  },
  { timestamps: true }
);

// Indexes for fast queries
MeetingSchema.index({ createdAt: -1 });
MeetingSchema.index({ userId: 1, createdAt: -1 });
MeetingSchema.index({ summary: 'text', transcript: 'text' });

const Meeting = mongoose.model('Meeting', MeetingSchema);
export default Meeting;
