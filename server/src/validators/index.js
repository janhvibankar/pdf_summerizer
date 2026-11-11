import { ApiError } from '../utils/apiError.js';

/**
 * Request Validation Middleware Utility
 * Validates request components (body, query, params) against custom validation rules.
 *
 * @param {Function} validatorFn - Function accepting (req) and returning { error, value }
 */
export const validateRequest = (validatorFn) => {
  return (req, res, next) => {
    try {
      const result = validatorFn(req);
      if (result && result.error) {
        throw ApiError.badRequest(
          result.error.message || 'Validation failed',
          result.error.details || null
        );
      }
      next();
    } catch (err) {
      next(err);
    }
  };
};

export default {
  validateRequest
};
