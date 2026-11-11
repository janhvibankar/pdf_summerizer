import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService.js';
import { STORAGE_KEYS } from '../utils/constants.js';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEYS.AUTH_TOKEN));
  const [isLoading, setIsLoading] = useState(true);
  const [authError, setAuthError] = useState(null);

  // Restore authenticated session on application mount
  const checkAuth = useCallback(async () => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await authService.getMe();
      if (response && response.data && response.data.user) {
        setUser(response.data.user);
      } else {
        setUser(null);
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
    } catch (err) {
      setUser(null);
      // Clean up dead token if unauthorized
      if (err.statusCode === 401) {
        localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      }
      setAuthError(err.message || 'Session verification failed');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  // Login handler
  const login = async ({ email, password }) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await authService.login({ email, password });
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      if (authToken) {
        setToken(authToken);
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
      }

      return userData;
    } catch (err) {
      setAuthError(err.message || 'Failed to sign in');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Register handler
  const register = async ({ name, email, password }) => {
    setIsLoading(true);
    setAuthError(null);

    try {
      const response = await authService.register({ name, email, password });
      const { user: userData, token: authToken } = response.data;

      setUser(userData);
      if (authToken) {
        setToken(authToken);
        localStorage.setItem(STORAGE_KEYS.AUTH_TOKEN, authToken);
      }

      return userData;
    } catch (err) {
      setAuthError(err.message || 'Failed to register account');
      throw err;
    } finally {
      setIsLoading(false);
    }
  };

  // Logout handler
  const logout = async () => {
    setIsLoading(true);
    try {
      await authService.logout();
    } catch {
      // Proceed with client session cleanup regardless of server response
    } finally {
      setUser(null);
      setToken(null);
      localStorage.removeItem(STORAGE_KEYS.AUTH_TOKEN);
      setIsLoading(false);
    }
  };

  // Profile update handler
  const updateProfile = async (profileData) => {
    const response = await authService.updateProfile(profileData);
    if (response && response.data && response.data.user) {
      setUser(response.data.user);
    }
    return response.data?.user;
  };

  // Change password handler
  const changePassword = async ({ currentPassword, newPassword }) => {
    return authService.changePassword({ currentPassword, newPassword });
  };

  const value = {
    user,
    token,
    isAuthenticated: Boolean(user),
    isLoading,
    authError,
    login,
    register,
    logout,
    updateProfile,
    changePassword,
    checkAuth
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;

