// controllers/commentController.js - Comment Controller
const mongoose = require('mongoose');
const Comment = require('../models/Comment');
const Video = require('../models/Video');

// @desc    Add a comment to a video
// @route   POST /api/comments/video/:videoId
// @access  Private
const addComment = async (req, res) => {
  try {
    const { text, parentComment } = req.body;
    const { videoId } = req.params;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    const comment = await Comment.create({
      videoId,
      userId: req.user.id,
      text: text.trim(),
      parentComment: parentComment || null
    });

    // If it's a reply, add to parent's replies array
    if (parentComment) {
      await Comment.findByIdAndUpdate(
        parentComment,
        { $push: { replies: comment._id } }
      );
    }

    const populatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username email');

    res.status(201).json({
      success: true,
      comment: populatedComment
    });
  } catch (error) {
    console.error('Add comment error:', error);
    res.status(500).json({ error: 'Server error adding comment' });
  }
};

// @desc    Get all comments for a video
// @route   GET /api/comments/video/:videoId
// @access  Public
const getComments = async (req, res) => {
  try {
    const { videoId } = req.params;
    const { limit = 50, page = 1 } = req.query;

    // Get only top-level comments (not replies)
    const comments = await Comment.find({ 
      videoId, 
      parentComment: null 
    })
      .populate('userId', 'username email')
      .populate({
        path: 'replies',
        populate: { path: 'userId', select: 'username email' }
      })
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((page - 1) * limit);

    const total = await Comment.countDocuments({ 
      videoId, 
      parentComment: null 
    });

    res.json({
      success: true,
      comments,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get comments error:', error);
    res.status(500).json({ error: 'Server error fetching comments' });
  }
};

// @desc    Update a comment
// @route   PUT /api/comments/:id
// @access  Private
const updateComment = async (req, res) => {
  try {
    const { text } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ error: 'Comment text is required' });
    }

    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to update this comment' });
    }

    comment.text = text.trim();
    await comment.save();

    const updatedComment = await Comment.findById(comment._id)
      .populate('userId', 'username email');

    res.json({
      success: true,
      comment: updatedComment
    });
  } catch (error) {
    console.error('Update comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Delete a comment
// @route   DELETE /api/comments/:id
// @access  Private
const deleteComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    // Check if user owns the comment
    if (comment.userId.toString() !== req.user.id) {
      return res.status(403).json({ error: 'Not authorized to delete this comment' });
    }

    // Delete all replies if it's a parent comment
    if (comment.replies && comment.replies.length > 0) {
      await Comment.deleteMany({ _id: { $in: comment.replies } });
    }

    // Remove from parent's replies array if it's a reply
    if (comment.parentComment) {
      await Comment.findByIdAndUpdate(
        comment.parentComment,
        { $pull: { replies: comment._id } }
      );
    }

    await comment.deleteOne();

    res.json({
      success: true,
      message: 'Comment deleted successfully'
    });
  } catch (error) {
    console.error('Delete comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Like a comment
// @route   POST /api/comments/:id/like
// @access  Private
const likeComment = async (req, res) => {
  try {
    const comment = await Comment.findById(req.params.id);

    if (!comment) {
      return res.status(404).json({ error: 'Comment not found' });
    }

    const userId = req.user.id;
    const userObjectId = mongoose.Types.ObjectId(userId);
    const hasLiked = comment.likedBy.includes(userObjectId);

    if (hasLiked) {
      // User has already liked, so unlike
      comment.likedBy = comment.likedBy.filter(id => !id.equals(userObjectId));
      comment.likes = Math.max(0, comment.likes - 1);
    } else {
      // User hasn't liked, so add like
      comment.likedBy.push(userObjectId);
      comment.likes += 1;
    }

    await comment.save();

    res.json({
      success: true,
      likes: comment.likes,
      hasLiked: !hasLiked
    });
  } catch (error) {
    console.error('Like comment error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addComment,
  getComments,
  updateComment,
  deleteComment,
  likeComment
};