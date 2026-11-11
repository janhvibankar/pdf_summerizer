import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { signToken, verifyToken, attachAuthCookie, clearAuthCookie } from '../src/utils/token.js';

describe('JWT Token & Session Cookie Unit Tests', () => {
  const samplePayload = {
    id: '507f1f77bcf86cd799439011',
    email: 'test@example.com',
    role: 'user'
  };

  test('signToken generates valid signed JWT string', () => {
    const token = signToken(samplePayload);
    assert.strictEqual(typeof token, 'string');
    assert.ok(token.split('.').length === 3);
  });

  test('verifyToken decodes valid token payload accurately', () => {
    const token = signToken(samplePayload);
    const decoded = verifyToken(token);
    assert.strictEqual(decoded.id, samplePayload.id);
    assert.strictEqual(decoded.email, samplePayload.email);
    assert.strictEqual(decoded.role, samplePayload.role);
    assert.strictEqual(decoded.iss, 'pranpan-api');
  });

  test('verifyToken throws on malformed or empty token', () => {
    assert.throws(() => verifyToken(''), /Authentication token is missing/i);
    assert.throws(() => verifyToken('invalid.jwt.token'), /Invalid authentication token/i);
  });

  test('attachAuthCookie sets secure HttpOnly cookie on response', () => {
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

    const token = signToken(samplePayload);
    attachAuthCookie(mockRes, token);

    assert.strictEqual(cookieName, 'pranpan_session');
    assert.strictEqual(cookieVal, token);
    assert.strictEqual(cookieOptions.httpOnly, true);
    assert.strictEqual(cookieOptions.path, '/');
    assert.ok(cookieOptions.maxAge > 0);
  });

  test('clearAuthCookie clears session cookie on response', () => {
    let clearedName = null;
    let clearedOptions = null;

    const mockRes = {
      clearCookie: (name, options) => {
        clearedName = name;
        clearedOptions = options;
      }
    };

    clearAuthCookie(mockRes);
    assert.strictEqual(clearedName, 'pranpan_session');
    assert.strictEqual(clearedOptions.httpOnly, true);
    assert.strictEqual(clearedOptions.path, '/');
  });
});

