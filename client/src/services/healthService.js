import apiClient from './api.js';
import { API_ENDPOINTS } from '../utils/constants.js';

export const healthService = {
  /**
   * Fetch backend system health status
   * @returns {Promise<{ success: boolean, message: string, data: object }>}
   */
  async getHealth() {
    return apiClient.get(API_ENDPOINTS.HEALTH);
  }
};

export default healthService;
