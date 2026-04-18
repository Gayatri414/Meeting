import mongoose from 'mongoose';

const ScheduledMeetingSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true },
    description: { type: String, default: '' },
    assignedTo: { type: String, default: '' },
    scheduledDate: { type: Date, required: true, index: true },
    meetingLink: { type: String, default: '' },
    topics: [{ type: String }],
    sourceText: { type: String, default: '' }, // original text that triggered this
    screenshot: { type: String, default: '' }, // base64 image if from screenshot
    status: { type: String, enum: ['upcoming', 'done', 'cancelled'], default: 'upcoming' }
  },
  { timestamps: true }
);

const ScheduledMeeting = mongoose.model('ScheduledMeeting', ScheduledMeetingSchema);
export default ScheduledMeeting;
