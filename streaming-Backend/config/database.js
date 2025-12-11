// config/database.js - MongoDB connection helper
const mongoose = require('mongoose');

// Establish MongoDB connection
const connectDB = async () => {
  const uri = process.env.MONGODB_URI || 'mongodb://localhost:27017/streaming';

  // Log the exact URI being used (per request, no masking)
  console.log(`[DB] Attempting to connect to MongoDB...`);
  console.log(`[DB] URI provided: ${uri ? 'Yes' : 'No (using default)'}`);
  console.log(`[DB] Connection string: ${uri}`);

  try {
    await mongoose.connect(uri, {
      retryWrites: true,
      w: 'majority',
      authSource: 'admin'
    });
    console.log('[DB] ✅ MongoDB connected successfully');
  } catch (error) {
    console.error('[DB] ❌ MongoDB connection error:', error.message);
    console.error('[DB] Error code:', error.code);
    console.error('[DB] Error details:', error);
    // Exit process if connection fails to avoid running the app without DB
    process.exit(1);
  }
};

module.exports = connectDB;

