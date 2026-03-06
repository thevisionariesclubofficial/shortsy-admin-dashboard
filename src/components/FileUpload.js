import React, { useState, useRef } from 'react'
import PropTypes from 'prop-types'
import {
  CFormLabel,
  CFormInput,
  CProgress,
  CProgressBar,
  CAlert,
  CButton,
  CSpinner,
  CInputGroup,
  CInputGroupText,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilCloudUpload, cilCheckCircle, cilX, cilTrash } from '@coreui/icons'
import { uploadVideo, uploadImage, uploadTrailer, validateFile, formatFileSize } from '../services/fileUpload'

/**
 * FileUpload Component - Reusable component for uploading files to Firebase Storage
 * 
 * @param {string} label - Label for the file input
 * @param {string} type - File type ('video', 'image', or 'trailer')
 * @param {string} value - Current file URL value
 * @param {Function} onChange - Callback when file URL changes
 * @param {boolean} required - Whether the field is required
 * @param {string} accept - File accept attribute
 * @param {string} helpText - Help text to display below input
 */
const FileUpload = ({
  label,
  type = 'video',
  value,
  onChange,
  required = false,
  accept,
  helpText,
  id
}) => {
  const [uploading, setUploading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const [selectedFile, setSelectedFile] = useState(null)
  const [uploadComplete, setUploadComplete] = useState(false)
  const fileInputRef = useRef(null)

  // Determine accept attribute based on type
  const getAcceptAttribute = () => {
    if (accept) return accept
    
    switch (type) {
      case 'video':
      case 'trailer':
        return 'video/mp4,video/webm,video/ogg,video/quicktime'
      case 'image':
        return 'image/jpeg,image/jpg,image/png,image/webp,image/gif'
      default:
        return '*'
    }
  }

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files[0]
    
    if (!file) {
      return
    }

    setError('')
    setUploadComplete(false)
    
    // Validate file
    const validation = validateFile(file, type === 'trailer' ? 'video' : type)
    if (!validation.valid) {
      setError(validation.error)
      return
    }

    setSelectedFile(file)
  }

  // Handle file upload
  const handleUpload = async () => {
    if (!selectedFile) {
      setError('Please select a file first')
      return
    }

    setUploading(true)
    setProgress(0)
    setError('')

    try {
      let downloadURL

      // Choose upload function based on type
      switch (type) {
        case 'video':
          downloadURL = await uploadVideo(selectedFile, setProgress)
          break
        case 'image':
          downloadURL = await uploadImage(selectedFile, setProgress)
          break
        case 'trailer':
          downloadURL = await uploadTrailer(selectedFile, setProgress)
          break
        default:
          throw new Error('Invalid upload type')
      }

      // Call onChange callback with the download URL
      onChange(downloadURL)
      setUploadComplete(true)
      
      // Clear file input
      if (fileInputRef.current) {
        fileInputRef.current.value = ''
      }
      setSelectedFile(null)

    } catch (err) {
      console.error('Upload error:', err)
      setError(err.message || 'Failed to upload file')
    } finally {
      setUploading(false)
    }
  }

  // Handle cancel upload
  const handleCancel = () => {
    setSelectedFile(null)
    setProgress(0)
    setError('')
    setUploadComplete(false)
    
    if (fileInputRef.current) {
      fileInputRef.current.value = ''
    }
  }

  // Handle clear uploaded file
  const handleClear = () => {
    onChange('')
    setUploadComplete(false)
  }

  return (
    <div className="mb-3">
      <CFormLabel htmlFor={id || `file-upload-${type}`}>
        {label} {required && <span className="text-danger">*</span>}
      </CFormLabel>

      {/* File Input */}
      <CInputGroup className="mb-2">
        <CFormInput
          type="file"
          id={id || `file-upload-${type}`}
          ref={fileInputRef}
          accept={getAcceptAttribute()}
          onChange={handleFileSelect}
          disabled={uploading}
        />
        {selectedFile && !uploading && (
          <CButton
            color="primary"
            onClick={handleUpload}
            disabled={uploading}
          >
            <CIcon icon={cilCloudUpload} className="me-1" />
            Upload
          </CButton>
        )}
        {selectedFile && !uploading && (
          <CButton
            color="secondary"
            onClick={handleCancel}
          >
            <CIcon icon={cilX} />
          </CButton>
        )}
      </CInputGroup>

      {/* Help Text */}
      {helpText && !selectedFile && !uploading && !value && (
        <small className="text-muted d-block mb-2">{helpText}</small>
      )}

      {/* Selected File Info */}
      {selectedFile && !uploading && !uploadComplete && (
        <CAlert color="info" className="mb-2 py-2">
          <strong>Selected:</strong> {selectedFile.name} ({formatFileSize(selectedFile.size)})
        </CAlert>
      )}

      {/* Upload Progress */}
      {uploading && (
        <div className="mb-2">
          <div className="d-flex justify-content-between align-items-center mb-1">
            <small className="text-muted">Uploading {selectedFile?.name}...</small>
            <small className="text-muted">{progress}%</small>
          </div>
          <CProgress>
            <CProgressBar
              value={progress}
              color={progress === 100 ? 'success' : 'primary'}
              animated={progress < 100}
            >
              {progress}%
            </CProgressBar>
          </CProgress>
        </div>
      )}

      {/* Upload Complete */}
      {uploadComplete && !uploading && (
        <CAlert color="success" className="mb-2 py-2">
          <CIcon icon={cilCheckCircle} className="me-1" />
          File uploaded successfully!
        </CAlert>
      )}

      {/* Error Message */}
      {error && (
        <CAlert color="danger" className="mb-2 py-2">
          {error}
        </CAlert>
      )}

      {/* Current File URL Display */}
      {value && !uploading && (
        <div className="mt-2">
          <CInputGroup>
            <CInputGroupText>
              <CIcon icon={cilCheckCircle} className="text-success" />
            </CInputGroupText>
            <CFormInput
              type="text"
              value={value}
              readOnly
              className="bg-light"
            />
            <CButton
              color="danger"
              variant="outline"
              onClick={handleClear}
              title="Clear uploaded file"
            >
              <CIcon icon={cilTrash} />
            </CButton>
          </CInputGroup>
          <small className="text-muted d-block mt-1">
            File uploaded and ready to use
          </small>
        </div>
      )}
    </div>
  )
}

FileUpload.propTypes = {
  label: PropTypes.string.isRequired,
  type: PropTypes.oneOf(['video', 'image', 'trailer']),
  value: PropTypes.string,
  onChange: PropTypes.func.isRequired,
  required: PropTypes.bool,
  accept: PropTypes.string,
  helpText: PropTypes.string,
  id: PropTypes.string,
}

export default FileUpload
