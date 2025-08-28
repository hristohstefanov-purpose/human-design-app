// Human Design Calculator Module
class HumanDesignCalculator {
    constructor() {
        // Gate to Zodiac Degree Mapping (0° Aries = Gate 41)
        this.gateStartDegrees = {
            41: 0.0, 19: 5.625, 13: 11.25, 49: 16.875, 30: 22.5, 55: 28.125,
            37: 33.75, 63: 39.375, 22: 45.0, 36: 50.625, 25: 56.25, 17: 61.875,
            21: 67.5, 51: 73.125, 42: 78.75, 3: 84.375, 27: 90.0, 24: 95.625,
            2: 101.25, 23: 106.875, 8: 112.5, 20: 118.125, 16: 123.75, 35: 129.375,
            45: 135.0, 12: 140.625, 15: 146.25, 52: 151.875, 39: 157.5, 53: 163.125,
            62: 168.75, 56: 174.375, 31: 180.0, 33: 185.625, 7: 191.25, 4: 196.875,
            29: 202.5, 59: 208.125, 40: 213.75, 64: 219.375, 47: 225.0, 6: 230.625,
            46: 236.25, 18: 241.875, 48: 247.5, 57: 253.125, 32: 258.75, 50: 264.375,
            28: 270.0, 44: 275.625, 1: 281.25, 43: 286.875, 14: 292.5, 34: 298.125,
            9: 303.75, 5: 309.375, 26: 315.0, 11: 320.625, 10: 326.25, 58: 331.875,
            38: 337.5, 54: 343.125, 61: 348.75, 60: 354.375
        };
        
        // Gate connections forming channels
        this.channels = [
            {id: '1-8', gates: [1, 8], centers: ['g', 'throat']},
            {id: '2-14', gates: [2, 14], centers: ['g', 'sacral']},
            {id: '3-60', gates: [3, 60], centers: ['root', 'sacral']},
            {id: '4-63', gates: [4, 63], centers: ['head', 'ajna']},
            {id: '5-15', gates: [5, 15], centers: ['sacral', 'g']},
            {id: '6-59', gates: [6, 59], centers: ['sacral', 'spleen']},
            {id: '7-31', gates: [7, 31], centers: ['g', 'throat']},
            {id: '9-52', gates: [9, 52], centers: ['root', 'sacral']},
            {id: '10-20', gates: [10, 20], centers: ['g', 'throat']},
            {id: '10-34', gates: [10, 34], centers: ['g', 'sacral']},
            {id: '10-57', gates: [10, 57], centers: ['g', 'spleen']},
            {id: '11-56', gates: [11, 56], centers: ['ajna', 'throat']},
            {id: '12-22', gates: [12, 22], centers: ['throat', 'spleen']},
            {id: '13-33', gates: [13, 33], centers: ['g', 'throat']},
            {id: '16-48', gates: [16, 48], centers: ['throat', 'spleen']},
            {id: '17-62', gates: [17, 62], centers: ['ajna', 'throat']},
            {id: '18-58', gates: [18, 58], centers: ['root', 'spleen']},
            {id: '19-49', gates: [19, 49], centers: ['root', 'spleen']},
            {id: '20-34', gates: [20, 34], centers: ['throat', 'sacral']},
            {id: '20-57', gates: [20, 57], centers: ['throat', 'spleen']},
            {id: '21-45', gates: [21, 45], centers: ['ego', 'throat']},
            {id: '23-43', gates: [23, 43], centers: ['ajna', 'throat']},
            {id: '24-61', gates: [24, 61], centers: ['head', 'ajna']},
            {id: '25-51', gates: [25, 51], centers: ['g', 'ego']},
            {id: '26-44', gates: [26, 44], centers: ['ego', 'spleen']},
            {id: '27-50', gates: [27, 50], centers: ['sacral', 'spleen']},
            {id: '28-38', gates: [28, 38], centers: ['root', 'spleen']},
            {id: '29-46', gates: [29, 46], centers: ['sacral', 'g']},
            {id: '30-41', gates: [30, 41], centers: ['root', 'spleen']},
            {id: '32-54', gates: [32, 54], centers: ['root', 'spleen']},
            {id: '34-57', gates: [34, 57], centers: ['sacral', 'spleen']},
            {id: '35-36', gates: [35, 36], centers: ['throat', 'spleen']},
            {id: '37-40', gates: [37, 40], centers: ['ego', 'spleen']},
            {id: '39-55', gates: [39, 55], centers: ['root', 'spleen']},
            {id: '42-53', gates: [42, 53], centers: ['root', 'sacral']},
            {id: '47-64', gates: [47, 64], centers: ['head', 'ajna']},
        ];
        
        // Center positions for bodygraph
        this.centerPositions = {
            head: {x: 250, y: 50, type: 'triangle'},
            ajna: {x: 250, y: 130, type: 'triangle'},
            throat: {x: 250, y: 210, type: 'square'},
            g: {x: 250, y: 290, type: 'diamond'},
            ego: {x: 170, y: 290, type: 'triangle'},
            spleen: {x: 330, y: 290, type: 'triangle'},
            sacral: {x: 250, y: 370, type: 'square'},
            root: {x: 250, y: 450, type: 'square'}
        };
    }
    
