<template>
  <div ref="panelRef" class="dynamic-panel" :class="`state-${currentState}`">
    <div class="panel-content">
      <!-- Header Section -->
      <div class="panel-header" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <div class="drag-handle"></div>
        <slot name="header">
          <div class="default-header">
            <h3>Default Header</h3>
          </div>
        </slot>
      </div>

      <!-- Primary Content Section -->
      <div ref="primaryRef" class="panel-primary" @scroll="handleScroll" @touchstart="handleTouchStart" @touchmove="handleTouchMove" @touchend="handleTouchEnd">
        <slot name="primary">
          <div class="default-primary">Primary Content</div>
        </slot>
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref } from 'vue';
import { onClickOutside } from '@vueuse/core';

const emit = defineEmits(['close']);

const panelRef = ref(null);
const primaryRef = ref(null);
const currentState = ref(0);
const isAtTop = ref(true); // dynamically updated from scroll

let startY = 0;
let currentY = 0;
let deltaY = 0;

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
  const isSwipingUp = deltaY < -30;
  const isSwipingDown = deltaY > 30;

  console.log('deltaY:', deltaY.toFixed(1), '| isAtTop:', isAtTop.value);

  if (isSwipingUp && currentState.value < 3) {
    currentState.value++;
  } else if (isSwipingDown && isAtTop.value && currentState.value > 0) {
    currentState.value--;
  }

  deltaY = 0;
}

function handleScroll() {
  const el = primaryRef.value;
  if (!el) return;

  const { scrollTop } = el;
  const { scrollHeight } = el;
  const { clientHeight } = el;

  const scrollPercent = (scrollTop / (scrollHeight - clientHeight)) * 100;
  isAtTop.value = scrollPercent <= 0.1; // allow slight float margin

  console.log(`Scroll position: ${scrollPercent.toFixed(1)}%`);
}

onClickOutside(panelRef, () => {
  if (currentState.value > 0) {
    setCurrentState(0);
    setTimeout(() => {
      emit('close');
    }, 300);
  }
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
    height: 23vh;
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
}

.panel-header {
  display: flex;
  flex-direction: column;
  align-items: center;
  flex-shrink: 0;
  padding: 16px;

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
  margin: 0;
  padding: 0 16px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: flex-start;
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
}
</style>
