<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>

    <!-- Custom Controls -->
    <div class="map-controls">
      <!-- Style Selector -->
      <div class="control-group">
        <select v-model="selectedStyle" @change="updateMapStyle">
          <option v-for="style in mapStyles" :key="style.name" :value="style.name">
            {{ style.label }}
          </option>
        </select>
      </div>

      <!-- Custom Overlay Controls -->
      <div class="control-group">
        <label> <input v-model="showPaperTexture" type="checkbox" /> Paper Texture </label>
        <label> <input v-model="showGrid" type="checkbox" /> Grid Overlay </label>
      </div>

      <!-- POI Controls -->
      <div class="control-group">
        <label> <input v-model="showPOIs" type="checkbox" @change="handlePOIToggle" /> Show POIs </label>
        <select v-if="showPOIs" v-model="selectedPOICategory" @change="updatePOIs">
          <option value="all">All Categories</option>
          <option v-for="category in poiCategories" :key="category" :value="category">
            {{ category }}
          </option>
        </select>
        <div v-if="poisStore.loading" class="loading-indicator">Loading POIs...</div>
      </div>

      <!-- Custom Marker Controls -->
      <div class="control-group">
        <button @click="addCustomMarker">Add Vintage Marker</button>
        <button @click="clearMarkers">Clear Markers</button>
      </div>
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
const overlayLayer = ref(null);
const gridLayer = ref(null);
const markers = ref([]);
const poiMarkers = ref([]);
const selectedMarker = ref(null);
const selectedStyle = ref('vintage');
const showPaperTexture = ref(true);
const showGrid = ref(false);
const showPOIs = ref(false);
const selectedPOICategory = ref('all');
let mapMoveTimeout = null;

// Initialize POI Store
const poisStore = usePoisStore();

// Custom Vintage Icon
const vintageIcon = L.divIcon({
  className: 'vintage-marker',
  html: '<div class="vintage-marker-inner"></div>',
  iconSize: [30, 30],
  iconAnchor: [15, 15],
});

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
  if (!map.value || !showPOIs.value) return;

  const bounds = map.value.getBounds();
  const zoom = map.value.getZoom();
  poisStore.loadPois(bounds, zoom);
}

function handlePOIToggle(newValue) {
  if (newValue) {
    updatePOIs();
  } else {
    poiMarkers.value.forEach((marker) => marker.remove());
    poiMarkers.value = [];
  }
}

function updateMapStyle() {
  if (!map.value) return;

  // Remove existing layers
  if (tileLayer.value) map.value.removeLayer(tileLayer.value);
  if (overlayLayer.value) map.value.removeLayer(overlayLayer.value);
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

  // Add overlay if enabled
  if (showPaperTexture.value) {
    overlayLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: 0.03,
      className: 'paper-texture',
    });
    overlayLayer.value.addTo(map.value);
  }

  // Add grid if enabled
  if (showGrid.value) {
    gridLayer.value = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      opacity: 0.1,
      className: 'grid-overlay',
    });
    gridLayer.value.addTo(map.value);
  }

  // Update POIs if enabled
  if (showPOIs.value) {
    updatePOIs();
  }
}

function addCustomMarker() {
  if (!map.value) return;

  const center = map.value.getCenter();
  const marker = L.marker([center.lat, center.lng], { icon: vintageIcon }).bindPopup('Vintage Location').addTo(map.value);

  markers.value.push(marker);
}

function clearMarkers() {
  markers.value.forEach((marker) => marker.remove());
  markers.value = [];
}

// Update the watch function for visible POIs
watch(
  () => poisStore.visiblePois,
  (newPois) => {
    console.log('Visible POIs:', newPois);
    // Clear existing POI markers
    poiMarkers.value.forEach((marker) => marker.remove());
    poiMarkers.value = [];

    // Filter POIs based on selected category
    const filteredPOIs = selectedPOICategory.value === 'all' ? newPois : newPois.filter((poi) => poi.poi_type === selectedPOICategory.value);
    console.log('Filtered POIs:', filteredPOIs);

    // Add new markers
    filteredPOIs.forEach((poi) => {
      console.log('Adding marker for POI:', poi.title, 'type:', poi.poi_type);
      const icon = poiIcons[poi.poi_type] || vintageIcon;
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
    });
  },
);

// Watch for map movement with debounce
function handleMapMove() {
  if (!map.value || !showPOIs.value) return;

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

    // Initial load if POIs are enabled
    if (showPOIs.value) {
      updatePOIs();
    }
  }
});

onUnmounted(() => {
  if (map.value) {
    map.value.remove();
    clearMarkers();
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
