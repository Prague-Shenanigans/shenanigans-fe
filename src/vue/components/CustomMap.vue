<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>

    <div class="control-group">
      <select v-model="selectedStyle" @change="updateMapStyle">
        <option v-for="style in mapStyles" :key="style.name" :value="style.name">
          {{ style.label }}
        </option>
      </select>
    </div>

    <DynamicPanel ref="panelRef" @close="handlePanelClose">
      <PoisPanel :poi="selectedMarker" @close="handlePanelClose" @get-directions="handleGetDirections" @save-to-trip="handleSaveToTrip" />
    </DynamicPanel>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import { usePoisStore } from '../../stores/pois.store';
import DynamicPanel from './Panels/DynamicPanel.vue';
import PoisPanel from './Panels/PoisPanel.vue';
import '../../css/custom/main.scss';

const mapRef = ref(null);
const map = ref(null);
const panelRef = ref(null); // <== ADD THIS
const tileLayer = ref(null);
const gridLayer = ref(null);
const poiMarkers = ref([]);
const selectedMarker = ref(null);
const selectedStyle = ref('vintage');
const showGrid = ref(false);
let mapMoveTimeout = null;

const poisStore = usePoisStore();

const mapStyles = [
  {
    name: 'vintage',
    label: 'Vintage Map',
    style: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: { attribution: '© OpenStreetMap contributors' },
      css: `
        .vintage-map { filter: sepia(30%) contrast(110%) brightness(95%); }
        .vintage-map .leaflet-tile { filter: sepia(30%) contrast(110%) brightness(95%); }
        .vintage-map .leaflet-tile[src*='water'] { filter: sepia(30%) contrast(110%) brightness(95%) hue-rotate(180deg) saturate(150%); }
        .vintage-map .leaflet-tile[src*='park'],
        .vintage-map .leaflet-tile[src*='forest'],
        .vintage-map .leaflet-tile[src*='nature_reserve'] { filter: sepia(30%) contrast(110%) brightness(95%) hue-rotate(90deg) saturate(120%); }
        .vintage-map .leaflet-tile[src*='highway'],
        .vintage-map .leaflet-tile[src*='road'] { filter: sepia(30%) contrast(120%) brightness(90%); }
        .vintage-map .leaflet-tile[src*='building'] { filter: sepia(30%) contrast(110%) brightness(85%); }
      `,
    },
  },
  {
    name: 'default',
    label: 'Default Map',
    style: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: { attribution: '© OpenStreetMap contributors' },
    },
  },
];

const poiIcons = {
  landmark: L.divIcon({ className: 'poi-icon landmark', iconSize: [36, 36], iconAnchor: [18, 18] }),
  bridge: L.divIcon({ className: 'poi-icon bridge', iconSize: [36, 36], iconAnchor: [18, 18] }),
  underground_club: L.divIcon({ className: 'poi-icon underground_club', iconSize: [36, 36], iconAnchor: [18, 18] }),
  museum: L.divIcon({ className: 'poi-icon museum', iconSize: [36, 36], iconAnchor: [18, 18] }),
  park: L.divIcon({ className: 'poi-icon park', iconSize: [36, 36], iconAnchor: [18, 18] }),
  restaurant: L.divIcon({ className: 'poi-icon restaurant', iconSize: [36, 36], iconAnchor: [18, 18] }),
  cafe: L.divIcon({ className: 'poi-icon cafe', iconSize: [36, 36], iconAnchor: [18, 18] }),
  bar: L.divIcon({ className: 'poi-icon bar', iconSize: [36, 36], iconAnchor: [18, 18] }),
  monument: L.divIcon({ className: 'poi-icon monument', iconSize: [36, 36], iconAnchor: [18, 18] }),
  square: L.divIcon({ className: 'poi-icon square', iconSize: [36, 36], iconAnchor: [18, 18] }),
  concert_hall: L.divIcon({ className: 'poi-icon concert_hall', iconSize: [36, 36], iconAnchor: [18, 18] }),
  pub: L.divIcon({ className: 'poi-icon pub', iconSize: [36, 36], iconAnchor: [18, 18] }),
};

function updatePOIs() {
  if (!map.value) return;
  const bounds = map.value.getBounds();
  const zoom = map.value.getZoom();
  poisStore.loadPois(bounds, zoom);
}

function updateMapStyle() {
  if (!map.value) return;
  if (tileLayer.value) map.value.removeLayer(tileLayer.value);
  if (gridLayer.value) map.value.removeLayer(gridLayer.value);

  const style = mapStyles.find((s) => s.name === selectedStyle.value)?.style;
  if (!style) return;

  tileLayer.value = L.tileLayer(style.url, style.options);
  tileLayer.value.addTo(map.value);

  if (style.css) {
    const styleElement = document.createElement('style');
    styleElement.textContent = style.css;
    document.head.appendChild(styleElement);
  }

  map.value.getContainer().classList.toggle('vintage-map', selectedStyle.value === 'vintage');

  if (showGrid.value) {
    gridLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: 0.1,
      className: 'grid-overlay',
    });
    gridLayer.value.addTo(map.value);
  }

  updatePOIs();
}

function handleMapMove() {
  if (!map.value) return;
  if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
  mapMoveTimeout = window.setTimeout(() => updatePOIs(), 500);
}

function handleGetDirections(poi) {
  // TODO: Implement directions functionality
  console.log('Getting directions to:', poi.title);
}

function handleSaveToTrip(poi) {
  // TODO: Implement save to trip functionality
  console.log('Saving to trip:', poi.title);
}

function handleMarkerSelect(poi) {
  selectedMarker.value = poi;
  panelRef.value?.setCurrentState(1); // <== CALL CHILD METHOD
}

function handlePanelClose() {
  selectedMarker.value = null;
}

watch(
  () => poisStore.visiblePois,
  (pois) => {
    poiMarkers.value.forEach((m) => m.remove());
    poiMarkers.value = [];

    pois.forEach((poi) => {
      const icon = poiIcons[poi.poi_type];
      if (icon) {
        const marker = L.marker([poi.latitude, poi.longitude], { icon });
        marker.on('click', () => {
          handleMarkerSelect(poi);
        });
        marker.addTo(map.value);
        poiMarkers.value.push(marker);
      }
    });
  },
);

onMounted(() => {
  if (!mapRef.value) return;

  map.value = L.map(mapRef.value).setView([50.0755, 14.4378], 13);
  updateMapStyle();
  map.value.on('moveend', handleMapMove);
  map.value.on('zoomend', handleMapMove);
  updatePOIs();
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    poiMarkers.value.forEach((m) => m.remove());
  }
  if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
});
</script>

<style lang="scss" scoped>
.map-wrapper {
  position: relative;
  height: 100vh;
  width: 100vw;
  overflow: hidden;
}

.map-container {
  height: 100%;
  width: 100%;
}

.control-group {
  position: absolute;
  top: 12px;
  right: 12px;
  background: white;
  padding: 6px 10px;
  border-radius: 6px;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  z-index: 1000;
}

.control-group select {
  border: none;
  background: transparent;
  font-size: 14px;
}

// POI Panel Styles
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
