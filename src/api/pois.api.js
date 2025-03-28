import api from '../services/api-request.js';

export const usePoisApi = () => {
  // Get POIs based on map bounds and zoom level
  const getPois = async (bounds, zoom) => {
    // Calculate minimum importance based on zoom level
    // At zoom 12 or lower: only show importance 5
    // At zoom 13: show importance 5 and 4
    // At zoom 14: show importance 5, 4, and 3
    // At zoom 15: show importance 5, 4, 3, and 2
    // At zoom 16+: show all importance levels
    const minImportance = zoom <= 12 ? 5 : Math.max(1, 6 - (zoom - 12));

    const params = {
      bounds: {
        north: bounds.getNorth(),
        south: bounds.getSouth(),
        east: bounds.getEast(),
        west: bounds.getWest(),
      },
      zoom,
      min_importance: minImportance,
    };

    const response = await api.get('/api/pois/', { params });
    return response.data;
  };

  // Get a single POI by ID
  const getPoiById = async (id) => {
    const response = await api.get(`/api/pois/${id}/`);
    return response.data;
  };

  return {
    getPois,
    getPoiById,
  };
};
