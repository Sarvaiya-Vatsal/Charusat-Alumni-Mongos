import mongoose from 'mongoose';
const { Schema } = mongoose;

const ForumCommentSchema = new Schema({
  topic_id: {
    type: Schema.Types.ObjectId,
    ref: 'ForumTopic',
    required: true
  },
  comment: {
    type: String,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('ForumComment', ForumCommentSchema); 