import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import authRoutes from './authRoutes.js';
import userRoutes from './userRoutes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const apiRouter = Router();

// Base API index
apiRouter.get('/', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Welcome to the PRANPAN API',
    data: {
      name: 'PRANPAN API',
      phase: 'Phase 2 - Backend, Database & Authentication',
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
        }
      }
    }
  });
});

// Mount domain routes
apiRouter.use('/', healthRoutes);
apiRouter.use('/auth', authRoutes);
apiRouter.use('/users', userRoutes);

export default apiRouter;
