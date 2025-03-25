<!--
  Example usage of IconLabelBtn with all props:

  <IconLabelBtn
    label="Button Label"        // The text label for the button
    iconName="sample-icon"      // The name of the icon to display
    iconColor="white"           // The color of the icon
    iconSize="24px"             // The size of the icon
    textSize="16px"             // The size of the text label
    textColor="white"           // The color of the text label
    :bold="true"                // Whether the text label is bold (true/false)
    iconPosition="left"         // The position of the icon (left/right)
    color="primary"             // The background color of the button (see list of available colors)
    :fullWidth="true"           // Whether the button should be full width (true/false)
    :spaceBetween="true"        // Whether there should be space between the icon and label (true/false)
    :disabled="false"           // Whether the button is disabled (true/false)
    paddingX="20px"             // Horizontal padding (padding-left and padding-right)
    paddingY="10px"             // Vertical padding (padding-top and padding-bottom)
  />

  List of available colors:
  'primary'
  'secondary'
  'txt-blue'
  'txt-yellow'
  'txt-orange'
  'txt-green'
  'txt-pink'
-->

<template>
  <button
    :class="[
      'button',
      `button--${color}`,
      {
        'button--full-width': fullWidth,
        'button--space-between': spaceBetween,
        'button--centered': !spaceBetween,
      },
    ]"
    :disabled="disabled"
    :style="{ padding: `${paddingY} ${paddingX}` }"
  >
    <template v-if="iconPosition === 'left'">
      <CustomIcon :icon-name="iconName" :color="iconColor" :size="iconSize" class="button__icon--left" />
    </template>
    <span :class="{ 'text--bold': bold }" :style="{ fontSize: textSize, color: textColor }">{{ label }}</span>
    <template v-if="iconPosition === 'right'">
      <CustomIcon :icon-name="iconName" :color="iconColor" :size="iconSize" class="button__icon--right" />
    </template>
  </button>
</template>

<script setup>
import CustomIcon from 'src/vue/components/base/CustomIcon.vue';

defineProps({
  label: {
    type: String,
    required: true,
  },
  iconName: {
    type: String,
    required: true,
  },
  iconPosition: {
    type: String,
    default: 'left',
    validator: (value) => ['left', 'right'].includes(value),
  },
  iconColor: {
    type: String,
    default: 'currentColor',
  },
  iconSize: {
    type: String,
    default: '16px',
  },
  textSize: {
    type: String,
    default: '16px',
  },
  textColor: {
    type: String,
    default: 'white',
  },
  bold: {
    type: Boolean,
    default: false,
  },
  color: {
    type: String,
    default: 'primary',
    validator: (value) => ['primary', 'secondary', 'txt-blue', 'txt-yellow', 'txt-orange', 'txt-green', 'txt-pink'].includes(value),
  },
  fullWidth: {
    type: Boolean,
    default: false,
  },
  spaceBetween: {
    type: Boolean,
    default: false,
  },
  disabled: {
    type: Boolean,
    default: false,
  },
  paddingX: {
    type: String,
    default: '15px',
  },
  paddingY: {
    type: String,
    default: '8px',
  },
});
</script>

<style scoped>
.button__icon--left {
  margin-right: 8px;
}

.button__icon--right {
  margin-left: 8px;
}

.text--bold {
  font-weight: bold;
}

.button--centered {
  justify-content: center;
}
</style>
