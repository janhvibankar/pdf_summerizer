import apiClient from './api.js';

/**
 * Service for document ingestion, retrieval, summarization, and RAG chat.
 */
export const documentService = {
  /**
   * Upload a PDF file to the backend
   * @param {File} file - PDF file to upload
   * @param {Function} [onUploadProgress] - Optional axios progress callback
   */
  async uploadDocument(file, onUploadProgress = null) {
    const formData = new FormData();
    formData.append('file', file);

    return apiClient.post('/documents/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress
    });
  },

  /**
   * Retrieve all uploaded documents for the current authenticated user
   */
  async getDocuments() {
    return apiClient.get('/documents');
  },

  /**
   * Retrieve document metadata by ID
   * @param {string} id - Document ID
   */
  async getDocument(id) {
    return apiClient.get(`/documents/${id}`);
  },

  /**
   * Retrieve full extracted page text for a document
   * @param {string} id - Document ID
   */
  async getDocumentContent(id) {
    return apiClient.get(`/documents/${id}/content`);
  },

  /**
   * Delete a document and all associated summaries and conversations
   * @param {string} id - Document ID
   */
  async deleteDocument(id) {
    return apiClient.delete(`/documents/${id}`);
  },

  /**
   * Generate an AI summary for a document using Gemini
   * @param {string} id - Document ID
   * @param {'short'|'medium'|'detailed'} [summaryType='medium'] - Summary depth
   */
  async generateSummary(id, summaryType = 'medium') {
    return apiClient.post(`/documents/${id}/summarize`, { summaryType });
  },

  /**
   * Retrieve an existing summary for a document
   * @param {string} id - Document ID
   * @param {'short'|'medium'|'detailed'} [summaryType='medium'] - Summary depth
   */
  async getSummary(id, summaryType = 'medium') {
    return apiClient.get(`/documents/${id}/summary`, {
      params: { summaryType }
    });
  },

  /**
   * Ask a question about a document (RAG chat grounded in document pages)
   * @param {string} id - Document ID
   * @param {string} question - User question
   */
  async sendChatMessage(id, question) {
    return apiClient.post(`/documents/${id}/chat`, { question });
  },

  /**
   * Retrieve conversation history for a document
   * @param {string} id - Document ID
   */
  async getChatHistory(id) {
    return apiClient.get(`/documents/${id}/chat`);
  }
};

export default documentService;
