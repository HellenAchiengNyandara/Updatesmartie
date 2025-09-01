const API_URL = "http://localhost:5000/api";

window.dataService = {
  cows: [],
  farm: null,

  // Helper function for all fetch requests (no auth required)
  request: async function(path, options = {}) {
    try {
      options.headers = {
        'Content-Type': 'application/json',
        ...(options.headers || {})
      };

      const res = await fetch(`${API_URL}${path}`, options);
      if (!res.ok) {
        throw new Error(await res.text());
      }
      return await res.json();
    } catch (err) {
      console.error(`Error fetching ${path}:`, err);
      return null;
    }
  },

  // Load all cows
  loadCows: async function() {
    const data = await this.request('/cows');
    this.cows = data || [];
    return this.cows;
  },

  // Add a new cow
  addCow: async function(cow) {
    const newCow = await this.request('/cows', {
      method: 'POST',
      body: JSON.stringify(cow)
    });
    if (newCow) this.cows.push(newCow);
    return newCow;
  },

  // Edit existing cow
  editCow: async function(id, updatedCow) {
    const updated = await this.request(`/cows/${id}`, {
      method: 'PUT',
      body: JSON.stringify(updatedCow)
    });
    if (updated) {
      const index = this.cows.findIndex(cow => cow.id === updated.id);
      if (index !== -1) this.cows[index] = updated;
    }
    return updated;
  },

  // Delete a cow
  deleteCow: async function(id) {
    const deleted = await this.request(`/cows/${id}`, { method: 'DELETE' });
    if (deleted) this.cows = this.cows.filter(cow => cow.id !== id);
    return deleted;
  },

  // Get cow by ID
  getCow: function(id) {
    return this.cows.find(cow => cow.id === id) || null;
  },

  // Load farm data
  loadFarm: async function() {
    this.farm = await this.request('/farm');
    return this.farm;
  },

  // Get all alerts with cow info
  getAlerts: function() {
    if (!this.farm?.alerts) return [];
    return this.farm.alerts.map(alert => {
      const cow = this.getCow(alert.cowId);
      return {
        ...alert,
        cowName: cow?.name || 'Unknown',
        cowPhoto: cow?.photo || ''
      };
    });
  },

  // Get farm stats including alerts
  getFarmStats: function() {
    if (!this.farm) return null;
    return { ...this.farm, alerts: this.getAlerts() };
  },

  // Get recommendations
  getRecommendations: function() {
    const alerts = this.getAlerts();
    return typeof utils?.generateRecommendations === 'function'
      ? utils.generateRecommendations(alerts)
      : [];
  }
};
