// routes/historyRoutes.js - History Routes
const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  addToHistory,
  getUserHistory,
  removeFromHistory,
  clearHistory
} = require('../controllers/historyController');

// All history routes require authentication
router.use(protect);

// @route   POST /api/history/:videoId
// @desc    Add video to watch history
// @access  Private
router.post('/:videoId', addToHistory);

// @route   GET /api/history
// @desc    Get user's watch history
// @access  Private
router.get('/', getUserHistory);

// @route   DELETE /api/history/:videoId
// @desc    Remove video from history
// @access  Private
router.delete('/:videoId', removeFromHistory);

// @route   DELETE /api/history
// @desc    Clear all watch history
// @access  Private
router.delete('/', clearHistory);

module.exports = router;