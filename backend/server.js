const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const fs = require('fs');
const connectDB = require('./config/db');
const authRoutes = require('./routes/auth');
const postRoutes = require('./routes/posts');

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir);
}

// Middleware
app.use(cors());
app.use(express.json());
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Simple Request Logging
app.use((req, res, next) => {
    console.log(`${new Date().toISOString()} - ${req.method} ${req.url}`);
    next();
});

// Health Check
app.get('/health', (req, res) => res.json({ status: 'ok', message: 'Backend is reachable' }));

// Routes
app.use('/auth', authRoutes);
app.use('/posts', postRoutes);
app.use('/users', require('./routes/users'));
app.use('/notifications', require('./routes/notifications'));
app.use('/messages', require('./routes/messages'));
app.use('/stories', require('./routes/stories'));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
