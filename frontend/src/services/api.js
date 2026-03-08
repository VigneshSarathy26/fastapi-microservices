import axios from 'axios'
import { getToken, handleAuthError } from './auth'

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost'

/**
 * Configure axios interceptor to add JWT token to all requests
 */
const axiosInstance = axios.create()

axiosInstance.interceptors.request.use(
  (config) => {
    const token = getToken()
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  }
)

/**
 * Configure axios interceptor to handle 401 responses
 */
axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      handleAuthError(error)
    }
    return Promise.reject(error)
  }
)

const usersAPI = {
  getAll: (skip = 0, limit = 10) => 
    axiosInstance.get(`${API_BASE_URL}:8000/api/v1/users`, { params: { skip, limit } }),
  get: (id) => 
    axiosInstance.get(`${API_BASE_URL}:8000/api/v1/users/${id}`),
  create: (data) => 
    axiosInstance.post(`${API_BASE_URL}:8000/api/v1/users`, data),
  update: (id, data) => 
    axiosInstance.put(`${API_BASE_URL}:8000/api/v1/users/${id}`, data),
  delete: (id) => 
    axiosInstance.delete(`${API_BASE_URL}:8000/api/v1/users/${id}`)
}

const productsAPI = {
  getAll: (skip = 0, limit = 10) => 
    axiosInstance.get(`${API_BASE_URL}:8001/api/v1/products`, { params: { skip, limit } }),
  get: (id) => 
    axiosInstance.get(`${API_BASE_URL}:8001/api/v1/products/${id}`),
  create: (data) => 
    axiosInstance.post(`${API_BASE_URL}:8001/api/v1/products`, data),
  update: (id, data) => 
    axiosInstance.put(`${API_BASE_URL}:8001/api/v1/products/${id}`, data),
  delete: (id) => 
    axiosInstance.delete(`${API_BASE_URL}:8001/api/v1/products/${id}`)
}

const ordersAPI = {
  getAll: (skip = 0, limit = 10) => 
    axiosInstance.get(`${API_BASE_URL}:8002/api/v1/orders`, { params: { skip, limit } }),
  get: (id) => 
    axiosInstance.get(`${API_BASE_URL}:8002/api/v1/orders/${id}`),
  getByUser: (userId, skip = 0, limit = 10) => 
    axiosInstance.get(`${API_BASE_URL}:8002/api/v1/orders/user/${userId}`, { params: { skip, limit } }),
  create: (data) => 
    axiosInstance.post(`${API_BASE_URL}:8002/api/v1/orders`, data),
  update: (id, data) => 
    axiosInstance.put(`${API_BASE_URL}:8002/api/v1/orders/${id}`, data),
  delete: (id) => 
    axiosInstance.delete(`${API_BASE_URL}:8002/api/v1/orders/${id}`)
}

export { usersAPI, productsAPI, ordersAPI, axiosInstance }
