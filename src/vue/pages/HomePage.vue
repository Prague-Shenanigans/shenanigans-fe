<template>
  <div class="home-page">
    <h1>Prague Shenanigans</h1>
    <p>If you can see this, the ap loading correctly!</p>
    <MainMap />
  </div>
</template>

<script setup>
import MainMap from '../components/MainMap.vue';

console.log('HomePage');
</script>

<style lang="scss" scoped>
.home-page {
  height: 100%;
  width: 100%;
  overflow: hidden;
  padding: 20px;

  h1 {
    color: #4285f4;
    margin-bottom: 10px;
  }
}
</style>
