// Main Application Controller
class HumanDesignApp {
    constructor() {
        this.currentChart = null;
        this.locationCache = {};
        this.init();
    }
    
    init() {
        // Set up event listeners
        this.setupEventListeners();
        
        // Load chart from URL if present
        this.loadSharedChart();
        
        // Display recent charts
        this.displayRecentCharts();
        
        // Set default date to today
        const today = new Date().toISOString().split('T')[0];
        document.getElementById('birth-date').value = today;
    }
    
    setupEventListeners() {
        // Form submission
        document.getElementById('birth-form').addEventListener('submit', (e) => {
            e.preventDefault();
            this.generateChart();
        });
        
        // Location autocomplete
        const locationInput = document.getElementById('birth-location');
        let debounceTimer;
        
        locationInput.addEventListener('input', (e) => {
            clearTimeout(debounceTimer);
            const query = e.target.value;
            
            if (query.length < 3) {
                this.hideSuggestions();
                return;
            }
            
            debounceTimer = setTimeout(() => {
                this.searchLocation(query);
            }, 300);
        });
        
        // Click outside to close suggestions
        document.addEventListener('click', (e) => {
            if (!e.target.closest('#birth-location') && !e.target.closest('#location-suggestions')) {
                this.hideSuggestions();
            }
        });
    }
    
    async searchLocation(query) {
        try {
            // Check cache first
            if (this.locationCache[query]) {
                this.displaySuggestions(this.locationCache[query]);
                return;
            }
            
            // Search using Nominatim
            const url = `https://nominatim.openstreetmap.org/search?` +
                       `q=${encodeURIComponent(query)}&` +
                       `format=json&` +
                       `limit=5&` +
                       `featuretype=city&` +
                       `addressdetails=1`;
            
            const response = await fetch(url, {
                headers: {
                    'Accept': 'application/json'
                }
            });
            
            if (!response.ok) throw new Error('Location search failed');
            
            const results = await response.json();
            
            // Cache results
            this.locationCache[query] = results;
            
            // Display suggestions
            this.displaySuggestions(results);
            
        } catch (error) {
            console.error('Location search error:', error);
        }
    }
    
    displaySuggestions(results) {
        const container = document.getElementById('location-suggestions');
        container.innerHTML = '';
        
        if (results.length === 0) {
            container.innerHTML = '<div class="suggestion-item">No locations found</div>';
            container.classList.add('active');
            return;
        }
        
        results.forEach(result => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = result.display_name;
            item.dataset.lat = result.lat;
            item.dataset.lon = result.lon;
            item.dataset.name = result.display_name;
            
            item.addEventListener('click', () => {
                this.selectLocation(result);
            });
            
            container.appendChild(item);
        });
        
