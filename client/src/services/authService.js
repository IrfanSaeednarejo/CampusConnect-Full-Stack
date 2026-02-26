/**
 * Authentication Service
 * Handles all auth-related API calls
 */

import { apiPost, apiGet, apiDelete, API_ENDPOINTS } from './apiClient';

export const authService = {
  /**
   * Login with email and password
   */
  login: (email, password) =>
    apiPost(API_ENDPOINTS.AUTH.LOGIN, { email, password }),

  /**
   * Register new user
   */
  signup: (userData) =>
    apiPost(API_ENDPOINTS.AUTH.SIGNUP, userData),

  /**
   * Logout current user
   */
  logout: () =>
    apiPost(API_ENDPOINTS.AUTH.LOGOUT),

  /**
   * Refresh auth token
   */
  refreshToken: () =>
    apiPost(API_ENDPOINTS.AUTH.REFRESH),

  /**
   * Request password reset
   */
  forgotPassword: (email) =>
    apiPost(API_ENDPOINTS.AUTH.FORGOT_PASSWORD, { email }),

  /**
   * Reset password with token
   */
  resetPassword: (token, password) =>
    apiPost(API_ENDPOINTS.AUTH.RESET_PASSWORD, { token, password }),
};

export default authService;
