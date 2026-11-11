/**
 * PRANPAN Application Constants
 */

export const APP_NAME = 'PRANPAN';
export const APP_TAGLINE = 'AI-Powered PDF Summarizer & Document Assistant';
export const APP_PHASE = 'Phase 0 - Architectural Foundation';

export const API_ENDPOINTS = {
  BASE: import.meta.env.VITE_API_URL || 'http://localhost:5000/api',
  HEALTH: '/health'
};

export const STORAGE_KEYS = {
  THEME: 'pranpan_theme',
  AUTH_TOKEN: 'pranpan_token' // Reserved for Phase 2
};
