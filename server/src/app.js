import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import { env } from './config/env.js';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import apiRouter from './routes/index.js';
import { ApiError } from './utils/apiError.js';

const app = express();

// Security headers
app.use(helmet());

// CORS configuration with explicit origins
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser agents (curl, postman, server-to-server) without origin header
    if (!origin) return callback(null, true);

    if (env.CLIENT_ORIGIN.includes('*') || env.CLIENT_ORIGIN.includes(origin)) {
      return callback(null, true);
    }

    return callback(new ApiError(403, `Origin '${origin}' not permitted by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With']
};

app.use(cors(corsOptions));

// HTTP payload parsing and compression
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Request logging
app.use(requestLogger);

// API route mounting
app.use('/api', apiRouter);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
