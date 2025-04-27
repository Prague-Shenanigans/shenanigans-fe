<template>
  <div v-if="isInitialized">
    <router-view />
  </div>
  <div v-else class="loading-container">
    <q-spinner color="primary" size="3em" />
    <p>Loading...</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from './stores/auth.store';
import { routeNames } from './router/routes';

defineOptions({
  name: 'App',
});

const router = useRouter();
const authStore = useAuthStore();
const isInitialized = ref(false);

onMounted(async () => {
  // Check if we need to redirect to login
  if (
    !authStore.accessToken &&
    router.currentRoute.value.name !== routeNames.signIn
  ) {
    router.push({ name: routeNames.signIn });
  }

  // Mark as initialized
  isInitialized.value = true;
});
</script>

<style>
.loading-container {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100vh;
  width: 100vw;
}
</style>
