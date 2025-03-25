import axios from 'axios';
import { LocalStorage } from 'quasar';

const instance = axios.create({
  baseURL: 'https://she-be.nonode.dev/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

instance.interceptors.request.use((config) => {
  const token = LocalStorage.getItem('accessToken');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

instance.interceptors.response.use(
  (response) => response,
  (error) => {
    let errorMessage = 'An unknown error occurred. Please try again.';

    if (axios.isAxiosError(error)) {
      const { status, data } = error.response ?? {};
      if (status) {
        if (status >= 300 && status < 400) {
          errorMessage = 'Redirection error. Please try again.';
        } else if (status >= 400 && status < 500) {
          errorMessage = data?.detail || 'Client error. Please check your request.';
        } else if (status >= 500) {
          errorMessage = 'Server error. Please try again later.';
        } else {
          errorMessage = `Unexpected status code: ${status}`;
        }
      } else if (error.request) {
        errorMessage = 'No response received from the server. Check your internet.';
      }
    } else if (error instanceof Error) {
      errorMessage = error.message;
    }

    console.error('API Error:', errorMessage);
    return Promise.reject(new Error(errorMessage));
  },
);

export default instance;
