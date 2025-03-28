<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>

    <div class="map-control">
      <select v-model="selectedProvider" @change="updateTileLayer">
        <option v-for="(provider, key) in tileProviders" :key="key" :value="provider.name">
          {{ provider.label }}
        </option>
      </select>
    </div>
  </div>
</template>

<script setup lang="ts">
// ===================== IMPORTS =====================
import { onMounted, ref, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import 'leaflet-providers';
import { tileProviders } from '../../maps/tiles/tileProviders.js';
import { usePoisStore } from '../../stores/pois.store';

// ===================== VARIABLES =====================
const mapRef = ref(null);
const map = ref(null);
const tileLayer = ref(null);
const markers = ref([]);
const selectedProvider = ref(tileProviders.osm.name);
const poisStore = usePoisStore();
let mapMoveTimeout: number | null = null;

// ===================== METHODS =====================
function updateTileLayer() {
  if (!map.value) return;

  if (tileLayer.value) {
    map.value.removeLayer(tileLayer.value);
  }

  const providerName = selectedProvider.value;
  tileLayer.value = L.tileLayer.provider(providerName);
  tileLayer.value.addTo(map.value);
}

function clearMarkers() {
  markers.value.forEach((marker) => marker.remove());
  markers.value = [];
}

function updateMarkers() {
  clearMarkers();

  poisStore.visiblePois.forEach((poi) => {
    const marker = L.marker([poi.latitude, poi.longitude])
      .bindPopup(
        `
        <h3>${poi.title}</h3>
        <p>${poi.description}</p>
        <div class="poi-tags">
          ${poi.tags.map((tag) => `<span class="tag">${tag}</span>`).join(' ')}
        </div>
      `,
      )
      .addTo(map.value);

    markers.value.push(marker);
  });
}

function handleMapMove() {
  if (!map.value) return;

  const bounds = map.value.getBounds();
  const zoom = map.value.getZoom();

  // Debounce the API call
  if (mapMoveTimeout) {
    clearTimeout(mapMoveTimeout);
  }

  mapMoveTimeout = window.setTimeout(() => {
    poisStore.loadPois(bounds, zoom);
  }, 500);
}

// ===================== LIFECYCLE HOOKS =====================
onMounted(() => {
  if (mapRef.value) {
    map.value = L.map(mapRef.value).setView([50.0755, 14.4378], 13);
    updateTileLayer();

    // Add event listeners
    map.value.on('moveend', handleMapMove);
    map.value.on('zoomend', handleMapMove);

    // Initial load
    handleMapMove();
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    clearMarkers();
  }
  if (mapMoveTimeout) {
    clearTimeout(mapMoveTimeout);
  }
});

// Watch for changes in visible POIs
watch(() => poisStore.visiblePois, updateMarkers);
</script>

<style scoped>
.map-wrapper {
  position: relative;
  height: 100vh;
  width: 100vw;
}

.map-container {
  height: 100%;
  width: 100%;
}

.map-control {
  position: absolute;
  top: 12px;
  right: 12px;
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.map-control select {
  border: none;
  background: transparent;
  font-size: 14px;
}
</style>
