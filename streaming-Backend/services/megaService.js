// services/megaService.js - Mega Drive Integration Service
const mega = require('megajs');
const fs = require('fs');
const path = require('path');
const { Readable } = require('stream');

class MegaService {
  constructor() {
    this.storage = null;
    this.folderId = null;
    this.targetFolder = null;
    this.initialized = false;
  }

  /**
   * Initialize Mega storage connection
   * @param {string} email - Mega account email
   * @param {string} password - Mega account password
   * @param {string} folderId - Optional: Specific folder ID to use
   */
  async initialize(email, password, folderId = null) {
    try {
      return new Promise((resolve, reject) => {
        this.storage = mega({ email, password }, (error) => {
          if (error) {
            console.error('Mega initialization error:', error);
            reject(error);
            return;
          }

          this.initialized = true;
          console.log('Mega storage initialized successfully');

          // If folderId is provided, use it; otherwise, use root or create a videos folder
          if (folderId) {
            this.folderId = folderId;
            this.targetFolder = this.storage.root.children.find(
              child => child.nodeId === folderId && child.directory
            ) || this.storage.root;
            resolve(this);
          } else {
            // Try to find or create a 'videos' folder
            this.findOrCreateVideosFolder()
              .then(() => resolve(this))
              .catch(reject);
          }
        });
      });
    } catch (error) {
      console.error('Error initializing Mega:', error);
      throw error;
    }
  }

  /**
   * Find or create a videos folder in Mega
   */
  async findOrCreateVideosFolder() {
    return new Promise((resolve, reject) => {
      // First, try to find existing folder
      const existingFolder = this.storage.root.children.find(
        child => child.name === 'StreamHub-Videos' && child.directory
      );

      if (existingFolder) {
        this.folderId = existingFolder.nodeId;
        this.targetFolder = existingFolder;
        resolve(this.folderId);
        return;
      }

      // Create new folder if it doesn't exist
      this.storage.mkdir('StreamHub-Videos', (error, folder) => {
        if (error) {
          reject(error);
          return;
        }
        this.folderId = folder.nodeId;
        this.targetFolder = folder;
        resolve(this.folderId);
      });
    });
  }

  /**
   * Upload a video file to Mega Drive
   * @param {string|Buffer|Stream} file - File path, buffer, or stream
   * @param {string} filename - Name for the file in Mega
   * @param {number} fileSize - Optional: File size in bytes (required for streams)
   * @returns {Promise<Object>} - Upload result with fileId and downloadUrl
   */
  async uploadVideo(file, filename, fileSize = null) {
    if (!this.initialized || !this.storage) {
      throw new Error('Mega storage not initialized. Call initialize() first.');
    }

    return new Promise((resolve, reject) => {
      let fileStream;
      let actualFileSize = fileSize;

      // Handle different input types
      if (typeof file === 'string') {
        // File path
        if (!fs.existsSync(file)) {
          reject(new Error(`File not found: ${file}`));
          return;
        }
        // Get file size from stats
        const stats = fs.statSync(file);
        actualFileSize = stats.size;
        fileStream = fs.createReadStream(file);
        // Set size property on stream for megajs
        if (actualFileSize) {
          fileStream.size = actualFileSize;
        }
      } else if (Buffer.isBuffer(file)) {
        // Buffer
        actualFileSize = file.length;
        fileStream = Readable.from(file);
        fileStream.size = actualFileSize;
      } else if (file && typeof file.pipe === 'function') {
        // Stream - need file size or enable buffering
        fileStream = file;
        if (actualFileSize) {
          fileStream.size = actualFileSize;
        }
      } else {
        reject(new Error('Invalid file input. Expected path, buffer, or stream.'));
        return;
      }

      // Get target folder (use created folder or root)
      const target = this.targetFolder || this.storage.root;

      // Ensure we have a file size - megajs requires it
      if (!actualFileSize) {
        console.warn('File size not available, enabling upload buffering');
      }

      // megajs upload API signature
      // Based on error and documentation, try: folder.upload({name, size}, stream, callback)
      console.log('Uploading with file size:', actualFileSize, 'filename:', filename);

      // Upload to the videos folder
      // Try passing name and size as object first (most common megajs pattern)
      if (actualFileSize) {
        target.upload({ name: filename, size: actualFileSize }, fileStream, async (error, fileNode) => {
          if (error) {
            console.error('Mega upload error (method 1):', error);
            // If that fails, try with options as separate parameter
            target.upload(filename, fileStream, { size: actualFileSize }, async (error2, fileNode2) => {
              if (error2) {
                console.error('Mega upload error (method 2):', error2);
                reject(error2);
                return;
              }
              await this.handleUploadSuccess(fileNode2, actualFileSize, resolve);
            });
            return;
          }
          await this.handleUploadSuccess(fileNode, actualFileSize, resolve);
        });
      } else {
        // Use buffering if size not available
        target.upload(filename, fileStream, { allowUploadBuffering: true }, async (error, fileNode) => {
          if (error) {
            console.error('Mega upload error:', error);
            reject(error);
            return;
          }
          await this.handleUploadSuccess(fileNode, actualFileSize, resolve);
        });
      }
    });
  }

