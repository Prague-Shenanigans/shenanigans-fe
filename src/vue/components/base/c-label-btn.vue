<!--
    Example usage of LabelBtn with all props:

    <LabelBtn
      label="Button Label"        // The text label for the button
      textSize="16px"             // The size of the text label
      :bold="true"                // Whether the text label is bold (true/false)
      color="primary"             // The background color of the button (see list of available colors)
      textColor="white"           // The color of the text
      :fullWidth="true"           // Whether the button should be full width (true/false)
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
  <button :class="['button', `button--${color}`, { 'button--full-width': fullWidth }]" :disabled="disabled" :style="{ padding: `${paddingY} ${paddingX}` }">
    <span :class="{ 'text--bold': bold }" :style="{ fontSize: textSize, color: textColor }">{{ label }}</span>
  </button>
</template>

<script setup>
defineProps({
  label: {
    type: String,
    required: true,
  },
  textSize: {
    type: String,
    default: '16px',
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
  textColor: {
    type: String,
    default: 'white',
  },
  fullWidth: {
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
.button {
  display: flex;
  align-items: center;
  justify-content: center; /* Ensure the label is centered */
}

.button--full-width {
  width: 100%;
}

.text--bold {
  font-weight: bold;
}
</style>
