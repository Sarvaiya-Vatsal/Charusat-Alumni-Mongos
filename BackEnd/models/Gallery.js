import mongoose from 'mongoose';
const { Schema } = mongoose;

const GallerySchema = new Schema({
  image_path: {
    type: String,
    required: true
  },
  about: {
    type: String,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

export default mongoose.model('Gallery', GallerySchema); 