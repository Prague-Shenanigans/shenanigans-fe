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
import { onMounted, ref } from 'vue';
import L from 'leaflet';
import 'leaflet-providers';
import { tileProviders } from '../../maps/tiles/tileProviders.js';

// ===================== VARIABLES =====================
const mapRef = ref(null);
const map = ref(null);
const tileLayer = ref(null);
const selectedProvider = ref(tileProviders.watercolor.name);

// ===================== METHODS =====================
function updateTileLayer() {
  if (!map.value) return;

  if (tileLayer.value) {
    map.value.removeLayer(tileLayer.value);
  }

  tileLayer.value = L.tileLayer.provider(selectedProvider.value);
  tileLayer.value.addTo(map.value);
}

// ===================== LIFECYCLE HOOKS =====================
onMounted(() => {
  if (mapRef.value) {
    map.value = L.map(mapRef.value).setView([51.505, -0.09], 13);
    updateTileLayer();
  }
});
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
