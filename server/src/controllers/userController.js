import { User } from '../models/User.js';
import { ApiResponse } from '../utils/apiResponse.js';
import { ApiError } from '../utils/apiError.js';
import { signToken, attachAuthCookie } from '../utils/token.js';

export const updateMe = async (req, res, next) => {
  try {
    const { name, bio } = req.body;
    const user = req.user;

    if (name !== undefined) {
      user.name = name.trim();
    }

    if (bio !== undefined) {
      user.bio = bio.trim();
    }

    await user.save();

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Profile updated successfully.',
      data: {
        user: user.toSafeJSON()
      }
    });
  } catch (err) {
    next(err);
  }
};

export const changePassword = async (req, res, next) => {
  try {
    const { currentPassword, newPassword } = req.body;

    // Load user with passwordHash
    const user = await User.findById(req.user._id).select('+passwordHash');
    if (!user) {
      throw ApiError.notFound('User not found.');
    }

    const isMatch = await user.comparePassword(currentPassword);
    if (!isMatch) {
      return ApiResponse.error(res, {
        statusCode: 400,
        code: 'INVALID_CURRENT_PASSWORD',
        message: 'Current password provided is incorrect.'
      });
    }

    // Hash and store new password
    user.passwordHash = await User.hashPassword(newPassword);
    await user.save();

    // Re-issue JWT token and refresh cookie
    const token = signToken({
      id: user._id.toString(),
      email: user.email,
      role: user.role
    });
    attachAuthCookie(res, token);

    return ApiResponse.success(res, {
      statusCode: 200,
      message: 'Password changed successfully.'
    });
  } catch (err) {
    next(err);
  }
};

export default {
  updateMe,
  changePassword
};

