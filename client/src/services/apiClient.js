/**
 * API Configuration and Service Layer
 * 
 * Central place to manage API endpoints and base configuration
 * Makes it easy to switch between mock and real API
 */

// Determine API base URL from environment or defaults
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';
const IS_MOCK_API = import.meta.env.VITE_USE_MOCK_API === 'true' || !import.meta.env.VITE_API_URL;

// API Endpoints
export const API_ENDPOINTS = {
  // Auth endpoints
  AUTH: {
    LOGIN: '/auth/login',
    SIGNUP: '/auth/signup',
    LOGOUT: '/auth/logout',
    REFRESH: '/auth/refresh',
    FORGOT_PASSWORD: '/auth/forgot-password',
    RESET_PASSWORD: '/auth/reset-password',
  },

  // User endpoints
  USERS: {
    PROFILE: '/users/profile',
    UPDATE_PROFILE: '/users/profile',
    PREFERENCES: '/users/preferences',
  },

  // Event endpoints
  EVENTS: {
    LIST: '/events',
    GET: (id) => `/events/${id}`,
    CREATE: '/events',
    UPDATE: (id) => `/events/${id}`,
    DELETE: (id) => `/events/${id}`,
    REGISTER: (id) => `/events/${id}/register`,
    UNREGISTER: (id) => `/events/${id}/unregister`,
  },

  // Society endpoints
  SOCIETIES: {
    LIST: '/societies',
    GET: (id) => `/societies/${id}`,
    CREATE: '/societies',
    UPDATE: (id) => `/societies/${id}`,
    DELETE: (id) => `/societies/${id}`,
    JOIN: (id) => `/societies/${id}/join`,
    LEAVE: (id) => `/societies/${id}/leave`,
  },

  // Mentor endpoints
  MENTORS: {
    LIST: '/mentors',
    GET: (id) => `/mentors/${id}`,
    REGISTER: '/mentors/register',
    BOOK_SESSION: '/mentors/sessions/book',
    GET_SESSIONS: '/mentors/sessions',
  },

  // Study Group endpoints
  STUDY_GROUPS: {
    LIST: '/study-groups',
    GET: (id) => `/study-groups/${id}`,
    CREATE: '/study-groups',
    UPDATE: (id) => `/study-groups/${id}`,
    DELETE: (id) => `/study-groups/${id}`,
    JOIN: (id) => `/study-groups/${id}/join`,
    LEAVE: (id) => `/study-groups/${id}/leave`,
  },

  // Chat/Message endpoints
  MESSAGES: {
    LIST: '/messages',
    GET: (id) => `/messages/${id}`,
    SEND: '/messages',
    MARK_READ: (id) => `/messages/${id}/read`,
  },

  // Notification endpoints
  NOTIFICATIONS: {
    LIST: '/notifications',
    MARK_READ: (id) => `/notifications/${id}/read`,
    MARK_ALL_READ: '/notifications/read-all',
    DELETE: (id) => `/notifications/${id}`,
  },
};

// API Client configuration
const clientConfig = {
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
};

/**
 * Make API request with proper error handling
 * 
 * @param {string} endpoint - API endpoint
 * @param {object} options - Request options (method, body, headers, etc.)
 * @returns {Promise} Response data or error
 */
export async function apiCall(endpoint, options = {}) {
  const {
    method = 'GET',
    body = null,
    headers = {},
    timeout = clientConfig.timeout,
  } = options;

  try {
    const url = `${clientConfig.baseURL}${endpoint}`;
    const token = localStorage.getItem('authState');
    const auth = token ? JSON.parse(token) : null;

    const requestConfig = {
      method,
      headers: {
        ...clientConfig.headers,
        ...headers,
        ...(auth?.token && { Authorization: `Bearer ${auth.token}` }),
      },
      ...(body && { body: JSON.stringify(body) }),
    };

    const response = await fetch(url, requestConfig);

    // Handle specific HTTP error codes
    if (!response.ok) {
      if (response.status === 401) {
        // Unauthorized - session expired
        localStorage.removeItem('authState');
        window.location.href = '/error/session-expired';
        throw new Error('Session expired');
      }
      
      if (response.status === 403) {
        // Forbidden
        window.location.href = '/error/forbidden';
        throw new Error('Access forbidden');
      }
      
      if (response.status === 500) {
        // Server error
        window.location.href = '/error/server-error';
        throw new Error('Server error');
      }
      
      if (response.status === 503) {
        // Service unavailable
        window.location.href = '/error/service-unavailable';
        throw new Error('Service unavailable');
      }

      const error = await response.json();
      throw new Error(error.message || `API error: ${response.status}`);
    }

    return await response.json();
  } catch (error) {
    // Network error
    if (error.message === 'Failed to fetch' || error.name === 'TypeError') {
      window.location.href = '/error/network-error';
    }
    console.error('API call failed:', error);
    throw error;
  }
}

/**
 * GET request
 */
export const apiGet = (endpoint, options = {}) =>
  apiCall(endpoint, { ...options, method: 'GET' });

/**
 * POST request
 */
export const apiPost = (endpoint, body, options = {}) =>
  apiCall(endpoint, { ...options, method: 'POST', body });

/**
 * PUT request
 */
export const apiPut = (endpoint, body, options = {}) =>
  apiCall(endpoint, { ...options, method: 'PUT', body });

/**
 * DELETE request
 */
export const apiDelete = (endpoint, options = {}) =>
  apiCall(endpoint, { ...options, method: 'DELETE' });

/**
 * PATCH request
 */
export const apiPatch = (endpoint, body, options = {}) =>
  apiCall(endpoint, { ...options, method: 'PATCH', body });

export default {
  API_BASE_URL,
  IS_MOCK_API,
  API_ENDPOINTS,
  apiCall,
  apiGet,
  apiPost,
  apiPut,
  apiDelete,
  apiPatch,
};
