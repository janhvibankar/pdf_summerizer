import { Router } from 'express';
import healthRoutes from './healthRoutes.js';
import { ApiResponse } from '../utils/apiResponse.js';

const apiRouter = Router();

// Base API index
apiRouter.get('/', (req, res) => {
  return ApiResponse.success(res, {
    message: 'Welcome to the PRANPAN API',
    data: {
      name: 'PRANPAN API',
      phase: 'Phase 0 - Architectural Foundation',
      endpoints: {
        health: '/api/health'
      }
    }
  });
});

// Mount domain routes
apiRouter.use('/', healthRoutes);

// Architectural reservations for Phase 1 & 2 routes:
// apiRouter.use('/auth', authRoutes);
// apiRouter.use('/documents', documentRoutes);
// apiRouter.use('/summaries', summaryRoutes);

export default apiRouter;
