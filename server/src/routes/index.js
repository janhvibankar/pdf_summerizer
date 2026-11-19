import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import documentRoutes from './documentRoutes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const apiRouter = Router();

// Base API index
apiRouter.get('/', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Welcome to the PRANPAN API',
    data: {
      name: 'PRANPAN API',
      phase: 'Phase 3 - Document Ingestion, PDF Processing & Gemini AI Integration',
      endpoints: {
        health: '/api/health',
        auth: {
          register: 'POST /api/auth/register',
          login: 'POST /api/auth/login',
          logout: 'POST /api/auth/logout',
          me: 'GET /api/auth/me'
        },
        users: {
          updateProfile: 'PATCH /api/users/me',
          changePassword: 'POST /api/users/change-password'
        },
        documents: {
          upload: 'POST /api/documents/upload',
          list: 'GET /api/documents',
          getById: 'GET /api/documents/:id',
          delete: 'DELETE /api/documents/:id',
          content: 'GET /api/documents/:id/content',
          summarize: 'POST /api/documents/:id/summarize',
          summary: 'GET /api/documents/:id/summary',
          chat: 'POST /api/documents/:id/chat',
          chatHistory: 'GET /api/documents/:id/chat-history'
        }
      }
    }
  });
});

// Mount domain routes
apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);
apiRouter.use('/documents', documentRoutes);

export default apiRouter;
