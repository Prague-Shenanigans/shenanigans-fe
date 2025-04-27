<template>
  <div class="map-wrapper">
    <div ref="mapContainer" class="map-container"></div>

    <div class="location-control">
      <q-btn round flat color="grey" icon="my_location" @click="centerOnUser">
        <q-tooltip>Get my location</q-tooltip>
      </q-btn>
    </div>

    <PoisPanel
      v-if="selectedPoi"
      ref="poisPanelRef"
      :poi="selectedPoi"
      @close="handlePanelClose"
      @get-directions="handleGetDirections"
      @save-to-trip="handleSaveToTrip"
      @center-map="handleCenterMap"
    />
  </div>
</template>

<script setup lang="ts">
// @ts-nocheck

// ===================== IMPORTS =====================
import { ref, onMounted, onUnmounted, watch } from 'vue';
import mapboxgl from 'mapbox-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { QBtn, QTooltip } from 'quasar';
import { usePoisStore } from '../../stores/pois.store';
import { useLocationStore } from '../../stores/location';
import PoisPanel from './Panels/PoisPanel.vue';

// ===================== VARIABLES =====================
const mapContainer = ref(null);
const mapInstance = ref(null);
const userMarker = ref(null);
const poisPanelRef = ref(null);
const poiMarkers = ref([]);
const selectedPoi = ref(null);
const routeLayerId = 'route-layer';

const poisStore = usePoisStore();
const locationStore = useLocationStore();

const { VITE_MAPBOX_TOKEN } = import.meta.env;

mapboxgl.accessToken = VITE_MAPBOX_TOKEN;

// ===================== METHODS =====================
function centerOnUser() {
  if (!navigator.geolocation || !mapInstance.value) return;

  navigator.geolocation.getCurrentPosition(
    (position) => {
      const lng = position.coords.longitude;
      const lat = position.coords.latitude;

      mapInstance.value.flyTo({ center: [lng, lat], zoom: 14 });

      if (userMarker.value) {
        userMarker.value.setLngLat([lng, lat]);
      } else {
        userMarker.value = new mapboxgl.Marker({ color: '#4285f4' })
          .setLngLat([lng, lat])
          .addTo(mapInstance.value);
      }
    },
    (error) => {
      console.error('Error getting user location:', error);
    },
  );
}

const loadPoisForCurrentView = () => {
  if (!mapInstance.value) return;

  const bounds = mapInstance.value.getBounds();
  const zoom = mapInstance.value.getZoom();

  poisStore.loadPois(
    {
      getNorth: () => bounds.getNorth(),
      getSouth: () => bounds.getSouth(),
      getEast: () => bounds.getEast(),
      getWest: () => bounds.getWest(),
      getCenter: () => ({
        lat: bounds.getCenter().lat,
        lng: bounds.getCenter().lng,
      }),
    },
    zoom,
  );
};

function handleMarkerSelect(poi) {
  selectedPoi.value = poi;
  setTimeout(() => {
    poisPanelRef.value?.setCurrentState(1);
  }, 50);
}

function addPOIMarkers() {
  poiMarkers.value.forEach((marker) => marker.remove());
  poiMarkers.value = [];

  poisStore.visiblePois.forEach((poi) => {
    const el = document.createElement('div');
    el.className = 'poi-marker';

    if (poi.icon_url) {
      el.style.backgroundImage = `url('${poi.icon_url}')`;
      el.style.backgroundSize = 'contain';
      el.style.backgroundRepeat = 'no-repeat';
      el.style.width = '50px';
      el.style.height = '50px';
    } else {
      el.style.backgroundColor = '#4285f4';
      el.style.borderRadius = '50%';
      el.style.width = '36px';
      el.style.height = '36px';
    }

    if (mapInstance.value) {
      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([poi.longitude, poi.latitude])
        .addTo(mapInstance.value);

      marker.getElement().addEventListener('click', () => {
        handleMarkerSelect(poi);
      });

      poiMarkers.value.push(marker);
    }
  });
}

function handlePanelClose() {
  poisPanelRef.value?.setCurrentState(0);
  setTimeout(() => {
    selectedPoi.value = null;
  }, 300);
}

function handleSaveToTrip(poi) {
  console.log('Saving to trip:', poi.title);
}

function handleGetDirections(routeData) {
  if (!mapInstance.value || !routeData.coordinates) return;

  if (mapInstance.value.getSource(routeLayerId)) {
    mapInstance.value.removeLayer(routeLayerId);
    mapInstance.value.removeSource(routeLayerId);
  }

  const geojson = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'LineString',
      coordinates: routeData.coordinates.map((coord) => [coord.lng, coord.lat]),
    },
  };

  mapInstance.value.addSource(routeLayerId, {
    type: 'geojson',
    data: geojson,
  });

  mapInstance.value.addLayer({
    id: routeLayerId,
    type: 'line',
    source: routeLayerId,
    layout: {
      'line-cap': 'round',
      'line-join': 'round',
    },
    paint: {
      'line-color': '#4285f4',
      'line-width': 4,
      'line-dasharray': [2, 4],
    },
  });

  if (routeData.bounds) {
    mapInstance.value.fitBounds(
      [
        [routeData.bounds._southWest.lng, routeData.bounds._southWest.lat],
        [routeData.bounds._northEast.lng, routeData.bounds._northEast.lat],
      ],
      { padding: 50 },
    );
  }
}

function handleCenterMap(routeData) {
  if (!mapInstance.value) return;

  mapInstance.value.flyTo({
    center: [routeData.lng, routeData.lat],
    zoom: 14,
  });
}

// ===================== WATCHERS =====================
watch(() => poisStore.visiblePois, addPOIMarkers);

// ===================== LIFECYCLE =====================
onMounted(() => {
  if (!mapContainer.value) return;

  mapInstance.value = new mapboxgl.Map({
    container: mapContainer.value,
    style: 'mapbox://styles/pavelios/cm98f1xwb00gn01pga6fd3plv?optimize=true',
    center: [14.4378, 50.0755],
    zoom: 13,
    pitch: 60,
    bearing: -17.6,
  });

  mapInstance.value.addControl(new mapboxgl.NavigationControl(), 'top-right');

  mapInstance.value.on('load', () => {
    loadPoisForCurrentView();
    mapInstance.value.on('moveend', loadPoisForCurrentView);
    mapInstance.value.on('zoomend', loadPoisForCurrentView);
  });
});

onUnmounted(() => {
  if (mapInstance.value) {
    mapInstance.value.off('moveend', loadPoisForCurrentView);
    mapInstance.value.off('zoomend', loadPoisForCurrentView);
    mapInstance.value.remove();
  }
  poiMarkers.value.forEach((marker) => marker.remove());
});
</script>

<style scoped lang="scss">
.map-wrapper {
  position: relative;
  width: 100vw;
  height: 100vh;
}

.map-container {
  width: 100%;
  height: 100%;
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

.poi-marker {
  cursor: pointer;
  background-color: #4285f4;
  border-radius: 50%;
}
</style>
