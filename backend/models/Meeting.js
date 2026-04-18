import mongoose from 'mongoose';

const TaskSchema = new mongoose.Schema({
  user: { type: String, required: true },
  task: { type: String, required: true },
  priority: { type: String, enum: ['High', 'Medium', 'Low'], default: 'Medium' },
  deadline: { type: String }
});

const MeetingSchema = new mongoose.Schema({
  transcript: { type: String, required: true },
  summary: { type: String, required: true },
  tasks: [TaskSchema],
  decisions: [{ type: String }],
  questions: [{ type: String }],
  risks: [{ type: String }]
}, {
  timestamps: true
});

const Meeting = mongoose.model('Meeting', MeetingSchema);

export default Meeting;
