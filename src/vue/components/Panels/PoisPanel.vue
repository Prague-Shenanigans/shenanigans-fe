<template>
  <DynamicPanel ref="panelRef" @close="handleClose">
    <template #header v-if="poi">
      <div class="poi-header">
        <h3>{{ poi.title }}</h3>
        <q-btn flat round icon="close" @click="handleClose" />
      </div>
    </template>

    <template #primary v-if="poi">
      <div class="poi-primary">
        <div class="poi-image">
          <img :src="poi.header_image_url" :alt="poi.title" />
        </div>
        <div class="poi-description">
          <p>{{ poi.description }}</p>
        </div>
        <div class="poi-actions">
          <q-btn color="primary" icon="directions" label="Navigate" @click="handleNavigate" />
        </div>
      </div>
    </template>

    <template #secondary v-if="poi">
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
          <q-btn color="secondary" label="Save to Trip" @click="handleSaveToTrip" />
        </div>
      </div>
    </template>
  </DynamicPanel>
</template>

<script setup>
import { ref, watch } from 'vue';
import { QBtn, QIcon } from 'quasar';
import { useLocationStore } from '../../../stores/location';
import DynamicPanel from './DynamicPanel.vue';

const props = defineProps({
  poi: {
    type: Object,
    required: true,
  },
});

const emit = defineEmits(['close', 'get-directions', 'save-to-trip']);
const panelRef = ref(null);
const locationStore = useLocationStore();
const isChangingPoi = ref(false);

// Watch for POI changes
watch(
  () => props.poi,
  () => {
    isChangingPoi.value = true;
    setTimeout(() => {
      isChangingPoi.value = false;
    }, 500); // Give enough time for the panel to update
  },
);

function handleClose() {
  // Don't close if we're in the middle of changing POIs
  if (isChangingPoi.value) return;

  panelRef.value?.setCurrentState(0);
  setTimeout(() => {
    emit('close');
  }, 300);
}

function handleSaveToTrip() {
  emit('save-to-trip', props.poi);
}

async function handleNavigate() {
  if (!locationStore.coordinates) {
    try {
      await locationStore.getCurrentPosition();
    } catch (error) {
      console.error('Failed to get user location:', error);
      return;
    }
  }

  const { lat: startLat, lng: startLng } = locationStore.coordinates;
  const { latitude: endLat, longitude: endLng } = props.poi;

  emit('get-directions', {
    start: { lat: startLat, lng: startLng },
    end: { lat: endLat, lng: endLng },
  });
}

defineExpose({
  setCurrentState: (state) => panelRef.value?.setCurrentState(state),
});
</script>

<style lang="scss" scoped>
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

  .poi-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
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
