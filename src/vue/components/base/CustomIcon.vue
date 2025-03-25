<template>
  <component :is="iconComponent" v-if="iconComponent" class="custom-icon" :style="{ width: size, height: size, fill: color }" />
</template>

<script setup>
import { ref, watchEffect, getCurrentInstance } from 'vue';

const props = defineProps({
  iconName: {
    type: String,
    required: true,
  },
  color: {
    type: String,
    default: 'currentColor',
  },
  size: {
    type: String,
    default: '16px',
  },
});

const { proxy } = getCurrentInstance();
const getIconComponent = proxy.$getIconComponent;

const iconComponent = ref(null);

watchEffect(async () => {
  iconComponent.value = await getIconComponent(props.iconName);
});
</script>

<style>
.custom-icon {
  display: inline-block;
  vertical-align: middle;
}
</style>
