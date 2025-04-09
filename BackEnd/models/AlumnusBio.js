import mongoose from 'mongoose';
const { Schema } = mongoose;

const AlumnusBioSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  course_id: {
    type: Schema.Types.ObjectId,
    ref: 'Course',
    required: true
  },
  batch: {
    type: String,
    required: false
  },
  roll_no: {
    type: String,
    required: false
  },
  contact: {
    type: String,
    required: false
  },
  company: {
    type: String,
    required: false
  },
  designation: {
    type: String,
    required: false
  },
  bio: {
    type: String,
    required: false
  },
  avatar: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('AlumnusBio', AlumnusBioSchema); 