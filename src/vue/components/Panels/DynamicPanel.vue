<template>
  <div ref="panelRef" class="dynamic-panel" :class="`state-${currentState}`" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
    <div class="panel-content">
      <!-- Header Section -->
      <div class="panel-header">
        <div class="drag-handle"></div>
        <slot name="header">
          <div class="default-header">
            <h3>Default Header</h3>
          </div>
        </slot>
      </div>

      <!-- Primary Content Section -->
      <div class="panel-primary">
        <slot name="primary">
          <div class="default-primary">Primary Content</div>
        </slot>
      </div>

      <!-- Secondary Content Section -->
      <div class="panel-secondary">
        <slot name="secondary">
          <div class="default-secondary">Secondary Content</div>
        </slot>
      </div>

      <div class="state-indicator">State: {{ currentState }}</div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

const emit = defineEmits(['close']);

const currentState = ref(0);
let startY = 0;
let currentY = 0;
let deltaY = 0;

const panelRef = ref(null);

function setCurrentState(value) {
  currentState.value = value;
}

function handleTouchStart(e) {
  startY = e.touches[0].clientY;
}

function handleTouchMove(e) {
  currentY = e.touches[0].clientY;
  deltaY = currentY - startY;
}

function handleTouchEnd() {
  if (deltaY < -30 && currentState.value < 3) {
    currentState.value++;
  } else if (deltaY > 30 && currentState.value > 0) {
    currentState.value--;
  }
  deltaY = 0;
}

onClickOutside(panelRef, () => {
  setCurrentState(0);
  setTimeout(() => {
    emit('close');
  }, 300);
});

defineExpose({
  setCurrentState,
});
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
    height: 55vh;
  }

  &.state-3 {
    height: 90vh;
  }
}

.panel-content {
  height: 100%;
  display: flex;
  flex-direction: column;
  padding: 16px;
}

.panel-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 16px;
  flex-shrink: 0;

  .drag-handle {
    width: 40px;
    height: 4px;
    background: #ddd;
    border-radius: 2px;
    margin-bottom: 8px;
  }

  .default-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    width: 100%;

    h3 {
      margin: 0;
      font-size: 1.2rem;
      font-weight: 600;
    }
  }
}

.panel-primary {
  margin-bottom: 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

.panel-secondary {
  overflow-y: auto;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding-top: 16px;
  border-top: 1px solid #eee;
}

.state-indicator {
  margin-top: 8px;
  font-size: 14px;
  color: #666;
  text-align: center;
}
</style>
