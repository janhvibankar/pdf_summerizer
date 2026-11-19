/**
 * PRANPAN Application Constants
 */

export const APP_NAME = 'PRANPAN';
export const APP_TAGLINE = 'AI-Powered PDF Summarizer & Document Assistant';
export const APP_PHASE = 'Phase 5 - Deployment Preparation';

export const API_ENDPOINTS = {
  BASE:
    import.meta.env.VITE_API_URL ||
    import.meta.env.VITE_API_BASE_URL ||
    (import.meta.env.DEV ? 'http://localhost:5000/api' : '/api'),
  HEALTH: '/health'
};

export const STORAGE_KEYS = {
  THEME: 'pranpan_theme',
  AUTH_TOKEN: 'pranpan_token' // Reserved for Phase 2
};
