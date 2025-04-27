<template>
  <q-layout view="lHh Lpr lFf" class="main-layout">
    <!-- ===================== HEADER ===================== -->
    <q-header elevated>
      <q-toolbar>
        <q-btn
          flat
          dense
          round
          icon="menu"
          @click="leftDrawerOpen = !leftDrawerOpen"
        />
        <q-toolbar-title>Prague Shenanigans</q-toolbar-title>
        <q-btn flat dense icon="logout" @click="logout" />
      </q-toolbar>
    </q-header>

    <!-- ===================== DRAWER ===================== -->
    <q-drawer v-model="leftDrawerOpen" bordered>
      <q-list>
        <q-item v-ripple to="/home" clickable>
          <q-item-section avatar><q-icon name="home" /></q-item-section>
          <q-item-section>Home</q-item-section>
        </q-item>

        <q-item v-ripple to="/settings" clickable>
          <q-item-section avatar><q-icon name="settings" /></q-item-section>
          <q-item-section>Settings</q-item-section>
        </q-item>
      </q-list>
    </q-drawer>

    <!-- ===================== PAGE CONTAINER ===================== -->
    <q-page-container class="page-container">
      <router-view v-if="isAuthenticated" />
      <div v-else class="auth-redirect">
        <q-spinner color="primary" size="3em" />
        <p>Redirecting to login...</p>
      </div>
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { ref, computed, onMounted } from 'vue';
import { useRouter } from 'vue-router';
import { useAuthStore } from 'src/stores/auth.store';
import { routeNames } from 'src/router/routes';

const leftDrawerOpen = ref(false);
const router = useRouter();
const authStore = useAuthStore();
const isAuthenticated = computed(() => authStore.isAuthenticated());

onMounted(() => {
  if (!isAuthenticated.value) {
    router.push({ name: routeNames.signIn });
  }
});

const logout = () => {
  authStore.logout();
  router.push('/auth/login');
};
</script>

<style lang="scss" scoped>
.main-layout {
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.page-container {
  height: 100%; // Subtract header height
  overflow: hidden;
  overflow-y: auto;
}

.auth-redirect {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  height: 100%;
  width: 100%;
}
</style>
