# Firebase File Upload Integration

## Overview

The Shortsy Admin Dashboard now includes Firebase Storage integration for uploading videos, images, and trailer files directly from the content management interface.

## Features

✅ **File Upload with Progress Tracking**: Real-time upload progress bars
✅ **Automatic URL Generation**: Files are uploaded and URLs are automatically saved
✅ **File Type Validation**: Only valid video and image formats are accepted
✅ **File Size Limits**: 
   - Videos: Max 500MB
   - Images: Max 10MB
✅ **Generic Upload Functions**: Reusable across the application
✅ **Error Handling**: Clear error messages for upload failures

## Setup Instructions

### 1. Firebase Configuration

Add your Firebase credentials to the `.env` file:

```env
VITE_FIREBASE_API_KEY=your_actual_firebase_api_key
VITE_FIREBASE_AUTH_DOMAIN=shortsy-7c19f.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=shortsy-7c19f
VITE_FIREBASE_STORAGE_BUCKET=shortsy-7c19f.firebasestorage.app
VITE_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
VITE_FIREBASE_APP_ID=your_app_id
```

To get these values:
1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project: `shortsy-7c19f`
3. Go to Project Settings > General
4. Scroll down to "Your apps" section
5. Copy the configuration values

### 2. Firebase Storage Rules

Make sure your Firebase Storage has the following rules configured:

```javascript
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Allow uploads from admin dashboard
      allow read, write: if true;  // Adjust based on your security needs
    }
    
    // Specific folder rules
    match /videos/{videoId} {
      allow read: if true;
      allow write: if request.resource.size < 500 * 1024 * 1024; // 500MB limit
    }
    
    match /trailers/{trailerId} {
      allow read: if true;
      allow write: if request.resource.size < 500 * 1024 * 1024; // 500MB limit
    }
    
    match /thumbnails/{imageId} {
      allow read: if true;
      allow write: if request.resource.size < 10 * 1024 * 1024; // 10MB limit
    }
  }
}
```

### 3. Install Dependencies

Firebase SDK is already installed. If you need to reinstall:

```bash
npm install firebase
```

## Usage

### In Content Management

When adding new content:

1. **Thumbnail Upload**:
   - Click "Choose file" under "Thumbnail Image"
   - Select an image file (JPEG, PNG, WebP, or GIF)
   - Click "Upload" button
   - Progress bar shows upload status
   - URL is automatically saved when complete

2. **Trailer Upload** (Optional):
   - Click "Choose file" under "Trailer Video"
   - Select a video file (MP4, WebM, OGG, or MOV)
   - Click "Upload" button
   - Progress bar shows upload status
   - URL is automatically saved to `trailerUrl` field

3. **Main Video Upload** (For Short Films):
   - Click "Choose file" under "Main Video"
   - Select a video file
   - Click "Upload" button
   - Progress bar shows upload status
   - URL is automatically saved to `videoUrl` field

4. **Episode Videos** (For Vertical Series):
   - Each episode has its own thumbnail and video upload
   - Same process as above for each episode

## File Structure

```
src/
├── services/
│   ├── firebase.js          # Firebase initialization and config
│   └── fileUpload.js        # Generic upload functions
├── components/
│   └── FileUpload.js        # Reusable upload component
└── views/
    └── content/
        └── Content.js       # Integrated with FileUpload component
```

## Available Functions

### Generic Upload Functions (from `fileUpload.js`)

```javascript
// Upload any file to Firebase Storage
uploadFile(file, folder, onProgress)

// Upload a video file (max 500MB)
uploadVideo(file, onProgress)

// Upload an image file (max 10MB)
uploadImage(file, onProgress)

// Upload a trailer video (max 500MB)
uploadTrailer(file, onProgress)

// Delete a file from Firebase Storage
deleteFile(fileUrl)

// Validate file before upload
validateFile(file, type)

// Format file size in human-readable format
formatFileSize(bytes)
```

### Example Usage in Code

```javascript
import { uploadVideo, uploadImage } from '../../services/fileUpload'

// Upload video with progress tracking
const handleVideoUpload = async (file) => {
  try {
    const url = await uploadVideo(file, (progress) => {
      console.log(`Upload progress: ${progress}%`)
      setUploadProgress(progress)
    })
    
    console.log('Video uploaded:', url)
    setVideoUrl(url)
  } catch (error) {
    console.error('Upload failed:', error.message)
  }
}

// Upload image
const handleImageUpload = async (file) => {
  try {
    const url = await uploadImage(file, (progress) => {
      setUploadProgress(progress)
    })
    
    setThumbnailUrl(url)
  } catch (error) {
    console.error('Upload failed:', error.message)
  }
}
```

## FileUpload Component Props

```javascript
<FileUpload
  label="Video File"           // Label text
  type="video"                 // 'video', 'image', or 'trailer'
  value={currentUrl}           // Current URL value
  onChange={(url) => {...}}    // Callback when URL changes
  required={true}              // Whether field is required
  helpText="Upload video..."   // Help text below input
  id="unique-id"              // Unique ID for the input
/>
```

## File Storage Structure in Firebase

```
shortsy-7c19f.firebasestorage.app/
├── videos/
│   └── {timestamp}_{random}_{filename}.mp4
├── trailers/
│   └── {timestamp}_{random}_{filename}.mp4
└── thumbnails/
    └── {timestamp}_{random}_{filename}.jpg
```

## Supported File Formats

### Videos
- MP4 (video/mp4)
- WebM (video/webm)
- OGG (video/ogg)
- MOV/QuickTime (video/quicktime)

### Images
- JPEG (image/jpeg, image/jpg)
- PNG (image/png)
- WebP (image/webp)
- GIF (image/gif)

## Error Handling

The component handles various error scenarios:
- File size exceeds limit
- Invalid file format
- Upload failures
- Network errors
- Firebase permission errors

All errors are displayed to the user with clear messages.

## Progress Tracking

- Real-time progress bar (0-100%)
- File name and size display
- Upload status indicators
- Success confirmation

## Security Considerations

⚠️ **Important**: Update Firebase Storage rules for production:

```javascript
// Production-ready rules with authentication
rules_version = '2';
service firebase.storage {
  match /b/{bucket}/o {
    match /{allPaths=**} {
      // Only authenticated admin users can upload
      allow read: if true;
      allow write: if request.auth != null && request.auth.token.admin == true;
    }
  }
}
```

## Troubleshooting

### Upload fails with "Unauthorized" error
- Check Firebase Storage rules
- Verify Firebase configuration in `.env`
- Ensure project ID matches

### Upload progress stuck at 0%
- Check internet connection
- Verify file size is within limits
- Check browser console for errors

### File uploaded but URL not returned
- Check Firebase Storage permissions
- Verify `getDownloadURL` access rules

## Next Steps

1. **Add Firebase credentials** to `.env` file
2. **Configure Firebase Storage rules** for security
3. **Test uploads** with different file types and sizes
4. **Monitor Firebase Storage quota** in Firebase Console

## Support

For issues or questions:
- Check Firebase Console for storage logs
- Review browser console for JavaScript errors
- Verify Firebase configuration is correct
