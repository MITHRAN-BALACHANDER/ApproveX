import axios from 'axios'

// Use Vite env var for API base; fallback to localhost
const API_BASE_URL =
  import.meta.env?.VITE_API_BASE_URL || 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests (supports role-based tokens)
api.interceptors.request.use(
  config => {
    const token =
      localStorage.getItem('adminToken') ||
      localStorage.getItem('teacherToken') ||
      localStorage.getItem('userToken') ||
      localStorage.getItem('token') // legacy key
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  error => {
    return Promise.reject(error)
  }
)

// Handle auth errors
api.interceptors.response.use(
  response => response,
  error => {
    if (error.response?.status === 401) {
      // Clear all known auth entries and redirect to login
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('adminToken')
      localStorage.removeItem('adminInfo')
      localStorage.removeItem('teacherToken')
      localStorage.removeItem('teacherInfo')
      localStorage.removeItem('userToken')
      localStorage.removeItem('userInfo')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Authentication API
export const authAPI = {
  // Register new user
  register: userData => api.post('/auth/register', userData),

  // Login user
  login: credentials => api.post('/auth/login', credentials),

  // Get user profile
  getProfile: () => api.get('/auth/profile'),

  // Change password
  changePassword: passwordData =>
    api.post('/auth/change-password', passwordData),
}

// Duty Request API
export const dutyRequestAPI = {
  // Get all duty requests (filtered by role)
  getAll: () => api.get('/duty-requests'),

  // Get duty request by ID
  getById: id => api.get(`/duty-requests/${id}`),

  // Create new duty request (students only)
  create: formData => {
    return api.post('/duty-requests', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
  },

  // Update approval status (teachers only)
  updateApproval: (id, approvalData) =>
    api.put(`/duty-requests/${id}/approve`, approvalData),

  // Get pending requests for approval (teachers only)
  getPendingApprovals: level =>
    api.get(`/duty-requests/pending/approvals?level=${level}`),

  // Delete duty request
  delete: id => api.delete(`/duty-requests/${id}`),
}

// Helper functions
export const setAuthToken = token => {
  localStorage.setItem('token', token)
}

export const removeAuthToken = () => {
  localStorage.removeItem('token')
  localStorage.removeItem('user')
}

export const getCurrentUser = () => {
  // Check for role-specific user info in the correct localStorage keys
  const adminInfo = localStorage.getItem('adminInfo')
  const teacherInfo = localStorage.getItem('teacherInfo')
  const userInfo = localStorage.getItem('userInfo') // student info

  if (adminInfo) {
    const admin = JSON.parse(adminInfo)
    return admin.email ? admin : null
  }

  if (teacherInfo) {
    const teacher = JSON.parse(teacherInfo)
    return teacher.email ? teacher : null
  }

  if (userInfo) {
    const student = JSON.parse(userInfo)
    return student.email ? student : null
  }

  // Fallback to old format for backward compatibility
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
  // Check for role-specific tokens
  const adminToken = localStorage.getItem('adminToken')
  const teacherToken = localStorage.getItem('teacherToken')
  const userToken = localStorage.getItem('userToken') // student token

  return !!(
    adminToken ||
    teacherToken ||
    userToken ||
    localStorage.getItem('token')
  )
}

export default api
