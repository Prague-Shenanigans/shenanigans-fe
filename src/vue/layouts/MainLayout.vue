<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <q-header id="layout-header" class="main-layout__header" />
    <q-footer elevated class="main-layout__menu">
      <q-tabs v-model="tab" class="text-grey-8" indicator-color="transparent" active-color="teal-9">
        <q-route-tab icon="task" :to="{ name: routeNames.home }">
          <q-badge v-if="importantNotices > 0" color="red" floating>{{ importantNotices }}</q-badge>
        </q-route-tab>
        <q-route-tab :name="routeNames.trip" icon="local_shipping" indicator-color="transparent" :to="{ name: routeNames.trip }" />
        <q-route-tab :name="routeNames.chat" icon="chat_bubble" :to="{ name: routeNames.chat }">
          <q-badge v-if="importantNotices > 0" color="red" floating>{{ importantNotices }}</q-badge>
        </q-route-tab>
        <q-route-tab :name="routeNames.settings" icon="settings" indicator-color="transparent" :to="{ name: routeNames.settings }" />
      </q-tabs>
    </q-footer>
    <q-page-container v-if="isLoading">
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import { routeNames } from 'src/router/routes';

const tab = ref(null);
const isLoading = ref(false);

const importantNotices = computed(() => 0);

onMounted(() => {
  isLoading.value = true;
});
</script>
