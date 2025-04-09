import mongoose from 'mongoose';
import dotenv from 'dotenv';
import Course from '../models/Course.js';

dotenv.config();

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
    // Clear existing courses
    await Course.deleteMany({});
    console.log('Existing courses removed');
    
    // Add sample courses
    const courses = [
      { name: 'Computer Science', description: 'Bachelor of Technology in Computer Science' },
      { name: 'Information Technology', description: 'Bachelor of Technology in Information Technology' },
      { name: 'Mechanical Engineering', description: 'Bachelor of Technology in Mechanical Engineering' },
      { name: 'Electrical Engineering', description: 'Bachelor of Technology in Electrical Engineering' },
      { name: 'Civil Engineering', description: 'Bachelor of Technology in Civil Engineering' },
      { name: 'Chemical Engineering', description: 'Bachelor of Technology in Chemical Engineering' },
      { name: 'Electronics and Communication', description: 'Bachelor of Technology in Electronics and Communication' },
      { name: 'Business Administration', description: 'Master of Business Administration' }
    ];
    
    const result = await Course.insertMany(courses);
    console.log(`${result.length} courses added successfully`);
    
    // Display added courses
    const allCourses = await Course.find();
    console.log('Courses in database:', allCourses);
    
    mongoose.connection.close();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    mongoose.connection.close();
  }
}); 