import axios from 'axios';
import { API_ENDPOINTS } from '../utils/constants.js';

/**
 * Centralized Axios HTTP Client
 * Handles base URL configuration, request headers, and standardized response unwrapping.
 */
export const apiClient = axios.create({
  baseURL: API_ENDPOINTS.BASE,
  timeout: 15000,
  withCredentials: true,
  xsrfCookieName: 'pranpan_csrf',
  xsrfHeaderName: 'x-csrf-token',
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json'
  }
});

// In-memory CSRF token cache to support cross-origin deployments (e.g. Vercel client + Render backend)
// where document.cookie across different domains cannot be accessed via JavaScript.
let inMemoryCsrfToken = null;

export const setCsrfToken = (token) => {
  inMemoryCsrfToken = token;
};

export const getCsrfToken = () => {
  return inMemoryCsrfToken || getCookie('pranpan_csrf');
};

// Helper to extract cookie value by name in browser context
const getCookie = (name) => {
  if (typeof document === 'undefined') return null;
  const match = document.cookie.match(new RegExp('(^|; )' + name + '=([^;]*)'));
  return match ? decodeURIComponent(match[2]) : null;
};

// Request interceptor: attach CSRF token on mutating requests
apiClient.interceptors.request.use(
  (config) => {
    const method = config.method?.toLowerCase();
    if (['post', 'put', 'patch', 'delete'].includes(method)) {
      const csrfToken = getCsrfToken();
      if (csrfToken && !config.headers['x-csrf-token']) {
        config.headers['x-csrf-token'] = csrfToken;
      }
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor: unwrap response envelope and normalize errors
apiClient.interceptors.response.use(
  (response) => {
    // Automatically capture CSRF token if present in response body
    if (response.data?.data?.csrfToken) {
      setCsrfToken(response.data.data.csrfToken);
    }
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
