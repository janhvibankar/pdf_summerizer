import crypto from 'crypto';
import { env } from '../config/env.js';
import { ApiError } from '../utils/apiError.js';

export const CSRF_COOKIE_NAME = 'pranpan_csrf';
export const CSRF_HEADER_NAME = 'x-csrf-token';

/**
 * Generate a cryptographically secure random CSRF token
 */
export const generateCsrfToken = () => {
  return crypto.randomBytes(32).toString('hex');
};

/**
 * Middleware that sets the CSRF cookie on safe requests if missing
 */
export const ensureCsrfCookie = (req, res, next) => {
  if (!req.cookies || !req.cookies[CSRF_COOKIE_NAME]) {
    const token = generateCsrfToken();
    res.cookie(CSRF_COOKIE_NAME, token, {
      httpOnly: false, // Accessible to client-side JS to attach in X-CSRF-Token header
      secure: env.isProduction,
      sameSite: env.COOKIE_SAME_SITE,
      path: '/'
    });
    // Expose on req for immediate downstream handlers
    req.csrfToken = token;
  } else {
    req.csrfToken = req.cookies[CSRF_COOKIE_NAME];
  }
  next();
};

/**
 * Validate allowed origin against CLIENT_ORIGIN configuration
 */
export const isOriginAllowed = (origin) => {
  if (!origin) return true; // Non-browser / same-origin without Origin header
  try {
    const parsedOrigin = new URL(origin).origin;

    // Check if origin matches any entry in configured CLIENT_ORIGIN array
    const originsList = Array.isArray(env.CLIENT_ORIGIN)
      ? env.CLIENT_ORIGIN
      : [env.CLIENT_ORIGIN];

    const isExplicitlyAllowed = originsList.some((allowed) => {
      try {
        return new URL(allowed).origin === parsedOrigin;
      } catch {
        return false;
      }
    });

    if (isExplicitlyAllowed) {
      return true;
    }

    // In non-production, allow localhost and 127.0.0.1 variants
    if (!env.isProduction) {
      const isLocalhost =
        parsedOrigin.startsWith('http://localhost:') ||
        parsedOrigin.startsWith('http://127.0.0.1:');
      if (isLocalhost) return true;
    }

    return false;
  } catch {
    return false;
  }
};

/**
 * CSRF Protection Middleware
 * Validates Origin and X-CSRF-Token header on all mutating HTTP methods (POST, PUT, PATCH, DELETE)
 */
export const verifyCsrf = (req, res, next) => {
  const method = req.method.toUpperCase();
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (safeMethods.includes(method)) {
    return next();
  }

  // 1. Validate Origin / Referer against allowed client origins
  const origin = req.headers.origin || (req.headers.referer ? new URL(req.headers.referer).origin : null);
  if (origin && !isOriginAllowed(origin)) {
    return next(
      ApiError.forbidden(
        'CSRF validation failed: Request origin is not permitted.',
        'CSRF_ORIGIN_INVALID'
      )
    );
  }

  // 2. Validate Double Submit CSRF token
  const clientToken = req.headers[CSRF_HEADER_NAME] || req.headers['x-xsrf-token'];
  const cookieToken = req.cookies ? req.cookies[CSRF_COOKIE_NAME] : null;

  if (!clientToken || !cookieToken) {
    return next(
      ApiError.forbidden(
        'CSRF validation failed: Missing CSRF token or cookie.',
        'CSRF_TOKEN_MISSING'
      )
    );
  }

  // Timing-safe comparison to prevent timing attacks
  try {
    const clientBuf = Buffer.from(clientToken, 'utf8');
    const cookieBuf = Buffer.from(cookieToken, 'utf8');

    if (clientBuf.length !== cookieBuf.length || !crypto.timingSafeEqual(clientBuf, cookieBuf)) {
      return next(
        ApiError.forbidden(
          'CSRF validation failed: Invalid CSRF token.',
          'CSRF_TOKEN_MISMATCH'
        )
      );
    }
  } catch {
    return next(
      ApiError.forbidden(
        'CSRF validation failed: Unable to verify CSRF token.',
        'CSRF_TOKEN_INVALID'
      )
    );
  }

  next();
};

export default {
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME,
  generateCsrfToken,
  ensureCsrfCookie,
  verifyCsrf,
  isOriginAllowed
};

