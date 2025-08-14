import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export class InsufficientCreditsError extends Error {
  constructor(message = 'Nedostatek kreditů') {
    super(message);
    this.name = 'InsufficientCreditsError';
  }
}

export function errorToMessage(err: any): string {
  if (!err) return 'Neznámá chyba';
  if (err instanceof InsufficientCreditsError) return err.message;
  const status = err.response?.status;
  const dataMsg = err.response?.data?.error || err.response?.data?.message;
  if (status === 400) return dataMsg || 'Neplatný požadavek';
  if (status === 401) return 'Přihlaste se prosím znovu';
  if (status === 402) return 'Nemáte dostatek kreditů';
  if (status === 403) return 'Nemáte oprávnění k provedení akce';
  if (status === 404) return 'Požadovaný zdroj nebyl nalezen';
  if (status >= 500) return 'Na serveru došlo k chybě. Zkuste to prosím později.';
  return dataMsg || err.message || 'Nastala chyba';
}
import { ApiResponse } from '../types';

// Get API URL from runtime config or environment variables
const getApiUrl = () => {
  // Try runtime config first (for production)
  if (typeof window !== 'undefined' && window.APP_CONFIG?.API_URL && window.APP_CONFIG.API_URL !== '/api') {
    if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      console.log('Using runtime config API URL:', window.APP_CONFIG.API_URL);
    }
    return window.APP_CONFIG.API_URL;
  }
  
  // Try environment variable
  if (import.meta.env.VITE_API_URL) {
    if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      console.log('Using environment variable API URL:', import.meta.env.VITE_API_URL);
    }
    return import.meta.env.VITE_API_URL;
  }
  
  // Production fallback: rely on nginx proxy to /api
  if (window.location.hostname !== 'localhost') {
    const productionBackendUrl = '/api';
    if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
      console.log('Using production fallback API URL:', productionBackendUrl);
    }
    return productionBackendUrl;
  }
  
  // Development fallback
  const devUrl = 'http://localhost:3001/api';
  if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
    console.log('Using development API URL:', devUrl);
  }
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
if (import.meta.env.VITE_ENABLE_DEBUG_MODE === 'true') {
  console.log('API Client configured with baseURL:', apiClient.defaults.baseURL);
}

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
      return Promise.reject(new InsufficientCreditsError());
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