import axios from 'axios';
import { useAuthStore } from '../store/useAuthStore';

// Create a configured Axios instance
export const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:8080/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor: Attach the JWT token
api.interceptors.request.use(
  (config) => {
    // Read the token directly from the Zustand store
    const token = useAuthStore.getState().token;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor: Handle 401 Unauthorized
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // If the backend rejects the token (expired or invalid), log the user out
      useAuthStore.getState().logout();
      
      // Optional: Redirect to login page immediately
      window.location.href = '/login'; 
    }
    return Promise.reject(error);
  }
);