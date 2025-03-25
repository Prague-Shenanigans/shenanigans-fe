<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-md shadow-2 login-card">
      <q-card-section>
        <div class="text-h5 text-center">Login</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="email" label="Email" type="email" filled dense class="q-mb-md" :error="!!errorX" :error-message="errorX" />

        <q-input
          v-model="password"
          :type="showPassword ? 'text' : 'password'"
          label="Password"
          filled
          dense
          class="q-mb-md"
          :append-icon="showPassword ? 'visibility_off' : 'visibility'"
          @click:append="showPassword = !showPassword"
        />

        <q-btn label="Login" color="primary" class="full-width q-mt-md" :loading="loading" @click="login" />

        <q-btn flat dense class="full-width q-mt-sm" to="/auth/register" label="Don't have an account? Register" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import axios from 'axios';
import { useQuasar } from 'quasar';
import { useAuthStore } from 'src/stores/auth.store'; // ✅ Pinia store for auth

const email = ref('');
const password = ref('');
const loading = ref(false);
const errorX = ref(null);
const router = useRouter();
const $q = useQuasar();
const authStore = useAuthStore(); // ✅ Use Pinia store for authentication
const showPassword = ref(false);

const login = async () => {
  errorX.value = null;
  loading.value = true;

  try {
    const response = await axios.post('https://she-be.nonode.dev/api/auth/login/', {
      email: email.value,
      password: password.value,
    });

    const { access, refresh } = response.data;

    // ✅ Store tokens in Pinia
    authStore.setTokens(access, refresh);

    $q.notify({
      type: 'positive',
      message: 'Login successful!',
      timeout: 2000,
    });

    router.push('/home'); // ✅ Redirect after login
  } catch (error) {
    errorX.value = 'Invalid credentials!';
  } finally {
    loading.value = false;
  }
};
</script>

<style scoped>
.login-card {
  width: 100%;
  max-width: 400px;
}
</style>
