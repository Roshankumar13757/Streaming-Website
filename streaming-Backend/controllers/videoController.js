// controllers/videoController.js - Video Controller
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Video = require('../models/Video');
const User = require('../models/User');
const megaService = require('../services/megaService');
const { getMimeTypeFromExtension, getFormatFromMimeType, isFormatSupported, getAlternativeFormats } = require('../utils/videoUtils');

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
    const mimetype = req.file.mimetype || getMimeTypeFromExtension(req.file.originalname);
    const format = getFormatFromMimeType(mimetype);
    
    const video = await Video.create({
      title,
      description,
      category: category || 'Other',
      tags: tags ? tags.split(',').map(tag => tag.trim()) : [],
      filename: req.file.originalname, // Keep original filename for reference
      mimetype: mimetype,
      formats: [{
        format: format,
        mimetype: mimetype,
        fileSize: megaResult?.size || req.file.size || 0,
        megaFileId: megaResult?.fileId || null,
        filename: req.file.originalname
      }],
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
    console.log(`Streaming request for video: ${req.params.id}, format: ${req.query.format || 'original'}`);
    const video = await Video.findById(req.params.id);

    if (!video) {
      console.log('Video not found');
      return res.status(404).json({ error: 'Video not found' });
    }

    console.log(`Video found: ${video.title}, MIME: ${video.mimetype}, Mega ID: ${video.megaFileId}`);

    // Check if local file exists first
    const localVideoPath = path.join(__dirname, '..', 'uploads', 'videos', video.filename || selectedFormat.filename);
    const localFileExists = fs.existsSync(localVideoPath);
    console.log(`Local file exists: ${localFileExists}, path: ${localVideoPath}`);

    // Get requested format from query parameter or use original
    const requestedFormat = req.query.format;
    let selectedFormat = video.formats?.[0] || { mimetype: video.mimetype, format: getFormatFromMimeType(video.mimetype) };
    
    // If a specific format is requested, try to find it
    if (requestedFormat && video.formats) {
      const foundFormat = video.formats.find(f => f.format === requestedFormat);
      if (foundFormat) {
        selectedFormat = foundFormat;
      }
    }

    const mimetype = selectedFormat.mimetype || video.mimetype || 'video/mp4';

    // Set common headers for video streaming
    res.setHeader('Accept-Ranges', 'bytes');
    res.setHeader('Content-Type', mimetype);
    res.setHeader('Cache-Control', 'public, max-age=3600');
    // CORS headers for video streaming
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, HEAD, OPTIONS');
    res.setHeader('Access-Control-Allow-Headers', 'Range');
    // Add format information
    res.setHeader('X-Video-Format', selectedFormat.format || 'mp4');
    res.setHeader('X-Supported-Formats', video.formats?.map(f => f.format).join(',') || selectedFormat.format);

    // Try local file first if it exists
    if (localFileExists) {
      console.log('Streaming from local file');
      const stat = fs.statSync(localVideoPath);
      const fileSize = stat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, '').split('-');
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
        const chunksize = (end - start) + 1;
        const file = fs.createReadStream(localVideoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': mimetype,
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': mimetype,
        };
        res.writeHead(200, head);
        fs.createReadStream(localVideoPath).pipe(res);
      }
      return;
    }

    // If video is stored in Mega Drive, stream from Mega
    if (selectedFormat.megaFileId || video.megaFileId) {
      try {
        const megaFileId = selectedFormat.megaFileId || video.megaFileId;
        const cacheDir = path.join(__dirname, '..', 'cache', 'videos');
        const cacheFilePath = path.join(cacheDir, `${megaFileId}.mp4`);
        
        // Check if file is already cached locally
        const isCached = fs.existsSync(cacheFilePath);
        
        if (isCached) {
          console.log('Serving from cache:', cacheFilePath);
          // Serve from cache
          const stat = fs.statSync(cacheFilePath);
          const fileSize = stat.size;
          const range = req.headers.range;

          if (range) {
            const parts = range.replace(/bytes=/, '').split('-');
            const start = parseInt(parts[0], 10);
            const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
            const chunksize = (end - start) + 1;
            const file = fs.createReadStream(cacheFilePath, { start, end });
            const head = {
              'Content-Range': `bytes ${start}-${end}/${fileSize}`,
              'Accept-Ranges': 'bytes',
              'Content-Length': chunksize,
              'Content-Type': mimetype,
            };

            res.writeHead(206, head);
            file.pipe(res);
          } else {
            const head = {
              'Content-Length': fileSize,
              'Content-Type': mimetype,
            };
            res.writeHead(200, head);
            fs.createReadStream(cacheFilePath).pipe(res);
          }
          return;
        }

        // File not cached, download from Mega and cache it
        console.log('Downloading from Mega and caching:', megaFileId);
        const startTime = Date.now();
        const fileData = await megaService.downloadVideo(megaFileId);
        const downloadTime = Date.now() - startTime;
        console.log(`Downloaded ${fileData.length} bytes from Mega in ${downloadTime}ms`);
        
        // Ensure cache directory exists
        if (!fs.existsSync(cacheDir)) {
          fs.mkdirSync(cacheDir, { recursive: true });
        }
        
        // Cache the file locally
        fs.writeFileSync(cacheFilePath, fileData);
        console.log('File cached locally:', cacheFilePath);
        
        // Get range request if present
        const range = req.headers.range;
        const fileSize = fileData.length;

        if (range) {
          // Handle range requests for video seeking
          const parts = range.replace(/bytes=/, '').split('-');
          const start = parseInt(parts[0], 10);
          const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;
          const chunksize = (end - start) + 1;

          res.writeHead(206, {
            'Content-Range': `bytes ${start}-${end}/${fileSize}`,
            'Accept-Ranges': 'bytes',
            'Content-Length': chunksize,
            'Content-Type': mimetype,
          });
          res.end(fileData.slice(start, end + 1));
        } else {
          // No range request - send full file
          res.setHeader('Content-Length', fileSize);
          res.writeHead(200);
          res.end(fileData);
        }
        return;
      } catch (megaError) {
        console.error('Error streaming from Mega:', megaError);
        console.log('Falling back to local file storage');
        // Fallback to local file if Mega download fails
      }
    }

    // Fallback: Try local file storage
    const videoPath = path.join(__dirname, '..', 'uploads', 'videos', selectedFormat.filename || video.filename);
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
          'Content-Type': mimetype,
        };

        res.writeHead(206, head);
        file.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': mimetype,
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

