import { defineStore } from 'pinia';
import { watch } from 'vue';
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
      const { location, getCurrentPosition } = useLocation();

      try {
        this.isLoading = true;
        this.error = null;
        await getCurrentPosition();
        this.location = location.value;
      } catch (err) {
        this.error = err.message;
      } finally {
        this.isLoading = false;
      }
    },

    startWatchingPosition(options = {}) {
      const { location, startWatchingPosition } = useLocation();

      this.isWatching = true;
      this.error = null;

      startWatchingPosition(options);

      // Watch for changes in the location ref
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
