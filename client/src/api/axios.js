import axios from 'axios';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL || 'http://localhost:8000/api/v1',
  timeout: 15000,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

let storeRef = null;
export const injectStore = (store) => {
  storeRef = store;
};
api.interceptors.request.use(
  (config) => {
    if (config.data instanceof FormData) {
      delete config.headers['Content-Type'];
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve();
    }
  });
  failedQueue = [];
};

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    const isAuthRequest = originalRequest.url?.includes('/users/login') || originalRequest.url?.includes('/users/refresh-token');

    if (error.response?.status === 401 && !originalRequest._retry && !isAuthRequest) {
      if (isRefreshing) {
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        }).then(() => api(originalRequest));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        await api.post('/users/refresh-token');
        processQueue(null);
        return api(originalRequest);
      } catch (refreshError) {
        processQueue(refreshError);
        if (storeRef) {
          const { logout } = await import('../redux/slices/authSlice');
          storeRef.dispatch(logout());
        }
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    const apiError = {
      status: error.response?.status,
      message: error.response?.data?.message || error.message || 'An unexpected error occurred',
      data: error.response?.data,
    };

    return Promise.reject(apiError);
  }
);

export default api;
