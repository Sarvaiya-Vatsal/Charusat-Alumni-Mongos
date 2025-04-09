# Alumni Management System Backend

## MongoDB Setup Instructions

### Local Setup
1. Install MongoDB Community Edition from: https://www.mongodb.com/try/download/community
2. Start MongoDB service:
   - Windows: Should run as a service automatically
   - Mac/Linux: `sudo systemctl start mongod`
3. Update `.env` file with: `MONGODB_URI=mongodb://localhost:27017/alumni_db`

### Cloud Setup (MongoDB Atlas)
1. Create account at MongoDB Atlas: https://www.mongodb.com/cloud/atlas/register
2. Create free cluster and set up database access
3. Get connection string and update `.env` file

## Running the Application
1. Install dependencies: `npm install`
2. Start server: `npm start`
3. Server runs on port 5000 