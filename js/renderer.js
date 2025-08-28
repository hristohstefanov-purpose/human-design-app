// Human Design Chart Renderer Module
class ChartRenderer {
    constructor() {
        this.svg = null;
        this.width = 500;
        this.height = 600;
        this.centerRadius = 35;
        this.colors = {
            defined: '#764ba2',
            undefined: '#ffffff',
            channel: '#667eea',
            personality: '#000000',
            design: '#ff0000',
            stroke: '#333333'
        };
    }
    
    renderChart(chartData) {
        // Clear existing chart
        d3.select('#bodygraph').selectAll('*').remove();
        
        // Initialize SVG
        this.svg = d3.select('#bodygraph')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('viewBox', `0 0 ${this.width} ${this.height}`);
        
        // Add background
        this.svg.append('rect')
            .attr('width', this.width)
            .attr('height', this.height)
            .attr('fill', '#f8f9fa');
        
        // Draw channels first (behind centers)
        this.drawChannels(chartData.activeChannels);
        
        // Draw centers
        this.drawCenters(chartData.definedCenters);
        
        // Draw gates
        this.drawGates(chartData.personalityGates, chartData.designGates);
        
        // Update info panel
        this.updateInfoPanel(chartData);
    }
    
    drawCenters(definedCenters) {
        const centers = window.HDCalculator.centerPositions;
        
        Object.entries(centers).forEach(([name, pos]) => {
            const isDefined = definedCenters.includes(name);
            
            let shape;
            if (pos.type === 'triangle') {
                shape = this.svg.append('polygon')
                    .attr('points', this.getTrianglePoints(pos.x, pos.y, this.centerRadius));
            } else if (pos.type === 'square') {
                shape = this.svg.append('rect')
                    .attr('x', pos.x - this.centerRadius)
                    .attr('y', pos.y - this.centerRadius)
                    .attr('width', this.centerRadius * 2)
                    .attr('height', this.centerRadius * 2);
            } else if (pos.type === 'diamond') {
                shape = this.svg.append('polygon')
                    .attr('points', this.getDiamondPoints(pos.x, pos.y, this.centerRadius));
            }
            
            shape
                .attr('fill', isDefined ? this.colors.defined : this.colors.undefined)
                .attr('stroke', this.colors.stroke)
                .attr('stroke-width', 2)
                .attr('class', `center center-${name}`)
                .on('mouseover', function() {
                    d3.select(this).attr('opacity', 0.8);
                    // Show tooltip
                    const tooltip = d3.select('body').append('div')
                        .attr('class', 'tooltip')
                        .style('position', 'absolute')
                        .style('padding', '10px')
                        .style('background', 'rgba(0,0,0,0.8)')
                        .style('color', 'white')
                        .style('border-radius', '5px')
                        .style('pointer-events', 'none')
                        .style('opacity', 0);
                    
                    tooltip.transition()
                        .duration(200)
                        .style('opacity', 1);
                    
                    tooltip.html(`<strong>${name.toUpperCase()} Center</strong><br>
                                 Status: ${isDefined ? 'Defined' : 'Undefined'}`)
                        .style('left', (d3.event.pageX + 10) + 'px')
                        .style('top', (d3.event.pageY - 10) + 'px');
                })
                .on('mouseout', function() {
                    d3.select(this).attr('opacity', 1);
                    d3.select('.tooltip').remove();
                });
            
            // Add center label
            this.svg.append('text')
                .attr('x', pos.x)
                .attr('y', pos.y)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '11px')
                .attr('font-weight', 'bold')
                .attr('fill', isDefined ? 'white' : '#666')
                .attr('pointer-events', 'none')
                .text(name.toUpperCase().substring(0, 3));
        });
    }
    
    drawChannels(activeChannels) {
        const centers = window.HDCalculator.centerPositions;
        
        activeChannels.forEach(channel => {
            const center1 = centers[channel.centers[0]];
            const center2 = centers[channel.centers[1]];
            
            // Draw channel line
            this.svg.append('line')
                .attr('x1', center1.x)
                .attr('y1', center1.y)
                .attr('x2', center2.x)
                .attr('y2', center2.y)
                .attr('stroke', this.colors.channel)
                .attr('stroke-width', 4)
                .attr('opacity', 0.6)
                .attr('class', `channel channel-${channel.id}`);
            
            // Add channel label
            const midX = (center1.x + center2.x) / 2;
            const midY = (center1.y + center2.y) / 2;
            
            this.svg.append('circle')
                .attr('cx', midX)
                .attr('cy', midY)
                .attr('r', 12)
                .attr('fill', 'white')
                .attr('stroke', this.colors.channel)
                .attr('stroke-width', 2);
            
            this.svg.append('text')
                .attr('x', midX)
                .attr('y', midY)
                .attr('text-anchor', 'middle')
                .attr('dominant-baseline', 'middle')
                .attr('font-size', '8px')
                .attr('font-weight', 'bold')
                .attr('fill', this.colors.channel)
                .text(channel.id);
        });
    }
    
    drawGates(personalityGates, designGates) {
        // Gate positions around centers (simplified)
        const gatePositions = this.calculateGatePositions();
        
        // Draw personality gates (black)
        personalityGates.forEach(gateInfo => {
            const pos = gatePositions[gateInfo.gate];
            if (pos) {
                this.drawGate(pos.x, pos.y, gateInfo.gate, this.colors.personality, 'P');
            }
        });
        
        // Draw design gates (red)
        designGates.forEach(gateInfo => {
            const pos = gatePositions[gateInfo.gate];
            if (pos) {
                // Offset slightly if personality gate is also present
                const offset = personalityGates.some(g => g.gate === gateInfo.gate) ? 15 : 0;
                this.drawGate(pos.x + offset, pos.y, gateInfo.gate, this.colors.design, 'D');
            }
        });
    }
    
    drawGate(x, y, gateNumber, color, type) {
        const group = this.svg.append('g')
            .attr('class', `gate gate-${gateNumber}`);
        
        group.append('circle')
            .attr('cx', x)
            .attr('cy', y)
            .attr('r', 8)
            .attr('fill', 'white')
            .attr('stroke', color)
            .attr('stroke-width', 2);
        
        group.append('text')
            .attr('x', x)
            .attr('y', y)
            .attr('text-anchor', 'middle')
            .attr('dominant-baseline', 'middle')
            .attr('font-size', '7px')
            .attr('font-weight', 'bold')
            .attr('fill', color)
            .text(gateNumber);
    }
    
    calculateGatePositions() {
        // Simplified gate positions - in reality these would be precisely calculated
        // based on the bodygraph geometry
        const positions = {};
        const centers = window.HDCalculator.centerPositions;
        
        // Head gates (64, 61, 63)
        positions[64] = {x: centers.head.x - 20, y: centers.head.y - 20};
        positions[61] = {x: centers.head.x, y: centers.head.y - 20};
        positions[63] = {x: centers.head.x + 20, y: centers.head.y - 20};
        
        // Ajna gates (47, 24, 4, 17, 43, 11)
        positions[47] = {x: centers.ajna.x - 30, y: centers.ajna.y};
        positions[24] = {x: centers.ajna.x - 15, y: centers.ajna.y};
        positions[4] = {x: centers.ajna.x, y: centers.ajna.y};
        positions[17] = {x: centers.ajna.x + 15, y: centers.ajna.y};
        positions[43] = {x: centers.ajna.x + 30, y: centers.ajna.y};
        positions[11] = {x: centers.ajna.x, y: centers.ajna.y + 20};
        
        // Throat gates (62, 23, 56, 16, 20, 31, 8, 33, 35, 12, 45, 21)
        positions[62] = {x: centers.throat.x - 40, y: centers.throat.y - 20};
        positions[23] = {x: centers.throat.x - 20, y: centers.throat.y - 20};
        positions[56] = {x: centers.throat.x, y: centers.throat.y - 20};
        positions[16] = {x: centers.throat.x + 20, y: centers.throat.y - 20};
        positions[20] = {x: centers.throat.x + 40, y: centers.throat.y - 20};
        positions[31] = {x: centers.throat.x - 40, y: centers.throat.y};
        positions[8] = {x: centers.throat.x - 20, y: centers.throat.y};
        positions[33] = {x: centers.throat.x, y: centers.throat.y};
        positions[35] = {x: centers.throat.x + 20, y: centers.throat.y};
        positions[12] = {x: centers.throat.x + 40, y: centers.throat.y};
        positions[45] = {x: centers.throat.x - 20, y: centers.throat.y + 20};
        positions[21] = {x: centers.throat.x + 20, y: centers.throat.y + 20};
        
        // G Center gates (1, 13, 25, 15, 10, 7, 46, 2)
        positions[1] = {x: centers.g.x, y: centers.g.y - 30};
        positions[13] = {x: centers.g.x - 30, y: centers.g.y - 15};
        positions[25] = {x: centers.g.x - 30, y: centers.g.y};
        positions[15] = {x: centers.g.x - 30, y: centers.g.y + 15};
        positions[10] = {x: centers.g.x + 30, y: centers.g.y - 15};
        positions[7] = {x: centers.g.x + 30, y: centers.g.y};
        positions[46] = {x: centers.g.x + 30, y: centers.g.y + 15};
        positions[2] = {x: centers.g.x, y: centers.g.y + 30};
        
        // Ego gates (51, 26, 21, 40, 37)
        positions[51] = {x: centers.ego.x, y: centers.ego.y - 20};
        positions[26] = {x: centers.ego.x - 20, y: centers.ego.y};
        positions[21] = {x: centers.ego.x, y: centers.ego.y};
        positions[40] = {x: centers.ego.x + 20, y: centers.ego.y};
        positions[37] = {x: centers.ego.x, y: centers.ego.y + 20};
        
        // Spleen gates (48, 57, 44, 50, 32, 28, 18)
        positions[48] = {x: centers.spleen.x - 20, y: centers.spleen.y - 20};
        positions[57] = {x: centers.spleen.x, y: centers.spleen.y - 20};
        positions[44] = {x: centers.spleen.x + 20, y: centers.spleen.y - 20};
        positions[50] = {x: centers.spleen.x - 20, y: centers.spleen.y};
        positions[32] = {x: centers.spleen.x, y: centers.spleen.y};
        positions[28] = {x: centers.spleen.x + 20, y: centers.spleen.y};
        positions[18] = {x: centers.spleen.x, y: centers.spleen.y + 20};
        
        // Sacral gates (5, 14, 29, 59, 9, 3, 42, 27, 34)
        positions[5] = {x: centers.sacral.x - 30, y: centers.sacral.y - 20};
        positions[14] = {x: centers.sacral.x, y: centers.sacral.y - 20};
        positions[29] = {x: centers.sacral.x + 30, y: centers.sacral.y - 20};
        positions[59] = {x: centers.sacral.x - 40, y: centers.sacral.y};
        positions[9] = {x: centers.sacral.x - 20, y: centers.sacral.y};
        positions[3] = {x: centers.sacral.x, y: centers.sacral.y};
        positions[42] = {x: centers.sacral.x + 20, y: centers.sacral.y};
        positions[27] = {x: centers.sacral.x + 40, y: centers.sacral.y};
        positions[34] = {x: centers.sacral.x, y: centers.sacral.y + 20};
        
        // Root gates (53, 60, 52, 19, 39, 41, 38, 58, 54)
        positions[53] = {x: centers.root.x - 40, y: centers.root.y};
        positions[60] = {x: centers.root.x - 25, y: centers.root.y};
        positions[52] = {x: centers.root.x - 10, y: centers.root.y};
        positions[19] = {x: centers.root.x + 10, y: centers.root.y};
        positions[39] = {x: centers.root.x + 25, y: centers.root.y};
        positions[41] = {x: centers.root.x + 40, y: centers.root.y};
        positions[38] = {x: centers.root.x - 20, y: centers.root.y + 20};
        positions[58] = {x: centers.root.x, y: centers.root.y + 20};
        positions[54] = {x: centers.root.x + 20, y: centers.root.y + 20};
        
        return positions;
    }
    
    getTrianglePoints(cx, cy, r) {
        const points = [];
        for (let i = 0; i < 3; i++) {
            const angle = (i * 120 - 90) * Math.PI / 180;
            const x = cx + r * Math.cos(angle);
            const y = cy + r * Math.sin(angle);
            points.push(`${x},${y}`);
        }
        return points.join(' ');
    }
    
    getDiamondPoints(cx, cy, r) {
        return `${cx},${cy - r} ${cx + r},${cy} ${cx},${cy + r} ${cx - r},${cy}`;
    }
    
    updateInfoPanel(chartData) {
        document.getElementById('hd-type').textContent = chartData.type;
        document.getElementById('hd-strategy').textContent = chartData.strategy;
        document.getElementById('hd-authority').textContent = chartData.authority;
        document.getElementById('hd-profile').textContent = chartData.profile;
        document.getElementById('hd-definition').textContent = chartData.definition;
        document.getElementById('hd-cross').textContent = chartData.cross;
    }
}

// Make renderer available globally
window.ChartRenderer = new ChartRenderer();
