import api from '../services/api-request.js';

export const useAuthApi = () => {
  const getCurrentUser = async () => {
    const res = await api.get('/auth/user/');
    return res.data;
  };

  const updateUser = async (payload) => {
    const res = await api.patch('/auth/user/', payload);
    return res.data;
  };

  const changePassword = async (payload) => {
    const res = await api.post('/auth/password/change/', payload);
    return res.data;
  };

  const deleteAccount = async () => {
    const res = await api.delete('/auth/delete-account/');
    return res.data;
  };

  return {
    getCurrentUser,
    updateUser,
    changePassword,
    deleteAccount,
  };
};
