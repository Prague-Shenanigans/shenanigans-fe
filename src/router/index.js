import { route } from 'quasar/wrappers';
import { createMemoryHistory, createRouter, createWebHashHistory, createWebHistory } from 'vue-router';

import { useAuthStore } from '../stores/auth.store';
import routes, { routeNames } from './routes';

const createHistory = process.env.SERVER ? createMemoryHistory : process.env.VUE_ROUTER_MODE === 'history' ? createWebHistory : createWebHashHistory;

const router = createRouter({
  scrollBehavior: () => ({ left: 0, top: 0 }),
  routes,
  history: createHistory(process.env.VUE_ROUTER_BASE),
});

export default route(() => router);

// ✅ Only allow unauthenticated users to access these routes
const publicRoutes = [
  routeNames.signIn,
  routeNames.register,
  routeNames.emailVerify,
  routeNames.passwordResetRequest,
  routeNames.passwordResetConfirm,
  // DO NOT include `changePassword` here
];

router.beforeEach(async (to, from, next) => {
  const authStore = useAuthStore();

  if (!authStore.accessToken && !publicRoutes.includes(to.name)) {
    next({ name: routeNames.signIn });
  } else if (authStore.accessToken && to.name === routeNames.signIn) {
    next({ name: routeNames.home });
  } else {
    if (!authStore.user && !publicRoutes.includes(to.name)) {
      await authStore.me();
    }
    next();
  }
});
