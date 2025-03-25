<template>
  <q-layout view="hHh lpR fFf" class="main-layout">
    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts"></script>

<style lang="scss" scoped>
.main-layout {
  background-color: #ededed;
  padding: 25px 30px;
}
</style>
