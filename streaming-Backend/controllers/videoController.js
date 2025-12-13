// controllers/videoController.js - Video Controller
const fs = require('fs');
const path = require('path');
const Video = require('../models/Video');
const User = require('../models/User');
const megaService = require('../services/megaService');

// @desc    Upload a new video
// @route   POST /api/videos/upload
// @access  Private
const uploadVideo = async (req, res) => {
  try {
    const { title, description, category, tags } = req.body;

    if (!req.file) {
      return res.status(400).json({ error: 'Please upload a video file' });
    }

    if (!title) {
      return res.status(400).json({ error: 'Title is required' });
    }

    // Upload to Mega Drive
    let megaResult = null;
    try {
      const filePath = req.file.path;
      const originalFilename = req.file.originalname;
      const uniqueFilename = `${Date.now()}-${Math.round(Math.random() * 1E9)}-${originalFilename}`;
      const fileSize = req.file.size; // Get file size from multer
      
      console.log('Uploading to Mega Drive...', { filename: uniqueFilename, size: fileSize });
      megaResult = await megaService.uploadVideo(filePath, uniqueFilename, fileSize);
      console.log('Mega upload successful:', megaResult);

      // Delete local file after successful upload to Mega
      if (fs.existsSync(filePath)) {
        fs.unlinkSync(filePath);
        console.log('Local file deleted after Mega upload');
      }
    } catch (megaError) {
      console.error('Mega upload error:', megaError);
      // If Mega upload fails, still save with local file reference
      // You can choose to fail the upload or continue with local storage
      return res.status(500).json({ 
        error: 'Failed to upload video to cloud storage',
        details: megaError.message 
      });
    }

    // Create video record in MongoDB
    const video = await Video.create({
      title,
      description,
      category: category || 'Other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filename: req.file.originalname, // Keep original filename for reference
      megaFileId: megaResult?.fileId || null,
      megaDownloadUrl: megaResult?.downloadUrl || null,
      megaPublicUrl: megaResult?.publicUrl || null,
      fileSize: megaResult?.size || req.file.size || 0,
      uploadedBy: req.user.id
    });

    res.status(201).json({
      success: true,
      message: 'Video uploaded successfully to Mega Drive',
      video
    });
  } catch (error) {
    console.error('Upload video error:', error);
    res.status(500).json({ error: 'Server error during video upload' });
  }
};

// @desc    Get all videos with filtering and pagination
// @route   GET /api/videos
// @access  Public
const getVideos = async (req, res) => {
  try {
    const { search, category, sortBy, limit = 20, page = 1 } = req.query;

    let query = { status: 'published' };

    // Search by title, description, or tags
    if (search) {
      query.$text = { $search: search };
    }

    // Filter by category
    if (category && category !== 'All') {
      query.category = category;
    }

    // Sorting options
    let sortOptions = { uploadDate: -1 }; // Default: newest first
    if (sortBy === 'views') sortOptions = { views: -1 };
    if (sortBy === 'likes') sortOptions = { likes: -1 };

    const videos = await Video.find(query)
      .populate('uploadedBy', 'username email')
      .sort(sortOptions)
      .limit(parseInt(limit))
      .skip((page - 1) * limit)
      .lean();

    const total = await Video.countDocuments(query);

    res.json({
      success: true,
      videos,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit)
      }
    });
  } catch (error) {
    console.error('Get videos error:', error);
    res.status(500).json({ error: 'Server error fetching videos' });
  }
};

// @desc    Get single video by ID
// @route   GET /api/videos/:id
// @access  Public
const getVideoById = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id)
      .populate('uploadedBy', 'username email subscribers');

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Increment views
    video.views += 1;
    await video.save();

    res.json({ success: true, video });
  } catch (error) {
    console.error('Get video error:', error);
    res.status(500).json({ error: 'Server error fetching video' });
  }
};

// @desc    Stream video
// @route   GET /api/videos/:id/stream
// @access  Public
const streamVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Set common headers for video streaming
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', 'video/mp4');
    res.setHeader('Cache-Control', 'public, max-age=3600');
    // CORS headers for video streaming
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');

    // If video is stored in Mega Drive, stream from Mega
    if (video.megaFileId) {
      try {
        // Get range request if present
        const range = req.headers.range;
        const fileSize = video.fileSize || 0;

        if (range && fileSize > 0) {
          // Handle range requests for video seeking
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;

          // Download only the requested chunk from Mega
          // Note: megajs doesn't support partial downloads directly,
          // so we'll download the full file and slice it
          // For better performance, consider implementing chunked streaming
          const fileData = await megaService.downloadVideo(video.megaFileId);
          
          if (Buffer.isBuffer(fileData)) {
            res.writeHead(206, {
              'Content-Range': `bytes ${start}-${end}/${fileData.length}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': 'video/mp4',
            });
            res.end(fileData.slice(start, end + 1));
          } else {
            // If not a buffer, send full file
            res.writeHead(200, {
              'Content-Length': fileData.length,
              'Content-Type': 'video/mp4',
            });
            res.end(fileData);
          }
        } else {
          // No range request - send full file
          const fileData = await megaService.downloadVideo(video.megaFileId);
          res.setHeader('Content-Length', fileData.length || fileSize);
          res.writeHead(200);
          res.end(fileData);
        }
        return;
      } catch (megaError) {
        console.error('Error streaming from Mega:', megaError);
        // Fallback to local file if Mega download fails
      }
    }

    // Fallback: Try local file storage
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', video.filename);
    if (fs.existsSync(videoPath)) {
      const stat = fs.statSync(videoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': 'video/mp4',
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': 'video/mp4',
        };
        res.writeHead(200, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } else {
      return res.status(404).json({ error: 'Video file not found' });
    }
  } catch (error) {
    console.error('Stream video error:', error);
    res.status(500).json({ error: 'Server error streaming video' });
  }
};

// @desc    Like a video
// @route   POST /api/videos/:id/like
// @access  Private
const likeVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    video.likes += 1;
    await video.save();

    res.json({ success: true, likes: video.likes });
  } catch (error) {
    console.error('Like video error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete video
// @route   DELETE /api/videos/:id
// @access  Private
const deleteVideo = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Check if user owns the video
    if (video.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this video' });
    }

    // Delete video from Mega Drive if it exists
    if (video.megaFileId) {
      try {
        await megaService.deleteVideo(video.megaFileId);
        console.log('Video deleted from Mega Drive');
      } catch (megaError) {
        console.error('Error deleting from Mega:', megaError);
        // Continue with database deletion even if Mega deletion fails
      }
    }

    // Delete local video file if it exists (fallback)
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', video.filename);
    if (fs.existsSync(videoPath)) {
      fs.unlinkSync(videoPath);
    }

    // Delete video from database
    await video.deleteOne();

    res.json({ success: true, message: 'Video deleted successfully' });
  } catch (error) {
    console.error('Delete video error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get user's uploaded videos
// @route   GET /api/videos/user/:userId
// @access  Public
const getUserVideos = async (req, res) => {
  try {
    const videos = await Video.find({ 
      uploadedBy: req.params.userId,
      status: 'published' 
    })
      .sort({ uploadDate: -1 })
      .populate('uploadedBy', 'username email');

    res.json({ success: true, videos });
  } catch (error) {
    console.error('Get user videos error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  uploadVideo,
  getVideos,
  getVideoById,
  streamVideo,
  likeVideo,
  deleteVideo,
  getUserVideos
};