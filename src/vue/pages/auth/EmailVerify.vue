<template>
  <div>
    <h1>Email Confirmation</h1>
    <p v-if="loading">Verifying your email...</p>
    <p v-if="error" class="error">{{ error }}</p>
    <p v-if="success" class="success">Your email has been verified! You can now log in.</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useAuthApi } from 'src/api/auth.api';
import { useQuasar } from 'quasar';

const route = useRoute();
const router = useRouter();
const $q = useQuasar();
const authApi = useAuthApi();

const loading = ref(true);
const error = ref(null);
const success = ref(false);

onMounted(async () => {
  const { key } = route.query;

  if (!key) {
    error.value = 'Invalid verification link.';
    loading.value = false;
    return;
  }

  try {
    await authApi.verifyEmail(key);
    success.value = true;
    $q.notify({
      type: 'positive',
      message: 'Your email has been verified! You can now log in.',
    });
    setTimeout(() => router.push('/auth/login'), 3000);
  } catch (err) {
    error.value = 'Verification failed. Link might be invalid or expired.';
    $q.notify({
      type: 'negative',
      message: 'Verification failed. Link might be invalid or expired.',
    });
    setTimeout(() => router.push('/'), 3000);
  } finally {
    loading.value = false;
  }
});
</script>

<style scoped>
.error {
  color: red;
}
.success {
  color: green;
}
</style>
