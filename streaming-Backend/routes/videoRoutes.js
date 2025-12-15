// routes/videoRoutes.js - Video Routes
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const {
  uploadVideo,
  getVideos,
  getVideoById,
  streamVideo,
  getVideoFormats,
  likeVideo,
  deleteVideo,
  getUserVideos
} = require('../controllers/videoController');
const { protect, optionalAuth } = require('../middleware/authMiddleware');

// Multer configuration for video uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const dir = './uploads/videos';
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    cb(null, dir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req, file, cb) => {
  // Accept video files only
  if (file.mimetype.startsWith('video/')) {
    cb(null, true);
  } else {
    cb(new Error('Only video files are allowed!'), false);
  }
};

const upload = multer({
  storage,
  limits: { fileSize: 500 * 1024 * 1024 }, // 500MB limit
  fileFilter
});

// Public routes
router.get('/', getVideos);
router.get('/user/:userId', getUserVideos);
router.get('/:id', getVideoById);
router.get('/:id/formats', getVideoFormats);
router.get('/:id/stream', streamVideo);

// Protected routes
router.post('/upload', protect, upload.single('video'), uploadVideo);
router.post('/:id/like', protect, likeVideo);
router.delete('/:id', protect, deleteVideo);

module.exports = router;