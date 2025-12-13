// models/Video.js - Video Model Schema
const mongoose = require('mongoose');

const videoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Title is required'],
    trim: true,
    maxlength: [100, 'Title cannot exceed 100 characters']
  },
  description: {
    type: String,
    trim: true,
    maxlength: [5000, 'Description cannot exceed 5000 characters']
  },
  filename: {
    type: String,
    required: true
  },
  // Mega Drive integration fields
  megaFileId: {
    type: String,
    default: null
  },
  megaDownloadUrl: {
    type: String,
    default: null
  },
  megaPublicUrl: {
    type: String,
    default: null
  },
  fileSize: {
    type: Number,
    default: 0
  },
  thumbnail: {
    type: String,
    default: null
  },
  duration: {
    type: Number,
    default: 0
  },
  views: {
    type: Number,
    default: 0
  },
  likes: {
    type: Number,
    default: 0
  },
  dislikes: {
    type: Number,
    default: 0
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  category: {
    type: String,
    enum: ['Gaming', 'Music', 'Education', 'Entertainment', 'Sports', 'Technology', 'Other'],
    default: 'Other'
  },
  tags: [{
    type: String,
    trim: true
  }],
  uploadDate: {
    type: Date,
    default: Date.now
  },
  status: {
    type: String,
    enum: ['processing', 'published', 'private', 'deleted'],
    default: 'published'
  }
}, {
  timestamps: true
});

// Indexes for better query performance
videoSchema.index({ title: 'text', description: 'text', tags: 'text' });
videoSchema.index({ uploadDate: -1 });
videoSchema.index({ views: -1 });
videoSchema.index({ category: 1 });
videoSchema.index({ uploadedBy: 1 });

module.exports = mongoose.model('Video', videoSchema);