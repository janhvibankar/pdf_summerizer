import { test, describe, before, after } from 'node:test';
import assert from 'node:assert/strict';
import http from 'http';
import bcrypt from 'bcryptjs';
import app from '../src/app.js';
import { User } from '../src/models/User.js';

describe('Authentication & Security HTTP Integration Tests', () => {
  let server;
  let baseUrl;

  // In-memory user database collection for deterministic isolated testing
  const usersDb = new Map();

  // Preserve original Mongoose methods
  const originalFindOne = User.findOne;
  const originalCreate = User.create;
  const originalFindById = User.findById;
  const originalFindByIdAndUpdate = User.findByIdAndUpdate;

  before(async () => {
    // Mock User methods with an isolated in-memory store
    User.findOne = (query) => {
      const exec = async () => {
        if (query.email) {
          const user = Array.from(usersDb.values()).find(
            (u) => u.email === query.email.toLowerCase()
          );
          return user ? createMockUserDoc(user) : null;
        }
        return null;
      };
      return {
        select: () => ({
          exec,
          then: (resolve, reject) => exec().then(resolve, reject)
        }),
        exec,
        then: (resolve, reject) => exec().then(resolve, reject)
      };
    };

    User.create = async (userData) => {
      const passwordHash =
        userData.passwordHash || (await bcrypt.hash(userData.password, 10));

      const doc = new User({
        name: userData.name,
        email: userData.email.toLowerCase(),
        passwordHash,
        bio: userData.bio || '',
        role: userData.role || 'user',
        tokenVersion: 0
      });

      const userRecord = {
        _id: doc._id.toString(),
        name: doc.name,
        email: doc.email,
        passwordHash,
        bio: doc.bio,
        role: doc.role,
        tokenVersion: 0,
        createdAt: new Date(),
        updatedAt: new Date()
      };

      usersDb.set(doc._id.toString(), userRecord);
      return createMockUserDoc(userRecord);
    };

    User.findById = (id) => {
      const exec = async () => {
        const user = usersDb.get(String(id));
        return user ? createMockUserDoc(user) : null;
      };
      return {
        select: () => ({
          exec,
          then: (resolve, reject) => exec().then(resolve, reject)
        }),
        exec,
        then: (resolve, reject) => exec().then(resolve, reject)
      };
    };

    User.findByIdAndUpdate = async (id, update) => {
      const user = usersDb.get(String(id));
      if (!user) return null;
      if (update.$inc && update.$inc.tokenVersion) {
        user.tokenVersion = (user.tokenVersion || 0) + update.$inc.tokenVersion;
      }
      return createMockUserDoc(user);
    };

    function createMockUserDoc(userData) {
      const doc = new User(userData);
      doc._id = userData._id;
      doc.id = userData._id;
      doc.passwordHash = userData.passwordHash;
      doc.tokenVersion = userData.tokenVersion || 0;
      doc.comparePassword = function (candidate) {
        return bcrypt.compare(candidate, this.passwordHash);
      };
      doc.save = async function () {
        const updated = {
          _id: String(this._id),
          name: this.name,
          email: this.email,
          passwordHash: this.passwordHash,
          bio: this.bio,
          role: this.role,
          tokenVersion: this.tokenVersion,
          createdAt: this.createdAt,
          updatedAt: new Date()
        };
        usersDb.set(String(this._id), updated);
        return createMockUserDoc(updated);
      };
      return doc;
    }

    // Start HTTP server on dynamic port
    await new Promise((resolve) => {
      server = http.createServer(app);
      server.listen(0, '127.0.0.1', () => {
        const port = server.address().port;
        baseUrl = `http://127.0.0.1:${port}`;
        resolve();
      });
    });
  });

  after(async () => {
    // Restore original Mongoose methods and stop server
    User.findOne = originalFindOne;
    User.create = originalCreate;
    User.findById = originalFindById;
    User.findByIdAndUpdate = originalFindByIdAndUpdate;

    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
  });

  // State shared across sequential tests
  let csrfToken = null;
  let csrfCookie = null;
  let sessionCookie = null;
  let savedTokenBeforePasswordChange = null;
  let savedTokenBeforeLogout = null;

  test('CSRF 1: GET /api/auth/csrf-token initializes CSRF token and sets pranpan_csrf cookie', async () => {
    const res = await fetch(`${baseUrl}/api/auth/csrf-token`);
    assert.equal(res.status, 200);

    const body = await res.json();
    assert.equal(body.success, true);
    assert.ok(body.data.csrfToken);
    csrfToken = body.data.csrfToken;

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie.includes('pranpan_csrf='));
    const match = setCookie.match(/pranpan_csrf=([^;]+)/);
    assert.ok(match);
    csrfCookie = match[0];
  });

  test('CSRF 2: Mutating POST request without CSRF token is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        name: 'Attacker',
        email: 'attacker@example.com',
        password: 'Password123!'
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'CSRF_TOKEN_MISSING');
  });

  test('Origin 1: Mutating request from disallowed origin is rejected with 403 Forbidden', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://malicious-attacker.com'
      },
      body: JSON.stringify({
        name: 'Evil Cross-Origin',
        email: 'evil@example.com',
        password: 'Password123!'
      })
    });

    assert.equal(res.status, 403);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('not permitted'));
  });

  test('Registration 1: POST /api/auth/register succeeds with valid payload, sets session cookie and returns safe user', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        name: 'Audited User',
        email: 'audited@pranpan.com',
        password: 'SecurePassword123!'
      })
    });

    assert.equal(res.status, 201);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, 'audited@pranpan.com');
    assert.equal(body.data.user.name, 'Audited User');
    assert.equal(body.data.user.role, 'user');
    assert.equal(body.data.user.passwordHash, undefined);
    assert.equal(body.data.user.tokenVersion, undefined);

    // Extract HttpOnly session cookie
    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie.includes('pranpan_session='));
    assert.ok(setCookie.toLowerCase().includes('httponly'));
    const match = setCookie.match(/pranpan_session=([^;]+)/);
    assert.ok(match);
    sessionCookie = match[0];
  });

  test('Registration 2: POST /api/auth/register rejects duplicate email with 409 Conflict', async () => {
    const res = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        name: 'Duplicate Attempt',
        email: 'audited@pranpan.com',
        password: 'SecurePassword123!'
      })
    });

    assert.equal(res.status, 409);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'EMAIL_ALREADY_EXISTS');
  });

  test('Login 1: POST /api/auth/login succeeds with correct credentials and returns session', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: 'audited@pranpan.com',
        password: 'SecurePassword123!'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, 'audited@pranpan.com');
    assert.ok(body.data.token);
    savedTokenBeforePasswordChange = body.data.token;

    const setCookie = res.headers.get('set-cookie');
    assert.ok(setCookie.includes('pranpan_session='));
    const match = setCookie.match(/pranpan_session=([^;]+)/);
    sessionCookie = match[0];
  });

  test('Login 2: POST /api/auth/login with wrong password returns generic 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: 'audited@pranpan.com',
        password: 'WrongPassword999!'
      })
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.message, 'Invalid email or password.');
  });

  test('Profile 1: GET /api/auth/me returns authenticated user using HttpOnly session cookie', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: `${sessionCookie}; ${csrfCookie}`
      }
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.email, 'audited@pranpan.com');
    assert.equal(body.data.user.passwordHash, undefined);
  });

  test('Profile 2: GET /api/auth/me without authentication returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`);
    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'AUTH_REQUIRED');
  });

  test('Profile 3: GET /api/auth/me with malformed JWT returns 401 Unauthorized', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: 'Bearer invalid.jwt.token'
      }
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'TOKEN_INVALID');
  });

  test('Profile 4: PATCH /api/users/me updates permitted fields (name, bio)', async () => {
    const res = await fetch(`${baseUrl}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        name: 'Audited Senior Engineer',
        bio: 'Lead security architect.'
      })
    });

    assert.equal(res.status, 200);
    const body = await res.json();
    assert.equal(body.success, true);
    assert.equal(body.data.user.name, 'Audited Senior Engineer');
    assert.equal(body.data.user.bio, 'Lead security architect.');
  });

  test('Security 1: PATCH /api/users/me rejects privilege escalation / role modification with 400 Bad Request', async () => {
    const res = await fetch(`${baseUrl}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        role: 'admin'
      })
    });

    assert.equal(res.status, 400);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.ok(body.error.message.includes('role'));
  });

  test('Password Change: POST /api/users/change-password requires correct current password and updates credentials', async () => {
    // 1. Wrong current password fails
    const failRes = await fetch(`${baseUrl}/api/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        currentPassword: 'WrongPassword!',
        newPassword: 'BrandNewSecure123!'
      })
    });
    assert.equal(failRes.status, 400);

    // 2. Correct current password succeeds
    const successRes = await fetch(`${baseUrl}/api/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        currentPassword: 'SecurePassword123!',
        newPassword: 'BrandNewSecure123!'
      })
    });
    assert.equal(successRes.status, 200);

    // Capture the new session cookie
    const setCookie = successRes.headers.get('set-cookie');
    const match = setCookie.match(/pranpan_session=([^;]+)/);
    sessionCookie = match[0];
  });

  test('Session Revocation 1: Reusing token issued BEFORE password change fails with 401 SESSION_REVOKED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${savedTokenBeforePasswordChange}`
      }
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'SESSION_REVOKED');
  });

  test('Logout & Session Revocation 2: POST /api/auth/logout invalidates session in DB and clears cookie', async () => {
    // Re-login with new password to get fresh token and session
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: 'audited@pranpan.com',
        password: 'BrandNewSecure123!'
      })
    });
    assert.equal(loginRes.status, 200);
    const loginBody = await loginRes.json();
    savedTokenBeforeLogout = loginBody.data.token;

    const setCookie = loginRes.headers.get('set-cookie');
    const match = setCookie.match(/pranpan_session=([^;]+)/);
    sessionCookie = match[0];

    // Call Logout endpoint
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      }
    });
    assert.equal(logoutRes.status, 200);

    // Verify session cookie was cleared
    const logoutSetCookie = logoutRes.headers.get('set-cookie');
    assert.ok(logoutSetCookie.includes('pranpan_session=;'));
  });

  test('Session Revocation 3: Reusing old token AFTER logout fails with 401 SESSION_REVOKED', async () => {
    const res = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${savedTokenBeforeLogout}`
      }
    });

    assert.equal(res.status, 401);
    const body = await res.json();
    assert.equal(body.success, false);
    assert.equal(body.error.code, 'SESSION_REVOKED');
  });
});
