# Mega Drive Integration - Quick Start

## Installation

```bash
npm install megajs
```

## Configuration

Add these to your `.env` file:

```env
MEGA_EMAIL=your-email@example.com
MEGA_PASSWORD=your-mega-password
MEGA_FOLDER_ID=  # Optional - leave empty for auto-creation
```

## How It Works

1. **Upload**: Videos are uploaded to Mega Drive automatically
2. **Storage**: File metadata stored in MongoDB, actual files in Mega
3. **Streaming**: Videos stream directly from Mega Drive URLs
4. **Management**: All CRUD operations work seamlessly

## Features

- ✅ Automatic folder creation ("StreamHub-Videos")
- ✅ Seamless upload to Mega Drive
- ✅ Direct streaming from Mega URLs
- ✅ Automatic cleanup (deletes local files after upload)
- ✅ Fallback to local storage if Mega unavailable

## Testing

1. Start your server: `npm run dev`
2. Check logs for: `[MEGA] ✅ Mega Drive initialized successfully`
3. Upload a video through your frontend
4. Check MongoDB - video should have `megaFileId` and `megaDownloadUrl` fields

## Troubleshooting

**"Mega storage not initialized"**
- Check `.env` file has correct credentials
- Verify Mega account is active

**Upload fails**
- Check Mega storage quota (free: 20GB)
- Check server logs for detailed errors

**Streaming doesn't work**
- Verify `megaDownloadUrl` is stored in database
- Check that video was successfully uploaded to Mega

For detailed setup, see `MEGA_SETUP.md`

