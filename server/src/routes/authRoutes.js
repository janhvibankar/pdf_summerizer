import { Router } from 'express';
import { register, login, logout, getMe } from '../controllers/authController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest, authValidators } from '../validators/index.js';
import { authLimiter } from '../middleware/rateLimiter.js';

const router = Router();

router.post('/register', authLimiter, validateRequest(authValidators.validateRegister), register);

router.post('/login', authLimiter, validateRequest(authValidators.validateLogin), login);

router.post('/logout', logout);

router.get('/me', requireAuth, getMe);

export default router;
