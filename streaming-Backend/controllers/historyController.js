// controllers/historyController.js - History Controller
const History = require('../models/History');
const Video = require('../models/Video');

// @desc    Add video to watch history
// @route   POST /api/history/:videoId
// @access  Private
const addToHistory = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;
    const { watchDuration, completed } = req.body;

    // Check if video exists
    const video = await Video.findById(videoId);
    if (!video) {
      return res.status(404).json({ error: 'Video not found' });
    }

    // Upsert history entry (update if exists, create if not)
    const historyEntry = await History.findOneAndUpdate(
      { userId, videoId },
      {
        watchedAt: new Date(),
        watchDuration: watchDuration || 0,
        completed: completed || false
      },
      {
        upsert: true,
        new: true,
        setDefaultsOnInsert: true
      }
    ).populate('videoId', 'title thumbnail views likes uploadDate uploadedBy category');

    res.json({
      success: true,
      history: historyEntry
    });
  } catch (error) {
    console.error('Add to history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Get user's watch history
// @route   GET /api/history
// @access  Private
const getUserHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;

    const history = await History.find({ userId })
      .sort({ watchedAt: -1 })
      .skip(skip)
      .limit(limit)
      .populate('videoId', 'title description thumbnail views likes uploadDate uploadedBy category')
      .lean();

    // Filter out videos that no longer exist or are deleted
    const validHistory = history.filter(item => item.videoId && item.videoId.status !== 'deleted');

    const total = await History.countDocuments({ userId });

    res.json({
      success: true,
      history: validHistory,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error('Get user history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Remove video from history
// @route   DELETE /api/history/:videoId
// @access  Private
const removeFromHistory = async (req, res) => {
  try {
    const { videoId } = req.params;
    const userId = req.user.id;

    const deletedHistory = await History.findOneAndDelete({ userId, videoId });

    if (!deletedHistory) {
      return res.status(404).json({ error: 'History entry not found' });
    }

    res.json({
      success: true,
      message: 'Removed from history'
    });
  } catch (error) {
    console.error('Remove from history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

// @desc    Clear all watch history
// @route   DELETE /api/history
// @access  Private
const clearHistory = async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await History.deleteMany({ userId });

    res.json({
      success: true,
      message: `Cleared ${result.deletedCount} items from history`
    });
  } catch (error) {
    console.error('Clear history error:', error);
    res.status(500).json({ error: 'Server error' });
  }
};

module.exports = {
  addToHistory,
  getUserHistory,
  removeFromHistory,
  clearHistory
};