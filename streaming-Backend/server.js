// server.js - Add cookie-parser
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const cookieParser = require('cookie-parser'); // ADD THIS

// Load environment variables FIRST
dotenv.config();

const connectDB = require('./config/database');
const { initializeMega } = require('./config/megaConfig');

const authRoutes = require('./routes/authRoutes');
const videoRoutes = require('./routes/videoRoutes');
const commentRoutes = require('./routes/commentRoutes');

const app = express();
connectDB();

// Initialize Mega Drive (non-blocking)
initializeMega().catch(err => {
  console.error('Mega initialization error:', err);
});

// Middleware
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:5000',
  process.env.FRONTEND_URL || 'https://your-frontend-url.vercel.app'
];

app.use(cors({
  origin: function(origin, callback) {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser()); // ADD THIS
app.use('/uploads', express.static('uploads'));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/videos', videoRoutes);
app.use('/api/comments', commentRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'Server is running' });
});

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ 
    error: 'Something went wrong!', 
    message: err.message 
  });
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});