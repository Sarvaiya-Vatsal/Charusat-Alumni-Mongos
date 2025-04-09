import mongoose from 'mongoose';
const { Schema } = mongoose;

const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  type: {
    type: String,
    enum: ['admin', 'alumnus', 'student'],
    required: true
  },
  alumnus_id: {
    type: Schema.Types.ObjectId,
    ref: 'AlumnusBio',
    required: false
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('User', UserSchema); 