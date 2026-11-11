import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { User } from '../src/models/User.js';

describe('User Model Methods & Hashing Tests', () => {
  test('hashPassword generates valid bcrypt hash different from plaintext', async () => {
    const plaintext = 'SecurePass123!';
    const hash = await User.hashPassword(plaintext);

    assert.notStrictEqual(hash, plaintext);
    assert.ok(hash.startsWith('$2a$') || hash.startsWith('$2b$'));
  });

  test('comparePassword returns true for matching password and false for mismatch', async () => {
    const plaintext = 'SecurePass123!';
    const hash = await User.hashPassword(plaintext);

    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: hash
    });

    const isMatch = await user.comparePassword(plaintext);
    assert.strictEqual(isMatch, true);

    const isWrong = await user.comparePassword('WrongPassword123!');
    assert.strictEqual(isWrong, false);
  });

  test('toSafeJSON omits passwordHash and __v', async () => {
    const hash = await User.hashPassword('SecurePass123!');
    const user = new User({
      name: 'Test User',
      email: 'test@example.com',
      passwordHash: hash,
      bio: 'Test bio'
    });

    const safe = user.toSafeJSON();
    assert.strictEqual(safe.name, 'Test User');
    assert.strictEqual(safe.email, 'test@example.com');
    assert.strictEqual(safe.bio, 'Test bio');
    assert.strictEqual(safe.passwordHash, undefined);
    assert.strictEqual(safe.__v, undefined);
  });
});

