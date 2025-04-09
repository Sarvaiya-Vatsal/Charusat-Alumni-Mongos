import mongoose from 'mongoose';
const { Schema } = mongoose;

const EventSchema = new Schema({
  title: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  schedule: {
    type: Date,
    required: true
  },
  user_id: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  banner: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Event', EventSchema); 