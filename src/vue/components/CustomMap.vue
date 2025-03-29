<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>

    <!-- Add location control button -->
    <div class="location-control">
      <q-btn round flat :color="locationStore.isWatching ? 'primary' : 'grey'" icon="my_location" @click="handleLocationClick">
        <q-tooltip>Center on my location</q-tooltip>
      </q-btn>
    </div>

    <PoisPanel
      v-if="selectedMarker"
      ref="poisPanelRef"
      :poi="selectedMarker"
      @close="handlePanelClose"
      @get-directions="handleGetDirections"
      @save-to-trip="handleSaveToTrip"
      @center-map="handleCenterMap"
    />
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import { QBtn, QTooltip } from 'quasar';
import { usePoisStore } from '../../stores/pois.store';
import { useLocationStore } from '../../stores/location';
import PoisPanel from './Panels/PoisPanel.vue';
import '../../css/custom/main.scss';

const mapRef = ref(null);
const map = ref(null);
const poisPanelRef = ref(null);
const tileLayer = ref(null);
const gridLayer = ref(null);
const poiMarkers = ref([]);
const userMarker = ref(null);
const selectedMarker = ref(null);
const showGrid = ref(false);
let mapMoveTimeout = null;
const routeLayer = ref(null);

const poisStore = usePoisStore();
const locationStore = useLocationStore();

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

