import api from '../services/api-request.js';

export const useAuthApi = () => {
  // Authentication
  const login = async (credentials) => {
    const res = await api.post('/api/auth/login/', credentials);
    return res.data;
  };

  const register = async (userData) => {
    const res = await api.post('/api/auth/register/', userData);
    return res.data;
  };

  const logout = async () => {
    const res = await api.post('/api/auth/logout/');
    return res.data;
  };

  // User Management
  const getCurrentUser = async () => {
    const res = await api.get('/api/auth/user/');
    return res.data;
  };

  const updateUser = async (payload) => {
    const res = await api.patch('/api/auth/user/', payload);
    return res.data;
  };

  // Password Management
  const changePassword = async (payload) => {
    const res = await api.post('/api/auth/password/change/', payload);
    return res.data;
  };

  const requestPasswordReset = async (email) => {
    const res = await api.post('/api/auth/password/reset/', { email });
    return res.data;
  };

  const resetPassword = async (token, newPassword) => {
    const res = await api.post('/api/auth/password/reset/confirm/', {
      token,
      new_password: newPassword,
    });
    return res.data;
  };

  // Account Management
  const deleteAccount = async () => {
    const res = await api.delete('/api/auth/delete-account/');
    return res.data;
  };

  const verifyEmail = async (token) => {
    const res = await api.post('/api/auth/email/verify/', { token });
    return res.data;
  };

  const resendVerificationEmail = async () => {
    const res = await api.post('/api/auth/email/resend-verification/');
    return res.data;
  };

  return {
    // Authentication
    login,
    register,
    logout,

    // User Management
    getCurrentUser,
    updateUser,

    // Password Management
    changePassword,
    requestPasswordReset,
    resetPassword,

    // Account Management
    deleteAccount,
    verifyEmail,
    resendVerificationEmail,
  };
};
