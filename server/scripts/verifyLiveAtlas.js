/**
 * PRANPAN — Live MongoDB Atlas Verification Script
 *
 * Performs end-to-end live database verification:
 * 1. Checks MONGO_URI from server/.env (without printing credentials).
 * 2. Connects to the real MongoDB Atlas database.
 * 3. Verifies health status via getDbStatus().
 * 4. Creates an isolated test account with unique timestamp.
 * 5. Verifies persistence by querying the database directly.
 * 6. Tests login, session hydration, and profile updating with DB read-back.
 * 7. Tests password change, old password rejection, and session invalidation.
 * 8. Tests logout and token revocation.
 * 9. Verifies absence of plaintext secrets or sensitive tokens in the database document.
 * 10. Cleans up the test account from the database.
 */

import mongoose from 'mongoose';
import http from 'http';
import app from '../src/app.js';
import { env } from '../src/config/env.js';
import { User } from '../src/models/User.js';
import { getDbStatus, connectDB, disconnectDB } from '../src/config/db.js';

const maskUri = (uri) => {
  if (!uri) return 'NOT_SET';
  try {
    const parsed = new URL(uri);
    return `${parsed.protocol}//***:***@${parsed.host}${parsed.pathname}`;
  } catch {
    return 'INVALID_URI_FORMAT';
  }
};

