import { ref, onUnmounted } from 'vue';

export function useLocation() {
  const location = ref(null);
  const error = ref(null);
  const isLoading = ref(false);
  let watchId = null;

  const getCurrentPosition = () =>
    new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation is not supported by your browser'));
        return;
      }

      isLoading.value = true;
      error.value = null;

      navigator.geolocation.getCurrentPosition(
        (position) => {
          location.value = {
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            accuracy: position.coords.accuracy,
            timestamp: position.timestamp,
          };
          isLoading.value = false;
          resolve(location.value);
        },
        (err) => {
          error.value = err.message;
          isLoading.value = false;
          reject(err);
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        },
      );
    });

  const startWatchingPosition = (options = {}) => {
    if (!navigator.geolocation) {
      error.value = 'Geolocation is not supported by your browser';
      return;
    }

    const defaultOptions = {
      enableHighAccuracy: true,
      timeout: 5000,
      maximumAge: 0,
    };

    watchId = navigator.geolocation.watchPosition(
      (position) => {
        location.value = {
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          accuracy: position.coords.accuracy,
          timestamp: position.timestamp,
        };
      },
      (err) => {
        error.value = err.message;
      },
      { ...defaultOptions, ...options },
    );
  };

  const stopWatchingPosition = () => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
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
