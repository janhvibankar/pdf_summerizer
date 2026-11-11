import { ApiResponse } from '../utils/apiResponse.js';
import { logger } from '../utils/logger.js';
import { env } from '../config/env.js';

// eslint-disable-next-line no-unused-vars
export const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || 'An unexpected error occurred';
  const code = err.code || (statusCode >= 500 ? 'INTERNAL_SERVER_ERROR' : 'REQUEST_ERROR');

  if (statusCode >= 500) {
    logger.error(`Unhandled Error [${req.method} ${req.originalUrl}]:`, err);
  } else {
    logger.warn(`Operational Error [${req.method} ${req.originalUrl}]: ${message}`);
  }

  const details = env.isDevelopment ? err.details || { stack: err.stack } : err.details || null;

  return ApiResponse.error(res, {
    statusCode,
    code,
    message,
    details
  });
};
