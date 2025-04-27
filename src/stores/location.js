import { defineStore } from 'pinia';
import { ref, computed } from 'vue';
import { Platform } from 'quasar'; // ✅ Use Quasar to detect if running on Capacitor

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

      let positionData;

      if (Platform.is.capacitor) {
        const { Geolocation } = await import('@capacitor/geolocation'); // ✅ Dynamic import
        positionData = await Geolocation.getCurrentPosition();
      } else {
        // ✅ Web browser geolocation
        positionData = await new Promise((resolve, reject) => {
          navigator.geolocation.getCurrentPosition(resolve, reject);
        });
      }

      position.value = positionData;
      return positionData;
    } catch (err) {
      error.value = err.message || 'Unknown error';
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
