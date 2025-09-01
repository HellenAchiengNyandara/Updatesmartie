// Frontend configuration
const CONFIG = {
  // API URL will be set based on environment
  API_URL: window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1'
    ? 'http://localhost:5000/api'
    : 'https://updatesmartie-production.up.railway.app/api' // Production backend URL
};

// Make config available globally
window.CONFIG = CONFIG;
