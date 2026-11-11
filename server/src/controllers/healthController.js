import { ApiResponse } from '../utils/apiResponse.js';
import { getDbStatus } from '../config/db.js';
import { env } from '../config/env.js';

export const getHealth = (req, res) => {
  const dbStatus = getDbStatus();

  const healthData = {
    status: 'ok',
    service: 'pranpan-api',
    version: '0.1.0',
    timestamp: new Date().toISOString(),
    uptimeSeconds: Math.floor(process.uptime()),
    environment: env.NODE_ENV,
    database: dbStatus
  };

  return ApiResponse.success(res, {
    statusCode: 200,
    message: 'PRANPAN API service is healthy and operational',
    data: healthData
  });
};