        container.classList.add('active');
    }
    
    hideSuggestions() {
        document.getElementById('location-suggestions').classList.remove('active');
    }
    
    selectLocation(location) {
        // Set input value
        document.getElementById('birth-location').value = location.display_name;
        
        // Store location data
        this.selectedLocation = {
            name: location.display_name,
            lat: parseFloat(location.lat),
            lon: parseFloat(location.lon)
        };
        
        // Get timezone for this location
        this.getTimezone(this.selectedLocation.lat, this.selectedLocation.lon);
        
        // Hide suggestions
        this.hideSuggestions();
    }
    
    async getTimezone(lat, lon) {
        try {
            // Using TimeZoneDB free API (requires free API key)
            // For now, we'll use a simplified approach with Luxon
            // In production, you'd want to use a proper timezone API
            
            // Estimate timezone from coordinates (simplified)
            const offset = Math.round(lon / 15); // Rough estimate
            this.selectedLocation.timezone = `UTC${offset >= 0 ? '+' : ''}${offset}`;
            
            // Better approach: use Intl API to get user's timezone
            // and assume birth location is in similar timezone for demo
            this.selectedLocation.timezone = Intl.DateTimeFormat().resolvedOptions().timeZone;
            
        } catch (error) {
            console.error('Timezone lookup error:', error);
            this.selectedLocation.timezone = 'UTC';
        }
    }
    
    async generateChart() {
        try {
            // Show loading
            this.showLoading();
            
            // Get form data
            const birthData = {
                name: document.getElementById('name').value || 'Anonymous',
                date: document.getElementById('birth-date').value,
                time: document.getElementById('birth-time').value,
                location: document.getElementById('birth-location').value,
                lat: this.selectedLocation?.lat,
                lon: this.selectedLocation?.lon,
                timezone: this.selectedLocation?.timezone || 'UTC'
            };
            
            // Validate
            if (!birthData.date || !birthData.time || !birthData.location) {
                throw new Error('Please fill in all required fields');
            }
            
            if (!this.selectedLocation) {
                throw new Error('Please select a location from the suggestions');
            }
            
            // Calculate chart
            const chartData = await window.HDCalculator.calculateChart(birthData);
            
            // Store current chart
            this.currentChart = chartData;
            window.currentChartData = chartData;
            
            // Render chart
            window.ChartRenderer.renderChart(chartData);
            
            // Save to storage
            const chartId = window.chartStorage.saveChart(chartData);
            
            // Update recent charts
            this.displayRecentCharts();
            
            // Show chart
            this.showChart();
            
        } catch (error) {
            console.error('Chart generation error:', error);
            this.showError(error.message);
        }
    }
    
    showLoading() {
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('chart-content').style.display = 'none';
        document.getElementById('loading').classList.add('active');
        document.getElementById('error-message').classList.remove('active');
    }
    
    showChart() {
        document.getElementById('welcome').style.display = 'none';
        document.getElementById('loading').classList.remove('active');
        document.getElementById('chart-content').style.display = 'block';
        document.getElementById('error-message').classList.remove('active');
    }
    
    showError(message) {
        document.getElementById('loading').classList.remove('active');
        const errorEl = document.getElementById('error-message');
        errorEl.textContent = message;
        errorEl.classList.add('active');
    }
    
    displayRecentCharts() {
        const container = document.getElementById('recent-charts');
        const charts = window.chartStorage.getCharts().slice(0, 5);
        
        if (charts.length === 0) {
            container.innerHTML = '<p style="color: #999;">No saved charts yet</p>';
            return;
        }
        
        container.innerHTML = '';
        charts.forEach(chart => {
            const item = document.createElement('div');
            item.style.cssText = 'padding: 10px; margin-bottom: 10px; background: #f8f9fa; border-radius: 5px; cursor: pointer;';
            
            const date = new Date(chart.savedAt).toLocaleDateString();
            item.innerHTML = `
                <div style="display: flex; justify-content: space-between; align-items: center;">
                    <div>
                        <strong>${chart.name}</strong><br>
                        <small style="color: #666;">${chart.type} - ${date}</small>
                    </div>
                    <button onclick="app.deleteChart('${chart.id}')" style="background: #dc3545; color: white; border: none; padding: 5px 10px; border-radius: 3px; cursor: pointer;">×</button>
                </div>
            `;
            
            item.addEventListener('click', (e) => {
                if (!e.target.closest('button')) {
                    this.loadChart(chart.id);
                }
            });
            
            container.appendChild(item);
        });
    }
    
    loadChart(chartId) {
        const chart = window.chartStorage.getChart(chartId);
        if (chart) {
            // Recalculate channels and centers
            const allGates = [
                ...chart.personalityGates.map(g => g.gate),
                ...chart.designGates.map(g => g.gate)
            ];
            chart.activeChannels = window.HDCalculator.calculateChannels(allGates);
            chart.definedCenters = window.HDCalculator.calculateDefinedCenters(chart.activeChannels);
            
            // Update current chart
            this.currentChart = chart;
            window.currentChartData = chart;
            
            // Render
            window.ChartRenderer.renderChart(chart);
            
            // Show chart
            this.showChart();
            
            // Update form with chart data
            document.getElementById('name').value = chart.birthData.name || '';
            document.getElementById('birth-date').value = chart.birthData.date;
            document.getElementById('birth-time').value = chart.birthData.time;
            document.getElementById('birth-location').value = chart.birthData.location;
        }
    }
    
    deleteChart(chartId) {
        if (confirm('Delete this chart?')) {
            window.chartStorage.deleteChart(chartId);
            this.displayRecentCharts();
        }
    }
    
    loadSharedChart() {
        const sharedChart = window.chartStorage.loadFromURL();
        if (sharedChart) {
            // Recalculate channels and centers
            const allGates = [
                ...sharedChart.personalityGates.map(g => g.gate),
                ...sharedChart.designGates.map(g => g.gate)
            ];
            sharedChart.activeChannels = window.HDCalculator.calculateChannels(allGates);
            sharedChart.definedCenters = window.HDCalculator.calculateDefinedCenters(sharedChart.activeChannels);
            
            // Update current chart
            this.currentChart = sharedChart;
            window.currentChartData = sharedChart;
            
            // Render
            window.ChartRenderer.renderChart(sharedChart);
            
            // Show chart
            this.showChart();
            
            // Clear URL to avoid confusion
            window.history.replaceState({}, document.title, window.location.pathname);
        }
    }
}

// Initialize app when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.app = new HumanDesignApp();
});

// Add print styles
const printStyles = document.createElement('style');
printStyles.textContent = `
    @media print {
        body {
            background: white !important;
        }
        .header {
            color: black !important;
        }
        .input-panel {
            display: none !important;
        }
        .main-content {
            display: block !important;
        }
        .chart-panel {
            box-shadow: none !important;
            border: 1px solid #ccc !important;
        }
        .action-btn {
            display: none !important;
        }
    }
`;
document.head.appendChild(printStyles);
