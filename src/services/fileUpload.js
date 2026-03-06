// File Upload Service for Firebase Storage
import { ref, uploadBytesResumable, getDownloadURL, deleteObject } from 'firebase/storage'
import { storage } from './firebase'

/**
 * Upload a file to Firebase Storage with progress tracking
 * @param {File} file - The file to upload
 * @param {string} folder - The folder path in storage (e.g., 'videos', 'images', 'thumbnails')
 * @param {Function} onProgress - Callback function for upload progress (0-100)
 * @returns {Promise<string>} - Returns the public download URL
 */
export const uploadFile = (file, folder = 'uploads', onProgress = null) => {
  return new Promise((resolve, reject) => {
    if (!file) {
      reject(new Error('No file provided'))
      return
    }

    // Validate file
    const maxSize = (folder === 'videos' || folder === 'trailers') ? 500 * 1024 * 1024 : 10 * 1024 * 1024 // 500MB for videos/trailers, 10MB for images
    if (file.size > maxSize) {
      reject(new Error(`File size exceeds ${maxSize / (1024 * 1024)}MB limit`))
      return
    }

    // Generate unique filename
    const timestamp = Date.now()
    const randomString = Math.random().toString(36).substring(2, 8)
    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const filename = `${timestamp}_${randomString}_${sanitizedName}`
    const filePath = `${folder}/${filename}`

    // Create storage reference
    const storageRef = ref(storage, filePath)

    // Upload file
    const uploadTask = uploadBytesResumable(storageRef, file, {
      contentType: file.type,
    })

    // Listen to upload progress
    uploadTask.on(
      'state_changed',
      (snapshot) => {
        // Calculate progress percentage
        const progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100
        
        // Call progress callback if provided
        if (onProgress && typeof onProgress === 'function') {
          onProgress(Math.round(progress))
        }

        // Log upload state
        switch (snapshot.state) {
          case 'paused':
            console.log('Upload is paused')
            break
          case 'running':
            console.log(`Upload is running: ${progress.toFixed(2)}%`)
            break
        }
      },
      (error) => {
        // Handle upload errors
        console.error('Upload error:', error)
        
        switch (error.code) {
          case 'storage/unauthorized':
            reject(new Error('Unauthorized: Check Firebase Storage rules'))
            break
          case 'storage/canceled':
            reject(new Error('Upload canceled'))
            break
          case 'storage/unknown':
            reject(new Error('Unknown error occurred during upload'))
            break
          default:
            reject(error)
        }
      },
      async () => {
        // Upload completed successfully, get download URL
        try {
          const downloadURL = await getDownloadURL(uploadTask.snapshot.ref)
          console.log('File uploaded successfully:', downloadURL)
          resolve(downloadURL)
        } catch (error) {
          console.error('Error getting download URL:', error)
          reject(error)
        }
      }
    )
  })
}

/**
 * Upload a video file
 * @param {File} file - The video file to upload
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - Returns the public download URL
 */
export const uploadVideo = (file, onProgress = null) => {
  // Validate video file type
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  
  if (!validVideoTypes.includes(file.type)) {
    return Promise.reject(new Error('Invalid video format. Please upload MP4, WebM, OGG, or MOV files.'))
  }

  return uploadFile(file, 'videos', onProgress)
}

/**
 * Upload an image file (thumbnail or poster)
 * @param {File} file - The image file to upload
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - Returns the public download URL
 */
export const uploadImage = (file, onProgress = null) => {
  // Validate image file type
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
  
  if (!validImageTypes.includes(file.type)) {
    return Promise.reject(new Error('Invalid image format. Please upload JPEG, PNG, WebP, or GIF files.'))
  }

  return uploadFile(file, 'thumbnails', onProgress)
}

/**
 * Upload a trailer video
 * @param {File} file - The trailer video file to upload
 * @param {Function} onProgress - Progress callback (0-100)
 * @returns {Promise<string>} - Returns the public download URL
 */
export const uploadTrailer = (file, onProgress = null) => {
  // Validate video file type
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime']
  
  if (!validVideoTypes.includes(file.type)) {
    return Promise.reject(new Error('Invalid video format. Please upload MP4, WebM, OGG, or MOV files.'))
  }

  return uploadFile(file, 'trailers', onProgress)
}

/**
 * Delete a file from Firebase Storage
 * @param {string} fileUrl - The download URL of the file to delete
 * @returns {Promise<void>}
 */
export const deleteFile = async (fileUrl) => {
  try {
    if (!fileUrl) {
      throw new Error('No file URL provided')
    }

    // Extract the file path from the URL
    const urlParts = fileUrl.split('/o/')
    if (urlParts.length < 2) {
      throw new Error('Invalid file URL')
    }

    const pathWithToken = urlParts[1].split('?')[0]
    const filePath = decodeURIComponent(pathWithToken)

    // Create reference and delete
    const fileRef = ref(storage, filePath)
    await deleteObject(fileRef)
    
    console.log('File deleted successfully:', filePath)
  } catch (error) {
    console.error('Error deleting file:', error)
    throw error
  }
}

/**
 * Get file size in human-readable format
 * @param {number} bytes - File size in bytes
 * @returns {string} - Formatted file size
 */
export const formatFileSize = (bytes) => {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const sizes = ['Bytes', 'KB', 'MB', 'GB']
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return Math.round((bytes / Math.pow(k, i)) * 100) / 100 + ' ' + sizes[i]
}

/**
 * Validate file before upload
 * @param {File} file - The file to validate
 * @param {string} type - File type ('video' or 'image')
 * @returns {Object} - {valid: boolean, error: string}
 */
export const validateFile = (file, type = 'video') => {
  if (!file) {
    return { valid: false, error: 'No file selected' }
  }

  console.log('Validating file:', { name: file.name, type: file.type, size: file.size, validationType: type })

  // Size limits
  const maxVideoSize = 500 * 1024 * 1024 // 500MB
  const maxImageSize = 10 * 1024 * 1024  // 10MB

  // Type validation
  const validVideoTypes = ['video/mp4', 'video/webm', 'video/ogg', 'video/quicktime', 'video/x-msvideo', 'video/avi']
  const validImageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']

  if (type === 'video') {
    if (!validVideoTypes.includes(file.type)) {
      console.log('Video type validation failed. File type:', file.type)
      return { valid: false, error: `Invalid video format. File type: ${file.type}. Please upload MP4, WebM, OGG, or MOV files.` }
    }
    if (file.size > maxVideoSize) {
      return { valid: false, error: `Video file size exceeds 500MB limit. Current size: ${formatFileSize(file.size)}` }
    }
  } else if (type === 'image') {
    if (!validImageTypes.includes(file.type)) {
      return { valid: false, error: 'Invalid image format. Please upload JPEG, PNG, WebP, or GIF files.' }
    }
    if (file.size > maxImageSize) {
      return { valid: false, error: `Image file size exceeds 10MB limit. Current size: ${formatFileSize(file.size)}` }
    }
  }

  console.log('File validation passed')
  return { valid: true, error: null }
}
