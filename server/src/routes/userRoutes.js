import { Router } from 'express';
import { updateMe, changePassword } from '../controllers/userController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { validateRequest, authValidators } from '../validators/index.js';

const router = Router();

router.patch('/me', requireAuth, validateRequest(authValidators.validateUpdateProfile), updateMe);

router.post(
  '/change-password',
  requireAuth,
  validateRequest(authValidators.validateChangePassword),
  changePassword
);

export default router;
