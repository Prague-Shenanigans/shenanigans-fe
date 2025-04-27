// src/services/api-request.js
import axios from 'axios';
import { LocalStorage, Dialog, Notify } from 'quasar';

// Environment detection using Quasar's MODE
const isDevelopment = process.env.MODE === 'spa';
const isProduction = process.env.MODE === 'production';
const isCapacitor = process.env.MODE === 'capacitor';

// Backend URL - can be overridden by .env if needed
const BACKEND_URL =
  import.meta.env.VITE_SERVER_DOMAIN || 'https://she-be.nonode.dev';

// Debug logging in development
if (isDevelopment) {
  console.log('Environment:', {
    mode: process.env.MODE,
    isDevelopment,
    isProduction,
    isCapacitor,
    backendUrl: BACKEND_URL,
  });
}

const instance = axios.create({
  baseURL: BACKEND_URL,
  headers: {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  },
  withCredentials: false, // We're using JWT, not cookies
});

// Request interceptor
instance.interceptors.request.use(
  (
    config, // ✅ No block, immediate return
  ) =>
    LocalStorage.getItem('accessToken')
      ? {
          ...config,
          headers: {
            ...config.headers,
            Authorization: `Bearer ${LocalStorage.getItem('accessToken')}`,
          },
        }
      : config,
  (error) => Promise.reject(error), // ✅ No block, immediate return
);

// Response interceptor
instance.interceptors.response.use(
  (response) => response, // ✅ No block, immediate return
  async (error) => {
    let errorMessage = 'An unknown error occurred. Please try again.';

    if (axios.isAxiosError(error)) {
      const { status, data } = error.response ?? {};

      // Handle token expiration
      if (status === 401) {
        LocalStorage.remove('accessToken');
        window.location.href = '/auth/login';
        return Promise.reject(
          new Error('Session expired. Please login again.'),
        );
      }

      if (status) {
        if (status >= 300 && status < 400) {
          errorMessage = 'Redirection error. Please try again.';
        } else if (status >= 400 && status < 500) {
          errorMessage =
            data?.detail || 'Client error. Please check your request.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Unexpected status code: ${status}`;
        }
      } else if (error.request) {
        errorMessage =
          'No response received from the server. Check your internet.';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    if (!isCapacitor) {
      Dialog.create({
        title: 'Error',
        message: errorMessage,
        ok: { label: 'OK', color: 'primary' },
      });
    }

    Notify.create({
      type: 'negative',
      message: errorMessage,
      position: 'top',
    });

    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  },
);

export default instance;
