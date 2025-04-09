import mongoose from 'mongoose';
const { Schema } = mongoose;

const ForumTopicSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
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

const ForumReplySchema = new Schema({
  topic_id: {
    type: Schema.Types.ObjectId,
    ref: 'ForumTopic',
    required: true
  },
  reply: {
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

export const ForumTopic = mongoose.model('ForumTopic', ForumTopicSchema);
export const ForumReply = mongoose.model('ForumReply', ForumReplySchema); 