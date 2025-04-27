<template>
  <q-page class="flex flex-center">
    <q-card class="q-pa-lg shadow-2">
      <q-card-section>
        <h5 class="text-center">Register</h5>
      </q-card-section>

      <q-card-section>
        <q-input
          v-model="email"
          label="Email"
          type="email"
          outlined
          dense
          :error="!!errors.email"
          :error-message="errors.email"
        />

        <q-input
          v-model="password1"
          label="Password"
          type="password"
          outlined
          dense
          :error="!!errors.password1"
          :error-message="errors.password1"
        />

        <q-input
          v-model="password2"
          label="Confirm Password"
          type="password"
          outlined
          dense
          :error="!!errors.password2"
          :error-message="errors.password2"
        />

        <q-banner v-if="successMessage" class="bg-green-2 text-green">
          {{ successMessage }}
        </q-banner>

        <q-banner v-if="errorMessage" class="bg-red-2 text-red">
          {{ errorMessage }}
        </q-banner>
      </q-card-section>

      <q-card-actions align="center">
        <q-btn
          label="Register"
          color="primary"
          :loading="loading"
          @click="register"
        />
      </q-card-actions>

      <q-card-section class="text-center">
        <p>
          Already have an account?
          <q-btn flat color="primary" dense to="/auth/login">Login</q-btn>
        </p>
      </q-card-section>
    </q-card>
  </q-page>
</template>

<script setup>
import { ref } from 'vue';
import { useAuthApi } from 'src/api/auth.api';

const email = ref('');
const password1 = ref('');
const password2 = ref('');
const loading = ref(false);
const successMessage = ref(null);
const errorMessage = ref(null);
const errors = ref({});

const authApi = useAuthApi();

const register = async () => {
  loading.value = true;
  successMessage.value = null;
  errorMessage.value = null;
  errors.value = {};

  try {
    await authApi.register({
      email: email.value,
      username: email.value,
      password1: password1.value,
      password2: password2.value,
    });

    successMessage.value =
      'Registration successful! Check your email for verification.';
    email.value = '';
    password1.value = '';
    password2.value = '';
  } catch (err) {
    if (err.response && err.response.data) {
      errors.value = err.response.data;
      errorMessage.value = 'Registration failed. Check your inputs.';
    } else {
      errorMessage.value = 'Something went wrong.';
    }
  } finally {
    loading.value = false;
  }
};
</script>
