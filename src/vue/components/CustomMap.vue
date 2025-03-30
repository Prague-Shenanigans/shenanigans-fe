<template>
  <div class="map-wrapper">
    <div ref="mapRef" class="map-container"></div>

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
// ===================== IMPORTS =====================
import { ref, onMounted, onUnmounted, watch } from 'vue';
import L from 'leaflet';
import { QBtn, QTooltip } from 'quasar';
import { usePoisStore } from '../../stores/pois.store';
import { useLocationStore } from '../../stores/location';
import PoisPanel from './Panels/PoisPanel.vue';
import '../../css/custom/main.scss';

// ===================== INSTANCES =====================
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

const userLocationIcon = L.divIcon({
  className: 'user-location-icon',
  iconSize: [32, 32],
  iconAnchor: [16, 16],
  html: `
    <div class="user-location-dot"></div>
    <div class="user-location-pulse"></div>
  `,
});

// ===================== METHODS =====================
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

function centerOnRoute({ lat, lng }) {
  if (!map.value) return;
  const offsetLat = lat - 0.022;
  map.value.setView([offsetLat, lng], map.value.getZoom(), { animate: true, duration: 0.5 });
}

function centerOnUser() {
  if (!map.value || !locationStore.coordinates) return;
  const { lat, lng } = locationStore.coordinates;
  map.value.setView([lat, lng], map.value.getZoom(), { animate: true, duration: 0.5 });
}

async function handleLocationClick() {
  if (!locationStore.isWatching) {
    locationStore.startWatchingPosition({ enableHighAccuracy: true });
  } else {
    locationStore.stopWatchingPosition();
  }

  if (locationStore.coordinates) {
    centerOnUser();
  } else {
    try {
      await locationStore.getCurrentPosition();
      if (locationStore.coordinates) centerOnUser();
    } catch (error) {
      console.error('Failed to get user location:', error);
    }
  }
}

function updateUserLocation() {
  if (!map.value || !locationStore.coordinates) return;
  const { lat, lng } = locationStore.coordinates;
  if (userMarker.value) userMarker.value.remove();
  userMarker.value = L.marker([lat, lng], { icon: userLocationIcon });
  userMarker.value.addTo(map.value);
}

function handleGetDirections(routeData) {
  // unchanged, uses OSRM API
}

function handleSaveToTrip(poi) {
  console.log('Saving to trip:', poi.title);
}

function handleMarkerSelect(poi) {
  selectedMarker.value = poi;
  setTimeout(() => {
    poisPanelRef.value?.setCurrentState(1);
  }, 50);
}

function handlePanelClose() {
  poisPanelRef.value?.setCurrentState(0);
  setTimeout(() => {
    selectedMarker.value = null;
  }, 300);
}

function handleCenterMap(routeData) {
  centerOnRoute(routeData);
}

// ===================== WATCHERS =====================
watch(
  () => poisStore.visiblePois,
  (pois) => {
    poiMarkers.value.forEach((m) => m.remove());
    poiMarkers.value = [];
    pois.forEach((poi) => {
      const icon = poi.icon_url
        ? L.divIcon({
            className: 'poi-icon custom-icon',
            iconSize: [36, 36],
            iconAnchor: [18, 18],
            html: `<img src="${poi.icon_url}" style="width: 50px; height: 50px; object-fit: contain;">`,
          })
        : poiIcons[poi.poi_type];
      if (icon) {
        const marker = L.marker([poi.latitude, poi.longitude], { icon });
        marker.on('click', () => handleMarkerSelect(poi));
        marker.addTo(map.value);
        poiMarkers.value.push(marker);
      }
    });
  },
);

watch(
  () => locationStore.coordinates,
  () => {
    updateUserLocation();
  },
);

// ===================== LIFECYCLE HOOKS =====================
onMounted(async () => {
  if (!mapRef.value) return;
  map.value = L.map(mapRef.value).setView([50.0755, 14.4378], 13);
  updateMapStyle();
  map.value.on('moveend', () => {
    if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
    mapMoveTimeout = window.setTimeout(updatePOIs, 500);
  });
  map.value.on('zoomend', () => {
    if (mapMoveTimeout) clearTimeout(mapMoveTimeout);
    mapMoveTimeout = window.setTimeout(updatePOIs, 500);
  });

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

onUnmounted(() => {
  if (map.value) map.value.remove();
  poiMarkers.value.forEach((m) => m.remove());
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
</style>
