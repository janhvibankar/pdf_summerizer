import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import cookieParser from 'cookie-parser';
import { requestLogger } from './middleware/requestLogger.js';
import { notFoundHandler } from './middleware/notFoundHandler.js';
import { errorHandler } from './middleware/errorHandler.js';
import { ensureCsrfCookie, verifyCsrf, isOriginAllowed } from './middleware/csrfMiddleware.js';
import apiRouter from './routes/index.js';
import { getHealth } from './controllers/healthController.js';
import { env } from './config/env.js';
import { ApiError } from './utils/apiError.js';

const app = express();

// Trust reverse proxy (Render, AWS ALB, Vercel) in production for HTTPS detection and secure cookies
if (env.isProduction) {
  app.set('trust proxy', 1);
}

// Security headers
app.use(helmet());

// CORS configuration with explicit origins and credentials support
const corsOptions = {
  origin: (origin, callback) => {
    // Allow non-browser agents (curl, postman, server-to-server) without origin header
    if (!origin) return callback(null, true);

    if (isOriginAllowed(origin)) {
      return callback(null, true);
    }

    return callback(new ApiError(403, `Origin '${origin}' not permitted by CORS policy`));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'X-Requested-With',
    'X-CSRF-Token',
    'x-csrf-token',
    'X-XSRF-Token',
    'x-xsrf-token'
  ]
};

app.use(cors(corsOptions));

// HTTP payload parsing, cookies, and compression
app.use(cookieParser());
app.use(compression());
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure CSRF cookie is initialized on safe requests
app.use(ensureCsrfCookie);

// Request logging
app.use(requestLogger);

// Direct root health check endpoint for cloud load balancers and orchestrators
app.get('/health', getHealth);

// API route mounting with CSRF protection on mutating endpoints
app.use('/api', verifyCsrf, apiRouter);

// 404 handler for unmatched routes
app.use(notFoundHandler);

// Centralized error handler
app.use(errorHandler);

export default app;
