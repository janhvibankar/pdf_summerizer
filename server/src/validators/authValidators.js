const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordComplexityRegex = /[0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/;

export const validateRegister = (req) => {
  const { name, email, password } = req.body || {};

  if (!name || typeof name !== 'string' || name.trim().length < 2) {
    return {
      error: {
        message: 'Name is required and must be at least 2 characters long.',
        details: { field: 'name' }
      }
    };
  }

  if (name.trim().length > 100) {
    return {
      error: {
        message: 'Name cannot exceed 100 characters.',
        details: { field: 'name' }
      }
    };
  }

  if (!email || typeof email !== 'string' || !emailRegex.test(email.trim())) {
    return {
      error: {
        message: 'A valid email address is required.',
        details: { field: 'email' }
      }
    };
  }

  if (!password || typeof password !== 'string' || password.length < 8) {
    return {
      error: {
        message: 'Password must be at least 8 characters long.',
        details: { field: 'password' }
      }
    };
  }

  if (!passwordComplexityRegex.test(password)) {
    return {
      error: {
        message: 'Password must contain at least one number or special character.',
        details: { field: 'password' }
      }
    };
  }

  return { value: { name: name.trim(), email: email.trim().toLowerCase(), password } };
};

export const validateLogin = (req) => {
  const { email, password } = req.body || {};

  if (!email || typeof email !== 'string' || !email.trim()) {
    return {
      error: {
        message: 'Email address is required.',
        details: { field: 'email' }
      }
    };
  }

  if (!password || typeof password !== 'string' || !password) {
    return {
      error: {
        message: 'Password is required.',
        details: { field: 'password' }
      }
    };
  }

  return { value: { email: email.trim().toLowerCase(), password } };
};

export const validateUpdateProfile = (req) => {
  const body = req.body || {};

  // Disallow forbidden updates (mass-assignment defense)
  const forbiddenFields = [
    'role',
    'email',
    'password',
    'passwordHash',
    '_id',
    'createdAt',
    'updatedAt'
  ];
  for (const field of forbiddenFields) {
    if (Object.prototype.hasOwnProperty.call(body, field)) {
      return {
        error: {
          message: `Field '${field}' cannot be updated through this endpoint.`,
          details: { field }
        }
      };
    }
  }

  const { name, bio } = body;

  if (name !== undefined) {
    if (typeof name !== 'string' || name.trim().length < 2) {
      return {
        error: {
          message: 'Name must be at least 2 characters long.',
          details: { field: 'name' }
        }
      };
    }
    if (name.trim().length > 100) {
      return {
        error: {
          message: 'Name cannot exceed 100 characters.',
          details: { field: 'name' }
        }
      };
    }
  }

  if (bio !== undefined) {
    if (typeof bio !== 'string') {
      return {
        error: {
          message: 'Bio must be a valid text string.',
          details: { field: 'bio' }
        }
      };
    }
    if (bio.trim().length > 500) {
      return {
        error: {
          message: 'Bio cannot exceed 500 characters.',
          details: { field: 'bio' }
        }
      };
    }
  }

  return {
    value: { name: name ? name.trim() : undefined, bio: bio !== undefined ? bio.trim() : undefined }
  };
};

export const validateChangePassword = (req) => {
  const { currentPassword, newPassword } = req.body || {};

  if (!currentPassword || typeof currentPassword !== 'string') {
    return {
      error: {
        message: 'Current password is required.',
        details: { field: 'currentPassword' }
      }
    };
  }

  if (!newPassword || typeof newPassword !== 'string' || newPassword.length < 8) {
    return {
      error: {
        message: 'New password must be at least 8 characters long.',
        details: { field: 'newPassword' }
      }
    };
  }

  if (!passwordComplexityRegex.test(newPassword)) {
    return {
      error: {
        message: 'New password must contain at least one number or special character.',
        details: { field: 'newPassword' }
      }
    };
  }

  if (currentPassword === newPassword) {
    return {
      error: {
        message: 'New password cannot be identical to current password.',
        details: { field: 'newPassword' }
      }
    };
  }

  return { value: { currentPassword, newPassword } };
};
