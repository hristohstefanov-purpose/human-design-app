// Storage and Sharing Module
class ChartStorage {
    constructor() {
        this.storageKey = 'hdCharts';
        this.maxCharts = 50;
    }
    
    saveChart(chartData) {
        try {
            // Get existing charts
            const charts = this.getCharts();
            
            // Create unique ID
            const chartId = this.generateId();
            
            // Add chart with ID
            const chartWithId = {
                ...chartData,
                id: chartId,
                name: chartData.birthData.name || 'Unnamed Chart',
                savedAt: new Date().toISOString()
            };
            
            // Add to beginning of array
            charts.unshift(chartWithId);
            
            // Limit stored charts
            if (charts.length > this.maxCharts) {
                charts.pop();
            }
            
            // Save to localStorage
            localStorage.setItem(this.storageKey, JSON.stringify(charts));
            
            return chartId;
        } catch (error) {
            console.error('Error saving chart:', error);
            return null;
        }
    }
    
    getCharts() {
        try {
            const stored = localStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Error loading charts:', error);
            return [];
        }
    }
    
    getChart(chartId) {
        const charts = this.getCharts();
        return charts.find(c => c.id === chartId);
    }
    
    deleteChart(chartId) {
        try {
            const charts = this.getCharts();
            const filtered = charts.filter(c => c.id !== chartId);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            return true;
        } catch (error) {
            console.error('Error deleting chart:', error);
            return false;
        }
    }
    
    generateId() {
        return 'hd_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    }
    
    createShareableURL(chartData) {
        try {
            // Compress chart data
            const compressed = LZString.compressToEncodedURIComponent(
                JSON.stringify({
                    bd: chartData.birthData,
                    pg: chartData.personalityGates.map(g => ({
                        p: g.planet,
                        g: g.gate,
                        l: g.line
                    })),
                    dg: chartData.designGates.map(g => ({
                        p: g.planet,
                        g: g.gate,
                        l: g.line
                    })),
                    t: chartData.type,
                    a: chartData.authority,
                    s: chartData.strategy,
                    pr: chartData.profile,
                    d: chartData.definition,
                    c: chartData.cross
                })
            );
            
            return `${window.location.origin}${window.location.pathname}?chart=${compressed}`;
        } catch (error) {
            console.error('Error creating shareable URL:', error);
            return null;
        }
    }
    
    loadFromURL() {
        try {
            const params = new URLSearchParams(window.location.search);
            const compressed = params.get('chart');
            
            if (!compressed) return null;
            
            const decompressed = LZString.decompressFromEncodedURIComponent(compressed);
            if (!decompressed) return null;
            
            const data = JSON.parse(decompressed);
            
            // Reconstruct full chart data
            return {
                birthData: data.bd,
                personalityGates: data.pg.map(g => ({
                    planet: g.p,
                    gate: g.g,
                    line: g.l
                })),
                designGates: data.dg.map(g => ({
                    planet: g.p,
                    gate: g.g,
                    line: g.l
                })),
                type: data.t,
                authority: data.a,
                strategy: data.s,
                profile: data.pr,
                definition: data.d,
                cross: data.c,
                activeChannels: [], // Will be recalculated
                definedCenters: []  // Will be recalculated
            };
        } catch (error) {
            console.error('Error loading from URL:', error);
            return null;
        }
    }
    
    exportChartAsJSON(chartData) {
        const dataStr = JSON.stringify(chartData, null, 2);
        const dataUri = 'data:application/json;charset=utf-8,' + encodeURIComponent(dataStr);
        
        const exportName = `hd-chart-${chartData.birthData.name || 'export'}-${Date.now()}.json`;
        
        const linkElement = document.createElement('a');
        linkElement.setAttribute('href', dataUri);
        linkElement.setAttribute('download', exportName);
        linkElement.click();
    }
    
    exportChartAsPDF(chartData) {
        // This would require a PDF library like jsPDF
        // For now, we'll create a printable version
        window.print();
    }
}

// Sharing functions
function shareChart() {
    const currentChart = window.currentChartData;
    if (!currentChart) {
        alert('No chart to share');
        return;
    }
    
    const url = window.chartStorage.createShareableURL(currentChart);
    if (url) {
        // Copy to clipboard
        navigator.clipboard.writeText(url).then(() => {
            alert('Chart link copied to clipboard!');
        }).catch(() => {
            prompt('Copy this link to share your chart:', url);
        });
    }
}

function downloadChart() {
    const currentChart = window.currentChartData;
    if (!currentChart) {
        alert('No chart to download');
        return;
    }
    
    // Download as JSON
    window.chartStorage.exportChartAsJSON(currentChart);
    
    // Also save as image
    saveSVGAsImage();
}

function printChart() {
    window.print();
}

function saveSVGAsImage() {
    const svg = document.getElementById('bodygraph');
    const svgData = new XMLSerializer().serializeToString(svg);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 500;
    canvas.height = 600;
    
    img.onload = function() {
        ctx.fillStyle = 'white';
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0);
        
        canvas.toBlob(function(blob) {
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `hd-chart-${Date.now()}.png`;
            a.click();
            URL.revokeObjectURL(url);
        });
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(unescape(encodeURIComponent(svgData)));
}

// Make storage available globally
window.chartStorage = new ChartStorage();
