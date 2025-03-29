<template>
  <DynamicPanel ref="panelRef" @close="handleClose">
    <template #header v-if="poi">
      <div class="poi-header" :style="headerStyle">
        <div class="header-content">
          <h3>{{ poi.title }}</h3>
          <p class="description">{{ poi.description }}</p>
        </div>
        <q-btn flat round icon="close" @click="handleClose" />
      </div>
    </template>

    <template #primary v-if="poi">
      <div class="poi-content">
        <div class="poi-image">
          <img :src="poi.header_image_url" :alt="poi.title" />
        </div>
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
            <span>{{ poi.category?.name || 'Uncategorized' }}</span>
          </div>
        </div>
        <div class="poi-markdown">
          <MarkdownRenderer :content="poi.markdown_content" />
        </div>
        <div class="poi-actions">
          <q-btn color="primary" icon="directions" label="Navigate" @click="handleNavigate" />
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
import MarkdownRenderer from '../common/MarkdownRenderer.vue';

const props = defineProps({
  poi: {
    type: Object,
    required: true,
    validator: (value) =>
      value &&
      typeof value.title === 'string' &&
      typeof value.description === 'string' &&
      typeof value.image_url === 'string' &&
      typeof value.header_image_url === 'string' &&
      typeof value.address === 'string' &&
      typeof value.opening_hours === 'string' &&
      typeof value.category === 'string' &&
      typeof value.markdown_content === 'string',
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
  align-items: flex-start;
  width: 100%;
  height: auto;
  padding: 0 0 0 16px;
  gap: 16px;
  background: #ffffff; // Dark background for header

  .header-content {
    flex: 1;
    min-width: 0; // Prevents text overflow

    h3 {
      margin: 0 0 8px 0;
      font-size: 1.4rem;
      font-weight: 600;
      color: #000000;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
    }

    .description {
      margin: 0;
      font-size: 0.95rem;
      line-height: 1.4;
      color: rgba(0, 0, 0, 0.9);
      text-shadow: 0 1px 2px rgba(0, 0, 0, 0.2);
    }
  }

  .q-btn {
    color: #000000;
    background: rgba(255, 255, 255, 0.1);
    flex-shrink: 0;

    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  }
}

.poi-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
  overflow-y: auto;
  padding-right: 16px;
  background: #ffffff; // White background for content
}

.poi-image {
  width: auto;
  min-height: 200px;
  border-radius: 8px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
}

.poi-details {
  display: flex;
  flex-direction: column;
  gap: 12px;
  padding: 16px;
  background: #f5f5f5; // Light gray background for details
  border-radius: 8px;

  .detail-item {
    display: flex;
    align-items: center;
    gap: 8px;
    color: #333333;

    .q-icon {
      font-size: 20px;
      color: #666666;
    }
  }
}

.poi-markdown {
  line-height: 1.6;
  color: #333333;

  :deep(h1) {
    font-size: 1.8rem;
    margin: 1.5rem 0 1rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  :deep(h2) {
    font-size: 1.5rem;
    margin: 1.2rem 0 1rem;
    font-weight: 600;
    color: #1a1a1a;
  }

  :deep(p) {
    margin: 1rem 0;
    color: #333333;
  }

  :deep(ul),
  :deep(ol) {
    margin: 1rem 0;
    padding-left: 1.5rem;
    color: #333333;
  }

  :deep(li) {
    margin: 0.5rem 0;
  }

  :deep(strong) {
    font-weight: 600;
    color: #1a1a1a;
  }

  :deep(hr) {
    border: none;
    border-top: 1px solid #e0e0e0;
    margin: 2rem 0;
  }
}

.poi-actions {
  display: flex;
  gap: 8px;
  justify-content: center;
  margin-top: 16px;
  padding: 16px;
  background: #f5f5f5; // Light gray background for actions
  border-radius: 8px;

  .q-btn {
    min-width: 120px;
  }
}
</style>
