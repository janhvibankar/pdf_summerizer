import apiClient from './api.js';

export const authService = {
  /**
   * Register a new user account
   */
  async register({ name, email, password }) {
    return apiClient.post('/auth/register', { name, email, password });
  },

  /**
   * Sign in with email and password
   */
  async login({ email, password }) {
    return apiClient.post('/auth/login', { email, password });
  },

  /**
   * Invalidate session and sign out
   */
  async logout() {
    return apiClient.post('/auth/logout');
  },

  /**
   * Retrieve current authenticated user profile
   */
  async getMe() {
    return apiClient.get('/auth/me');
  },

  /**
   * Update allowed profile fields (name, bio)
   */
  async updateProfile(profileData) {
    return apiClient.patch('/users/me', profileData);
  },

  /**
   * Change account password
   */
  async changePassword({ currentPassword, newPassword }) {
    return apiClient.post('/users/change-password', { currentPassword, newPassword });
  }
};

export default authService;

