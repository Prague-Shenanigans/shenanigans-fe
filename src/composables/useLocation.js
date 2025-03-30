import { ref, onUnmounted } from 'vue';
import { Geolocation } from '@capacitor/geolocation';

export function useLocation() {
  const location = ref(null);
  const error = ref(null);
  const isLoading = ref(false);
  let watchId = null;

  const getCurrentPosition = async () => {
    try {
      isLoading.value = true;
      error.value = null;
      const position = await Geolocation.getCurrentPosition();
      location.value = {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
        accuracy: position.coords.accuracy,
        timestamp: position.timestamp,
      };
    } catch (err) {
      error.value = err.message;
    } finally {
      isLoading.value = false;
    }
  };

  const startWatchingPosition = async (options = {}) => {
    try {
      error.value = null;
      watchId = await Geolocation.watchPosition(options, (position, err) => {
        if (err) {
          error.value = err.message;
          return;
        }
        location.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
      });
    } catch (err) {
      error.value = err.message;
    }
  };

  const stopWatchingPosition = async () => {
    if (watchId !== null) {
      await Geolocation.clearWatch({ id: watchId });
      watchId = null;
    }
  };

  onUnmounted(() => {
    stopWatchingPosition();
  });

  return {
    location,
    error,
    isLoading,
    getCurrentPosition,
    startWatchingPosition,
    stopWatchingPosition,
  };
}
