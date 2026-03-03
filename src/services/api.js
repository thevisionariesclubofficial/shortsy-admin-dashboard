/**
 * API Service for Shortsy Admin Dashboard
 * 
 * Handles all API calls to the Shortsy backend
 */

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://2tngsao13b.execute-api.ap-south-1.amazonaws.com/v1'

let isRefreshing = false
let refreshSubscribers = []

function subscribeTokenRefresh(callback) {
  refreshSubscribers.push(callback)
}

function onTokenRefreshed(token) {
  refreshSubscribers.forEach(callback => callback(token))
  refreshSubscribers = []
}

/**
 * Refresh access token using refresh token
 */
async function refreshAccessToken() {
  const refreshToken = localStorage.getItem('adminRefreshToken')
  
  if (!refreshToken) {
    throw new Error('No refresh token available')
  }

  const response = await fetch(`${API_BASE_URL}/auth/refresh`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ refreshToken }),
  })

  if (!response.ok) {
    throw new Error('Token refresh failed')
  }

  const data = await response.json()
  
  if (data.tokens?.accessToken) {
    localStorage.setItem('adminToken', data.tokens.accessToken)
    return data.tokens.accessToken
  }
  
  throw new Error('Invalid refresh response')
}

/**
 * Make an authenticated API request with automatic token refresh
 */
async function apiRequest(endpoint, options = {}, isRetry = false) {
  const token = localStorage.getItem('adminToken')
  
  const config = {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
  }

  console.log('API Request:', {
    url: `${API_BASE_URL}${endpoint}`,
    method: options.method || 'GET',
    hasToken: !!token,
    isRetry
  })

  const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
  
  console.log('API Response:', {
    status: response.status,
    statusText: response.statusText,
    ok: response.ok
  })
  
  // Handle 401 Unauthorized - try to refresh token
  if (response.status === 401 && !isRetry) {
    console.log('Got 401, attempting token refresh...')
    
    if (isRefreshing) {
      // Wait for the ongoing refresh to complete
      return new Promise((resolve, reject) => {
        subscribeTokenRefresh((newToken) => {
          if (newToken) {
            // Retry with new token
            resolve(apiRequest(endpoint, options, true))
          } else {
            reject(new Error('Token refresh failed'))
          }
        })
      })
    }

    isRefreshing = true

    try {
      const newToken = await refreshAccessToken()
      console.log('Token refreshed successfully')
      isRefreshing = false
      onTokenRefreshed(newToken)
      
      // Retry the original request with new token
      return apiRequest(endpoint, options, true)
    } catch (err) {
      console.error('Token refresh failed:', err)
      isRefreshing = false
      onTokenRefreshed(null)
      
      // Clear tokens and redirect to login
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminRefreshToken')
      localStorage.removeItem('adminUser')
      window.location.href = '/#/login'
      
      throw new Error('Session expired. Please login again.')
    }
  }
  
  if (!response.ok) {
    const errorText = await response.text()
    console.error('API Error Response:', errorText)
    
    let error
    try {
      error = JSON.parse(errorText)
    } catch {
      error = { message: `HTTP ${response.status}: ${response.statusText}` }
    }
    
    console.error('Parsed error:', error)
    throw new Error(error.message || 'API request failed')
  }

  const data = await response.json()
  console.log('API Response data:', data)
  return data
}

/**
 * Fetch all users
 */
export async function fetchUsers() {
  return apiRequest('/admin/users')
}

/**
 * Fetch user by ID
 */
export async function fetchUserById(userId) {
  return apiRequest(`/admin/users/${userId}`)
}

/**
 * Update user
 */
export async function updateUser(userId, data) {
  return apiRequest(`/admin/users/${userId}`, {
    method: 'PATCH',
    body: JSON.stringify(data),
  })
}

/**
 * Delete user
 */
export async function deleteUser(userId) {
  return apiRequest(`/admin/users/${userId}`, {
    method: 'DELETE',
  })
}

/**
 * Fetch all content
 */
export async function fetchContent() {
  return apiRequest('/content')
}

/**
 * Add new content
 */
export async function addContent(data) {
  return apiRequest('/content', {
    method: 'POST',
    body: JSON.stringify(data),
  })
}

/**
 * Fetch all rentals
 */
export async function fetchRentals() {
  return apiRequest('/admin/rentals')
}

/**
 * Fetch rentals by user ID
 */
export async function fetchUserRentals(userId) {
  return apiRequest(`/admin/rentals?userId=${userId}`)
}

/**
 * Fetch all orders
 */
export async function fetchOrders() {
  return apiRequest('/admin/orders')
}

/**
 * Fetch analytics/stats
 */
export async function fetchAnalytics() {
  return apiRequest('/admin/analytics')
}

/**
 * Login admin
 */
export async function loginAdmin(email, password) {
  const response = await apiRequest('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  })
  
  // Don't store here, let the calling component handle it
  // Backend returns { user, tokens: { accessToken, refreshToken, expiresIn } }
  return response
}

/**
 * Logout admin
 */
export function logoutAdmin() {
  localStorage.removeItem('adminToken')
}

/**
 * Check if admin is authenticated
 */
export function isAuthenticated() {
  return !!localStorage.getItem('adminToken')
}
