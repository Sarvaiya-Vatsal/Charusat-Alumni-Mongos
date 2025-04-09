import express from "express";
import cors from "cors";
import { adminRouter } from "./Routes/AdminRoutes.js";
import dotenv from "dotenv";
import connectMongoDB from "./utils/mongodb.js";

dotenv.config();

// Connect to MongoDB
connectMongoDB();

const app = express();

app.use(cors({
    origin: ['http://localhost:5173', 'https://alumni-client.vercel.app'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
}));

// Handle preflight requests
app.options('*', cors({
    origin: ['http://localhost:5173', 'https://alumni-client.vercel.app'],
    methods: ['GET', 'HEAD', 'PUT', 'PATCH', 'POST', 'DELETE'],
    credentials: true,
}));

app.use(express.json());

app.get("/", (req, res) => {
    res.send("Hello from Alumni Server!");
});

app.use("/auth", adminRouter);
app.use('/Public', express.static('Public'));

// ✅ FIXED: Server Port Configuration
const PORT = process.env.PORT || 5000; // 5000 is default

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
