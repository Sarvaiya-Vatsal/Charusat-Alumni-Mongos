import mongoose from 'mongoose';
const { Schema } = mongoose;

const EventCommitSchema = new Schema({
  event_id: {
    type: Schema.Types.ObjectId,
    ref: 'Event',
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

export default mongoose.model('EventCommit', EventCommitSchema); 