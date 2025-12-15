// utils/videoUtils.js - Video processing utilities
const path = require('path');
const fs = require('fs');

/**
 * Get MIME type from file extension
 * @param {string} filename - The filename
 * @returns {string} MIME type
 */
const getMimeTypeFromExtension = (filename) => {
  const ext = path.extname(filename).toLowerCase();
  const mimeTypes = {
    '.mp4': 'video/mp4',
    '.webm': 'video/webm',
    '.avi': 'video/x-msvideo',
    '.mov': 'video/quicktime',
    '.mkv': 'video/x-matroska',
    '.flv': 'video/x-flv',
    '.wmv': 'video/x-ms-wmv',
    '.m4v': 'video/x-m4v',
    '.3gp': 'video/3gpp'
  };
  return mimeTypes[ext] || 'video/mp4';
};

/**
 * Get format from MIME type
 * @param {string} mimetype - The MIME type
 * @returns {string} Format name
 */
const getFormatFromMimeType = (mimetype) => {
  const formats = {
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/x-msvideo': 'avi',
    'video/quicktime': 'mov',
    'video/x-matroska': 'mkv',
    'video/x-flv': 'flv',
    'video/x-ms-wmv': 'wmv',
    'video/x-m4v': 'm4v',
    'video/3gpp': '3gp'
  };
  return formats[mimetype] || 'mp4';
};

/**
 * Check if a video format is supported by HTML5
 * @param {string} mimetype - The MIME type
 * @returns {boolean} Whether the format is supported
 */
const isFormatSupported = (mimetype) => {
  const supportedTypes = [
    'video/mp4',
    'video/webm',
    'video/ogg'
  ];
  return supportedTypes.includes(mimetype);
};

/**
 * Get alternative formats for better compatibility
 * @param {string} originalMimetype - The original MIME type
 * @returns {string[]} Array of alternative MIME types
 */
const getAlternativeFormats = (originalMimetype) => {
  const alternatives = {
    'video/mp4': ['video/mp4'],
    'video/webm': ['video/webm', 'video/mp4'],
    'video/x-msvideo': ['video/mp4', 'video/webm'],
    'video/quicktime': ['video/mp4', 'video/webm'],
    'video/x-matroska': ['video/webm', 'video/mp4'],
    'video/x-flv': ['video/mp4', 'video/webm'],
    'video/x-ms-wmv': ['video/mp4', 'video/webm'],
    'video/x-m4v': ['video/mp4'],
    'video/3gpp': ['video/mp4', 'video/webm']
  };
  return alternatives[originalMimetype] || ['video/mp4'];
};

module.exports = {
  getMimeTypeFromExtension,
  getFormatFromMimeType,
  isFormatSupported,
  getAlternativeFormats
};