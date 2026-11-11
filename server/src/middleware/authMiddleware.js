import { env } from '../config/env.js';
import { verifyToken } from '../utils/token.js';
import { ApiError } from '../utils/apiError.js';
import { User } from '../models/User.js';

export const requireAuth = async (req, res, next) => {
  try {
    let token = null;

    // 1. Check HttpOnly cookie
    if (req.cookies && req.cookies[env.COOKIE_NAME]) {
      token = req.cookies[env.COOKIE_NAME];
    }
    // 2. Check Authorization Bearer header
    else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
      token = req.headers.authorization.split(' ')[1];
    }

    if (!token) {
      throw ApiError.unauthorized(
        'Authentication required. Please sign in to proceed.',
        'AUTH_REQUIRED'
      );
    }

    const decoded = verifyToken(token);

    if (!decoded || !decoded.id) {
      throw ApiError.unauthorized('Invalid authentication token payload.', 'TOKEN_INVALID');
    }

    // Lookup user in database
    const user = await User.findById(decoded.id);

    if (!user) {
      throw ApiError.unauthorized(
        'User session is no longer active or user account was removed.',
        'USER_NOT_FOUND'
      );
    }

    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

export default {
  requireAuth
};
