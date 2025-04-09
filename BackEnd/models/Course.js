import mongoose from 'mongoose';
const { Schema } = mongoose;

const CourseSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Course', CourseSchema); 