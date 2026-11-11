import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { signToken, attachAuthCookie, clearAuthCookie } from '../utils/token.js';

export const register = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Check if email already registered
    const existingUser = await User.findOne({ email: normalizedEmail });
    if (existingUser) {
      return ApiResponse.error(res, {
        statusCode: 409,
        code: 'EMAIL_ALREADY_EXISTS',
        message: 'An account with this email address already exists.'
      });
    }

    // Hash password and persist user
    const passwordHash = await User.hashPassword(password);
    const user = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash
    });

    // Generate JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Attach secure HttpOnly session cookie
    attachAuthCookie(res, token);

    return ApiResponse.success(res, {
      statusCode: 201,
      message: 'Account registered successfully.',
      data: {
        user: user.toSafeJSON(),
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

export const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    const normalizedEmail = email.trim().toLowerCase();

    // Query user including passwordHash
    const user = await User.findOne({ email: normalizedEmail }).select('+passwordHash');

    // Generic response defense: never disclose whether email exists
    if (!user) {
      return ApiResponse.error(res, {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      return ApiResponse.error(res, {
        statusCode: 401,
        code: 'INVALID_CREDENTIALS',
        message: 'Invalid email or password.'
      });
    }

    // Generate JWT token
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });

    // Attach secure HttpOnly session cookie
    attachAuthCookie(res, token);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Signed in successfully.',
      data: {
        user: user.toSafeJSON(),
        token
      }
    });
  } catch (err) {
    next(err);
  }
};

export const logout = async (req, res, next) => {
  try {
    clearAuthCookie(res);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Signed out successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export const getMe = async (req, res, next) => {
  try {
    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Current user profile retrieved.',
      data: {
        user: req.user.toSafeJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

export default {
  register,
  login,
  logout,
  getMe
};
