import mongoose from 'mongoose';
const { Schema } = mongoose;

const CareerSchema = new Schema({
  company: {
    type: String,
    required: true
  },
  job_title: {
    type: String,
    required: true
  },
  location: {
    type: String,
    required: false
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

export default mongoose.model('Career', CareerSchema); 