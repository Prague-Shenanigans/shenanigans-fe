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
import axios from 'axios';
import { useRoute, useRouter } from 'vue-router';

const route = useRoute();
const router = useRouter();
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
    await axios.post('https://she-be.nonode.dev/api/auth/registration/verify-email/', { key });
    success.value = true;
    setTimeout(() => router.push('/login'), 3000);
  } catch (err) {
    error.value = 'Verification failed. Link might be invalid or expired.';
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