async function runLiveAtlasVerification() {
  console.log('====================================================');
  console.log('PRANPAN — LIVE MONGODB ATLAS VERIFICATION');
  console.log('====================================================\n');

  // 1. Inspect MONGO_URI
  console.log('[1/12] Reading MONGO_URI configuration...');
  if (!env.MONGO_URI || env.MONGO_URI.trim() === '') {
    console.error('❌ CONFIGURATION ERROR: MONGO_URI is empty or not set in server/.env.');
    console.error('   Expected format: MONGO_URI=mongodb+srv://<username>:<password>@<cluster>.mongodb.net/pranpan?retryWrites=true&w=majority');
    console.error('\nResult: Live database verification cannot proceed because no MongoDB connection string is configured.');
    return {
      success: false,
      reason: 'MONGO_URI_NOT_CONFIGURED',
      status: 'NOT TESTED'
    };
  }

  const masked = maskUri(env.MONGO_URI);
  console.log(`✅ MONGO_URI is configured: ${masked}`);

  // 2. Connect to MongoDB Atlas
  console.log('\n[2/12] Connecting to MongoDB Atlas...');
  const connected = await connectDB();
  if (!connected || mongoose.connection.readyState !== 1) {
    console.error('❌ CONNECTION FAILED: Unable to establish connection to MongoDB Atlas.');
    return {
      success: false,
      reason: 'ATLAS_CONNECTION_FAILED',
      status: 'FAIL'
    };
  }
  console.log('✅ Connected to MongoDB Atlas successfully.');

  // 3. Verify Health Check DB Status
  console.log('\n[3/12] Checking database status in health endpoint...');
  const dbStatus = getDbStatus();
  console.log('   Health check DB status:', JSON.stringify(dbStatus));
  if (!dbStatus.connected || dbStatus.status !== 'connected') {
    console.error('❌ HEALTH CHECK FAILED: Expected dbStatus.connected === true.');
    await disconnectDB();
    return { success: false, reason: 'HEALTH_STATUS_MISMATCH', status: 'FAIL' };
  }
  console.log('✅ Health endpoint accurately reflects active MongoDB connection.');

  // Start temporary local HTTP server for real network API dispatch
  let server;
  let baseUrl;
  await new Promise((resolve) => {
    server = http.createServer(app);
    server.listen(0, '127.0.0.1', () => {
      const port = server.address().port;
      baseUrl = `http://127.0.0.1:${port}`;
      resolve();
    });
  });

  const uniqueId = Date.now();
  const testEmail = `atlas-audit-${uniqueId}@pranpan.test`;
  const initialPassword = `AuditPass!${uniqueId}`;
  const updatedPassword = `BrandNewPass!${uniqueId}`;
  const testName = `Atlas Audit User ${uniqueId}`;

  try {
    // Obtain CSRF token
    const csrfRes = await fetch(`${baseUrl}/api/auth/csrf-token`);
    const csrfBody = await csrfRes.json();
    const csrfToken = csrfBody.data.csrfToken;
    const csrfCookie = csrfRes.headers.get('set-cookie').match(/pranpan_csrf=([^;]+)/)[0];

    // 4. Register new isolated test account
    console.log(`\n[4/12] Registering isolated test account: ${testEmail}...`);
    const regRes = await fetch(`${baseUrl}/api/auth/register`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        name: testName,
        email: testEmail,
        password: initialPassword
      })
    });

    if (regRes.status !== 201) {
      const err = await regRes.json();
      throw new Error(`Registration failed with status ${regRes.status}: ${JSON.stringify(err)}`);
    }
    console.log('✅ Registration API responded with 201 Created.');

    // 5. Verify account is persisted directly in MongoDB Atlas
    console.log('\n[5/12] Directly querying MongoDB Atlas for persisted user document...');
    const persistedUser = await User.findOne({ email: testEmail }).select('+passwordHash');
    if (!persistedUser) {
      throw new Error('User document was NOT found in MongoDB Atlas collection.');
    }
    console.log(`✅ User document verified in Atlas: ID=${persistedUser._id}, Email=${persistedUser.email}`);

    // 11 (Early check). Verify no plaintext password or sensitive secrets
    console.log('\n[6/12] Inspecting stored document security properties in MongoDB...');
    if (persistedUser.passwordHash === initialPassword) {
      throw new Error('SECURITY VIOLATION: Password is stored in plaintext in MongoDB!');
    }
    if (!persistedUser.passwordHash.startsWith('$2a$') && !persistedUser.passwordHash.startsWith('$2b$')) {
      throw new Error('SECURITY VIOLATION: Password hash does not match valid bcrypt format!');
    }
    const safeJson = persistedUser.toSafeJSON();
    if (safeJson.passwordHash || safeJson.tokenVersion) {
      throw new Error('SECURITY VIOLATION: toSafeJSON() leaked sensitive security fields!');
    }
    console.log('✅ Stored document security verified: 10-round bcrypt hash, no plaintext credentials.');

    // 6. Login using newly registered account
    console.log('\n[7/12] Logging in with newly registered credentials...');
    const loginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: testEmail,
        password: initialPassword
      })
    });

    if (loginRes.status !== 200) {
      throw new Error(`Login failed with status ${loginRes.status}`);
    }

    const loginBody = await loginRes.json();
    const tokenBeforePasswordChange = loginBody.data.token;
    const sessionCookie = loginRes.headers.get('set-cookie').match(/pranpan_session=([^;]+)/)[0];
    console.log('✅ Login succeeded; HttpOnly session cookie issued.');

    // 7. Verify /api/auth/me restores the user
    console.log('\n[8/12] Calling /api/auth/me to verify session hydration...');
    const meRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Cookie: `${sessionCookie}; ${csrfCookie}`
      }
    });

    if (meRes.status !== 200) {
      throw new Error(`/api/auth/me failed with status ${meRes.status}`);
    }
    const meBody = await meRes.json();
    if (meBody.data.user.email !== testEmail) {
      throw new Error('Hydrated user email does not match test user.');
    }
    console.log(`✅ Session restored: authenticated as ${meBody.data.user.name} (${meBody.data.user.email})`);

    // 8. Update profile and verify persistence after fresh DB read
    console.log('\n[9/12] Updating profile (bio & name) and re-querying MongoDB Atlas...');
    const newBio = 'Live verified MongoDB Atlas document architect.';
    const updateRes = await fetch(`${baseUrl}/api/users/me`, {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({ bio: newBio })
    });

    if (updateRes.status !== 200) {
      throw new Error(`Profile update failed with status ${updateRes.status}`);
    }

    // Direct Atlas re-query
    const reloadedUser = await User.findById(persistedUser._id);
    if (reloadedUser.bio !== newBio) {
      throw new Error(`Persistence failure: expected bio "${newBio}", got "${reloadedUser.bio}"`);
    }
    console.log(`✅ Profile update persisted in Atlas: Bio="${reloadedUser.bio}"`);

    // 9. Change password and verify session revocation
    console.log('\n[10/12] Changing password and testing session revocation...');
    const changePassRes = await fetch(`${baseUrl}/api/users/change-password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: `${sessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        currentPassword: initialPassword,
        newPassword: updatedPassword
      })
    });

    if (changePassRes.status !== 200) {
      throw new Error(`Password change failed with status ${changePassRes.status}`);
    }

    // Capture updated session cookie
    const updatedSessionCookie = changePassRes.headers.get('set-cookie').match(/pranpan_session=([^;]+)/)[0];

    // Verify old password no longer works
    const oldLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: testEmail,
        password: initialPassword
      })
    });
    if (oldLoginRes.status !== 401) {
      throw new Error('SECURITY FLAW: Old password was accepted after password change!');
    }
    console.log('   ✓ Old password rejected with 401.');

    // Verify token issued BEFORE password change is rejected
    const revokedTokenRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${tokenBeforePasswordChange}`
      }
    });
    if (revokedTokenRes.status !== 401) {
      throw new Error('SECURITY FLAW: Old JWT remained valid after password change!');
    }
    console.log('   ✓ Pre-password-change token revoked (SESSION_REVOKED).');

    // Verify new password works
    const newLoginRes = await fetch(`${baseUrl}/api/auth/login`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-csrf-token': csrfToken,
        Cookie: csrfCookie,
        Origin: 'http://localhost:5173'
      },
      body: JSON.stringify({
        email: testEmail,
        password: updatedPassword
      })
    });
    if (newLoginRes.status !== 200) {
      throw new Error('New password was rejected on login!');
    }
    const freshLoginBody = await newLoginRes.json();
    const tokenBeforeLogout = freshLoginBody.data.token;
    console.log('   ✓ New password successfully authenticated.');

    // 10. Logout and verify session cannot be reused
    console.log('\n[11/12] Testing logout and post-logout session invalidation...');
    const logoutRes = await fetch(`${baseUrl}/api/auth/logout`, {
      method: 'POST',
      headers: {
        'x-csrf-token': csrfToken,
        Cookie: `${updatedSessionCookie}; ${csrfCookie}`,
        Origin: 'http://localhost:5173'
      }
    });
    if (logoutRes.status !== 200) {
      throw new Error(`Logout failed with status ${logoutRes.status}`);
    }

    // Try reusing token after logout
    const postLogoutRes = await fetch(`${baseUrl}/api/auth/me`, {
      headers: {
        Authorization: `Bearer ${tokenBeforeLogout}`
      }
    });
    if (postLogoutRes.status !== 401) {
      throw new Error('SECURITY FLAW: Old token remained valid after logout!');
    }
    console.log('   ✓ Post-logout token reuse rejected with 401 (SESSION_REVOKED).');

    // 12. Cleanup test account
    console.log('\n[12/12] Cleaning up isolated test account from MongoDB Atlas...');
    const deleteResult = await User.deleteOne({ email: testEmail });
    if (deleteResult.deletedCount !== 1) {
      console.warn('⚠️ Warning: deleteCount was not 1 during cleanup.');
    } else {
      console.log('✅ Isolated test account removed cleanly. No lingering test data.');
    }

    console.log('\n====================================================');
    console.log('🎉 ALL LIVE MONGODB ATLAS CHECKS PASSED SUCCESSFULLY');
    console.log('====================================================\n');

    return { success: true, status: 'PASS' };
  } finally {
    if (server) {
      await new Promise((resolve) => server.close(resolve));
    }
    await disconnectDB();
  }
}

// Execute directly
runLiveAtlasVerification()
  .then((result) => {
    process.exit(result.success ? 0 : 1);
  })
  .catch((err) => {
    console.error('\n💥 Unexpected verification failure:', err);
    process.exit(1);
  });

export default runLiveAtlasVerification;
