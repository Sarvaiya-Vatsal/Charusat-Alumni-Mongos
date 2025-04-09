import mongoose from 'mongoose';
const { Schema } = mongoose;

const SystemSettingSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  contact: {
    type: String,
    required: true
  },
  cover_img: {
    type: String,
    required: false
  },
  about_content: {
    type: String,
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('SystemSetting', SystemSettingSchema); 