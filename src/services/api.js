import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add auth token to requests
api.interceptors.request.use(
  config => {
    const token = localStorage.getItem('token')
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
      localStorage.removeItem('token')
      localStorage.removeItem('user')
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
  const user = localStorage.getItem('user')
  return user ? JSON.parse(user) : null
}

export const isAuthenticated = () => {
  return !!localStorage.getItem('token')
}

export default api