  /**
   * Handle successful upload
   * @param {Object} fileNode - Mega file node
   * @param {number} fileSize - File size
   * @param {Function} resolve - Promise resolve function
   */
  async handleUploadSuccess(fileNode, fileSize, resolve) {
    try {
      const downloadUrl = await this.generateDownloadLink(fileNode);
      resolve({
        fileId: fileNode.nodeId,
        filename: fileNode.name,
        size: fileNode.size || fileSize,
        downloadUrl: downloadUrl,
        publicUrl: downloadUrl
      });
    } catch (error) {
      console.error('Error in handleUploadSuccess:', error);
      // Resolve with fallback URL if link generation fails
      const fallbackUrl = `https://mega.nz/file/${fileNode.nodeId}`;
      resolve({
        fileId: fileNode.nodeId,
        filename: fileNode.name,
        size: fileNode.size || fileSize,
        downloadUrl: fallbackUrl,
        publicUrl: fallbackUrl
      });
    }
  }

  /**
   * Generate a download link for a file
   * @param {Object} fileNode - Mega file node
   * @returns {Promise<string>} - Download URL
   */
  async generateDownloadLink(fileNode) {
    try {
      // Generate a public link - link() method returns a Promise
      const link = await fileNode.link();
      return link;
    } catch (error) {
      console.error('Error generating download link:', error);
      // Fallback: return a handle-based URL
      return `https://mega.nz/file/${fileNode.nodeId}`;
    }
  }

  /**
   * Download a file from Mega Drive
   * @param {string} fileId - Mega file ID
   * @returns {Promise<Buffer>} - File data as buffer
   */
  async downloadVideo(fileId) {
    if (!this.initialized || !this.storage) {
      throw new Error('Mega storage not initialized.');
    }

    return new Promise((resolve, reject) => {
      // Find the file by ID
      const file = this.findFileById(fileId);
      
      if (!file) {
        reject(new Error('File not found in Mega storage'));
        return;
      }

      file.downloadBuffer((error, data) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(data);
      });
    });
  }

  /**
   * Find a file by its ID in the storage tree
   * @param {string} fileId - File ID to find
   * @returns {Object|null} - File node or null
   */
  findFileById(fileId) {
    const search = (node) => {
      if (node.nodeId === fileId) {
        return node;
      }
      if (node.children) {
        for (const child of node.children) {
          const result = search(child);
          if (result) return result;
        }
      }
      return null;
    };

    return search(this.storage.root);
  }

  /**
   * Delete a file from Mega Drive
   * @param {string} fileId - Mega file ID
   * @returns {Promise<boolean>} - Success status
   */
  async deleteVideo(fileId) {
    if (!this.initialized || !this.storage) {
      throw new Error('Mega storage not initialized.');
    }

    return new Promise((resolve, reject) => {
      const file = this.findFileById(fileId);
      
      if (!file) {
        reject(new Error('File not found'));
        return;
      }

      file.delete((error) => {
        if (error) {
          reject(error);
          return;
        }
        resolve(true);
      });
    });
  }

  /**
   * List all videos in the Mega folder
   * @returns {Promise<Array>} - List of video files
   */
  async listVideos() {
    if (!this.initialized || !this.storage) {
      throw new Error('Mega storage not initialized.');
    }

    const videos = [];
    const folder = this.targetFolder || this.storage.root;

    if (!folder || !folder.children) {
      return [];
    }

    // Process files and generate links (async)
    const videoPromises = folder.children
      .filter(child => !child.directory && this.isVideoFile(child.name))
      .map(async (child) => {
        try {
          const downloadUrl = await this.generateDownloadLink(child);
          return {
            fileId: child.nodeId,
            filename: child.name,
            size: child.size,
            created: child.timestamp,
            downloadUrl: downloadUrl
          };
        } catch (error) {
          console.error(`Error processing file ${child.name}:`, error);
          return null;
        }
      });

    const results = await Promise.all(videoPromises);
    return results.filter(video => video !== null);
  }

  /**
   * Check if a file is a video file
   * @param {string} filename - File name
   * @returns {boolean}
   */
  isVideoFile(filename) {
    const videoExtensions = ['.mp4', '.avi', '.mov', '.wmv', '.flv', '.webm', '.mkv', '.m4v'];
    const ext = path.extname(filename).toLowerCase();
    return videoExtensions.includes(ext);
  }

  /**
   * Get file info by ID
   * @param {string} fileId - File ID
   * @returns {Promise<Object|null>} - File information
   */
  async getFileInfo(fileId) {
    const file = this.findFileById(fileId);
    if (!file) return null;

    try {
      const downloadUrl = await this.generateDownloadLink(file);
      return {
        fileId: file.nodeId,
        filename: file.name,
        size: file.size,
        created: file.timestamp,
        downloadUrl: downloadUrl
      };
    } catch (error) {
      console.error('Error getting file info:', error);
      return {
        fileId: file.nodeId,
        filename: file.name,
        size: file.size,
        created: file.timestamp,
        downloadUrl: `https://mega.nz/file/${file.nodeId}`
      };
    }
  }
}

// Export singleton instance
const megaService = new MegaService();

module.exports = megaService;

