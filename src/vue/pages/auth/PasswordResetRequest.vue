<template>
  <div>
    <h1>Reset Your Password</h1>
    <form @submit.prevent="submitEmail">
      <input v-model="email" type="email" placeholder="Enter your email" required />
      <button type="submit">Send Reset Link</button>
    </form>
    <p v-if="success">{{ success }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthApi } from 'src/api/auth.api';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const authApi = useAuthApi();

const email = ref('');
const success = ref('');
const error = ref('');

const submitEmail = async () => {
  try {
    await authApi.requestPasswordReset(email.value);
    success.value = 'Check your email for the password reset link.';
    error.value = '';
    $q.notify({
      type: 'positive',
      message: 'Check your email for the password reset link.',
    });
  } catch (err) {
    error.value = 'Error sending email. Please try again.';
    success.value = '';
    $q.notify({
      type: 'negative',
      message: 'Error sending email. Please try again.',
    });
  }
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
