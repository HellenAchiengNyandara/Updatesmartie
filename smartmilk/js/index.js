// Main Application
window.app = {
  // Initialize the app
  init: function() {
    this.setupUI();
    this.loadData();
    this.updateUserInfo();
    this.applySettings();
  },
  
  // Apply saved settings
  applySettings: function() {
    // Dark mode
    const darkMode = localStorage.getItem('darkMode') === 'true';
    document.body.classList.toggle('dark-mode', darkMode);
    
    // Notifications
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    this.toggleNotificationBadge(notificationsEnabled);
  },
  
  // Toggle notification badge visibility
  toggleNotificationBadge: function(show) {
    document.querySelectorAll('.badge').forEach(badge => {
      badge.style.display = show ? 'inline-block' : 'none';
    });
  },
  
  // Setup UI elements
  setupUI: function() {
    // Menu toggle
    document.getElementById('menu-toggle').addEventListener('click', function() {
      document.getElementById('side-menu').classList.add('active');
    });
    
    // Close menu
    document.getElementById('close-menu').addEventListener('click', function() {
      document.getElementById('side-menu').classList.remove('active');
    });
    
    // Navigation items
    document.querySelectorAll('.menu-item, .tab-item').forEach(item => {
      item.addEventListener('click', e => {
        e.preventDefault();
        const screen = item.dataset.screen;
        this.renderScreen(screen);
        
        // Update active state
        document.querySelectorAll('.menu-item, .tab-item').forEach(i => {
          i.classList.remove('active');
        });
        item.classList.add('active');
        
        // Update title
        document.getElementById('screen-title').textContent = 
          item.querySelector('span') ? item.querySelector('span').textContent : 'Dashboard';
        
        // Close menu if mobile
        if (window.innerWidth < 768) {
          document.getElementById('side-menu').classList.remove('active');
        }
      });
    });
  },
  
  // Load data
  loadData: function() {
    const loadingScreen = document.querySelector('.loading-screen');
    
    Promise.all([
      dataService.loadCows(),
      dataService.loadFarm()
    ]).then(([cows, farm]) => {
      // Sort cows by milk production (highest first)
      cows.sort((a, b) => b.milkVolume - a.milkVolume);
      
      // Calculate additional stats
      const stats = utils.calculateFarmStats(cows);
      if (stats) {
        dataService.farm = {
          ...farm,
          ...stats
        };
      }
      
      // Render initial screen
      this.renderScreen('dashboard');
      
      // Update alert count
      this.updateAlertCount();
      
      // Hide loading
      loadingScreen.style.display = 'none';
    }).catch(error => {
      console.error('Error loading data:', error);
      loadingScreen.innerHTML = `
        <div class="error-message">
          <i class="fas fa-exclamation-triangle"></i>
          <p>Failed to load data. Please check your connection.</p>
          <button class="btn btn-primary" onclick="window.location.reload()">Retry</button>
        </div>
      `;
    });
  },
  
  // Update alert count in UI
  updateAlertCount: function() {
    const alerts = dataService.getAlerts();
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    
    document.querySelectorAll('#alert-count, .badge').forEach(el => {
      el.textContent = alerts.length;
      el.style.display = alerts.length > 0 && notificationsEnabled ? 'inline-block' : 'none';
    });
  },
  
  // Update user info
  updateUserInfo: function() {
    const username = localStorage.getItem('username');
    const avatar = localStorage.getItem('avatar');
    
    if (username) {
      document.getElementById('user-menu').setAttribute('title', username);
    }
    
    if (avatar) {
      document.getElementById('user-avatar-img').src = avatar;
    }
  },
  
  // Render screens
  renderScreen: function(screen) {
    const appContent = document.getElementById('app-content');
    
    switch(screen) {
      case 'dashboard':
        this.renderDashboard(appContent);
        break;
      case 'cows':
        this.renderCows(appContent);
        break;
      case 'alerts':
        this.renderAlerts(appContent);
        break;
      case 'recommendations':
        this.renderRecommendations(appContent);
        break;
      case 'reports':
        this.renderReports(appContent);
        break;
      case 'settings':
        this.renderSettings(appContent);
        break;
      default:
        this.renderDashboard(appContent);
    }
  },
  
  // Render Dashboard with sorted cows by milk production
  renderDashboard: function(container) {
    const farm = dataService.getFarmStats();
    const cows = [...dataService.cows].sort((a, b) => b.milkVolume - a.milkVolume).slice(0, 4);
    
    if (!farm || !cows) {
      container.innerHTML = '<div class="error">No data available</div>';
      return;
    }
    
    // Stats cards
    const statsHtml = `
      <div class="stat-card">
        <div class="label">Total Cows</div>
        <div class="value">${farm.totalCows}</div>
        <div class="trend up">
          <i class="fas fa-arrow-up"></i>
          <span>2% from last week</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="label">Avg Fat</div>
        <div class="value">${utils.formatPercentage(farm.averageFat)}</div>
        <div class="trend ${farm.averageFat > 3.6 ? 'up' : 'down'}">
          <i class="fas fa-arrow-${farm.averageFat > 3.6 ? 'up' : 'down'}"></i>
          <span>${Math.abs(farm.averageFat - 3.6).toFixed(1)}%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="label">Avg Protein</div>
        <div class="value">${utils.formatPercentage(farm.averageProtein)}</div>
        <div class="trend ${farm.averageProtein > 3.2 ? 'up' : 'down'}">
          <i class="fas fa-arrow-${farm.averageProtein > 3.2 ? 'up' : 'down'}"></i>
          <span>${Math.abs(farm.averageProtein - 3.2).toFixed(1)}%</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="label">Total Milk</div>
        <div class="value">${farm.totalMilk.toFixed(1)} L</div>
        <div class="trend up">
          <i class="fas fa-arrow-up"></i>
          <span>5% from yesterday</span>
        </div>
      </div>
    `;
    
    // Alerts
    const alertsHtml = farm.alerts && farm.alerts.length > 0 ? 
      farm.alerts.slice(0, 3).map(alert => `
        <div class="alert-card ${alert.type === 'warning' ? 'warning' : 'danger'}">
          <div class="alert-icon">
            <i class="fas fa-exclamation"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title">${alert.cowId} - ${alert.message}</div>
            <div class="alert-message">Cow: ${alert.cowName || 'Unknown'}</div>
            <div class="alert-time">${utils.timeSince(alert.date)}</div>
          </div>
        </div>
      `).join('') : `
        <div class="alert-card info">
          <div class="alert-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title">No critical alerts</div>
            <div class="alert-message">All cows are within normal ranges</div>
          </div>
        </div>
      `;
    
    // Cows - sorted by milk production
    const cowsHtml = cows.map(cow => `
      <div class="cow-card">
        <img src="${cow.photo}" alt="${cow.name}" class="cow-image">
        <div class="cow-info">
          <div class="cow-name">${cow.name}</div>
          <div class="cow-id">${cow.id}</div>
          <div class="cow-stats">
            <div class="cow-stat">
              <div class="value">${utils.formatMilkVolume(cow.milkVolume)}</div>
              <div class="label">Milk</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPercentage(cow.fatPercent)}</div>
              <div class="label">Fat</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPercentage(cow.proteinPercent)}</div>
              <div class="label">Protein</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPercentage(cow.lactosePercent)}</div>
              <div class="label">Lactose</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPH(cow.pH)}</div>
              <div class="label">pH</div>
            </div>
          </div>
          ${cow.alerts && cow.alerts.length > 0 ? `
            <div class="cow-alerts">
              <i class="fas fa-exclamation-triangle"></i>
              ${cow.alerts.join(', ')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
    
    // Charts
    const chartsHtml = `
      <div class="chart-container">
        <h3>Milk Production Trend</h3>
        <canvas id="milkChart"></canvas>
      </div>
      <div class="chart-container">
        <h3>Nutrition Composition</h3>
        <canvas id="nutritionChart"></canvas>
      </div>
    `;
    
    // Recommendations
    const recommendations = dataService.getRecommendations();
    const recommendationsHtml = recommendations.length > 0 ? 
      `<section class="recommendations-section">
        <div class="section-header">
          <h2><i class="fas fa-lightbulb"></i> Recommendations</h2>
        </div>
        <div class="recommendations-carousel">
          ${recommendations.slice(0, 3).map(rec => `
            <div class="recommendation-card ${rec.priority.toLowerCase()}">
              <div class="recommendation-header">
                <span class="priority-badge">${rec.priority} Priority</span>
                <span class="cow-id">${rec.cowId}</span>
              </div>
              <div class="recommendation-body">
                <h4>${dataService.getCow(rec.cowId)?.name || 'Unknown Cow'}</h4>
                <div class="recommendation-message">${rec.message.replace(/\n/g, '<br>')}</div>
              </div>
              <div class="recommendation-footer">
                <i class="fas fa-clock"></i> ${utils.formatDate(new Date().toISOString())}
              </div>
            </div>
          `).join('')}
        </div>
        ${recommendations.length > 3 ? `
          <a href="#" class="view-all" data-screen="recommendations">View All Recommendations</a>
        ` : ''}
      </section>` : '';
    
    // Combine all
    container.innerHTML = `
      <div class="dashboard-section">
        <div class="stats-section">
          <div class="section-header">
            <h2>Farm Overview</h2>
          </div>
          <div class="stats-grid">
            ${statsHtml}
          </div>
        </div>
        
        <div class="alerts-section">
          <div class="section-header">
            <h2>Recent Alerts</h2>
            <a href="#" class="view-all" data-screen="alerts">View All</a>
          </div>
          ${alertsHtml}
        </div>
        
        <div class="cows-section">
          <div class="section-header">
            <h2>Top Producing Cows</h2>
            <a href="#" class="view-all" data-screen="cows">View All</a>
          </div>
          <div class="cow-list">
            ${cowsHtml}
          </div>
        </div>
        
        <div class="charts-section">
          ${chartsHtml}
        </div>
        
        ${recommendationsHtml}
      </div>
    `;
    
    // Render charts
    this.renderDashboardCharts();
    
    // Add event listeners to view-all links
    document.querySelectorAll('.view-all').forEach(link => {
      link.addEventListener('click', e => {
        e.preventDefault();
        const screen = link.dataset.screen;
        this.renderScreen(screen);
        
        // Update active state
        document.querySelectorAll('.menu-item, .tab-item').forEach(item => {
          item.classList.remove('active');
          if (item.dataset.screen === screen) {
            item.classList.add('active');
          }
        });
        
        // Update title
        document.getElementById('screen-title').textContent = 
          screen.charAt(0).toUpperCase() + screen.slice(1);
      });
    });
  },
  
  // Render dashboard charts with pH included
  renderDashboardCharts: function() {
    const cows = dataService.cows;
    if (!cows || cows.length === 0) return;
    
    // Milk production chart
    const milkCtx = document.getElementById('milkChart').getContext('2d');
    new Chart(milkCtx, {
      type: 'line',
      data: {
        labels: cows.map(cow => cow.name),
        datasets: [{
          label: 'Milk Production (L)',
          data: cows.map(cow => cow.milkVolume),
          backgroundColor: 'rgba(76, 175, 80, 0.2)',
          borderColor: 'rgba(76, 175, 80, 1)',
          borderWidth: 2,
          tension: 0.3
        }]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                return context.dataset.label + ': ' + context.raw.toFixed(1) + ' L';
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Liters'
            }
          }
        }
      }
    });
    
    // Nutrition composition chart with pH
    const nutritionCtx = document.getElementById('nutritionChart').getContext('2d');
    new Chart(nutritionCtx, {
      type: 'bar',
      data: {
        labels: cows.map(cow => cow.name),
        datasets: [
          {
            label: 'Fat %',
            data: cows.map(cow => cow.fatPercent),
            backgroundColor: 'rgba(255, 193, 7, 0.7)',
            borderColor: 'rgba(255, 193, 7, 1)',
            borderWidth: 1
          },
          {
            label: 'Protein %',
            data: cows.map(cow => cow.proteinPercent),
            backgroundColor: 'rgba(33, 150, 243, 0.7)',
            borderColor: 'rgba(33, 150, 243, 1)',
            borderWidth: 1
          },
          {
            label: 'Lactose %',
            data: cows.map(cow => cow.lactosePercent),
            backgroundColor: 'rgba(156, 39, 176, 0.7)',
            borderColor: 'rgba(156, 39, 176, 1)',
            borderWidth: 1
          },
          {
            label: 'pH',
            data: cows.map(cow => cow.pH),
            backgroundColor: 'rgba(244, 67, 54, 0.7)',
            borderColor: 'rgba(244, 67, 54, 1)',
            borderWidth: 1,
            type: 'line',
            yAxisID: 'y1'
          }
        ]
      },
      options: {
        responsive: true,
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 3) { // pH
                  label += context.raw.toFixed(1);
                } else {
                  label += context.raw.toFixed(1) + '%';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            title: {
              display: true,
              text: 'Percentage'
            }
          },
          y1: {
            position: 'right',
            title: {
              display: true,
              text: 'pH'
            },
            min: 6,
            max: 7.5,
            grid: {
              drawOnChartArea: false
            }
          }
        }
      }
    });
  },
  
  // Render Cows screen
  renderCows: function(container) {
    const cows = [...dataService.cows].sort((a, b) => b.milkVolume - a.milkVolume);
    
    if (!cows || cows.length === 0) {
      container.innerHTML = '<div class="error">No cow data available</div>';
      return;
    }
    
    const cowsHtml = cows.map(cow => `
      <div class="cow-card">
        <img src="${cow.photo}" alt="${cow.name}" class="cow-image">
        <div class="cow-info">
          <div class="cow-name">${cow.name}</div>
          <div class="cow-id">${cow.id}</div>
          <div class="cow-stats">
            <div class="cow-stat">
              <div class="value">${utils.formatMilkVolume(cow.milkVolume)}</div>
              <div class="label">Milk</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPercentage(cow.fatPercent)}</div>
              <div class="label">Fat</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPercentage(cow.proteinPercent)}</div>
              <div class="label">Protein</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPercentage(cow.lactosePercent)}</div>
              <div class="label">Lactose</div>
            </div>
            <div class="cow-stat">
              <div class="value">${utils.formatPH(cow.pH)}</div>
              <div class="label">pH</div>
            </div>
          </div>
          ${cow.alerts && cow.alerts.length > 0 ? `
            <div class="cow-alerts">
              <i class="fas fa-exclamation-triangle"></i>
              ${cow.alerts.join(', ')}
            </div>
          ` : ''}
        </div>
      </div>
    `).join('');
    
    container.innerHTML = `
      <div class="section-header">
        <h2>All Cows (${cows.length})</h2>
      </div>
      <div class="cow-list">
        ${cowsHtml}
      </div>
    `;
  },
  
  // Render Alerts screen
  renderAlerts: function(container) {
    const alerts = dataService.getAlerts();
    
    const alertsHtml = alerts.length > 0 ? 
      alerts.map(alert => `
        <div class="alert-card ${alert.type === 'warning' ? 'warning' : 'danger'}">
          <div class="alert-icon">
            <i class="fas fa-exclamation"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title">${alert.cowId} - ${alert.message}</div>
            <div class="alert-message">Cow: ${alert.cowName || 'Unknown'}</div>
            <div class="alert-time">${utils.formatDate(alert.date)}</div>
          </div>
        </div>
      `).join('') : `
        <div class="alert-card info">
          <div class="alert-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title">No alerts</div>
            <div class="alert-message">All cows are within normal ranges</div>
          </div>
        </div>
      `;
    
    container.innerHTML = `
      <div class="section-header">
        <h2>Alerts (${alerts.length})</h2>
      </div>
      ${alertsHtml}
    `;
  },
  
  // Render Recommendations screen
  renderRecommendations: function(container) {
    const recommendations = dataService.getRecommendations();
    
    const recommendationsHtml = recommendations.length > 0 ? 
      recommendations.map(rec => `
        <div class="recommendation-card ${rec.priority.toLowerCase()}">
          <div class="recommendation-header">
            <span class="priority-badge">${rec.priority} Priority</span>
            <span class="cow-id">${rec.cowId}</span>
          </div>
          <div class="recommendation-body">
            <h4>${dataService.getCow(rec.cowId)?.name || 'Unknown Cow'}</h4>
            <div class="recommendation-message">${rec.message.replace(/\n/g, '<br>')}</div>
          </div>
          <div class="recommendation-footer">
            <i class="fas fa-clock"></i> ${utils.formatDate(new Date().toISOString())}
          </div>
        </div>
      `).join('') : `
        <div class="alert-card info">
          <div class="alert-icon">
            <i class="fas fa-check"></i>
          </div>
          <div class="alert-content">
            <div class="alert-title">No recommendations</div>
            <div class="alert-message">All cows are performing optimally</div>
          </div>
        </div>
      `;
    
    container.innerHTML = `
      <div class="section-header">
        <h2>Recommendations (${recommendations.length})</h2>
      </div>
      ${recommendationsHtml}
    `;
  },
  
  // Render Reports screen
  renderReports: function(container) {
    const farm = dataService.getFarmStats();
    const cows = dataService.cows;
    
    if (!farm || !cows) {
      container.innerHTML = '<div class="error">No data available for reports</div>';
      return;
    }
    
    // Find top performing cows
    const topCow = [...cows].sort((a, b) => b.milkVolume - a.milkVolume)[0];
    const highFatCow = [...cows].sort((a, b) => b.fatPercent - a.fatPercent)[0];
    const highProteinCow = [...cows].sort((a, b) => b.proteinPercent - a.proteinPercent)[0];
    const highLactoseCow = [...cows].sort((a, b) => b.lactosePercent - a.lactosePercent)[0];
    const optimalPHCow = [...cows].sort((a, b) => Math.abs(6.7 - a.pH) - Math.abs(6.7 - b.pH))[0];
    
    // Weekly trends data
    const weeklyTrendsHtml = `
      <div class="weekly-trends-scroller">
        ${[1, 2, 3, 4].map(week => `
          <div class="weekly-card">
            <h4>Week ${week}</h4>
            <div class="trend-value">${(farm.totalMilk * (0.95 + (week * 0.03))).toFixed(1)} L</div>
            <div class="trend-detail">
              <i class="fas fa-weight"></i>
              <span>Fat: ${(farm.averageFat * (0.98 + (week * 0.005))).toFixed(1)}%</span>
            </div>
            <div class="trend-detail">
              <i class="fas fa-egg"></i>
              <span>Protein: ${(farm.averageProtein * (0.99 + (week * 0.004))).toFixed(1)}%</span>
            </div>
            <div class="trend-detail">
              <i class="fas fa-wine-bottle"></i>
              <span>Lactose: ${(farm.averageLactose * (0.995 + (week * 0.003))).toFixed(1)}%</span>
            </div>
            <div class="trend-detail">
              <i class="fas fa-tint"></i>
              <span>pH: ${(farm.averagePH + (week * 0.02)).toFixed(1)}</span>
            </div>
          </div>
        `).join('')}
      </div>
    `;
    
    container.innerHTML = `
      <div class="section-header">
        <h2>Farm Reports</h2>
      </div>
      
      <div class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <i class="fas fa-chart-line"></i>
          </div>
          <h3 class="report-title">Daily Summary</h3>
        </div>
        <div class="report-content">
          <p>Total milk produced today: <strong>${farm.totalMilk.toFixed(1)} L</strong></p>
          <p>Average fat content: <strong>${utils.formatPercentage(farm.averageFat)}</strong></p>
          <p>Average protein content: <strong>${utils.formatPercentage(farm.averageProtein)}</strong></p>
          <p>Average lactose content: <strong>${utils.formatPercentage(farm.averageLactose)}</strong></p>
          <p>Average pH: <strong>${utils.formatPH(farm.averagePH)}</strong></p>
          <p>Active alerts: <strong>${farm.alerts.length}</strong></p>
        </div>
      </div>
      
      <div class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <i class="fas fa-trophy"></i>
          </div>
          <h3 class="report-title">Top Performers</h3>
        </div>
        <div class="report-content">
          <p>Top producing cow: <strong>${topCow.name} (${topCow.id})</strong> with ${topCow.milkVolume.toFixed(1)} L</p>
          <p>Highest fat content: <strong>${highFatCow.name} (${highFatCow.id})</strong> at ${utils.formatPercentage(highFatCow.fatPercent)}</p>
          <p>Highest protein content: <strong>${highProteinCow.name} (${highProteinCow.id})</strong> at ${utils.formatPercentage(highProteinCow.proteinPercent)}</p>
          <p>Highest lactose content: <strong>${highLactoseCow.name} (${highLactoseCow.id})</strong> at ${utils.formatPercentage(highLactoseCow.lactosePercent)}</p>
          <p>Most optimal pH: <strong>${optimalPHCow.name} (${optimalPHCow.id})</strong> at ${utils.formatPH(optimalPHCow.pH)}</p>
        </div>
      </div>
      
      <div class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <i class="fas fa-bell"></i>
          </div>
          <h3 class="report-title">Alert Summary</h3>
        </div>
        <div class="report-content">
          ${farm.alerts.length > 0 ? `
            <p>Most common alert: <strong>${this.getMostCommonAlert(farm.alerts)}</strong></p>
            <p>Cows with alerts: <strong>${this.getCowsWithAlerts(farm.alerts).length}</strong></p>
          ` : `
            <p>No active alerts in the farm</p>
          `}
        </div>
      </div>
      
      <div class="report-card">
        <div class="report-header">
          <div class="report-icon">
            <i class="fas fa-calendar"></i>
          </div>
          <h3 class="report-title">Weekly Trend</h3>
        </div>
        <div class="report-content">
          <canvas id="weeklyTrendChart"></canvas>
          ${weeklyTrendsHtml}
        </div>
      </div>
    `;
    
    // Render weekly trend chart
    this.renderWeeklyTrendChart();
  },
  
  // Render weekly trend chart
  renderWeeklyTrendChart: function() {
    const cows = dataService.cows;
    if (!cows || cows.length === 0) return;
    
    // Simulate weekly data
    const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const milkData = days.map(() => Math.random() * 20 + 50);
    const fatData = days.map(() => Math.random() * 0.5 + 3.5);
    const proteinData = days.map(() => Math.random() * 0.5 + 3.0);
    const lactoseData = days.map(() => Math.random() * 0.3 + 4.5);
    
    const ctx = document.getElementById('weeklyTrendChart').getContext('2d');
    new Chart(ctx, {
      type: 'line',
      data: {
        labels: days,
        datasets: [
          {
            label: 'Milk Production (L)',
            data: milkData,
            borderColor: 'rgba(76, 175, 80, 1)',
            backgroundColor: 'rgba(76, 175, 80, 0.1)',
            borderWidth: 2,
            yAxisID: 'y',
            tension: 0.3
          },
          {
            label: 'Fat %',
            data: fatData,
            borderColor: 'rgba(255, 193, 7, 1)',
            backgroundColor: 'rgba(255, 193, 7, 0.1)',
            borderWidth: 2,
            yAxisID: 'y1',
            tension: 0.3
          },
          {
            label: 'Protein %',
            data: proteinData,
            borderColor: 'rgba(33, 150, 243, 1)',
            backgroundColor: 'rgba(33, 150, 243, 0.1)',
            borderWidth: 2,
            yAxisID: 'y1',
            tension: 0.3
          },
          {
            label: 'Lactose %',
            data: lactoseData,
            borderColor: 'rgba(156, 39, 176, 1)',
            backgroundColor: 'rgba(156, 39, 176, 0.1)',
            borderWidth: 2,
            yAxisID: 'y1',
            tension: 0.3
          }
        ]
      },
      options: {
        responsive: true,
        interaction: {
          mode: 'index',
          intersect: false,
        },
        plugins: {
          legend: {
            position: 'top',
          },
          tooltip: {
            callbacks: {
              label: function(context) {
                let label = context.dataset.label || '';
                if (label) {
                  label += ': ';
                }
                if (context.datasetIndex === 0) {
                  label += context.raw.toFixed(1) + ' L';
                } else {
                  label += context.raw.toFixed(1) + '%';
                }
                return label;
              }
            }
          }
        },
        scales: {
          y: {
            type: 'linear',
            display: true,
            position: 'left',
            title: {
              display: true,
              text: 'Liters'
            }
          },
          y1: {
            type: 'linear',
            display: true,
            position: 'right',
            title: {
              display: true,
              text: 'Percentage'
            },
            grid: {
              drawOnChartArea: false,
            },
            min: 2.5,
            max: 5
          }
        }
      }
    });
  },
  
  // Render Settings screen with working toggles
  renderSettings: function(container) {
    const username = localStorage.getItem('username') || 'User';
    const darkMode = localStorage.getItem('darkMode') === 'true';
    const notificationsEnabled = localStorage.getItem('notificationsEnabled') !== 'false';
    
    container.innerHTML = `
      <div class="section-header">
        <h2>Settings</h2>
      </div>
      
      <div class="setting-item">
        <div class="setting-icon">
          <i class="fas fa-user"></i>
        </div>
        <div class="setting-content">
          <div class="setting-title">Account</div>
          <div class="setting-description">Logged in as ${username}</div>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-icon">
          <i class="fas fa-bell"></i>
        </div>
        <div class="setting-content">
          <div class="setting-title">Notifications</div>
          <div class="setting-description">Enable/disable alert notifications</div>
        </div>
        <label class="setting-switch">
          <input type="checkbox" ${notificationsEnabled ? 'checked' : ''} id="notifications-toggle">
          <span class="setting-slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-icon">
          <i class="fas fa-moon"></i>
        </div>
        <div class="setting-content">
          <div class="setting-title">Dark Mode</div>
          <div class="setting-description">Switch between light and dark theme</div>
        </div>
        <label class="setting-switch">
          <input type="checkbox" ${darkMode ? 'checked' : ''} id="darkmode-toggle">
          <span class="setting-slider"></span>
        </label>
      </div>
      
      <div class="setting-item">
        <div class="setting-icon">
          <i class="fas fa-database"></i>
        </div>
        <div class="setting-content">
          <div class="setting-title">Data Sync</div>
          <div class="setting-description">Last sync: ${utils.formatDate(new Date().toISOString())}</div>
        </div>
      </div>
      
      <div class="setting-item">
        <div class="setting-icon">
          <i class="fas fa-info-circle"></i>
        </div>
        <div class="setting-content">
          <div class="setting-title">About</div>
          <div class="setting-description">SMARTMILK v1.2.0</div>
        </div>
      </div>
      
      <div class="logout-btn-container">
        <button id="logout-btn" class="btn btn-outline">
          <i class="fas fa-sign-out-alt"></i> Logout
        </button>
      </div>
    `;
    
    // Dark mode toggle
    document.getElementById('darkmode-toggle').addEventListener('change', (e) => {
      const enabled = e.target.checked;
      document.body.classList.toggle('dark-mode', enabled);
      localStorage.setItem('darkMode', enabled);
    });
    
    // Notifications toggle
    document.getElementById('notifications-toggle').addEventListener('change', (e) => {
      const enabled = e.target.checked;
      localStorage.setItem('notificationsEnabled', enabled);
      this.toggleNotificationBadge(enabled);
      this.updateAlertCount();
    });
  },
  
  // Helper to get most common alert
  getMostCommonAlert: function(alerts) {
    const counts = {};
    alerts.forEach(alert => {
      counts[alert.message] = (counts[alert.message] || 0) + 1;
    });
    return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
  },
  
  // Helper to get unique cows with alerts
  getCowsWithAlerts: function(alerts) {
    const cowIds = new Set();
    alerts.forEach(alert => cowIds.add(alert.cowId));
    return Array.from(cowIds);
  }
};