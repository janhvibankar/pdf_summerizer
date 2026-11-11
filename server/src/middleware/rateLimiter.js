import rateLimit from 'express-rate-limit';
import { ApiResponse } from '../utils/apiResponse.js';

export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 20, // limit each IP to 20 requests per windowMs on auth routes
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    return ApiResponse.error(res, {
      statusCode: 429,
      code: 'TOO_MANY_REQUESTS',
      message: 'Too many authentication attempts from this IP. Please try again after 15 minutes.'
    });
  }
});

export default {
  authLimiter
};

