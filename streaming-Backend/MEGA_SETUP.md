# Mega Drive Integration Setup Guide

This guide will help you set up Mega Drive integration for storing and managing your videos.

## Prerequisites

1. A Mega.nz account (free or paid)
2. Node.js and npm installed
3. MongoDB database connection

## Installation

1. Install the required package:
```bash
cd streaming-Backend
npm install megajs
```

## Configuration

1. Create a `.env` file in the `streaming-Backend` directory (or update your existing one):

```env
# Mega Drive Configuration
MEGA_EMAIL=your-email@example.com
MEGA_PASSWORD=your-mega-password
MEGA_FOLDER_ID=  # Optional: Leave empty to auto-create folder
```

2. **Important Security Note**: Never commit your `.env` file to version control. It contains sensitive credentials.

## How It Works

### Video Upload Flow

1. User uploads a video through the frontend
2. Video is temporarily stored locally
3. Video is uploaded to your Mega Drive folder (automatically creates "StreamHub-Videos" folder if it doesn't exist)
4. Local file is deleted after successful Mega upload
5. Video metadata (including Mega file ID and URLs) is stored in MongoDB

### Video Streaming

- Videos are streamed directly from Mega Drive
- The system uses Mega's download URLs for efficient streaming
- Falls back to local storage if Mega is unavailable

### Database Schema

The Video model now includes these Mega-related fields:
- `megaFileId`: Unique identifier for the file in Mega
- `megaDownloadUrl`: Direct download URL from Mega
- `megaPublicUrl`: Public sharing URL (if available)
- `fileSize`: File size in bytes

## Features

✅ **Automatic Folder Management**: Creates "StreamHub-Videos" folder automatically  
✅ **File Management**: Upload, download, delete operations  
✅ **Streaming Support**: Direct streaming from Mega Drive  
✅ **Fallback Support**: Falls back to local storage if Mega is unavailable  
✅ **Error Handling**: Comprehensive error handling and logging  

## Getting Your Mega Folder ID (Optional)

If you want to use a specific existing folder in Mega:

1. Log in to Mega.nz
2. Navigate to the folder you want to use
3. Copy the folder ID from the URL (the long string after `/folder/`)
4. Add it to your `.env` file as `MEGA_FOLDER_ID`

## Troubleshooting

### "Mega storage not initialized" Error

- Check that `MEGA_EMAIL` and `MEGA_PASSWORD` are set correctly in `.env`
- Verify your Mega account credentials are correct
- Check server logs for detailed error messages

### Upload Failures

- Check your Mega storage quota (free accounts have 20GB)
- Verify internet connection
- Check server logs for specific error messages

### Streaming Issues

- Ensure the video file was successfully uploaded to Mega
- Check that `megaDownloadUrl` is stored in the database
- Verify Mega account is active and accessible

## Security Best Practices

1. **Never commit credentials**: Keep `.env` in `.gitignore`
2. **Use environment variables**: Never hardcode credentials
3. **Regular backups**: Backup your MongoDB database regularly
4. **Monitor usage**: Keep track of Mega storage usage

## API Endpoints

All existing video endpoints work the same way. The Mega integration is transparent to the API:

- `POST /api/videos/upload` - Uploads to Mega automatically
- `GET /api/videos/:id/stream` - Streams from Mega
- `DELETE /api/videos/:id` - Deletes from both Mega and database

## Support

For issues or questions:
1. Check server logs for detailed error messages
2. Verify your Mega account is active
3. Ensure all environment variables are set correctly