// Update user location icon with a more detailed design
const userLocationIcon = L.divIcon({
  className: 'user-location-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  html: `
    <div class="user-location-dot"></div>
    <div class="user-location-pulse"></div>
  `,
});

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

  // Use CARTO Voyager style which maintains colors but has a cleaner look
  tileLayer.value = L.tileLayer('https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
  });
  tileLayer.value.addTo(map.value);

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

function handleGetDirections(routeData) {
  if (!map.value) return;

  // Remove existing route if any
  if (routeLayer.value) {
    map.value.removeLayer(routeLayer.value);
  }

  // Create a polyline for the route
  routeLayer.value = L.polyline(
    [
      [routeData.start.lat, routeData.start.lng],
      [routeData.end.lat, routeData.end.lng],
    ],
    {
      color: '#4285f4',
      weight: 4,
      opacity: 0.8,
      dashArray: '10, 10',
    },
  );

  // Add the route to the map
  routeLayer.value.addTo(map.value);

  // Fit the map to show the entire route
  map.value.fitBounds(routeLayer.value.getBounds(), {
    padding: [50, 50],
  });
}

function handleSaveToTrip(poi) {
  // TODO: Implement save to trip functionality
  console.log('Saving to trip:', poi.title);
}

function handleMarkerSelect(poi) {
  console.log('Selected POI:', poi);
  console.log('Markdown content:', poi.markdown_content);
  selectedMarker.value = poi;
  // Set panel state after a short delay to ensure data is ready
  setTimeout(() => {
    poisPanelRef.value?.setCurrentState(1);
  }, 50);
}

function handlePanelClose() {
  // First set the state to 0
  poisPanelRef.value?.setCurrentState(0);
  // Then clear the selected marker after animation
  setTimeout(() => {
    selectedMarker.value = null;
  }, 300);
}

function centerOnUser() {
  if (!map.value || !locationStore.coordinates) return;

  const { lat, lng } = locationStore.coordinates;
  map.value.setView([lat, lng], map.value.getZoom(), {
    animate: true,
    duration: 0.5,
  });
}

function centerOnRoute({ lat, lng }) {
  if (!map.value) return;

  // Add a larger vertical offset to move the center point higher up
  const offsetLat = lat - 0.022; // Approximately 5km up

  // Set the map view with the adjusted center
  map.value.setView([offsetLat, lng], map.value.getZoom(), {
    animate: true,
    duration: 0.5,
  });
}

async function handleLocationClick() {
  if (!locationStore.isWatching) {
    // Start continuous updates
    locationStore.startWatchingPosition({
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 30000, // Update every 30 seconds
    });
  } else {
    // Stop continuous updates
    locationStore.stopWatchingPosition();
  }

  // Center map on user location
  if (locationStore.coordinates) {
    centerOnUser();
  } else {
    try {
      await locationStore.getCurrentPosition();
      if (locationStore.coordinates) {
        centerOnUser();
      }
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
  }
}

function updateUserLocation() {
  if (!map.value || !locationStore.coordinates) return;

  const { lat, lng } = locationStore.coordinates;

  // Remove existing user marker if it exists
  if (userMarker.value) {
    userMarker.value.remove();
  }

  // Add new user marker
  userMarker.value = L.marker([lat, lng], { icon: userLocationIcon });
  userMarker.value.addTo(map.value);
}

function handleCenterMap(routeData) {
  centerOnRoute(routeData);
}

watch(
  () => poisStore.visiblePois,
  (pois) => {
    poiMarkers.value.forEach((m) => m.remove());
    poiMarkers.value = [];

    pois.forEach((poi) => {
      let icon;

      if (poi.icon_url) {
        // Use custom icon from API if available
        icon = L.divIcon({
          className: 'poi-icon custom-icon',
          iconSize: [36, 36],
          iconAnchor: [18, 18],
          html: `<img src="${poi.icon_url}" alt="${poi.title}" style="width: 150%; height: 150%; object-fit: contain;">`,
        });
      } else {
        // Fallback to default icon based on poi_type
        icon = poiIcons[poi.poi_type];
      }

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

// Modify the onMounted function
onMounted(async () => {
  if (!mapRef.value) return;

  // Initialize map with default center
  map.value = L.map(mapRef.value).setView([50.0755, 14.4378], 13);
  updateMapStyle();
  map.value.on('moveend', handleMapMove);
  map.value.on('zoomend', handleMapMove);
  updatePOIs();

  // Get user location and center map
  try {
    await locationStore.getCurrentPosition();
    if (locationStore.coordinates) {
      const { lat, lng } = locationStore.coordinates;
      map.value.setView([lat, lng], 13);
      updateUserLocation();
    }
  } catch (error) {
    console.error('Failed to get user location:', error);
  }
});

// Add watch for location changes
watch(
  () => locationStore.coordinates,
  () => {
    updateUserLocation();
  },
);

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

.location-control {
  position: fixed;
  bottom: 20px;
  right: 20px;
  z-index: 1000;
  background: white;
  border-radius: 50%;
  box-shadow: 0 2px 6px rgba(0, 0, 0, 0.2);
  padding: 4px;
}

:deep(.user-location-icon) {
  .user-location-dot {
    width: 12px;
    height: 12px;
    background-color: #4285f4;
    border: 2px solid white;
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    box-shadow: 0 0 0 2px #4285f4;
  }

  .user-location-pulse {
    width: 32px;
    height: 32px;
    background-color: rgba(66, 133, 244, 0.2);
    border-radius: 50%;
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    animation: pulse 2s infinite;
  }
}

@keyframes pulse {
  0% {
    transform: translate(-50%, -50%) scale(0.5);
    opacity: 0.8;
  }
  100% {
    transform: translate(-50%, -50%) scale(1.5);
    opacity: 0;
  }
}

:deep(.leaflet-polyline) {
  stroke-linecap: round;
  stroke-linejoin: round;
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

  .poi-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
  }
}

// .poi-secondary {
//   width: 100%;

//   .poi-details {
//     display: flex;
//     flex-direction: column;
//     gap: 12px;
//     margin-bottom: 16px;

//     .detail-item {
//       display: flex;
//       align-items: center;
//       gap: 8px;
//       color: #666;

//       .q-icon {
//         font-size: 20px;
//       }
//     }
//   }

//   .poi-actions {
//     display: flex;
//     gap: 8px;
//     justify-content: center;
//   }
// }
</style>
