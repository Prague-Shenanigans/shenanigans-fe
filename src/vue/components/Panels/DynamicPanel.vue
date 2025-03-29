<template>
  <div class="dynamic-panel" :class="`state-${currentState}`" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <div class="panel-content">
      <slot />
      <div class="state-indicator">State: {{ currentState }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';

const currentState = ref(1);
let startY = 0;
let currentY = 0;
let deltaY = 0;

function handleTouchStart(e) {
  console.log('e :>> ', e);
  startY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  currentY = e.touches[0].clientY;
  deltaY = currentY - startY;
}

function handleTouchEnd() {
  if (deltaY < -30) {
    // Swipe up
    if (currentState.value < 3) {
      currentState.value++;
    }
  } else if (deltaY > 30) {
    // Swipe down
    if (currentState.value > 0) {
      currentState.value--;
    }
  }
  deltaY = 0;
}
</script>

<style lang="scss" scoped>
.dynamic-panel {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  width: 100%;
  background: white;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
  border-top-left-radius: 16px;
  border-top-right-radius: 16px;
  z-index: 1000;
  padding: 16px;
  transition: height 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  overflow: hidden;

  &.state-0 {
    height: 0;
    padding: 0;
  }

  &.state-1 {
    height: 20vh;
  }

  &.state-2 {
    height: 40vh;
  }

  &.state-3 {
    height: 80vh;
  }
}

.panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.state-indicator {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
}
</style>
