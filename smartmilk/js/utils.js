// Formatting Utilities
function formatPercentage(value) {
  return value ? value.toFixed(1) + '%' : 'N/A';
}

function formatMilkVolume(value) {
  return value ? value.toFixed(1) + ' L' : 'N/A';
}

function formatDate(dateStr) {
  if (!dateStr) return 'N/A';
  const date = new Date(dateStr);
  return date.toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function timeSince(dateStr) {
  const date = new Date(dateStr);
  const seconds = Math.floor((new Date() - date) / 1000);
  
  let interval = Math.floor(seconds / 31536000);
  if (interval >= 1) return interval + "y ago";
  
  interval = Math.floor(seconds / 2592000);
  if (interval >= 1) return interval + "m ago";
  
  interval = Math.floor(seconds / 86400);
  if (interval >= 1) return interval + "d ago";
  
  interval = Math.floor(seconds / 3600);
  if (interval >= 1) return interval + "h ago";
  
  interval = Math.floor(seconds / 60);
  if (interval >= 1) return interval + "m ago";
  
  return Math.floor(seconds) + "s ago";
}

// DOM Utilities
function createElement(tag, classes, text) {
  const el = document.createElement(tag);
  if (classes) el.className = classes;
  if (text) el.textContent = text;
  return el;
}

function showScreen(screenId) {
  document.querySelectorAll('.screen').forEach(screen => {
    screen.classList.remove('active');
  });
  document.getElementById(screenId).classList.add('active');
}

// Data Analysis Utilities
function calculateFarmStats(cows) {
  if (!cows || cows.length === 0) return null;
  
  const totalCows = cows.length;
  let totalFat = 0;
  let totalProtein = 0;
  let totalMilk = 0;
  let alerts = [];
  
  cows.forEach(cow => {
    totalFat += cow.fatPercent || 0;
    totalProtein += cow.proteinPercent || 0;
    totalMilk += cow.milkVolume || 0;
    
    // Generate alerts
    if (cow.fatPercent > 4.0) {
      alerts.push({
        cowId: cow.id,
        name: cow.name,
        message: 'High fat content',
        type: 'warning',
        date: new Date().toISOString()
      });
    }
    
    if (cow.proteinPercent < 3.0) {
      alerts.push({
        cowId: cow.id,
        name: cow.name,
        message: 'Low protein content',
        type: 'danger',
        date: new Date().toISOString()
      });
    }
    
    if (cow.milkVolume < 10) {
      alerts.push({
        cowId: cow.id,
        name: cow.name,
        message: 'Low milk production',
        type: 'warning',
        date: new Date().toISOString()
      });
    }
  });
  
  return {
    totalCows,
    averageFat: totalFat / totalCows,
    averageProtein: totalProtein / totalCows,
    totalMilk,
    alerts,
    lastUpdated: new Date().toISOString()
  };
}

// Add this to the generateRecommendations function
function generateRecommendations(alerts) {
  const recommendations = [];
  
  // Group alerts by cow
  const alertsByCow = {};
  alerts.forEach(alert => {
    if (!alertsByCow[alert.cowId]) {
      alertsByCow[alert.cowId] = [];
    }
    alertsByCow[alert.cowId].push(alert);
  });

  // Generate comprehensive recommendations for each cow
  for (const cowId in alertsByCow) {
    const cowAlerts = alertsByCow[cowId];
    const cow = dataService.getCow(cowId);
    const cowName = cow ? cow.name : 'Unknown Cow';
    
    let recommendationMessage = `For ${cowName} (${cowId}), we recommend:`;
    let hasNutritionIssue = false;
    let hasHealthIssue = false;
    
    cowAlerts.forEach(alert => {
      switch(alert.message) {
        case 'High fat content':
          recommendationMessage += `\n- Reduce energy-dense feeds and increase fiber intake with more hay.`;
          hasNutritionIssue = true;
          break;
        case 'Low fat content':
          recommendationMessage += `\n- Increase energy-dense feeds like corn and barley.`;
          hasNutritionIssue = true;
          break;
        case 'Low protein content':
          recommendationMessage += `\n- Add protein supplements like soybean meal or canola meal.`;
          hasNutritionIssue = true;
          break;
        case 'Low lactose content':
          recommendationMessage += `\n- Increase grain feeding slightly to boost carbohydrate intake.`;
          hasNutritionIssue = true;
          break;
        case 'High pH (possible mastitis)':
          recommendationMessage += `\n- Immediate veterinary check for mastitis. Isolate the cow and check for udder inflammation.`;
          hasHealthIssue = true;
          break;
        case 'Low pH (possible acidosis)':
          recommendationMessage += `\n- Check for signs of acidosis. Provide buffers like sodium bicarbonate.`;
          hasHealthIssue = true;
          break;
        case 'Low milk production':
          recommendationMessage += `\n- Evaluate feed intake, health status, and environmental stressors.`;
          break;
      }
    });

    // Add general recommendations based on issue type
    if (hasNutritionIssue) {
      recommendationMessage += `\n- Review overall diet balance with a nutritionist.`;
    }
    if (hasHealthIssue) {
      recommendationMessage += `\n- Schedule veterinary examination as soon as possible.`;
    }

    // Add monitoring recommendation
    recommendationMessage += `\n- Monitor closely for the next 3 days and record any changes.`;

    recommendations.push({
      cowId,
      message: recommendationMessage,
      priority: hasHealthIssue ? 'High' : (hasNutritionIssue ? 'Medium' : 'Low')
    });
  }

  // Sort by priority (High first)
  recommendations.sort((a, b) => {
    const priorityOrder = { 'High': 1, 'Medium': 2, 'Low': 3 };
    return priorityOrder[a.priority] - priorityOrder[b.priority];
  });

  return recommendations;
}

// Export for browser
window.utils = {
  formatPercentage,
  formatMilkVolume,
  formatDate,
  timeSince,
  createElement,
  showScreen,
  calculateFarmStats
};

// Add this with the other formatting functions
function formatPH(value) {
  return value ? value.toFixed(1) : 'N/A';
}

// Update the exports at the bottom
window.utils = {
  formatPercentage,
  formatMilkVolume,
  formatPH,  // Added this
  formatDate,
  timeSince,
  createElement,
  showScreen,
  calculateFarmStats,
  generateRecommendations  // Added this
};