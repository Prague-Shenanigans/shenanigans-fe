<template>
  <div>
    <h1>Set New Password</h1>
    <form @submit.prevent="submitPassword">
      <input v-model="newPassword" type="password" placeholder="New Password" required />
      <input v-model="confirmPassword" type="password" placeholder="Confirm Password" required />
      <button type="submit">Reset Password</button>
    </form>
    <p v-if="success">{{ success }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import axios from 'axios';

const route = useRoute();
const router = useRouter();

const uid = ref('');
const token = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const error = ref('');
const success = ref('');

onMounted(() => {
  uid.value = route.query.uid;
  token.value = route.query.token;
});

const submitPassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  try {
    await axios.post('https://she-be.nonode.dev/api/auth/password/reset/confirm/', {
      uid: uid.value,
      token: token.value,
      new_password1: newPassword.value,
      new_password2: confirmPassword.value,
    });
    success.value = 'Password successfully reset. Redirecting to login...';
    setTimeout(() => router.push('/auth/login'), 3000);
  } catch (err) {
    error.value = 'Failed to reset password. Link might be invalid or expired.';
  }
};
</script>

<style scoped>
.error {
  color: red;
}
</style>
