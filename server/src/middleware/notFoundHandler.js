import { ApiResponse } from '../utils/apiResponse.js';

export const notFoundHandler = (req, res) => {
  return ApiResponse.error(res, {
    statusCode: 404,
    code: 'NOT_FOUND',
    message: `Resource not found: ${req.method} ${req.originalUrl}`
  });
};
