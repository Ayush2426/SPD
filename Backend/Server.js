// backend/server.js
const express = require('express');
const dotenv = require('dotenv').config();
const cors = require('cors');
const connectDB = require('./Config/db');
const studentRoutes = require('./Routes/studentRoutes');
const { initCronJobs } = require('./Cron/scheduler');

// Connect to database
connectDB();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors()); // Enable CORS for all origins (for development)
app.use(express.json()); // Body parser for raw JSON
app.use(express.urlencoded({ extended: false })); // Body parser for URL-encoded data

// Routes
app.use('/api/students', studentRoutes);

// Cron job initialization
initCronJobs(); // Initialize cron jobs with default or .env schedule

// Simple welcome route
app.get('/', (req, res) => {
    res.send('Student Progress Management API is running...');
});

app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
