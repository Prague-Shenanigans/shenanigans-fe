<template>
  <div class="pois-panel">
    <div class="poi-header">
      <h3>{{ poi.title }}</h3>
      <q-btn flat round icon="close" @click="$emit('close')" />
    </div>

    <div class="poi-primary">
      <div class="poi-image">
        <img :src="poi.image_url" :alt="poi.title" />
      </div>
      <div class="poi-description">
        <p>{{ poi.description }}</p>
      </div>
    </div>

    <div class="poi-secondary">
      <div class="poi-details">
        <div class="detail-item">
          <q-icon name="location_on" />
          <span>{{ poi.address }}</span>
        </div>
        <div class="detail-item">
          <q-icon name="schedule" />
          <span>{{ poi.opening_hours }}</span>
        </div>
        <div class="detail-item">
          <q-icon name="category" />
          <span>{{ poi.category }}</span>
        </div>
      </div>
      <div class="poi-actions">
        <q-btn color="primary" label="Get Directions" @click="handleGetDirections" />
        <q-btn color="secondary" label="Save to Trip" @click="handleSaveToTrip" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { defineProps, defineEmits } from 'vue';

const props = defineProps({
  poi: {
    type: Object,
    required: true,
    validator: (value) =>
      value &&
      typeof value.title === 'string' &&
      typeof value.description === 'string' &&
      typeof value.image_url === 'string' &&
      typeof value.address === 'string' &&
      typeof value.opening_hours === 'string' &&
      typeof value.category === 'string',
  },
});

const emit = defineEmits(['close', 'getDirections', 'saveToTrip']);

function handleGetDirections() {
  emit('getDirections', props.poi);
}

function handleSaveToTrip() {
  emit('saveToTrip', props.poi);
}
</script>

<style lang="scss" scoped>
.pois-panel {
  width: 100%;
}

.poi-header {
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

.poi-primary {
  display: flex;
  flex-direction: column;
  gap: 16px;
  width: 100%;

  .poi-image {
    width: 100%;
    height: 200px;
    border-radius: 8px;
    overflow: hidden;

    img {
      width: 100%;
      height: 100%;
      object-fit: cover;
    }
  }

  .poi-description {
    p {
      margin: 0;
      line-height: 1.5;
      color: #666;
    }
  }
}

.poi-secondary {
  width: 100%;

  .poi-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #666;

      .q-icon {
        font-size: 20px;
      }
    }
  }

  .poi-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
}
</style>
