import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';
import { ApiError } from './apiError.js';

const JWT_ISSUER = 'pranpan-api';

/**
 * Sign a JWT token for an authenticated user
 */
export const signToken = (payload) => {
  if (!env.JWT_SECRET) {
    throw ApiError.internal('JWT secret is not configured.');
  }

  return jwt.sign(payload, env.JWT_SECRET, {
    expiresIn: env.JWT_EXPIRES_IN,
    issuer: JWT_ISSUER
  });
};

/**
 * Verify a JWT token and decode its payload
 */
export const verifyToken = (token) => {
  if (!token) {
    throw ApiError.unauthorized('Authentication token is missing.', 'TOKEN_MISSING');
  }

  try {
    return jwt.verify(token, env.JWT_SECRET, {
      issuer: JWT_ISSUER
    });
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      throw ApiError.unauthorized('Authentication token has expired.', 'TOKEN_EXPIRED');
    }
    throw ApiError.unauthorized('Invalid authentication token.', 'TOKEN_INVALID');
  }
};

/**
 * Attach HttpOnly authentication session cookie
 */
export const attachAuthCookie = (res, token) => {
  res.cookie(env.COOKIE_NAME, token, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    maxAge: env.COOKIE_MAX_AGE_MS,
    path: '/'
  });
};

/**
 * Clear authentication session cookie on logout
 */
export const clearAuthCookie = (res) => {
  res.clearCookie(env.COOKIE_NAME, {
    httpOnly: true,
    secure: env.isProduction,
    sameSite: env.isProduction ? 'strict' : 'lax',
    path: '/'
  });
};

