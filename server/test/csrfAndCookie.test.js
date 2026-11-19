import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  generateCsrfToken,
  ensureCsrfCookie,
  isOriginAllowed,
  verifyCsrf,
  CSRF_COOKIE_NAME,
  CSRF_HEADER_NAME
} from '../src/middleware/csrfMiddleware.js';
import { attachAuthCookie, clearAuthCookie } from '../src/utils/token.js';
import { env } from '../src/config/env.js';

describe('CSRF Middleware & Cross-Site Cookie Production Configuration Tests', () => {
  // 1. Token Generation Entropy
  test('generateCsrfToken creates 64-character hex strings with unique entropy', () => {
    const token1 = generateCsrfToken();
    const token2 = generateCsrfToken();

    assert.strictEqual(typeof token1, 'string');
    assert.strictEqual(token1.length, 64);
    assert.strictEqual(token2.length, 64);
    assert.notStrictEqual(token1, token2);
    assert.match(token1, /^[0-9a-f]{64}$/);
  });

  // 2. ensureCsrfCookie Middleware
  test('ensureCsrfCookie sets cookie with configured SameSite and Secure properties if missing', () => {
    let setCookieName = null;
    let setCookieVal = null;
    let setCookieOptions = null;

    const req = { cookies: {} };
    const res = {
      cookie: (name, val, options) => {
        setCookieName = name;
        setCookieVal = val;
        setCookieOptions = options;
      }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    ensureCsrfCookie(req, res, next);

    assert.ok(nextCalled);
    assert.strictEqual(setCookieName, CSRF_COOKIE_NAME);
    assert.strictEqual(typeof setCookieVal, 'string');
    assert.strictEqual(setCookieVal.length, 64);
    assert.strictEqual(setCookieOptions.httpOnly, false);
    assert.strictEqual(setCookieOptions.path, '/');
    assert.strictEqual(setCookieOptions.sameSite, env.COOKIE_SAME_SITE);
    assert.strictEqual(setCookieOptions.secure, env.isProduction);
    assert.strictEqual(req.csrfToken, setCookieVal);
  });

  test('ensureCsrfCookie reuses existing cookie token if already present on request', () => {
    const existingToken = generateCsrfToken();
    const req = {
      cookies: {
        [CSRF_COOKIE_NAME]: existingToken
      }
    };
    let cookieWasCalled = false;
    const res = {
      cookie: () => { cookieWasCalled = true; }
    };
    let nextCalled = false;
    const next = () => { nextCalled = true; };

    ensureCsrfCookie(req, res, next);

    assert.ok(nextCalled);
    assert.strictEqual(cookieWasCalled, false);
    assert.strictEqual(req.csrfToken, existingToken);
  });

  // 3. isOriginAllowed Validation
  test('isOriginAllowed permits server-to-server and same-origin requests with null origin', () => {
    assert.strictEqual(isOriginAllowed(null), true);
    assert.strictEqual(isOriginAllowed(''), true);
    assert.strictEqual(isOriginAllowed(undefined), true);
  });

  test('isOriginAllowed accurately matches configured client origins', () => {
    // Configured client origin in test env matches env.CLIENT_ORIGIN
    const allowed = env.CLIENT_ORIGIN[0];
    assert.strictEqual(isOriginAllowed(allowed), true);
  });

  test('isOriginAllowed rejects unauthorized external origins', () => {
    assert.strictEqual(isOriginAllowed('https://malicious-phishing-site.com'), false);
    assert.strictEqual(isOriginAllowed('http://unauthorized-domain.org:8080'), false);
  });

  // 4. verifyCsrf Middleware
  test('verifyCsrf allows safe HTTP methods (GET, HEAD, OPTIONS) without token verification', () => {
    const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

    for (const method of safeMethods) {
      let nextCalled = false;
      const req = { method, headers: {} };
      const res = {};
      verifyCsrf(req, res, (err) => {
        assert.ifError(err);
        nextCalled = true;
      });
      assert.ok(nextCalled, `Safe method ${method} must pass verifyCsrf`);
    }
  });

  test('verifyCsrf rejects mutating request with missing CSRF token in headers', () => {
    const token = generateCsrfToken();
    const req = {
      method: 'POST',
      headers: {
        origin: env.CLIENT_ORIGIN[0]
      },
      cookies: {
        [CSRF_COOKIE_NAME]: token
      }
    };
    const res = {};
    let caughtError = null;

    verifyCsrf(req, res, (err) => {
      caughtError = err;
    });

    assert.ok(caughtError);
    assert.strictEqual(caughtError.statusCode, 403);
    assert.strictEqual(caughtError.code, 'CSRF_TOKEN_MISSING');
  });

  test('verifyCsrf rejects mutating request with missing CSRF cookie', () => {
    const token = generateCsrfToken();
    const req = {
      method: 'POST',
      headers: {
        origin: env.CLIENT_ORIGIN[0],
        [CSRF_HEADER_NAME]: token
      },
      cookies: {}
    };
    const res = {};
    let caughtError = null;

    verifyCsrf(req, res, (err) => {
      caughtError = err;
    });

    assert.ok(caughtError);
    assert.strictEqual(caughtError.statusCode, 403);
    assert.strictEqual(caughtError.code, 'CSRF_TOKEN_MISSING');
  });

  test('verifyCsrf rejects mutating request with mismatched header and cookie tokens', () => {
    const tokenA = generateCsrfToken();
    const tokenB = generateCsrfToken();
    const req = {
      method: 'POST',
      headers: {
        origin: env.CLIENT_ORIGIN[0],
        [CSRF_HEADER_NAME]: tokenA
      },
      cookies: {
        [CSRF_COOKIE_NAME]: tokenB
      }
    };
    const res = {};
    let caughtError = null;

    verifyCsrf(req, res, (err) => {
      caughtError = err;
    });

    assert.ok(caughtError);
    assert.strictEqual(caughtError.statusCode, 403);
    assert.strictEqual(caughtError.code, 'CSRF_TOKEN_MISMATCH');
  });

  test('verifyCsrf accepts mutating request when header and cookie tokens match perfectly', () => {
    const token = generateCsrfToken();
    const req = {
      method: 'POST',
      headers: {
        origin: env.CLIENT_ORIGIN[0],
        [CSRF_HEADER_NAME]: token
      },
      cookies: {
        [CSRF_COOKIE_NAME]: token
      }
    };
    const res = {};
    let nextCalled = false;

    verifyCsrf(req, res, (err) => {
      assert.ifError(err);
      nextCalled = true;
    });

    assert.ok(nextCalled);
  });

  // 5. Authentication Cookie Attributes
  test('attachAuthCookie sets HttpOnly, Path=/, and configured SameSite & Secure options', () => {
    let cookieName = null;
    let cookieVal = null;
    let cookieOptions = null;

    const mockRes = {
      cookie: (name, val, options) => {
        cookieName = name;
        cookieVal = val;
        cookieOptions = options;
      }
    };

    attachAuthCookie(mockRes, 'sample.jwt.token');

    assert.strictEqual(cookieName, env.COOKIE_NAME);
    assert.strictEqual(cookieVal, 'sample.jwt.token');
    assert.strictEqual(cookieOptions.httpOnly, true);
    assert.strictEqual(cookieOptions.path, '/');
    assert.strictEqual(cookieOptions.sameSite, env.COOKIE_SAME_SITE);
    assert.strictEqual(cookieOptions.secure, env.isProduction);
    assert.strictEqual(cookieOptions.maxAge, env.COOKIE_MAX_AGE_MS);
  });

  test('clearAuthCookie clears cookie using identical SameSite, Secure, and path attributes', () => {
    let clearedName = null;
    let clearedOptions = null;

    const mockRes = {
      clearCookie: (name, options) => {
        clearedName = name;
        clearedOptions = options;
      }
    };

    clearAuthCookie(mockRes);

    assert.strictEqual(clearedName, env.COOKIE_NAME);
    assert.strictEqual(clearedOptions.httpOnly, true);
    assert.strictEqual(clearedOptions.path, '/');
    assert.strictEqual(clearedOptions.sameSite, env.COOKIE_SAME_SITE);
    assert.strictEqual(clearedOptions.secure, env.isProduction);
  });
});
