import mongoose from 'mongoose';

const TopicSchema = new mongoose.Schema(
  {
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', index: true },
    title: { type: String, required: true, trim: true },
    status: { type: String, enum: ['open', 'resolved'], default: 'open' },
    discussedCount: { type: Number, default: 1 },
    lastDiscussedAt: { type: Date, default: Date.now },
    meetings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Meeting' }],
    isRepeatedUnresolved: { type: Boolean, default: false },
    suggestedAction: { type: String, default: '' }
  },
  { timestamps: true }
);

TopicSchema.index({ userId: 1, title: 1 });

const Topic = mongoose.model('Topic', TopicSchema);
export default Topic;
