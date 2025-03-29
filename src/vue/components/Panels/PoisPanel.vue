<template>
  <DynamicPanel ref="panelRef" @close="handleClose">
    <template #header v-if="poi">
      <div class="poi-header" :style="headerStyle">
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
            <span>{{ poi.category?.name || 'Uncategorized' }}</span>
          </div>
        </div>
        <div class="poi-markdown">
          <MarkdownRenderer :content="poi.markdown_content" />
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
  height: 100%;
  display: flex;
  flex-direction: column;
  overflow: hidden;

  .poi-details {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 16px;
    flex-shrink: 0;

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

  .poi-markdown {
    flex: 1;
    overflow-y: auto;
    padding-right: 16px;
    margin: 24px 0;
    line-height: 1.6;
    color: #333;

    :deep(h1) {
      font-size: 1.8rem;
      margin: 1.5rem 0 1rem;
      font-weight: 600;
    }

    :deep(h2) {
      font-size: 1.5rem;
      margin: 1.2rem 0 1rem;
      font-weight: 600;
    }

    :deep(p) {
      margin: 1rem 0;
    }

    :deep(ul),
    :deep(ol) {
      margin: 1rem 0;
      padding-left: 1.5rem;
    }

    :deep(li) {
      margin: 0.5rem 0;
    }

    :deep(strong) {
      font-weight: 600;
    }

    :deep(hr) {
      border: none;
      border-top: 1px solid #eee;
      margin: 2rem 0;
    }
  }

  .poi-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    flex-shrink: 0;
    margin-top: 16px;
  }
}
</style>
