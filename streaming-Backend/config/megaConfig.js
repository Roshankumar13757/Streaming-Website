// config/megaConfig.js - Mega Drive Configuration and Initialization
const megaService = require('../services/megaService');
const dotenv = require('dotenv');

dotenv.config();

/**
 * Initialize Mega Drive connection
 * This should be called when the server starts
 */
async function initializeMega() {
  const megaEmail = process.env.MEGA_EMAIL;
  const megaPassword = process.env.MEGA_PASSWORD;
  const megaFolderId = process.env.MEGA_FOLDER_ID || null;

  if (!megaEmail || !megaPassword) {
    console.warn('[MEGA]  Mega credentials not found in environment variables.');
    console.warn('[MEGA]  Videos will be stored locally. Set MEGA_EMAIL and MEGA_PASSWORD to use Mega Drive.');
    return false;
  }

  try {
    console.log('[MEGA]  Initializing Mega Drive connection...');
    await megaService.initialize(megaEmail, megaPassword, megaFolderId);
    console.log('[MEGA]  Mega Drive initialized successfully');
    console.log('[MEGA]  Using folder ID:', megaService.folderId || 'Root folder');
    return true;
  } catch (error) {
    console.error('[MEGA]  Failed to initialize Mega Drive:', error.message);
    console.error('[MEGA]   Videos will be stored locally as fallback.');
    return false;
  }
}

module.exports = {
  initializeMega,
  megaService
};

