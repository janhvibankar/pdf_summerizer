import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import {
  validateRegister,
  validateLogin,
  validateUpdateProfile,
  validateChangePassword
} from '../src/validators/authValidators.js';

describe('Auth Validators Unit Tests', () => {
  test('validateRegister rejects missing or short name', () => {
    const res1 = validateRegister({
      body: { name: '', email: 'test@example.com', password: 'Password123!' }
    });
    assert.ok(res1.error);
    assert.match(res1.error.message, /Name is required/);

    const res2 = validateRegister({
      body: { name: 'A', email: 'test@example.com', password: 'Password123!' }
    });
    assert.ok(res2.error);
  });

  test('validateRegister rejects invalid emails', () => {
    const res = validateRegister({
      body: { name: 'Alice', email: 'not-an-email', password: 'Password123!' }
    });
    assert.ok(res.error);
    assert.match(res.error.message, /valid email/i);
  });

  test('validateRegister rejects weak passwords (< 8 chars or no numbers/symbols)', () => {
    const res1 = validateRegister({
      body: { name: 'Alice', email: 'alice@example.com', password: 'short' }
    });
    assert.ok(res1.error);
    assert.match(res1.error.message, /at least 8 characters/i);

    const res2 = validateRegister({
      body: { name: 'Alice', email: 'alice@example.com', password: 'lettersalltheway' }
    });
    assert.ok(res2.error);
    assert.match(res2.error.message, /number or special character/i);
  });

  test('validateRegister accepts valid input', () => {
    const res = validateRegister({
      body: { name: '  Jane Doe  ', email: '  JANE@EXAMPLE.COM ', password: 'ValidPassword123!' }
    });
    assert.strictEqual(res.error, undefined);
    assert.strictEqual(res.value.name, 'Jane Doe');
    assert.strictEqual(res.value.email, 'jane@example.com');
  });

  test('validateLogin rejects empty email or password', () => {
    const res1 = validateLogin({ body: { email: '', password: 'Password1!' } });
    assert.ok(res1.error);

    const res2 = validateLogin({ body: { email: 'user@example.com', password: '' } });
    assert.ok(res2.error);
  });

  test('validateUpdateProfile prevents mass assignment (role, email, password)', () => {
    const resRole = validateUpdateProfile({ body: { role: 'admin' } });
    assert.ok(resRole.error);
    assert.match(resRole.error.message, /cannot be updated/i);

    const resEmail = validateUpdateProfile({ body: { email: 'new@example.com' } });
    assert.ok(resEmail.error);

    const resPassword = validateUpdateProfile({ body: { password: 'newPassword123!' } });
    assert.ok(resPassword.error);
  });

  test('validateUpdateProfile allows permitted fields (name, bio)', () => {
    const res = validateUpdateProfile({ body: { name: 'Updated Name', bio: 'Senior analyst' } });
    assert.strictEqual(res.error, undefined);
    assert.strictEqual(res.value.name, 'Updated Name');
    assert.strictEqual(res.value.bio, 'Senior analyst');
  });

  test('validateChangePassword requires current and complex new password', () => {
    const res1 = validateChangePassword({
      body: { currentPassword: '', newPassword: 'NewPassword1!' }
    });
    assert.ok(res1.error);

    const res2 = validateChangePassword({
      body: { currentPassword: 'OldPassword1!', newPassword: 'OldPassword1!' }
    });
    assert.ok(res2.error);
    assert.match(res2.error.message, /cannot be identical/i);
  });
});
