import mongoose from 'mongoose';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import path from 'path';
import { fileURLToPath } from 'url';

// Get directory paths for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');

// Dynamically import models from parent directory
const AlumnusBioPath = path.join(rootDir, 'models', 'AlumnusBio.js');
const UserPath = path.join(rootDir, 'models', 'User.js');
const CoursePath = path.join(rootDir, 'models', 'Course.js');

dotenv.config({ path: path.join(rootDir, '.env') });

// Import models using dynamic import
const importModels = async () => {
  const AlumnusBioModule = await import(AlumnusBioPath);
  const UserModule = await import(UserPath);
  const CourseModule = await import(CoursePath);
  
  return {
    AlumnusBio: AlumnusBioModule.default,
    User: UserModule.default,
    Course: CourseModule.default
  };
};

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;

db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', async function() {
  console.log('Connected to database');
  
  try {
    // Import models
    const { AlumnusBio, User, Course } = await importModels();
    
    // Get first course for the alumnus
    const courses = await Course.find().limit(1);
    if (courses.length === 0) {
      console.error('No courses found. Please add courses first.');
      mongoose.connection.close();
      return;
    }
    
    // Create test alumnus data
    const testEmail = 'test.alumnus@example.com';
    
    // Check if user already exists
    const existingUser = await User.findOne({ email: testEmail });
    if (existingUser) {
      console.log('Test user already exists:', existingUser);
      mongoose.connection.close();
      return;
    }
    
    // Create new alumnus bio
    const newAlumnusBio = new AlumnusBio({
      name: 'Test Alumnus',
      email: testEmail,
      gender: 'male',
      batch: '2023',
      connected_to: 'Currently working at Test Company',
      course_id: courses[0]._id
    });
    
    const savedAlumnusBio = await newAlumnusBio.save();
    console.log('Created new alumnus bio:', savedAlumnusBio);
    
    // Create new user with alumnus_id
    const hashedPassword = await bcrypt.hash('password123', 10);
    const newUser = new User({
      name: 'Test Alumnus',
      email: testEmail,
      password: hashedPassword,
      type: 'alumnus',
      alumnus_id: savedAlumnusBio._id
    });
    
    const savedUser = await newUser.save();
    console.log('Created new user:', savedUser);
    
    console.log('Successfully created test alumnus with ID:', savedAlumnusBio._id);
    console.log('Login credentials:');
    console.log('Email:', testEmail);
    console.log('Password: password123');
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}); 