    async calculateChart(birthData) {
        try {
            // Convert birth time to UTC
            const birthDateTime = await this.convertToUTC(birthData);
            
            // Calculate planetary positions at birth
            const personalityPlanets = this.calculatePlanets(birthDateTime);
            
            // Calculate design time (88 solar degrees before birth)
            const designDateTime = this.calculateDesignTime(birthDateTime);
            const designPlanets = this.calculatePlanets(designDateTime);
            
            // Convert to gates
            const personalityGates = this.planetsToGates(personalityPlanets);
            const designGates = this.planetsToGates(designPlanets);
            
            // Combine all activated gates
            const allGates = [...new Set([...personalityGates.map(g => g.gate), ...designGates.map(g => g.gate)])];
            
            // Calculate channels
            const activeChannels = this.calculateChannels(allGates);
            
            // Calculate defined centers
            const definedCenters = this.calculateDefinedCenters(activeChannels);
            
            // Determine type and authority
            const type = this.determineType(definedCenters, activeChannels);
            const authority = this.determineAuthority(definedCenters);
            const strategy = this.determineStrategy(type);
            
            // Calculate profile
            const profile = this.calculateProfile(personalityPlanets.sun, designPlanets.sun);
            
            // Calculate definition
            const definition = this.calculateDefinition(definedCenters);
            
            // Calculate incarnation cross
            const cross = this.calculateIncarnationCross(personalityGates, designGates);
            
            return {
                personalityGates,
                designGates,
                activeChannels,
                definedCenters,
                type,
                authority,
                strategy,
                profile,
                definition,
                cross,
                birthData: birthData,
                timestamp: new Date().toISOString()
            };
            
        } catch (error) {
            console.error('Chart calculation error:', error);
            throw error;
        }
    }
    
    async convertToUTC(birthData) {
        // Use Luxon for timezone conversion
        const dt = luxon.DateTime.fromISO(`${birthData.date}T${birthData.time}`, {
            zone: birthData.timezone || 'UTC'
        });
        return dt.toJSDate();
    }
    
    calculatePlanets(dateTime) {
        const time = new Astronomy.AstroTime(dateTime);
        const planets = {};
        
        // Calculate Sun
        const sun = Astronomy.Ecliptic(Astronomy.SunPosition(time));
        planets.sun = this.normalizeEclipticLongitude(sun.elon);
        
        // Calculate Moon
        const moon = Astronomy.Ecliptic(Astronomy.GeoMoon(time));
        planets.moon = this.normalizeEclipticLongitude(moon.elon);
        
        // Calculate planets
        const planetNames = ['Mercury', 'Venus', 'Mars', 'Jupiter', 'Saturn', 'Uranus', 'Neptune', 'Pluto'];
        planetNames.forEach(name => {
            const body = Astronomy.Body[name];
            const pos = Astronomy.Ecliptic(Astronomy.GeoVector(body, time, false));
            planets[name.toLowerCase()] = this.normalizeEclipticLongitude(pos.elon);
        });
        
        // Calculate North Node
        const node = Astronomy.MoonNode(time);
        planets.northNode = this.normalizeEclipticLongitude(node);
        planets.southNode = (planets.northNode + 180) % 360;
        
        // Calculate Earth (opposite Sun)
        planets.earth = (planets.sun + 180) % 360;
        
        return planets;
    }
    
    normalizeEclipticLongitude(elon) {
        // Ensure longitude is between 0 and 360
        let normalized = elon % 360;
        if (normalized < 0) normalized += 360;
        return normalized;
    }
    
    calculateDesignTime(birthDateTime) {
        // Calculate 88 solar degrees before birth
        const birthTime = new Astronomy.AstroTime(birthDateTime);
        const birthSun = Astronomy.Ecliptic(Astronomy.SunPosition(birthTime));
        const targetDegree = (birthSun.elon - 88 + 360) % 360;
        
        // Search backwards for when sun was at target degree
        let searchTime = birthTime.AddDays(-100); // Start ~100 days before
        let bestTime = searchTime;
        let bestDiff = 360;
        
        for (let i = 0; i < 200; i++) {
            searchTime = searchTime.AddDays(0.5);
            const sun = Astronomy.Ecliptic(Astronomy.SunPosition(searchTime));
            const diff = Math.abs(sun.elon - targetDegree);
            
            if (diff < bestDiff) {
                bestDiff = diff;
                bestTime = searchTime;
            }
            
            if (diff < 0.01) break; // Good enough precision
        }
        
        return bestTime.date;
    }
    
    planetsToGates(planets) {
        const gates = [];
        
        Object.entries(planets).forEach(([planet, degree]) => {
            const gateInfo = this.degreeToGate(degree);
            gates.push({
                planet,
                degree,
                gate: gateInfo.gate,
                line: gateInfo.line,
                color: gateInfo.color,
                tone: gateInfo.tone
            });
        });
        
        return gates;
    }
    
