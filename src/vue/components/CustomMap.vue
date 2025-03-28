<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>

    <!-- Style Selector -->
    <div class="control-group">
      <select v-model="selectedStyle" @change="updateMapStyle">
        <option v-for="style in mapStyles" :key="style.name" :value="style.name">
          {{ style.label }}
        </option>
      </select>
    </div>

    <!-- Custom Info Panel -->
    <div v-if="selectedMarker" class="info-panel">
      <h3>{{ selectedMarker.title }}</h3>
      <p>{{ selectedMarker.description }}</p>
      <button @click="selectedMarker = null">Close</button>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import { usePoisStore } from '../../stores/pois.store';
import '../../css/custom/main.scss';

// Map Styles
const mapStyles = [
  {
    name: 'vintage',
    label: 'Vintage Map',
    style: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '© OpenStreetMap contributors',
      },
      css: `
        .vintage-map {
          filter: sepia(30%) contrast(110%) brightness(95%);
        }
        .vintage-map .leaflet-tile {
          filter: sepia(30%) contrast(110%) brightness(95%);
        }
        .vintage-map .leaflet-tile[src*='water'] {
          filter: sepia(30%) contrast(110%) brightness(95%) hue-rotate(180deg) saturate(150%);
        }
        .vintage-map .leaflet-tile[src*='park'],
        .vintage-map .leaflet-tile[src*='forest'],
        .vintage-map .leaflet-tile[src*='nature_reserve'] {
          filter: sepia(30%) contrast(110%) brightness(95%) hue-rotate(90deg) saturate(120%);
        }
        .vintage-map .leaflet-tile[src*='highway'],
        .vintage-map .leaflet-tile[src*='road'] {
          filter: sepia(30%) contrast(120%) brightness(90%);
        }
        .vintage-map .leaflet-tile[src*='building'] {
          filter: sepia(30%) contrast(110%) brightness(85%);
        }
      `,
    },
  },
  {
    name: 'default',
    label: 'Default Map',
    style: {
      url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
      options: {
        attribution: '© OpenStreetMap contributors',
      },
    },
  },
];

// Map State
const mapRef = ref(null);
const map = ref(null);
const tileLayer = ref(null);
const gridLayer = ref(null);
const markers = ref([]);
const poiMarkers = ref([]);
const selectedMarker = ref(null);
const selectedStyle = ref('vintage');
const showGrid = ref(false);
let mapMoveTimeout = null;

// Initialize POI Store
const poisStore = usePoisStore();

// POI Icons
const poiIcons = {
  landmark: L.divIcon({
    className: 'poi-icon landmark',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  bridge: L.divIcon({
    className: 'poi-icon bridge',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  underground_club: L.divIcon({
    className: 'poi-icon underground_club',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  museum: L.divIcon({
    className: 'poi-icon museum',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  park: L.divIcon({
    className: 'poi-icon park',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  restaurant: L.divIcon({
    className: 'poi-icon restaurant',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  cafe: L.divIcon({
    className: 'poi-icon cafe',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  bar: L.divIcon({
    className: 'poi-icon bar',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  monument: L.divIcon({
    className: 'poi-icon monument',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  square: L.divIcon({
    className: 'poi-icon square',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  concert_hall: L.divIcon({
    className: 'poi-icon concert_hall',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
  pub: L.divIcon({
    className: 'poi-icon pub',
    iconSize: [36, 36],
    iconAnchor: [18, 18],
  }),
};

// Methods
function updatePOIs() {
  if (!map.value) return;

  const bounds = map.value.getBounds();
  const zoom = map.value.getZoom();
  poisStore.loadPois(bounds, zoom);
}

function updateMapStyle() {
  if (!map.value) return;

  // Remove existing layers
  if (tileLayer.value) map.value.removeLayer(tileLayer.value);
  if (gridLayer.value) map.value.removeLayer(gridLayer.value);

  // Get selected style
  const style = mapStyles.find((s) => s.name === selectedStyle.value)?.style;
  if (!style) return;

  // Add base tile layer
  tileLayer.value = L.tileLayer(style.url, style.options);
  tileLayer.value.addTo(map.value);

  // Add custom CSS if provided
  if (style.css) {
    const styleElement = document.createElement('style');
    styleElement.textContent = style.css;
    document.head.appendChild(styleElement);
  }

  // Add vintage class to map container if vintage style is selected
  if (selectedStyle.value === 'vintage') {
    map.value.getContainer().classList.add('vintage-map');
  } else {
    map.value.getContainer().classList.remove('vintage-map');
  }

  // Add grid if enabled
  if (showGrid.value) {
    gridLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: 0.1,
      className: 'grid-overlay',
    });
    gridLayer.value.addTo(map.value);
  }

  // Update POIs
  updatePOIs();
}

// Update the watch function for visible POIs
watch(
  () => poisStore.visiblePois,
  (newPois) => {
    // Clear existing POI markers
    poiMarkers.value.forEach((marker) => marker.remove());
    poiMarkers.value = [];

    // Add new markers
    newPois.forEach((poi) => {
      const icon = poiIcons[poi.poi_type];
      if (icon) {
        const marker = L.marker([poi.latitude, poi.longitude], { icon })
          .bindPopup(
            `
            <div class="vintage-popup">
              <h3>${poi.title}</h3>
              <p>${poi.description}</p>
              <div class="poi-tags">
                ${poi.tags.map((tag) => `<span class="tag">${tag}</span>`).join(' ')}
              </div>
            </div>
          `,
          )
          .addTo(map.value);
        poiMarkers.value.push(marker);
      }
    });
  },
);

// Watch for map movement with debounce
function handleMapMove() {
  if (!map.value) return;

  // Debounce the API call
  if (mapMoveTimeout) {
    clearTimeout(mapMoveTimeout);
  }

  mapMoveTimeout = window.setTimeout(() => {
    updatePOIs();
  }, 500);
}

// Lifecycle Hooks
onMounted(() => {
  if (mapRef.value) {
    map.value = L.map(mapRef.value).setView([50.0755, 14.4378], 13);
    updateMapStyle();

    // Add event listeners for POI updates
    map.value.on('moveend', handleMapMove);
    map.value.on('zoomend', handleMapMove);

    // Initial load of POIs
    updatePOIs();
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    poiMarkers.value.forEach((marker) => marker.remove());
  }
  if (mapMoveTimeout) {
    clearTimeout(mapMoveTimeout);
  }
});
</script>

<style scoped>
/* All styles have been moved to SCSS files */
</style>
