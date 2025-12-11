// config/database.js - MongoDB connection helper
const mongoose = require('mongoose');

// Establish MongoDB connection
const connectDB = async () => {
  const uri = process.env.MONGO_URI || 'mongodb://localhost:27017/streaming';

  // Log the exact URI being used (per request, no masking)
  console.log(`Connecting to MongoDB at ${uri}`);

  try {
    await mongoose.connect(uri);
    console.log('MongoDB connected');
  } catch (error) {
    console.error('MongoDB connection error:', error.message);
    // Exit process if connection fails to avoid running the app without DB
    process.exit(1);
  }
};

module.exports = connectDB;

