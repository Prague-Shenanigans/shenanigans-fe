import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { LocalStorage } from 'quasar';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();

  const accessToken = ref<string | null>(LocalStorage.getItem('accessToken') || null);
  const refreshToken = ref<string | null>(LocalStorage.getItem('refreshToken') || null);
  const user = ref<any>(null); // You can type this if you know your user shape
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ✅ Store tokens and persist them
  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    LocalStorage.set('accessToken', access);
    LocalStorage.set('refreshToken', refresh);
  };

  // ✅ Logout: clear everything
  const logout = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    LocalStorage.remove('accessToken');
    LocalStorage.remove('refreshToken');
    router.push('/auth/login');
  };

  // ✅ Are we authenticated?
  const isAuthenticated = () => !!accessToken.value;

  // ✅ Fetch user info (use correct domain!)
  const fetchUser = async () => {
    if (!accessToken.value) return;

    try {
      const response = await axios.get('https://she-be.nonode.dev/api/auth/user/', {
        headers: {
          Authorization: `Bearer ${accessToken.value}`,
        },
      });
      user.value = response.data;
    } catch (err: any) {
      console.error('Failed to fetch user:', err);
      // Optional: only logout on 401/403
      if (err.response?.status === 401 || err.response?.status === 403) {
        logout();
      }
    }
  };

  // ✅ Expose as `me()` so it can be used externally
  const me = async () => {
    await fetchUser();
  };

  return {
    accessToken,
    refreshToken,
    user,
    loading,
    error,
    setTokens,
    logout,
    isAuthenticated,
    fetchUser,
    me,
  };
});
