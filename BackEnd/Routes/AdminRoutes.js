import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import bcrypt from "bcrypt";
import sendEmail from "../utils/mailer.js";
import User from "../models/User.js";
import AlumnusBio from "../models/AlumnusBio.js";
import Career from "../models/Career.js";
import { ForumTopic, ForumReply } from "../models/ForumTopic.js";
import Event from "../models/Event.js";
import Course from "../models/Course.js";
import mongoose from "mongoose";

const router = express.Router();

// Multer storage configuration for avatar
const avatarStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Avatar');
    },
    filename: (req, file, cb) => {
        cb(null, file.fieldname + '_' + Date.now() + path.extname(file.originalname));
    }
});

const avatarUpload = multer({ storage: avatarStorage });

const galleryStorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'Public/Images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const galleryUpload = multer({ storage: galleryStorage });

router.post("/login", async (req, res) => {
    try {
        const user = await User.findOne({ email: req.body.email });
        
        if (!user) {
            return res.json({ loginStatus: false, Error: "Wrong Email or Password" });
        }
        
        const passwordMatch = await bcrypt.compare(req.body.password, user.password);
        
        if (passwordMatch) {
            const email = user.email;
            const token = jwt.sign({ role: "admin", email: email }, "jwt_csalumni_key", { expiresIn: "1d" });
            res.cookie('token', token);
            return res.json({ 
                loginStatus: true, 
                userType: user.type, 
                userId: user._id, 
                userName: user.name, 
                alumnus_id: user.alumnus_id 
            });
        } else {
            return res.json({ loginStatus: false, Error: "Wrong Email or Password" });
        }
    } catch (err) {
        console.error(err);
        return res.json({ loginStatus: false, Error: "Server Error" });
    }
});

router.post("/signup", async (req, res) => {
    const { name, email, password, userType, course_id } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.json({ email: existingUser.email });
        }
        
        if (userType === "alumnus") {
            try {
                // Create new alumnus bio
                const newAlumnusBio = new AlumnusBio({
                    name,
                    email,
                    course_id: mongoose.Types.ObjectId.isValid(course_id) ? course_id : null
                });
                
                const savedAlumnusBio = await newAlumnusBio.save();
                
                // Create new user with alumnus_id
                const newUser = new User({
                    name,
                    email,
                    password: hashedPassword,
                    type: userType,
                    alumnus_id: savedAlumnusBio._id
                });
                
                const savedUser = await newUser.save();
                return res.json({ 
                    message: 'Signup Successful', 
                    userId: savedUser._id, 
                    signupStatus: true 
                });
            } catch (err) {
                console.error("Error creating alumnus:", err);
                return res.status(500).json({ 
                    error: "Invalid course ID or other data error", 
                    signupStatus: false 
                });
            }
        } else {
            // Create new user without alumnus_id
            const newUser = new User({
                name,
                email,
                password: hashedPassword,
                type: userType
            });
            
            const savedUser = await newUser.save();
            return res.json({ 
                message: 'Signup Successful', 
                userId: savedUser._id, 
                signupStatus: true 
            });
        }
    } catch (error) {
        console.error("Error during signup:", error);
        return res.status(500).json({ 
            error: "Server Error", 
            signupStatus: false 
        });
    }
});

// Admin registration route
router.post("/admin/register", async (req, res) => {
    const { name, email, password } = req.body;
    
    try {
        // Check if user already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(400).json({ 
                error: "Email already in use", 
                registerStatus: false 
            });
        }
        
        // Hash password
        const hashedPassword = await bcrypt.hash(password, 10);
        
        // Create new admin user
        const newAdmin = new User({
            name,
            email,
            password: hashedPassword,
            type: 'admin'
        });
        
        const savedAdmin = await newAdmin.save();
        
        return res.json({ 
            message: 'Admin registered successfully', 
            userId: savedAdmin._id, 
            registerStatus: true 
        });
    } catch (error) {
        console.error("Error registering admin:", error);
        return res.status(500).json({ 
            error: "Server Error", 
            registerStatus: false 
        });
    }
});

