import { defineStore } from 'pinia';
import { ref } from 'vue';
import axios from 'axios';
import { useRouter } from 'vue-router';
import { LocalStorage } from 'quasar';

export const useAuthStore = defineStore('auth', () => {
  const router = useRouter();
  const accessToken = ref<string | null>(LocalStorage.getItem('accessToken') || null);
  const refreshToken = ref<string | null>(LocalStorage.getItem('refreshToken') || null);
  const user = ref<any>(null); // Replace `any` with an actual user type when known
  const loading = ref(false);
  const error = ref<string | null>(null);

  // ✅ Set tokens after login
  const setTokens = (access: string, refresh: string) => {
    accessToken.value = access;
    refreshToken.value = refresh;
    LocalStorage.set('accessToken', access);
    LocalStorage.set('refreshToken', refresh);
  };

  // ✅ Remove tokens on logout
  const logout = () => {
    accessToken.value = null;
    refreshToken.value = null;
    user.value = null;
    LocalStorage.remove('accessToken');
    LocalStorage.remove('refreshToken');
    router.push('/login');
  };

  // ✅ Check if the user is authenticated
  const isAuthenticated = () => !!accessToken.value;

  // ✅ Fetch user profile
  const fetchUser = async () => {
    if (!accessToken.value) return;
    try {
      const response = await axios.get('http://127.0.0.1:8000/api/auth/user/', {
        headers: { Authorization: `Bearer ${accessToken.value}` },
      });
      user.value = response.data;
    } catch (err) {
      console.error('Failed to fetch user:', err);
      logout();
    }
  };

  // ✅ Alias `fetchUser()` as `me()` to match `router/index.ts`
  const me = async () => fetchUser();

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
    me, // ✅ Now `authStore.me()` exists
  };
});
