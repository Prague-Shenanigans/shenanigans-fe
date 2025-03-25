<template>
  <q-page class="q-pa-md">
    <q-card flat bordered class="q-pa-lg max-w-md mx-auto">
      <q-card-section>
        <div class="text-h6">Account Settings</div>
      </q-card-section>

      <q-card-section>
        <q-input v-model="user.first_name" label="First Name" class="q-mb-md" />
        <q-input v-model="user.last_name" label="Last Name" class="q-mb-md" />
        <q-input v-model="user.email" label="Email" readonly class="q-mb-md" />

        <q-btn label="Save Changes" color="primary" :loading="loading" class="q-mt-sm full-width" @click="saveChanges" />
      </q-card-section>

      <q-separator spaced />

      <q-card-section>
        <div class="text-subtitle2 q-mb-sm">Change Password</div>
        <q-input v-model="oldPassword" label="Old Password" type="password" class="q-mb-md" />
        <q-input v-model="newPassword1" label="New Password" type="password" class="q-mb-md" />
        <q-input v-model="newPassword2" label="Confirm New Password" type="password" class="q-mb-md" />
        <q-btn label="Change Password" color="secondary" :loading="loading" class="q-mt-sm full-width" @click="changeUserPassword" />
      </q-card-section>

      <q-separator spaced />

      <q-card-section>
        <q-btn label="Delete Account" color="negative" flat class="full-width" @click="confirmDelete" />
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import { useQuasar } from 'quasar';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth.store';
import { useAuthApi } from 'src/api/auth.api.js';

const $q = useQuasar();
const router = useRouter();
const authStore = useAuthStore();

const { getCurrentUser, updateUser, changePassword, deleteAccount } = useAuthApi();

const user = ref({
  first_name: '',
  last_name: '',
  email: '',
});

const loading = ref(false);
const oldPassword = ref('');
const newPassword1 = ref('');
const newPassword2 = ref('');

onMounted(async () => {
  try {
    loading.value = true;
    const userData = await getCurrentUser();
    user.value = userData;
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message });
  } finally {
    loading.value = false;
  }
});

const saveChanges = async () => {
  try {
    loading.value = true;
    await updateUser({
      first_name: user.value.first_name,
      last_name: user.value.last_name,
    });
    $q.notify({ type: 'positive', message: 'Profile updated' });
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message });
  } finally {
    loading.value = false;
  }
};

const changeUserPassword = async () => {
  if (newPassword1.value !== newPassword2.value) {
    $q.notify({ type: 'warning', message: 'Passwords do not match' });
    return;
  }

  try {
    loading.value = true;
    await changePassword({
      old_password: oldPassword.value,
      new_password1: newPassword1.value,
      new_password2: newPassword2.value,
    });
    $q.notify({ type: 'positive', message: 'Password changed successfully' });
    oldPassword.value = '';
    newPassword1.value = '';
    newPassword2.value = '';
  } catch (err) {
    $q.notify({ type: 'negative', message: err.message });
  } finally {
    loading.value = false;
  }
};

const confirmDelete = () => {
  $q.dialog({
    title: 'Delete Account',
    message: 'Are you sure you want to permanently delete your account?',
    cancel: true,
    persistent: true,
  }).onOk(async () => {
    try {
      await deleteAccount();
      $q.notify({ type: 'positive', message: 'Account deleted' });
      authStore.logout();
    } catch (err) {
      $q.notify({ type: 'negative', message: err.message });
    }
  });
};
</script>

<style scoped>
.max-w-md {
  max-width: 500px;
}
.mx-auto {
  margin-left: auto;
  margin-right: auto;
}
</style>
