<template>
  <div class="info-panel-wrapper">
    <div
      ref="panel"
      class="info-panel"
      :style="{ transform: `translateY(${translateY}px)` }"
      @mousedown="onStart"
      @mousemove="onMove"
      @mouseup="onEnd"
      @mouseleave="onEnd"
      @touchstart="onStart"
      @touchmove="onMove"
      @touchend="onEnd"
    >
      <div class="drag-handle"></div>
      <div class="info-panel-content">
        <slot />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';

const emit = defineEmits(['close']);

const panel = ref(null);
const isDragging = ref(false);
const startY = ref(0);
const translateY = ref(window.innerHeight * 0.85);
const velocity = ref(0);
let lastY = 0;
let lastTime = 0;

const screenHeight = window.innerHeight;

function setTranslate(y, animate = true) {
  if (animate) {
    panel.value.style.transition = 'transform 0.25s cubic-bezier(0.25, 0.8, 0.25, 1)';
  } else {
    panel.value.style.transition = 'none';
  }
  translateY.value = Math.max(0, Math.min(screenHeight, y));
}

function getY(e) {
  return e.touches ? e.touches[0].clientY : e.clientY;
}

function onStart(e) {
  isDragging.value = true;
  startY.value = getY(e);
  lastY = startY.value;
  lastTime = performance.now();
  setTranslate(translateY.value, false);
}

function onMove(e) {
  if (!isDragging.value) return;
  const y = getY(e);
  const delta = y - startY.value;
  setTranslate(translateY.value + delta, false);

  const now = performance.now();
  const deltaTime = now - lastTime;
  if (deltaTime > 0) {
    velocity.value = (y - lastY) / deltaTime;
    lastY = y;
    lastTime = now;
  }

  startY.value = y;
}

function onEnd() {
  if (!isDragging.value) return;
  isDragging.value = false;

  if (translateY.value >= screenHeight - 50 || velocity.value > 0.7) {
    emit('close');
  } else {
    setTranslate(translateY.value); // stay where user left it
  }
}

onMounted(() => {
  setTranslate(window.innerHeight * 0.85, true);
});
</script>

<style scoped>
.info-panel-wrapper {
  position: fixed;
  top: 0;
  width: 100%;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 999;
}

.info-panel {
  min-width: 100%;
  height: 100%;
  background: white;
  z-index: 1000;
  touch-action: none;
  border-top-left-radius: 1rem;
  border-top-right-radius: 1rem;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.15);
}

.drag-handle {
  height: 24px;
  width: 40px;
  background: #ccc;
  margin: 12px auto;
  border-radius: 4px;
}

.info-panel-content {
  max-width: 768px;
  margin: 0 auto;
  padding: 1rem;
}
</style>