// @desc    Get available formats for a video
// @route   GET /api/videos/:id/formats
// @access  Public
const getVideoFormats = async (req, res) => {
  try {
    const video = await Video.findById(req.params.id);

    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const formats = video.formats && video.formats.length > 0 ? video.formats : [{
      format: getFormatFromMimeType(video.mimetype),
      mimetype: video.mimetype,
      fileSize: video.fileSize
    }];

    res.json({
      success: true,
      formats: formats,
      originalFormat: {
        format: getFormatFromMimeType(video.mimetype),
        mimetype: video.mimetype
      }
    });
  } catch (error) {
    console.error('Get video formats error:', error);
    res.status(500).json({ error: 'Server error fetching video formats' });
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

    const userId = req.user.id;
    const userObjectId = mongoose.Types.ObjectId(userId);
    const hasLiked = video.likedBy.includes(userObjectId);

    if (hasLiked) {
      // User has already liked, so unlike
      video.likedBy = video.likedBy.filter(id => !id.equals(userObjectId));
      video.likes = Math.max(0, video.likes - 1);
    } else {
      // User hasn't liked, so add like
      video.likedBy.push(userObjectId);
      video.likes += 1;
    }

    await video.save();

    res.json({
      success: true,
      likes: video.likes,
      hasLiked: !hasLiked
    });
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
    const { userId } = req.params;

    // Validate userId is a valid ObjectId
    if (!userId || !require('mongoose').Types.ObjectId.isValid(userId)) {
      return res.json({ success: true, videos: [] });
    }

    const videos = await Video.find({ 
      uploadedBy: userId,
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
  getVideoFormats,
  likeVideo,
  deleteVideo,
  getUserVideos
};