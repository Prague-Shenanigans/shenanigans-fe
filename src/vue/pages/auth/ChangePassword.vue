<template>
  <div>
    <h1>Change Password</h1>
    <form @submit.prevent="changePassword">
      <input
        v-model="currentPassword"
        type="password"
        placeholder="Current Password"
        required
      />
      <input
        v-model="newPassword"
        type="password"
        placeholder="New Password"
        required
      />
      <input
        v-model="confirmPassword"
        type="password"
        placeholder="Confirm New Password"
        required
      />
      <button type="submit">Update Password</button>
    </form>
    <p v-if="success" class="success">{{ success }}</p>
    <p v-if="error" class="error">{{ error }}</p>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthApi } from 'src/api/auth.api';
import { useQuasar } from 'quasar';

const $q = useQuasar();
const authApi = useAuthApi();

const currentPassword = ref('');
const newPassword = ref('');
const confirmPassword = ref('');
const success = ref('');
const error = ref('');

const changePassword = async () => {
  if (newPassword.value !== confirmPassword.value) {
    error.value = 'Passwords do not match.';
    return;
  }

  try {
    await authApi.changePassword({
      old_password: currentPassword.value,
      new_password1: newPassword.value,
      new_password2: confirmPassword.value,
    });
    success.value = 'Password successfully changed.';
    $q.notify({
      type: 'positive',
      message: 'Password successfully changed.',
    });
  } catch (err) {
    error.value =
      'Failed to change password. Make sure your current password is correct.';
    $q.notify({
      type: 'negative',
      message:
        'Failed to change password. Make sure your current password is correct.',
    });
  }
};
</script>

<style scoped>
.error {
  color: red;
}
.success {
  color: green;
}
</style>
