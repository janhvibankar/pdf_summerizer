import axios from 'axios';
import { API_ENDPOINTS, STORAGE_KEYS } from '../utils/constants.js';

/**
 * Centralized Axios HTTP Client
 * Handles base URL configuration, request headers, and standardized response unwrapping.
 */
export const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE,
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// Request interceptor: attach auth tokens when available (Phase 2 reserve)
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap response envelope and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Return the response data body directly
    return response.data;
  },
  (error) => {
    const normalizedError = {
      message:
        error.response?.data?.error?.message ||
        error.response?.data?.message ||
        error.message ||
        'An unexpected network error occurred',
      statusCode: error.response?.status || 0,
      code: error.response?.data?.error?.code || 'NETWORK_ERROR',
      details: error.response?.data?.error?.details || null
    };

    return Promise.reject(normalizedError);
  }
);

export default apiClient;
