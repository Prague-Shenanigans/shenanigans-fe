<template>
  <button
    class="c-btn"
    :class="[`c-btn--${variant}`, dense ? `c-btn--dense` : '', rightIcon ? 'text-left row' : 'text-center']"
    type="button"
    :style="[color ? `color: ${color} !important` : '']"
    :disabled="disable"
    @click.stop="ev => $emit('click', ev)"
  >
    <span v-if="label">{{ label }}</span>
    <template v-if="rightIcon">
      <q-space />
      <q-icon class="q-ml-sm" :name="rightIcon" :size="rightIconSize" />
    </template>
  </button>
</template>

<script setup lang="ts">

defineProps({
  label: {
    type: String,
    default: null,
  },
  color: {
    type: String,
    default: null,
  },
  variant: {
    type: String,
    default: 'primary',
    validator(value : string) {
      return ['primary', 'secondary', 'error'].includes(value);
    },
  },
  dense: {
    type: Boolean,
    default: false,
  },
  rightIcon: {
    type: String,
    default: null,
  },
  rightIconSize: {
    type: String,
    default: '18px',
  },
  disable: {
    type: Boolean,
    default: false,
  },
});

defineEmits(['click']);
</script>

<style lang="scss">
@use 'src/css/colors.variables' as colors;

.c-btn {
  cursor: pointer;
  border-radius: 10px;
  -webkit-border-radius: 10px;
  -moz-border-radius: 10px;
  transform-origin: center bottom 0;
  align-items: center;
  justify-content: center;
  padding: 8px 10px;
  border: none;

  &--dense {
    padding: 5px 0;
  }

  &__container {
    align-items: center;
    justify-content: center;
  }

  &.disabled {
    cursor: not-allowed;
  }

  // Variant

  &--primary {
    background-color: colors.$bg-primary;
    color: white;
  }

  &--secondary {
    background-color: white;
    color: black;
  }

  &--error {
    background-color: colors.$bg-error-soft;
    color: white;
  }
}
</style>
