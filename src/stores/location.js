import { defineStore } from 'pinia';
import { useLocation } from '../composables/useLocation';

export const useLocationStore = defineStore('location', {
  state: () => ({
    location: null,
    error: null,
    isLoading: false,
    isWatching: false,
  }),

  getters: {
    hasLocation: (state) => !!state.location,
    coordinates: (state) =>
      state.location
        ? {
            lat: state.location.latitude,
            lng: state.location.longitude,
          }
        : null,
  },

  actions: {
    async getCurrentPosition() {
      const { location, error, isLoading, getCurrentPosition } = useLocation();

      this.isLoading = isLoading.value;
      this.error = error.value;

      try {
        await getCurrentPosition();
        this.location = location.value;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    startWatchingPosition(options = {}) {
      const { location, error, startWatchingPosition } = useLocation();

      this.isWatching = true;
      this.error = error.value;

      startWatchingPosition(options);

      watch(location, (newLocation) => {
        this.location = newLocation;
      });
    },

    stopWatchingPosition() {
      const { stopWatchingPosition } = useLocation();
      stopWatchingPosition();
      this.isWatching = false;
    },
  },
});
