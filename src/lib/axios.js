import axios from 'axios';
import { AUTH_PUBLIC_PATHS } from '../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

let unauthorizedRedirectQueued = false;

const axiosInstance = axios.create({
  baseURL: API_URL,
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.response.use(
  (response) => response,
  (error) => {
    const status = error.response?.status;
    const requestUrl = error.config?.url || '';
    const isAuthCheck = requestUrl.includes('/auth/me');
    const isPublicPath = AUTH_PUBLIC_PATHS.some((path) =>
      window.location.pathname.startsWith(path)
    );

    // Soft-redirect on expired sessions to avoid a full document reload
    // (which feels like a page refresh when closing dialogs / submitting forms).
    if (
      status === 401 &&
      !isAuthCheck &&
      !isPublicPath &&
      !unauthorizedRedirectQueued
    ) {
      unauthorizedRedirectQueued = true;
      window.dispatchEvent(new CustomEvent('auth:unauthorized'));
      // Allow another redirect after the next full navigation cycle.
      setTimeout(() => {
        unauthorizedRedirectQueued = false;
      }, 1000);
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
