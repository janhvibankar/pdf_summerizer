import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest, authValidators } from '../validators/index.js';
import { authLimiter } from '../middleware/rateLimiter.js';
import { CSRF_COOKIE_NAME, generateCsrfToken } from '../middleware/csrfMiddleware.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { env } from '../config/env.js';

const router = Router();

// CSRF token generation endpoint
router.get('/csrf-token', (req, res) => {
  const token = req.csrfToken || req.cookies[CSRF_COOKIE_NAME] || generateCsrfToken();
  res.cookie(CSRF_COOKIE_NAME, token, {
    httpOnly: false,
    secure: env.isProduction,
    sameSite: 'lax',
    path: '/'
  });
  return ApiResponse.success(res, {
    statusCode: 200,
    message: 'CSRF token initialized.',
    data: { csrfToken: token }
  });
});

router.post('/register', authLimiter, validateRequest(authValidators.validateRegister), register);

router.post('/login', authLimiter, validateRequest(authValidators.validateLogin), login);

router.post('/logout', logout);

router.get('/me', requireAuth, getMe);

export default router;
