export const routeNames = {
  signIn: 'signIn',
  emailVerify: 'emailverify',
  register: 'register',
  home: 'home',
  trip: 'trip',
  stopdetail: 'stopdetail',
  chat: 'chat',
  settings: 'settings',
  passwordResetRequest: 'passwordResetRequest',
  passwordResetConfirm: 'passwordResetConfirm',
  changePassword: 'changePassword',
};

const routes = [
  {
    path: '/',
    component: () => import('src/vue/layouts/MainLayout.vue'),
    children: [
      { path: '', redirect: routeNames.home },
      {
        path: 'home',
        name: routeNames.home,
        component: () => import('src/vue/pages/HomePage.vue'),
      },
      {
        path: 'trip',
        name: routeNames.trip,
        component: () => import('src/vue/pages/TripPage.vue'),
      },
      {
        path: 'stopdetail/:stopId',
        name: routeNames.stopdetail,
        component: () => import('src/vue/pages/StopDetailPage.vue'),
        props: true,
      },
      {
        path: 'chat',
        name: routeNames.chat,
        component: () => import('src/vue/pages/ChatPage.vue'),
      },
      {
        path: 'settings',
        name: routeNames.settings,
        component: () => import('src/vue/pages/SettingsPage.vue'),
      },
      {
        path: 'change-password',
        name: routeNames.changePassword,
        component: () => import('src/vue/pages/auth/ChangePassword.vue'),
      },
    ],
  },
  {
    path: '/auth',
    component: () => import('src/vue/layouts/AuthLayout.vue'),
    children: [
      {
        path: 'login',
        name: routeNames.signIn,
        component: () => import('src/vue/pages/auth/LoginPage.vue'),
      },
      {
        path: 'emailverify',
        name: routeNames.emailVerify,
        component: () => import('src/vue/pages/auth/EmailVerify.vue'),
      },
      {
        path: 'register',
        name: routeNames.register,
        component: () => import('src/vue/pages/auth/RegisterPage.vue'),
      },
      {
        path: 'reset-password',
        name: routeNames.passwordResetRequest,
        component: () => import('src/vue/pages/auth/PasswordResetRequest.vue'),
      },
      {
        path: 'reset-password-confirm',
        name: routeNames.passwordResetConfirm,
        component: () => import('src/vue/pages/auth/PasswordResetConfirm.vue'),
      },
    ],
  },
  {
    path: '/:catchAll(.*)*',
    component: () => import('src/vue/pages/ErrorNotFound.vue'),
  },
];

export default routes;
