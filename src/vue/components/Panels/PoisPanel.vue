<template>
  <DynamicPanel ref="panelRef" @close="handleClose">
    <template #header v-if="poi">
      <div class="poi-header">
        <div class="header-content">
          <div class="header-top">
            <h3>{{ poi.title }}</h3>
            <div class="actions-column">
              <q-btn round flat color="primary" icon="directions" class="action-btn" @click="handleNavigate">
                <q-tooltip>Get directions</q-tooltip>
              </q-btn>
              <q-btn round flat color="secondary" icon="bookmark" class="action-btn" @click="handleSaveToTrip">
                <q-tooltip>Save to trip</q-tooltip>
              </q-btn>
              <q-btn round flat color="primary" icon="share" class="action-btn" @click="handleShare">
                <q-tooltip>Share</q-tooltip>
              </q-btn>
            </div>
          </div>
          <p class="description">{{ poi.description }}</p>
          <div v-if="poi.category && poi.category.length" class="tags-container">
            <div class="tags-list">
              <div v-for="cat in poi.category" :key="cat.id" class="tag">
                {{ cat.name }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </template>

    <template #primary v-if="poi">
      <div class="poi-content">
        <div v-if="poi.header_image_url" class="poi-image">
          <img :src="poi.header_image_url" :alt="poi.title" />
        </div>
        <div class="poi-details">
          <div class="details-column">
            <div class="detail-item">
              <q-icon name="location_on" />
              <span>{{ poi.address }}</span>
            </div>
            <div class="detail-item">
              <q-icon name="schedule" />
              <span>{{ poi.opening_hours }}</span>
            </div>
            <div v-if="poi.tags && poi.tags.length" class="detail-item tags-row">
              <div class="tags-list">
                <div v-for="tag in poi.tags" :key="tag.id" class="tag">
                  {{ tag.name }}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div class="poi-markdown">
          <MarkdownRenderer :content="poi.markdown_content" />
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
  },
});

const emit = defineEmits(['close', 'get-directions', 'save-to-trip', 'center-map']);
const panelRef = ref(null);
const isChangingPoi = ref(false);
const locationStore = useLocationStore();

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
  try {
    if (!locationStore.coordinates) {
      await locationStore.getCurrentPosition();
    }

    const { lat: startLat, lng: startLng } = locationStore.coordinates;
    const { latitude: endLat, longitude: endLng } = props.poi;

    // Set panel state to 2 (half height)
    panelRef.value?.setCurrentState(2);

    // Emit both the directions and center-map events
    emit('get-directions', {
      start: { lat: startLat, lng: startLng },
      end: { lat: endLat, lng: endLng },
    });
    emit('center-map', {
      lat: (startLat + endLat) / 2,
      lng: (startLng + endLng) / 2,
      bounds: {
        north: Math.max(startLat, endLat),
        south: Math.min(startLat, endLat),
        east: Math.max(startLng, endLng),
        west: Math.min(startLng, endLng),
      },
    });
  } catch (error) {
    console.error('Failed to get user location:', error);
  }
}

function handleShare() {
  const shareData = {
    title: props.poi.title,
    text: props.poi.description,
    url: window.location.href,
  };
  navigator.share(shareData);
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
  background: #ffffff;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);

  .header-content {
    flex: 1;
    min-width: 0;
    display: flex;
    flex-direction: column;
    gap: 8px;

    .header-top {
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
      width: 100%;
      padding: 8px 16px;
      gap: 16px;

      h3 {
        margin: 0;
        font-size: 1.2rem;
        font-weight: 600;
        color: #000000;
        flex: 1;
        min-width: 0;
        word-wrap: break-word;
        line-height: 1.3;
      }

      .actions-column {
        display: flex;
        flex-direction: row;
        gap: 8px;
        flex-shrink: 0;

        .action-btn {
          width: 36px;
          height: 36px;
          background: rgba(255, 255, 255, 0.9);
          box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
          transition: all 0.2s ease;

          &:hover {
            transform: translateY(-1px);
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.15);
          }

          .q-icon {
            font-size: 18px;
          }
        }
      }
    }

    .description {
      margin: 0;
      padding: 0 16px 8px;
      font-size: 0.9rem;
      line-height: 1.3;
      color: rgba(0, 0, 0, 0.7);
      overflow: visible;
      white-space: normal;
      word-wrap: break-word;
    }

    .tags-container {
      padding: 0 16px 14px;

      .tags-list {
        display: flex;
        flex-wrap: wrap;
        gap: 8px;

        .tag {
          background: #f0f0f0;
          color: #666;
          padding: 4px 8px;
          border-radius: 4px;
          font-size: 0.8rem;
          line-height: 1.2;
        }
      }
    }
  }
}

.poi-content {
  display: flex;
  flex-direction: column;
  gap: 14px;
  width: 100%;
  height: 100%;
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
  gap: 16px;
  padding: 16px;
  background: #f5f5f5; // Light gray background for details
  border-radius: 8px;
  border: 1px solid rgba(0, 0, 0, 0.1);

  .details-column {
    flex: 1;
    display: flex;
    flex-direction: column;
    gap: 12px;

    .detail-item {
      display: flex;
      align-items: center;
      gap: 8px;
      color: #333333;

      .q-icon {
        font-size: 20px;
        color: #666666;
      }

      &.tags-row {
        align-items: flex-start;

        .tags-list {
          display: flex;
          flex-wrap: wrap;
          gap: 8px;

          .tag {
            background: var(--q-primary);
            color: white;
            padding: 4px 8px;
            border-radius: 4px;
            font-size: 0.8rem;
            line-height: 1.2;
          }
        }
      }
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
    line-height: 1.3;
  }

  :deep(h2) {
    font-size: 1.5rem;
    margin: 1.2rem 0 1rem;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.3;
  }

  :deep(h3) {
    font-size: 1.3rem;
    margin: 1rem 0;
    font-weight: 600;
    color: #1a1a1a;
    line-height: 1.3;
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
</style>