router.post("/logout", (req, res) => {
    res.clearCookie('token');
    res.status(200).json({ message: 'Logout Success' });
});

router.get("/counts", async (req, res) => {
    try {
        const forums = await ForumTopic.countDocuments();
        const jobs = await Career.countDocuments();
        const events = await Event.countDocuments();
        const upevents = await Event.countDocuments({ schedule: { $gte: new Date() } });
        const alumni = await AlumnusBio.countDocuments();
        
        res.json({
            forums,
            jobs,
            events,
            upevents,
            alumni
        });
    } catch (err) {
        console.error("Error getting counts:", err);
        res.status(500).json({ error: "Server Error" });
    }
});

router.get('/jobs', async (req, res) => {
    try {
        const jobs = await Career.find()
            .populate('user_id', 'name')
            .sort({ _id: -1 });
            
        const formattedJobs = jobs.map(job => ({
            id: job._id,
            company: job.company,
            job_title: job.job_title,
            location: job.location,
            description: job.description,
            user_id: job.user_id._id,
            name: job.user_id.name,
            created_at: job.created_at
        }));
        
        res.json(formattedJobs);
    } catch (err) {
        console.error('Error getting jobs:', err);
        res.status(500).json({ error: 'Server Error' });
    }
});

router.get('/courses', async (req, res) => {
    try {
        const courses = await Course.find();
        return res.json(courses);
    } catch (err) {
        console.error('Error getting courses:', err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

router.delete('/courses/:id', async (req, res) => {
    try {
        await Course.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Course deleted successfully' });
    } catch (err) {
        console.error('Error deleting course:', err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

router.post("/courses", async (req, res) => {
    try {
        const newCourse = new Course({
            name: req.body.course
        });
        const savedCourse = await newCourse.save();
        return res.json(savedCourse._id);
    } catch (err) {
        console.error('Error adding course:', err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

router.put('/courses', async (req, res) => {
    const { id, course } = req.body;
    if (id) {
        try {
            await Course.findByIdAndUpdate(id, { name: course });
            return res.json({ message: 'Course Updated Successfully' });
        } catch (err) {
            console.error('Error updating course:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
    } else {
        return res.status(400).json({ error: 'Invalid Request: No ID provided for update' });
    }
});

router.get("/events", async (req, res) => {
    try {
        const events = await Event.aggregate([
            {
                $lookup: {
                    from: 'eventcommits',
                    localField: '_id',
                    foreignField: 'event_id',
                    as: 'commits'
                }
            },
            {
                $project: {
                    _id: 1,
                    id: '$_id',
                    title: 1,
                    content: 1,
                    schedule: 1,
                    banner: 1,
                    createdAt: '$created_at',
                    commits_count: { $size: '$commits' }
                }
            },
            { $sort: { schedule: -1 } }
        ]);
        
        return res.json(events);
    } catch (err) {
        console.error("Error getting events:", err);
        return res.status(500).json({ error: "Query Error: " + err.message });
    }
});

router.post("/events", async (req, res) => {
    const { title, description, schedule, user_id } = req.body;
    
    try {
        // Validate required fields
        if (!title || !description || !schedule || !user_id) {
            return res.status(400).json({ 
                error: `Missing required fields: ${!title ? 'title ' : ''}${!description ? 'description ' : ''}${!schedule ? 'schedule ' : ''}${!user_id ? 'user_id' : ''}` 
            });
        }
        
        // Validate user_id format
        if (!mongoose.Types.ObjectId.isValid(user_id)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        
        // Create new event
        const newEvent = new Event({
            title,
            description,  // Make sure this matches your MongoDB schema
            schedule: new Date(schedule),
            banner: '',
            user_id: new mongoose.Types.ObjectId(user_id)
        });
        
        console.log("Creating new event:", newEvent);
        const savedEvent = await newEvent.save();
        console.log("Event saved successfully:", savedEvent._id);
        
        return res.json({ 
            message: "Event Added Successfully",
            eventId: savedEvent._id
        });
    } catch (err) {
        console.error("Error adding event:", err);
        return res.status(500).json({ error: "Error: " + err.message });
    }
});

router.put("/events", async (req, res) => {
    const { id, title, description, schedule, user_id } = req.body;
    
    try {
        // Validate request
        if (!id) {
            return res.status(400).json({ error: "Event ID is required for update" });
        }
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid event ID format" });
        }
        
        // Check if event exists
        const existingEvent = await Event.findById(id);
        if (!existingEvent) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        // Update event
        const updateData = {};
        if (title) updateData.title = title;
        if (description) updateData.description = description;
        if (schedule) updateData.schedule = new Date(schedule);
        if (user_id && mongoose.Types.ObjectId.isValid(user_id)) {
            updateData.user_id = new mongoose.Types.ObjectId(user_id);
        }
        
        const updatedEvent = await Event.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        return res.json({ 
            message: "Event Updated Successfully",
            event: updatedEvent
        });
    } catch (err) {
        console.error("Error updating event:", err);
        return res.status(500).json({ error: "Error: " + err.message });
    }
});

router.delete("/events/:id", async (req, res) => {
    const eventId = req.params.id;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ error: "Invalid event ID format" });
        }
        
        const event = await Event.findById(eventId);
        if (!event) {
            return res.status(404).json({ error: "Event not found" });
        }
        
        await Event.findByIdAndDelete(eventId);
        
        // Optionally, delete related event commitments
        const EventCommit = mongoose.model('EventCommit', new mongoose.Schema({
            event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            created_at: { type: Date, default: Date.now }
        }));
        
        await EventCommit.deleteMany({ event_id: eventId });
        
        return res.json({ message: 'Event Deleted Successfully' });
    } catch (err) {
        console.error("Error deleting event:", err);
        return res.status(500).json({ error: "Query Error: " + err.message });
    }
});

router.post("/events/participate", async (req, res) => {
    const { event_id, user_id } = req.body;
    try {
        const EventCommit = mongoose.model('EventCommit', new mongoose.Schema({
            event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            created_at: { type: Date, default: Date.now }
        }));
        
        const newEventCommit = new EventCommit({
            event_id: mongoose.Types.ObjectId(event_id),
            user_id: mongoose.Types.ObjectId(user_id)
        });
        
        await newEventCommit.save();
        return res.json({ message: "Participated" });
    } catch (err) {
        console.error("Error adding event participation:", err);
        return res.status(500).json({ error: "Query Error" });
    }
});

router.post("/eventcommits/check", async (req, res) => {
    const { event_id, user_id } = req.body;
    try {
        const EventCommit = mongoose.model('EventCommit', new mongoose.Schema({
            event_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Event' },
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            created_at: { type: Date, default: Date.now }
        }));
        
        const commit = await EventCommit.findOne({
            event_id: mongoose.Types.ObjectId(event_id),
            user_id: mongoose.Types.ObjectId(user_id)
        });
        
        if (commit) {
            return res.json({ eventCommit: true });
        } else {
            return res.json({ eventCommit: false });
        }
    } catch (err) {
        console.error("Error checking event participation:", err);
        return res.json({ eventCommit: false, Error: "Query Error" });
    }
});

router.get("/forums", async (req, res) => {
    try {
        const forums = await ForumTopic.aggregate([
            {
                $lookup: {
                    from: 'forumcomments',
                    localField: '_id',
                    foreignField: 'topic_id',
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            {
                $project: {
                    id: '$_id',
                    title: 1,
                    description: 1,
                    user_id: 1,
                    date_created: '$created_at',
                    comments_count: { $size: '$comments' },
                    created_by: { $arrayElemAt: ['$creator.name', 0] }
                }
            },
            { $sort: { _id: -1 } }
        ]);
        
        return res.json(forums);
    } catch (err) {
        console.error("Error getting forums:", err);
        return res.status(500).json({ error: "Query Error" });
    }
});

router.delete("/forum/:id", async (req, res) => {
    const eid = req.params.id;
    try {
        await ForumTopic.findByIdAndDelete(eid);
        return res.json({ message: 'Forum Deleted Successfully' });
    } catch (err) {
        console.error("Error deleting forum:", err);
        return res.status(500).json({ error: "Query Error" });
    }
});

router.post("/topiccomments", async (req, res) => {
    const { topic_id } = req.body;
    try {
        const ForumComment = mongoose.model('ForumComment', new mongoose.Schema({
            topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic' },
            comment: { type: String, required: true },
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            created_at: { type: Date, default: Date.now }
        }));
        
        const comments = await ForumComment.aggregate([
            { 
                $match: { 
                    topic_id: mongoose.Types.ObjectId(topic_id) 
                } 
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'user'
                }
            },
            {
                $project: {
                    id: '$_id',
                    topic_id: 1,
                    comment: 1,
                    user_id: 1,
                    date_created: '$created_at',
                    name: { $arrayElemAt: ['$user.name', 0] }
                }
            }
        ]);
        
        return res.json(comments);
    } catch (err) {
        console.error("Error getting topic comments:", err);
        return res.status(500).json({ error: "Query Error" });
    }
});

router.put("/view_forum/:id", async (req, res) => {
    const { id } = req.params;
    const { comment } = req.body;
    if (id) {
        try {
            const ForumComment = mongoose.model('ForumComment', new mongoose.Schema({
                topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic' },
                comment: { type: String, required: true },
                user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
                created_at: { type: Date, default: Date.now }
            }));
            
            await ForumComment.findByIdAndUpdate(id, { comment });
            return res.json({ message: "Comment Updated Successfully" });
        } catch (err) {
            console.error("Error updating comment:", err);
            return res.status(500).json({ error: "Query Error" });
        }
    } else {
        return res.status(400).json({ error: "Invalid request" });
    }
});

router.post("/view_forum", async (req, res) => {
    const { c, user_id, topic_id } = req.body;
    try {
        const ForumComment = mongoose.model('ForumComment', new mongoose.Schema({
            topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic' },
            comment: { type: String, required: true },
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            created_at: { type: Date, default: Date.now }
        }));
        
        const newComment = new ForumComment({
            topic_id: mongoose.Types.ObjectId(topic_id),
            comment: c,
            user_id: mongoose.Types.ObjectId(user_id)
        });
        
        const savedComment = await newComment.save();
        return res.json(savedComment);
    } catch (err) {
        console.error("Error adding comment:", err);
        return res.status(500).json({ error: "Query Error" });
    }
});

router.delete('/view_forum/:id', async (req, res) => {
    try {
        const ForumComment = mongoose.model('ForumComment', new mongoose.Schema({
            topic_id: { type: mongoose.Schema.Types.ObjectId, ref: 'ForumTopic' },
            comment: { type: String, required: true },
            user_id: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
            created_at: { type: Date, default: Date.now }
        }));
        
        await ForumComment.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Comment deleted successfully' });
    } catch (err) {
        console.error("Error deleting comment:", err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

router.post('/manageforum', async (req, res) => {
    const { title, userId, description } = req.body;
    try {
        const newTopic = new ForumTopic({
            title,
            user_id: new mongoose.Types.ObjectId(userId),
            description
        });
        
        const savedTopic = await newTopic.save();
        return res.json({ 
            message: 'New Forum added successfully', 
            jobId: savedTopic._id 
        });
    } catch (err) {
        console.error('Error adding forum:', err);
        return res.status(500).json({ error: 'Database Error' });
    }
});

router.put('/manageforum', async (req, res) => {
    const { title, description, id } = req.body;
    if (id) {
        try {
            await ForumTopic.findByIdAndUpdate(id, {
                title,
                description
            });
            
            return res.json({ message: 'Forum updated successfully' });
        } catch (err) {
            console.error('Error updating forum:', err);
            return res.status(500).json({ error: 'Database Error' });
        }
    } else {
        return res.status(400).json({ error: 'Invalid Request: No ID provided for update' });
    }
});

router.get("/users", async (req, res) => {
    try {
        const users = await User.find().sort({ name: 1 });
        return res.json(users);
    } catch (err) {
        console.error("Error getting users:", err);
        return res.status(500).json({ error: "Server Error" });
    }
});

// Add endpoint to get a specific user
router.get("/user/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        return res.json(user);
    } catch (err) {
        console.error("Error getting user:", err);
        return res.status(500).json({ error: "Server Error" });
    }
});

// Add endpoint to delete a user
router.delete("/user/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // If user is an alumnus, also delete their alumnus record
        if (user.type === 'alumnus' && user.alumnus_id) {
            await AlumnusBio.findByIdAndDelete(user.alumnus_id);
        }
        
        // Delete the user
        await User.findByIdAndDelete(userId);
        
        return res.json({ message: "User deleted successfully" });
    } catch (err) {
        console.error("Error deleting user:", err);
        return res.status(500).json({ error: "Server Error" });
    }
});

// Add endpoint to update a user
router.put("/user/:id", async (req, res) => {
    try {
        const userId = req.params.id;
        const { name, email, type, password } = req.body;
        
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ error: "Invalid user ID format" });
        }
        
        const user = await User.findById(userId);
        if (!user) {
            return res.status(404).json({ error: "User not found" });
        }
        
        // Update basic info
        const updateData = { name, email, type };
        
        // Update password if provided
        if (password && password.trim() !== '') {
            const hashedPassword = await bcrypt.hash(password, 10);
            updateData.password = hashedPassword;
        }
        
        // Update the user
        await User.findByIdAndUpdate(userId, updateData);
        
        // If user is an alumnus, also update their alumnus record name and email
        if (user.type === 'alumnus' && user.alumnus_id) {
            await AlumnusBio.findByIdAndUpdate(user.alumnus_id, {
                name,
                email
            });
        }
        
        return res.json({ message: "User updated successfully" });
    } catch (err) {
        console.error("Error updating user:", err);
        return res.status(500).json({ error: "Server Error" });
    }
});

router.get("/gallery", async (req, res) => {
    try {
        const Gallery = mongoose.model('Gallery', new mongoose.Schema({
            image_path: { type: String, required: true },
            about: { type: String, required: true },
            created_at: { type: Date, default: Date.now }
        }));
        
        const gallery = await Gallery.find().sort({ _id: -1 });
        return res.json(gallery);
    } catch (err) {
        console.error("Error getting gallery items:", err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

router.delete('/alumnus/:id', async (req, res) => {
    try {
        await AlumnusBio.findByIdAndDelete(req.params.id);
        return res.json({ message: 'Alumnus Deleted Successfully' });
    } catch (err) {
        console.error("Error deleting alumnus:", err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

router.put('/viewalumni', async (req, res) => {
    try {
        const { aid, status } = req.body;
        await AlumnusBio.findByIdAndUpdate(aid, { status });
        return res.json({ message: 'Status Updated Successfully' });
    } catch (err) {
        console.error("Error updating alumnus status:", err);
        return res.status(500).json({ error: 'Database Error' });
    }
});

router.get("/settings", async (req, res) => {
    try {
        const SystemSetting = mongoose.model('SystemSetting', new mongoose.Schema({
            name: { type: String, required: true },
            email: { type: String, required: true },
            contact: { type: String, required: true },
            cover_img: { type: String },
            about_content: { type: String },
            created_at: { type: Date, default: Date.now }
        }));
        
        const settings = await SystemSetting.find();
        if (settings.length > 0) {
            return res.json(settings);
        } else {
            return res.json({ message: "No Data Available" });
        }
    } catch (err) {
        console.error("Error getting settings:", err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

router.get("/up_events", async (req, res) => {
    try {
        const currentDate = new Date();
        const events = await Event.find({
            schedule: { $gte: currentDate }
        }).sort({ schedule: 1 });
        
        if (events.length > 0) {
            return res.json(events);
        } else {
            return res.json({ message: "Still there are no upcoming Events" });
        }
    } catch (err) {
        console.error("Database Query Error:", err);
        return res.status(500).json({ Error: `DB Query Error ${err}` });
    }
});

router.get("/alumni_list", async (req, res) => {
    try {
        const alumni = await AlumnusBio.aggregate([
            {
                $lookup: {
                    from: 'courses',
                    localField: 'course_id',
                    foreignField: '_id',
                    as: 'courseData'
                }
            },
            {
                $project: {
                    id: '$_id',
                    name: 1,
                    gender: 1,
                    batch: 1,
                    course_id: 1,
                    email: 1,
                    connected_to: 1,
                    avatar: 1,
                    status: 1,
                    date_created: '$created_at',
                    course: { $arrayElemAt: ['$courseData.course', 0] }
                }
            },
            { $sort: { name: 1 } }
        ]);
        
        if (alumni.length > 0) {
            return res.json(alumni);
        } else {
            return res.json({ message: "No Alumni available" });
        }
    } catch (err) {
        console.error("Error getting alumni list:", err);
        return res.status(500).json({ Error: "Query Error" });
    }
});

// Add route to create new alumnus
router.post('/createalumnus', async (req, res) => {
    const { name, email, gender, batch, course_id, connected_to } = req.body;
    
    try {
        // Validate required fields
        if (!name || !email) {
            return res.status(400).json({ error: 'Name and email are required' });
        }
        
        // Check if alumnus with this email already exists
        const existingAlumnus = await AlumnusBio.findOne({ email });
        if (existingAlumnus) {
            return res.status(400).json({ error: 'An alumnus with this email already exists' });
        }
        
        // Create the new alumnus
        const newAlumnus = new AlumnusBio({
            name,
            email,
            gender: gender || '',
            batch: batch || '',
            course_id: course_id && mongoose.Types.ObjectId.isValid(course_id) ? 
                new mongoose.Types.ObjectId(course_id) : null,
            connected_to: connected_to || '',
            status: 1 // Set as verified by default
        });
        
        const savedAlumnus = await newAlumnus.save();
        
        return res.json({ 
            message: 'Alumnus added successfully', 
            alumni: savedAlumnus 
        });
    } catch (err) {
        console.error('Error creating alumnus:', err);
        return res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// Add route to update alumnus
router.put('/updatealumnus/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, gender, batch, course_id, connected_to, status } = req.body;
    
    try {
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid alumnus ID format' });
        }
        
        const alumnus = await AlumnusBio.findById(id);
        if (!alumnus) {
            return res.status(404).json({ error: 'Alumnus not found' });
        }
        
        // Update the alumnus
        const updateData = { 
            name, 
            email,
            gender: gender || '',
            batch: batch || '',
            connected_to: connected_to || ''
        };
        
        // Only include course_id if valid
        if (course_id && mongoose.Types.ObjectId.isValid(course_id)) {
            updateData.course_id = new mongoose.Types.ObjectId(course_id);
        }
        
        // Only include status if provided
        if (status !== undefined) {
            updateData.status = status;
        }
        
        const updatedAlumnus = await AlumnusBio.findByIdAndUpdate(
            id,
            updateData,
            { new: true, runValidators: true }
        );
        
        return res.json({ 
            message: 'Alumnus updated successfully', 
            alumni: updatedAlumnus 
        });
    } catch (err) {
        console.error('Error updating alumnus:', err);
        return res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// Add the missing alumnusdetails endpoint
router.get("/alumnusdetails", async (req, res) => {
    try {
        const { id } = req.query;
        if (!id) {
            return res.status(400).json({ error: "Alumnus ID is required" });
        }

        // Make sure ID is a valid ObjectId
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: "Invalid alumnus ID format" });
        }

        const alumnus = await AlumnusBio.find({ _id: new mongoose.Types.ObjectId(id) });
        
        if (alumnus.length > 0) {
            console.log("Returning alumnus details:", alumnus);
            return res.json(alumnus);
        } else {
            console.log("No alumnus found with ID:", id);
            return res.status(404).json({ message: "Alumnus not found" });
        }
    } catch (err) {
        console.error("Error getting alumnus details:", err);
        return res.status(500).json({ error: "Database Error" });
    }
});

router.put('/upaccount', avatarUpload.single('image'), async (req, res) => {
    try {
        const { name, connected_to, course_id, email, gender, batch, password, alumnus_id, user_id } = req.body;
        
        console.log("Update account request received:", { 
            name, email, gender, batch, 
            course_id_type: typeof course_id,
            alumnus_id_type: typeof alumnus_id,
            user_id_type: typeof user_id
        });
        
        // Validate required IDs
        if (!alumnus_id) {
            return res.status(400).json({ error: 'Alumnus ID is required' });
        }
        
        if (!user_id) {
            return res.status(400).json({ error: 'User ID is required' });
        }

        // Build update object with only valid data
        const alumnusUpdate = { name, email, gender, batch };
        
        // Add optional fields if provided
        if (connected_to) alumnusUpdate.connected_to = connected_to;
        
        // Validate course_id if provided
        if (course_id && course_id !== 'null' && course_id !== 'undefined') {
            if (!mongoose.Types.ObjectId.isValid(course_id)) {
                return res.status(400).json({ error: 'Invalid course ID format' });
            }
            alumnusUpdate.course_id = new mongoose.Types.ObjectId(course_id);
        }
        
        // Update alumnus_bio record
        console.log("Updating alumnus record with ID:", alumnus_id);
        console.log("Update data:", alumnusUpdate);
        const updatedAlumnus = await AlumnusBio.findByIdAndUpdate(
            alumnus_id,
            alumnusUpdate,
            { new: true, runValidators: true }
        );
        
        if (!updatedAlumnus) {
            return res.status(404).json({ error: 'Alumnus record not found' });
        }
        
        // Update avatar if provided
        if (req.file) {
            console.log("Updating avatar:", req.file.path);
            await AlumnusBio.findByIdAndUpdate(alumnus_id, {
                avatar: req.file.path
            });
        }
        
        // Update user record
        console.log("Updating user record with ID:", user_id);
        const updatedUser = await User.findByIdAndUpdate(
            user_id,
            { name, email },
            { new: true, runValidators: true }
        );
        
        if (!updatedUser) {
            return res.status(404).json({ error: 'User record not found' });
        }
        
        // Update password if provided
        if (password && password.trim() !== '') {
            console.log("Updating password");
            const hashedPassword = await bcrypt.hash(password, 10);
            await User.findByIdAndUpdate(user_id, {
                password: hashedPassword
            });
        }
        
        return res.json({ message: 'Account updated successfully' });
    } catch (error) {
        console.error('Error updating account:', error);
        return res.status(500).json({ error: 'An error occurred: ' + error.message });
    }
});

const getAllStudentEmails = async () => {
    try {
        const students = await AlumnusBio.find({}, 'email');
        return students.map(student => student.email);
    } catch (err) {
        console.error('Error getting student emails:', err);
        throw err;
    }
};

router.post('/managejob', async (req, res) => {
    const { company, job_title, location, description, user_id } = req.body;
    
    try {
        // Create new job with proper validation
        const newCareer = new Career({
            company,
            job_title,
            location,
            description,
            user_id: user_id ? mongoose.Types.ObjectId.isValid(user_id) ? new mongoose.Types.ObjectId(user_id) : null : null
        });
        
        console.log("Creating new job:", newCareer);
        const savedCareer = await newCareer.save();
        console.log("Job saved successfully:", savedCareer._id);
        
        // Don't try to send emails if there's an error
        try {
            const emails = await getAllStudentEmails();
            if (emails && emails.length > 0) {
                const subject = `New Job Posted: ${job_title}`;
                const html = `A new job has been posted:<br><br>Company: ${company}<br>Title: ${job_title}<br>Location: ${location}<br>Description: ${description}`;
                
                // Send emails in the background to not block response
                Promise.all(emails.map(email => sendEmail(email, subject, html)))
                    .catch(error => console.error('Error sending emails:', error));
                
                return res.json({ 
                    message: 'New job added successfully and emails being sent', 
                    jobId: savedCareer._id 
                });
            } else {
                return res.json({ 
                    message: 'New job added successfully (no alumni to notify)', 
                    jobId: savedCareer._id 
                });
            }
        } catch (error) {
            console.error('Error fetching emails:', error);
            // Still return success since the job was created
            return res.json({ 
                message: 'New job added successfully (email notification failed)', 
                jobId: savedCareer._id 
            });
        }
    } catch (err) {
        console.error('Error adding job:', err);
        return res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// Add the PUT endpoint for managejob to edit existing jobs
router.put('/managejob', async (req, res) => {
    const { id, company, job_title, location, description } = req.body;
    
    try {
        if (!id) {
            return res.status(400).json({ error: 'Job ID is required for update' });
        }
        
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ error: 'Invalid job ID format' });
        }
        
        const job = await Career.findById(id);
        if (!job) {
            return res.status(404).json({ error: 'Job not found' });
        }
        
        // Update the job
        const updatedJob = await Career.findByIdAndUpdate(
            id,
            { company, job_title, location, description },
            { new: true, runValidators: true }
        );
        
        return res.json({ 
            message: 'Job updated successfully', 
            job: updatedJob 
        });
    } catch (err) {
        console.error('Error updating job:', err);
        return res.status(500).json({ error: 'Database Error: ' + err.message });
    }
});

// Add the new endpoint for forum_list
router.get("/forum_list", async (req, res) => {
    try {
        const forums = await ForumTopic.aggregate([
            {
                $lookup: {
                    from: 'forumcomments',
                    localField: '_id',
                    foreignField: 'topic_id',
                    as: 'comments'
                }
            },
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'creator'
                }
            },
            {
                $project: {
                    _id: 1,
                    title: 1,
                    description: 1,
                    user_id: 1,
                    createdAt: '$created_at',
                    comments: 1,
                    createdBy: { 
                        _id: { $arrayElemAt: ['$creator._id', 0] },
                        name: { $arrayElemAt: ['$creator.name', 0] } 
                    }
                }
            },
            { $sort: { _id: -1 } }
        ]);
        
        return res.json(forums);
    } catch (err) {
        console.error("Error getting forums:", err);
        return res.status(500).json({ error: "Query Error" });
    }
});

// Add the new endpoint for job_list
router.get("/job_list", async (req, res) => {
    try {
        const jobs = await Career.aggregate([
            {
                $lookup: {
                    from: 'users',
                    localField: 'user_id',
                    foreignField: '_id',
                    as: 'poster'
                }
            },
            {
                $project: {
                    _id: 1,
                    company: 1,
                    title: '$job_title',
                    location: 1,
                    description: 1,
                    postedBy: {
                        _id: { $arrayElemAt: ['$poster._id', 0] },
                        name: { $arrayElemAt: ['$poster.name', 0] }
                    },
                    createdAt: '$created_at'
                }
            },
            { $sort: { createdAt: -1 } }
        ]);
        
        return res.json(jobs);
    } catch (err) {
        console.error("Error getting jobs:", err);
        return res.status(500).json({ error: "Query Error" });
    }
});

// Add endpoint to delete a job by id
router.delete("/job/:id", async (req, res) => {
    try {
        const jobId = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(jobId)) {
            return res.status(400).json({ error: "Invalid job ID format" });
        }
        
        const job = await Career.findById(jobId);
        if (!job) {
            return res.status(404).json({ error: "Job not found" });
        }
        
        await Career.findByIdAndDelete(jobId);
        
        return res.json({ message: "Job deleted successfully" });
    } catch (err) {
        console.error("Error deleting job:", err);
        return res.status(500).json({ error: "Server Error" });
    }
});

export { router as adminRouter };
