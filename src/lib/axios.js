import axios from 'axios';
import { AUTH_PUBLIC_PATHS } from '../constants/roles';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

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

    // Session restore failures are handled by the auth slice — do not hard redirect.
    if (status === 401 && !isAuthCheck && !isPublicPath) {
      window.location.assign('/login');
    }

    return Promise.reject(error);
  }
);

export default axiosInstance;
