import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';
import { ApiResponse } from '../types';

// Get API URL from runtime config or environment variables
const getApiUrl = () => {
  // Try runtime config first (for production)
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_URL && window.APP_CONFIG.API_URL !== '/api') {
    console.log('Using runtime config API URL:', window.APP_CONFIG.API_URL);
    return window.APP_CONFIG.API_URL;
  }
  
  // Try environment variable
  if (import.meta.env.VITE_API_URL) {
    console.log('Using environment variable API URL:', import.meta.env.VITE_API_URL);
    return import.meta.env.VITE_API_URL;
  }
  
  // Production fallback - using actual backend URL
  if (window.location.hostname !== 'localhost') {
    const productionBackendUrl = 'http://ak8gggwkc84o04o4wcwc4gc4.82.29.179.61.sslip.io/api';
    console.log('Using production fallback API URL:', productionBackendUrl);
    return productionBackendUrl;
  }
  
  // Development fallback
  const devUrl = 'http://localhost:3001/api';
  console.log('Using development API URL:', devUrl);
  return devUrl;
};

const getApiTimeout = () => {
  // Try runtime config first (for production)
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_TIMEOUT) {
    return window.APP_CONFIG.API_TIMEOUT;
  }
  // Fall back to environment variables (for development)
  return parseInt(import.meta.env.VITE_API_TIMEOUT || '10000');
};

// Create axios instance
const apiClient: AxiosInstance = axios.create({
  baseURL: getApiUrl(),
  timeout: getApiTimeout(),
  headers: {
    'Content-Type': 'application/json',
  },
});

// Log the final API client configuration
console.log('API Client configured with baseURL:', apiClient.defaults.baseURL);

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle common errors
apiClient.interceptors.response.use(
  (response: AxiosResponse) => {
    return response;
  },
  (error) => {
    // Handle 401 Unauthorized - redirect to login
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // Handle 402 Payment Required - insufficient credits
    if (error.response?.status === 402) {
      // This will be handled by the specific components
      return Promise.reject(error);
    }
    
    return Promise.reject(error);
  }
);

// Generic API methods
export const api = {
  // GET request
  get: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.get(url, config);
  },

  // POST request
  post: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.post(url, data, config);
  },

  // PUT request
  put: <T>(url: string, data?: any, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.put(url, data, config);
  },

  // DELETE request
  delete: <T>(url: string, config?: AxiosRequestConfig): Promise<AxiosResponse<ApiResponse<T>>> => {
    return apiClient.delete(url, config);
  },
};

export default apiClient; 