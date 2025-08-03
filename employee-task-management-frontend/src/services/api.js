import axios from 'axios'

const API_BASE_URL = 'http://localhost:5000/api'

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
})

// Add token to requests if available
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  }
)

// Auth API
export const authAPI = {
  login: (credentials) => api.post('/auth/login', credentials),
  register: (userData) => api.post('/auth/register', userData),
  getCurrentUser: () => api.get('/auth/me'),
}

// Users API
export const usersAPI = {
  getAllUsers: () => api.get('/users'),
  getUserById: (id) => api.get(`/users/${id}`),
  updateUser: (id, userData) => api.put(`/users/${id}`, userData),
  deleteUser: (id) => api.delete(`/users/${id}`),
  getEmployees: () => api.get('/users/employees'),
}

// Tasks API
export const tasksAPI = {
  createTask: (taskData) => api.post('/tasks', taskData),
  getAllTasks: (params) => api.get('/tasks', { params }),
  getTaskById: (id) => api.get(`/tasks/${id}`),
  updateTask: (id, taskData) => api.put(`/tasks/${id}`, taskData),
  deleteTask: (id) => api.delete(`/tasks/${id}`),
  submitTask: (id, submissionData) => api.post(`/tasks/${id}/submit`, submissionData),
  getTasksByEmployee: (employeeId) => api.get(`/tasks/employee/${employeeId}`),
}

// Reviews API
export const reviewsAPI = {
  createReview: (reviewData) => api.post('/reviews', reviewData),
  getAllReviews: (params) => api.get('/reviews', { params }),
  getReviewById: (id) => api.get(`/reviews/${id}`),
  updateReview: (id, reviewData) => api.put(`/reviews/${id}`, reviewData),
  deleteReview: (id) => api.delete(`/reviews/${id}`),
  submitReview: (id, submissionData) => api.post(`/reviews/${id}/submit`, submissionData),
  getReviewsByEmployee: (employeeId) => api.get(`/reviews/employee/${employeeId}`),
  getSuggestions: (employeeId) => api.get(`/reviews/suggestions/${employeeId}`),
}

export default api

