import { api } from 'boot/axios';

export const ApiService = {
  setAccessToken(accessToken : string) {
    api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
  },
};
