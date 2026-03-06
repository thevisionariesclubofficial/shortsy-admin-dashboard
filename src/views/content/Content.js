import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CSpinner,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CBadge,
  CButton,
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CForm,
  CFormInput,
  CFormSelect,
  CFormTextarea,
  CFormLabel,
  CAlert,
  CInputGroup,
  CInputGroupText,
  CFormSwitch,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilReload, cilVideo, cilTv, cilPlus, cilTrash, cilStar } from '@coreui/icons'
import { fetchContent, addContent, updateContent } from '../../services/api'
import FileUpload from '../../components/FileUpload'

const Content = () => {
  const [activeTab, setActiveTab] = useState('vertical-series')
  const [content, setContent] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [showAddModal, setShowAddModal] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState('')
  const [formData, setFormData] = useState({
    title: '',
    type: 'short-film',
    thumbnail: '',
    duration: '',
    price: 0,
    director: '',
    language: '',
    genre: '',
    mood: '',
    rating: 0,
    views: 0,
    description: '',
    trailer: '',
    videoUrl: '',
    episodes: 0,
    episodeList: [],
    featured: false,
    festivalWinner: false,
  })

  useEffect(() => {
    loadContent()
  }, [])

  const loadContent = async () => {
    setLoading(true)
    setError('')
    try {
      const response = await fetchContent()
      console.log('Content response:', response)
      setContent(response.data || [])
    } catch (err) {
      setError(err.message || 'Failed to load content')
      console.error('Error loading content:', err)
    } finally {
      setLoading(false)
    }
  }

  const handleAddContent = async (e) => {
    e.preventDefault()
    setFormError('')
    setSubmitting(true)

    try {
      // Prepare data based on type
      const dataToSubmit = {
        title: formData.title,
        type: formData.type,
        thumbnail: formData.thumbnail,
        duration: formData.duration,
        price: parseInt(formData.price),
        director: formData.director,
        language: formData.language,
        genre: formData.genre,
        mood: formData.mood,
        description: formData.description,
        featured: formData.featured,
        festivalWinner: formData.festivalWinner,
      }

      // Add optional fields
      if (formData.rating) dataToSubmit.rating = parseFloat(formData.rating)
      if (formData.views) dataToSubmit.views = parseInt(formData.views)
      if (formData.trailer) dataToSubmit.trailer = formData.trailer

      // Type-specific fields
      if (formData.type === 'short-film') {
        if (!formData.videoUrl) {
          setFormError('Please upload a video file and wait for the upload to complete before submitting')
          setSubmitting(false)
          return
        }
        dataToSubmit.videoUrl = formData.videoUrl
      } else if (formData.type === 'vertical-series') {
        if (!formData.episodes || formData.episodes < 1) {
          setFormError('Episodes count is required and must be greater than 0 for series')
          setSubmitting(false)
          return
        }
        if (!formData.episodeList || formData.episodeList.length !== parseInt(formData.episodes)) {
          setFormError('Episode list must match episodes count')
          setSubmitting(false)
          return
        }
        dataToSubmit.episodes = parseInt(formData.episodes)
        dataToSubmit.episodeList = formData.episodeList
      }

      await addContent(dataToSubmit)
      setShowAddModal(false)
      resetForm()
      loadContent() // Reload content list
    } catch (err) {
      console.error('Error adding content:', err)
      setFormError(err.message || 'Failed to add content')
    } finally {
      setSubmitting(false)
    }
  }

  const resetForm = () => {
    setFormData({
      title: '',
      type: 'short-film',
      thumbnail: '',
      duration: '',
      price: 0,
      director: '',
      language: '',
      genre: '',
      mood: '',
      rating: 0,
      views: 0,
      description: '',
      trailer: '',
      videoUrl: '',
      episodes: 0,
      episodeList: [],
      featured: false,
      festivalWinner: false,
    })
    setFormError('')
  }

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }))
  }

  const addEpisode = () => {
    setFormData(prev => ({
      ...prev,
      episodeList: [...prev.episodeList, {
        id: `ep${prev.episodeList.length + 1}`,
        title: '',
        duration: '',
        thumbnail: '',
        videoUrl: '',
      }]
    }))
  }

  const removeEpisode = (index) => {
    setFormData(prev => ({
      ...prev,
      episodeList: prev.episodeList.filter((_, i) => i !== index)
    }))
  }

  const updateEpisode = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      episodeList: prev.episodeList.map((ep, i) => 
        i === index ? { ...ep, [field]: value } : ep
      )
    }))
  }

  const filterContentByType = (type) => {
    return content.filter((item) => item.type === type)
  }

  const handleToggleFeatured = async (contentId, currentValue) => {
    try {
      // If setting to featured, unfeature all other content first
      if (!currentValue) {
        const featuredContent = content.find(item => item.featured && item.id !== contentId)
        if (featuredContent) {
          await updateContent(featuredContent.id, { featured: false })
        }
      }
      
      // Toggle the selected content
      await updateContent(contentId, { featured: !currentValue })
      await loadContent() // Reload to get updated data
    } catch (err) {
      console.error('Error toggling featured:', err)
      setError(err.message || 'Failed to update featured status')
    }
  }

  const handleToggleFestivalWinner = async (contentId, currentValue) => {
    try {
      await updateContent(contentId, { festivalWinner: !currentValue })
      await loadContent() // Reload to get updated data
    } catch (err) {
      console.error('Error toggling festival winner:', err)
      setError(err.message || 'Failed to update festival winner status')
    }
  }

  const verticalSeries = filterContentByType('vertical-series')
  const shortFilms = filterContentByType('short-film')

  const ContentCard = ({ item }) => (
    <CCol xs={12} sm={6} md={4} lg={3} className="mb-4">
      <CCard className="h-100 shadow-sm">
        <div
          style={{
            position: 'relative',
            paddingTop: '120%',
            backgroundColor: '#f0f0f0',
            overflow: 'hidden',
          }}
        >
          {item.thumbnail ? (
            <img
              src={item.thumbnail}
              alt={item.title}
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                objectFit: 'cover',
              }}
            />
          ) : (
            <div
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: '#e0e0e0',
              }}
            >
              <CIcon icon={item.type === 'vertical-series' ? cilTv : cilVideo} size="xl" />
            </div>
          )}
          <div
            style={{
              position: 'absolute',
              top: 6,
              right: 6,
            }}
          >
            <CBadge color={item.type === 'vertical-series' ? 'info' : 'success'} style={{ fontSize: '0.7rem' }}>
              {item.type === 'vertical-series' ? 'Series' : 'Film'}
            </CBadge>
          </div>
          {item.featured && (
            <div
              style={{
                position: 'absolute',
                top: 6,
                left: 6,
              }}
            >
              <CBadge color="warning" style={{ fontSize: '0.7rem' }}>
                <CIcon icon={cilStar} size="sm" className="me-1" />
                Featured
              </CBadge>
            </div>
          )}
          {item.festivalWinner && (
            <div
              style={{
                position: 'absolute',
                top: item.featured ? 32 : 6,
                left: 6,
              }}
            >
              <CBadge color="danger" style={{ fontSize: '0.7rem' }}>
                🏆 Winner
              </CBadge>
            </div>
          )}
        </div>
        <CCardBody className="p-2">
          <h6 className="mb-1 text-truncate" title={item.title} style={{ fontSize: '0.9rem' }}>
            {item.title}
          </h6>
          <p className="text-muted small mb-1" style={{ fontSize: '0.75rem' }}>
            {item.genre || 'N/A'}
          </p>
          <div className="d-flex justify-content-between align-items-center">
            <small className="text-muted" style={{ fontSize: '0.7rem' }}>{item.duration || 'N/A'}</small>
            <CBadge color={item.price ? 'warning' : 'secondary'} style={{ fontSize: '0.7rem' }}>
              ₹{item.price || 0}
            </CBadge>
          </div>
          {item.episodes > 0 && (
            <div className="mt-1">
              <small className="text-muted" style={{ fontSize: '0.7rem' }}>{item.episodes} Episodes</small>
            </div>
          )}
          <div className="mt-2 pt-2" style={{ borderTop: '1px solid #e0e0e0' }}>
            <div className="d-flex justify-content-between align-items-center mb-1">
              <small style={{ fontSize: '0.7rem' }}>Featured</small>
              <CFormSwitch
                size="sm"
                id={`featured-${item.id}`}
                checked={item.featured || false}
                onChange={() => handleToggleFeatured(item.id, item.featured)}
              />
            </div>
            <div className="d-flex justify-content-between align-items-center">
              <small style={{ fontSize: '0.7rem' }}>Festival Winner</small>
              <CFormSwitch
                size="sm"
                id={`festival-${item.id}`}
                checked={item.festivalWinner || false}
                onChange={() => handleToggleFestivalWinner(item.id, item.festivalWinner)}
              />
            </div>
          </div>
        </CCardBody>
      </CCard>
    </CCol>
  )

  const ContentGrid = ({ items, emptyMessage }) => {
    if (loading) {
      return (
        <div className="text-center py-5">
          <CSpinner color="primary" />
        </div>
      )
    }

    if (items.length === 0) {
      return (
        <div className="text-center py-5">
          <p className="text-muted">{emptyMessage}</p>
        </div>
      )
    }

    return (
      <CRow>
        {items.map((item) => (
          <ContentCard key={item.id} item={item} />
        ))}
      </CRow>
    )
  }

  return (
    <>
      <CCard>
        <CCardHeader className="d-flex justify-content-between align-items-center">
          <h5 className="mb-0">Content Management</h5>
          <div>
            <CButton 
              color="success" 
              size="sm" 
              onClick={() => setShowAddModal(true)} 
              className="me-2"
            >
              <CIcon icon={cilPlus} className="me-1" />
              Add Content
            </CButton>
            <CButton color="primary" size="sm" onClick={loadContent} disabled={loading}>
              <CIcon icon={cilReload} className="me-1" />
              Refresh
            </CButton>
          </div>
        </CCardHeader>
        <CCardBody>
          {error && (
            <div className="alert alert-danger" role="alert">
              {error}
            </div>
          )}

          <CNav variant="tabs" role="tablist" className="mb-4">
            <CNavItem>
              <CNavLink
                active={activeTab === 'vertical-series'}
                onClick={() => setActiveTab('vertical-series')}
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={cilTv} className="me-2" />
                Vertical Series
                <CBadge color="info" className="ms-2">
                  {verticalSeries.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 'short-film'}
                onClick={() => setActiveTab('short-film')}
                style={{ cursor: 'pointer' }}
              >
                <CIcon icon={cilVideo} className="me-2" />
                Short Films
                <CBadge color="success" className="ms-2">
                  {shortFilms.length}
                </CBadge>
              </CNavLink>
            </CNavItem>
          </CNav>

          <CTabContent>
            <CTabPane visible={activeTab === 'vertical-series'}>
              <ContentGrid
                items={verticalSeries}
                emptyMessage="No vertical series available"
              />
            </CTabPane>
            <CTabPane visible={activeTab === 'short-film'}>
              <ContentGrid items={shortFilms} emptyMessage="No short films available" />
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      {/* Add Content Modal */}
      <CModal size="lg" visible={showAddModal} onClose={() => { setShowAddModal(false); resetForm(); }}>
        <CModalHeader>
          <CModalTitle>Add New Content</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {formError && (
            <CAlert color="danger" dismissible onClose={() => setFormError('')}>
              {formError}
            </CAlert>
          )}
          
          <CForm onSubmit={handleAddContent}>
            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="title">Title *</CFormLabel>
                <CFormInput
                  type="text"
                  id="title"
                  name="title"
                  value={formData.title}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
              <CCol md={6}>
                <CFormLabel htmlFor="type">Type *</CFormLabel>
                <CFormSelect
                  id="type"
                  name="type"
                  value={formData.type}
                  onChange={handleInputChange}
                  required
                >
                  <option value="short-film">Short Film</option>
                  <option value="vertical-series">Vertical Series</option>
                </CFormSelect>
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={12}>
                <FileUpload
                  label="Thumbnail Image"
                  type="image"
                  value={formData.thumbnail}
                  onChange={(url) => setFormData(prev => ({ ...prev, thumbnail: url }))}
                  required
                  helpText="Upload a thumbnail image (max 10MB). Supported formats: JPEG, PNG, WebP, GIF"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="duration">Duration *</CFormLabel>
                <CFormInput
                  type="text"
                  id="duration"
                  name="duration"
                  value={formData.duration}
                  onChange={handleInputChange}
                  placeholder="e.g., 15min, 1h 30min"
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="director">Director *</CFormLabel>
                <CFormInput
                  type="text"
                  id="director"
                  name="director"
                  value={formData.director}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="language">Language *</CFormLabel>
                <CFormInput
                  type="text"
                  id="language"
                  name="language"
                  value={formData.language}
                  onChange={handleInputChange}
                  required
                />
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="price">Price (₹) *</CFormLabel>
                <CFormInput
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleInputChange}
                  min="0"
                  required
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={4}>
                <CFormLabel htmlFor="genre">Genre *</CFormLabel>
                <CFormSelect
                  id="genre"
                  name="genre"
                  value={formData.genre}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Genre</option>
                  <option value="Drama">Drama</option>
                  <option value="Thriller">Thriller</option>
                  <option value="Romance">Romance</option>
                  <option value="Comedy">Comedy</option>
                  <option value="Documentary">Documentary</option>
                  <option value="Experimental">Experimental</option>
                  <option value="Family">Family</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="mood">Mood *</CFormLabel>
                <CFormSelect
                  id="mood"
                  name="mood"
                  value={formData.mood}
                  onChange={handleInputChange}
                  required
                >
                  <option value="">Select Mood</option>
                  <option value="5-min Heartbreak">5-min Heartbreak 💔</option>
                  <option value="Late Night">Late Night 🌙</option>
                  <option value="Suspense">Suspense 😱</option>
                  <option value="Heartwarming">Heartwarming ❤️</option>
                  <option value="Emotional">Emotional 😢</option>
                  <option value="Artistic">Artistic 🎨</option>
                  <option value="Inspiring">Inspiring ✨</option>
                </CFormSelect>
              </CCol>
              <CCol md={4}>
                <CFormLabel htmlFor="rating">Rating (0-5)</CFormLabel>
                <CFormInput
                  type="number"
                  id="rating"
                  name="rating"
                  value={formData.rating}
                  onChange={handleInputChange}
                  min="0"
                  max="5"
                  step="0.1"
                />
              </CCol>
            </CRow>

            <div className="mb-3">
              <CFormLabel htmlFor="description">Description *</CFormLabel>
              <CFormTextarea
                id="description"
                name="description"
                rows="3"
                value={formData.description}
                onChange={handleInputChange}
                required
              />
            </div>

            <CRow className="mb-3">
              <CCol md={12}>
                <FileUpload
                  label="Trailer Video (Optional)"
                  type="trailer"
                  value={formData.trailer}
                  onChange={(url) => setFormData(prev => ({ ...prev, trailer: url }))}
                  helpText="Upload a trailer video (max 500MB). Supported formats: MP4, WebM, OGG, MOV"
                />
              </CCol>
            </CRow>

            <CRow className="mb-3">
              <CCol md={6}>
                <CFormLabel htmlFor="views">Views</CFormLabel>
                <CFormInput
                  type="number"
                  id="views"
                  name="views"
                  value={formData.views}
                  onChange={handleInputChange}
                  min="0"
                />
              </CCol>
            </CRow>

            {formData.type === 'short-film' && (
              <div className="mb-3">
                <FileUpload
                  label="Main Video"
                  type="video"
                  value={formData.videoUrl}
                  onChange={(url) => setFormData(prev => ({ ...prev, videoUrl: url }))}
                  required
                  helpText="Upload the main video file (max 500MB). Supported formats: MP4, WebM, OGG, MOV"
                />
              </div>
            )}

            {formData.type === 'vertical-series' && (
              <>
                <div className="mb-3">
                  <CFormLabel htmlFor="episodes">Number of Episodes *</CFormLabel>
                  <CFormInput
                    type="number"
                    id="episodes"
                    name="episodes"
                    value={formData.episodes}
                    onChange={handleInputChange}
                    min="1"
                    required
                  />
                </div>

                <div className="mb-3">
                  <div className="d-flex justify-content-between align-items-center mb-2">
                    <CFormLabel className="mb-0">Episodes List *</CFormLabel>
                    <CButton color="info" size="sm" onClick={addEpisode}>
                      <CIcon icon={cilPlus} className="me-1" />
                      Add Episode
                    </CButton>
                  </div>
                  
                  {formData.episodeList.map((episode, index) => (
                    <CCard key={index} className="mb-2">
                      <CCardBody className="p-3">
                        <div className="d-flex justify-content-between align-items-center mb-2">
                          <h6 className="mb-0">Episode {index + 1}</h6>
                          <CButton 
                            color="danger" 
                            size="sm" 
                            variant="ghost"
                            onClick={() => removeEpisode(index)}
                          >
                            <CIcon icon={cilTrash} />
                          </CButton>
                        </div>
                        <CRow className="g-2">
                          <CCol md={12}>
                            <CFormInput
                              type="text"
                              placeholder="Episode Title *"
                              value={episode.title}
                              onChange={(e) => updateEpisode(index, 'title', e.target.value)}
                              required
                              size="sm"
                            />
                          </CCol>
                          <CCol md={12}>
                            <CFormInput
                              type="text"
                              placeholder="Duration (e.g., 10min) *"
                              value={episode.duration}
                              onChange={(e) => updateEpisode(index, 'duration', e.target.value)}
                              required
                              size="sm"
                            />
                          </CCol>
                          <CCol md={12}>
                            <FileUpload
                              label="Episode Thumbnail"
                              type="image"
                              value={episode.thumbnail}
                              onChange={(url) => updateEpisode(index, 'thumbnail', url)}
                              required
                              id={`episode-thumbnail-${index}`}
                            />
                          </CCol>
                          <CCol md={12}>
                            <FileUpload
                              label="Episode Video"
                              type="video"
                              value={episode.videoUrl}
                              onChange={(url) => updateEpisode(index, 'videoUrl', url)}
                              required
                              id={`episode-video-${index}`}
                            />
                          </CCol>
                        </CRow>
                      </CCardBody>
                    </CCard>
                  ))}
                  
                  {formData.episodeList.length === 0 && (
                    <CAlert color="info">
                      Click "Add Episode" to add episodes to this series
                    </CAlert>
                  )}
                </div>
              </>
            )}

            <CRow className="mb-3">
              <CCol md={6}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="featured"
                    name="featured"
                    checked={formData.featured}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="featured">
                    Featured Content
                  </label>
                </div>
              </CCol>
              <CCol md={6}>
                <div className="form-check">
                  <input
                    className="form-check-input"
                    type="checkbox"
                    id="festivalWinner"
                    name="festivalWinner"
                    checked={formData.festivalWinner}
                    onChange={handleInputChange}
                  />
                  <label className="form-check-label" htmlFor="festivalWinner">
                    Festival Winner
                  </label>
                </div>
              </CCol>
            </CRow>
          </CForm>
        </CModalBody>
        <CModalFooter>
          <CButton 
            color="secondary" 
            onClick={() => { setShowAddModal(false); resetForm(); }}
            disabled={submitting}
          >
            Cancel
          </CButton>
          <CButton 
            color="primary" 
            onClick={handleAddContent}
            disabled={submitting}
          >
            {submitting ? (
              <>
                <CSpinner size="sm" className="me-2" />
                Adding...
              </>
            ) : (
              'Add Content'
            )}
          </CButton>
        </CModalFooter>
      </CModal>
    </>
  )
}

export default Content
