import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

export const useLocationStore = defineStore('location', () => {
  const position = ref(null);
  const error = ref(null);
  const isLoading = ref(false);

  const coordinates = computed(() => {
    if (!position.value) return null;
    return {
      lat: position.value.coords.latitude,
      lng: position.value.coords.longitude,
    };
  });

  async function getCurrentPosition() {
    try {
      isLoading.value = true;
      error.value = null;
      const positionData = await Geolocation.getCurrentPosition();
      position.value = positionData;
      return positionData;
    } catch (err) {
      error.value = err.message;
      throw err;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    position,
    error,
    isLoading,
    coordinates,
    getCurrentPosition,
  };
});