    degreeToGate(degree) {
        // Each gate is 5.625 degrees (360/64)
        // Each line is 0.9375 degrees (5.625/6)
        // Each color is 0.15625 degrees (0.9375/6)
        // Each tone is 0.026042 degrees (0.15625/6)
        
        let gate = 0;
        let remainingDegree = degree;
        
        // Find which gate
        for (const [gateNum, startDegree] of Object.entries(this.gateStartDegrees)) {
            const nextStartDegree = (parseFloat(startDegree) + 5.625) % 360;
            
            if (degree >= parseFloat(startDegree) && 
                (degree < nextStartDegree || nextStartDegree < parseFloat(startDegree))) {
                gate = parseInt(gateNum);
                remainingDegree = degree - parseFloat(startDegree);
                break;
            }
        }
        
        // Calculate line, color, tone
        const line = Math.floor(remainingDegree / 0.9375) + 1;
        const lineRemainder = remainingDegree % 0.9375;
        const color = Math.floor(lineRemainder / 0.15625) + 1;
        const colorRemainder = lineRemainder % 0.15625;
        const tone = Math.floor(colorRemainder / 0.026042) + 1;
        
        return { gate, line, color, tone };
    }
    
    calculateChannels(gates) {
        const activeChannels = [];
        
        this.channels.forEach(channel => {
            if (gates.includes(channel.gates[0]) && gates.includes(channel.gates[1])) {
                activeChannels.push(channel);
            }
        });
        
        return activeChannels;
    }
    
    calculateDefinedCenters(channels) {
        const definedCenters = new Set();
        
        channels.forEach(channel => {
            channel.centers.forEach(center => {
                definedCenters.add(center);
            });
        });
        
        return Array.from(definedCenters);
    }
    
    determineType(definedCenters, channels) {
        const hasSacral = definedCenters.includes('sacral');
        const hasThroat = definedCenters.includes('throat');
        
        // Check for motor to throat connection
        let motorToThroat = false;
        const motorCenters = ['root', 'sacral', 'spleen', 'ego'];
        
        channels.forEach(channel => {
            const centers = channel.centers;
            if (centers.includes('throat')) {
                motorCenters.forEach(motor => {
                    if (centers.includes(motor)) {
                        motorToThroat = true;
                    }
                });
            }
        });
        
        // Reflector: no defined centers
        if (definedCenters.length === 0) {
            return 'Reflector';
        }
        
        // Generator types: defined sacral
        if (hasSacral) {
            if (motorToThroat) {
                return 'Manifesting Generator';
            }
            return 'Generator';
        }
        
        // Manifestor: motor to throat, no sacral
        if (motorToThroat) {
            return 'Manifestor';
        }
        
        // Projector: no sacral, no motor to throat
        return 'Projector';
    }
    
    determineAuthority(definedCenters) {
        // Authority hierarchy
        if (definedCenters.includes('spleen')) return 'Splenic';
        if (definedCenters.includes('sacral')) return 'Sacral';
        if (definedCenters.includes('ego')) return 'Ego';
        if (definedCenters.includes('g')) return 'Self-Projected';
        if (definedCenters.includes('throat')) return 'Mental';
        if (definedCenters.includes('ajna')) return 'Mental';
        return 'Lunar'; // Reflectors
    }
    
    determineStrategy(type) {
        const strategies = {
            'Generator': 'To Respond',
            'Manifesting Generator': 'To Respond',
            'Projector': 'Wait for Invitation',
            'Manifestor': 'To Inform',
            'Reflector': 'Wait a Lunar Cycle'
        };
        return strategies[type] || 'Unknown';
    }
    
    calculateProfile(personalitySun, designSun) {
        const personalityLine = this.degreeToGate(personalitySun).line;
        const designLine = this.degreeToGate(designSun).line;
        return `${personalityLine}/${designLine}`;
    }
    
    calculateDefinition(definedCenters) {
        const count = definedCenters.length;
        if (count === 0) return 'None';
        if (count <= 2) return 'Single';
        if (count <= 4) return 'Split';
        if (count <= 6) return 'Triple Split';
        return 'Quadruple Split';
    }
    
    calculateIncarnationCross(personalityGates, designGates) {
        // Get Sun and Earth gates
        const personalitySun = personalityGates.find(g => g.planet === 'sun');
        const personalityEarth = personalityGates.find(g => g.planet === 'earth');
        const designSun = designGates.find(g => g.planet === 'sun');
        const designEarth = designGates.find(g => g.planet === 'earth');
        
        if (!personalitySun || !designSun) return 'Unknown';
        
        // This is simplified - full cross names require a lookup table
        return `${personalitySun.gate}/${personalityEarth.gate} | ${designSun.gate}/${designEarth.gate}`;
    }
}

// Make calculator available globally
window.HDCalculator = new HumanDesignCalculator();
