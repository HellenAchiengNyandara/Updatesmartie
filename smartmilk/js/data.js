// Data Service
window.dataService = {
  cows: [],
  farm: null,
  
  // Load cows data
  loadCows: function() {
    return fetch('../data/cows.json')  
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load cows data');
        }
        return response.json();
      })
      .then(data => {
        this.cows = data;
        return data;
      })
      .catch(error => {
        console.error('Error loading cows data:', error);
        return [];
      });
  },
  
  // Load farm data
  loadFarm: function() {
    return fetch('../data/farm.json')  
      .then(response => {
        if (!response.ok) {
          throw new Error('Failed to load farm data');
        }
        return response.json();
      })
      .then(data => {
        this.farm = data;
        return data;
      })
      .catch(error => {
        console.error('Error loading farm data:', error);
        return null;
      });
  },
  
  // Get cow by ID
  getCow: function(id) {
    return this.cows.find(cow => cow.id === id);
  },
  
  // Get all alerts
  getAlerts: function() {
    if (!this.farm || !this.farm.alerts) return [];
    return this.farm.alerts.map(alert => {
      const cow = this.getCow(alert.cowId);
      return {
        ...alert,
        cowName: cow ? cow.name : 'Unknown',
        cowPhoto: cow ? cow.photo : ''
      };
    });
  },
  
  // Get farm stats
  getFarmStats: function() {
    if (!this.farm) return null;
    return {
      ...this.farm,
      alerts: this.getAlerts()
    };
  },
  
  // Get recommendations
  getRecommendations: function() {
    const alerts = this.getAlerts();
    return utils.generateRecommendations(alerts);
  }
};