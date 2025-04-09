import mongoose from 'mongoose';
import bcrypt from 'bcrypt';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

// Initialize dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load environment variables
dotenv.config({ path: path.join(__dirname, '..', '.env') });

// Define models
const User = mongoose.model('User', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true },
  type: { type: String, enum: ['admin', 'alumnus'], required: true },
  alumnus_id: { type: mongoose.Schema.Types.ObjectId, ref: 'AlumnusBio' },
  created_at: { type: Date, default: Date.now }
}));

const Course = mongoose.model('Course', new mongoose.Schema({
  course: { type: String, required: true },
  about: { type: String },
  created_at: { type: Date, default: Date.now }
}));

const AlumnusBio = mongoose.model('AlumnusBio', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  gender: { type: String },
  batch: { type: String },
  course_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Course' },
  connected_to: { type: String },
  avatar: { type: String },
  status: { type: Boolean, default: false },
  created_at: { type: Date, default: Date.now }
}));

const Event = mongoose.model('Event', new mongoose.Schema({
  title: { type: String, required: true },
  content: { type: String, required: true },
  schedule: { type: Date, required: true },
  banner: { type: String },
  created_at: { type: Date, default: Date.now }
}));

const ForumTopic = mongoose.model('ForumTopic', new mongoose.Schema({
  title: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
}));

const ForumComment = mongoose.model('ForumComment', new mongoose.Schema({
  topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic', required: true },
  comment: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
}));

const Career = mongoose.model('Career', new mongoose.Schema({
  company: { type: String, required: true },
  location: { type: String, required: true },
  job_title: { type: String, required: true },
  description: { type: String, required: true },
  user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  created_at: { type: Date, default: Date.now }
}));

const SystemSetting = mongoose.model('SystemSetting', new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  contact: { type: String, required: true },
  cover_img: { type: String },
  about_content: { type: String },
  created_at: { type: Date, default: Date.now }
}));

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('✅ MongoDB Connected!');
    return true;
  } catch (err) {
    console.error('❌ MongoDB Connection Error:', err);
    return false;
  }
}

// Main seed function
async function seedData() {
  try {
    // Connect to MongoDB
    const connected = await connectDB();
    if (!connected) {
      console.error('Failed to connect to MongoDB. Exiting...');
      process.exit(1);
    }

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await AlumnusBio.deleteMany({});
    await Event.deleteMany({});
    await ForumTopic.deleteMany({});
    await ForumComment.deleteMany({});
    await Career.deleteMany({});
    await SystemSetting.deleteMany({});

    console.log('Creating courses...');
    // Create courses
    const courses = await Course.insertMany([
      { course: 'BSC', about: 'Bachelor of Science' },
      { course: 'MCS', about: 'Master of Computer Science' },
      { course: 'BCS', about: 'Bachelor of Computer Science' }
    ]);

    console.log('Creating admin user...');
    // Create admin user
    const adminPassword = await bcrypt.hash('admin123', 10);
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@gmail.com',
      password: adminPassword,
      type: 'admin'
    });

    console.log('Creating alumni profiles...');
    // Create alumni profiles
    const alumnus1 = await AlumnusBio.create({
      name: 'John Doe',
      email: 'john@example.com',
      gender: 'male',
      batch: '2020',
      course_id: courses[0]._id,
      connected_to: 'Google Developer',
      avatar: 'Public/Avatar/default.jpg',
      status: true
    });

    const alumnus2 = await AlumnusBio.create({
      name: 'Jane Smith',
      email: 'jane@example.com',
      gender: 'female',
      batch: '2021',
      course_id: courses[1]._id,
      connected_to: 'Microsoft Engineer',
      avatar: 'Public/Avatar/default.jpg',
      status: true
    });

    console.log('Creating alumni users...');
    // Create alumni users
    const alumnusPassword = await bcrypt.hash('alumni123', 10);
    
    const alumnusUser1 = await User.create({
      name: alumnus1.name,
      email: alumnus1.email,
      password: alumnusPassword,
      type: 'alumnus',
      alumnus_id: alumnus1._id
    });

    const alumnusUser2 = await User.create({
      name: alumnus2.name,
      email: alumnus2.email,
      password: alumnusPassword,
      type: 'alumnus',
      alumnus_id: alumnus2._id
    });

    console.log('Creating events...');
    // Create events
    const futureDate1 = new Date();
    futureDate1.setMonth(futureDate1.getMonth() + 1);
    
    const futureDate2 = new Date();
    futureDate2.setMonth(futureDate2.getMonth() + 2);
    
    const events = await Event.insertMany([
      {
        title: 'Annual Alumni Meet',
        content: '<p>Join us for our annual alumni gathering where we catch up with old friends and make new connections!</p>',
        schedule: futureDate1,
        banner: ''
      },
      {
        title: 'Tech Conference 2024',
        content: '<p>A technology conference featuring the latest trends in AI, Machine Learning, and Web Development.</p>',
        schedule: futureDate2,
        banner: ''
      }
    ]);

    console.log('Creating forum topics...');
    // Create forum topics
    const forums = await ForumTopic.insertMany([
      {
        title: 'Career Opportunities in AI',
        description: '<p>Let\'s discuss career paths and opportunities in the field of Artificial Intelligence.</p>',
        user_id: alumnusUser1._id
      },
      {
        title: 'Alumni Networking Strategies',
        description: '<p>What are some effective strategies for networking with fellow alumni?</p>',
        user_id: alumnusUser2._id
      }
    ]);

    console.log('Creating forum comments...');
    // Create forum comments
    await ForumComment.insertMany([
      {
        topic_id: forums[0]._id,
        comment: 'Machine Learning Engineer roles are in high demand right now.',
        user_id: alumnusUser2._id
      },
      {
        topic_id: forums[0]._id,
        comment: 'I recommend getting certified in major AI frameworks like TensorFlow or PyTorch.',
        user_id: admin._id
      },
      {
        topic_id: forums[1]._id,
        comment: 'LinkedIn has been very effective for me in connecting with alumni.',
        user_id: alumnusUser1._id
      }
    ]);

    console.log('Creating career listings...');
    // Create career listings
    await Career.insertMany([
      {
        company: 'Google',
        location: 'Remote',
        job_title: 'Software Engineer',
        description: '<p>Looking for experienced software engineers to join our team.</p>',
        user_id: admin._id
      },
      {
        company: 'Microsoft',
        location: 'New York',
        job_title: 'Data Scientist',
        description: '<p>Join our data science team to work on cutting-edge AI solutions.</p>',
        user_id: alumnusUser1._id
      }
    ]);

    console.log('Creating system settings...');
    // Create system settings
    await SystemSetting.create({
      name: 'Alumni - Charusat University',
      email: 'info@charusat.ac.in',
      contact: '(+91) 2697 265011',
      cover_img: '1602738120_pngtree-purple-hd-business-banner-image_5493.jpg',
      about_content: 'Charusat University is a renowned institution located in Changa, Gujarat, India. It offers undergraduate and postgraduate programs in various disciplines including Engineering, IT, Pharmacy, Management, and more. The university is committed to excellence in education, research, and innovation.'
    });

    console.log('✅ Data seeding completed successfully!');

  } catch (error) {
    console.error('❌ Error seeding data:', error);
  } finally {
    await mongoose.disconnect();
    console.log('MongoDB connection closed');
    process.exit(0);
  }
}

// Run the seed function
seedData(); 