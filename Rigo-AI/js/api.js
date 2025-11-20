// API utilities for Hugging Face integration
import CONFIG from './config.prod.js';

class HuggingFaceAPI {
    constructor() {
        this.apiUrl = CONFIG.HF_API_URL + CONFIG.HF_MODEL_ID;
        this.retryAttempts = 3;
        this.retryDelay = 2000;
    }

    // Analyze soil image using Hugging Face model
    async analyzeSoilImage(imageFile) {
        if (!CONFIG.HF_API_TOKEN || CONFIG.HF_API_TOKEN.trim() === '') {
            console.warn('⚠️ No API token - Using DEMO MODE with mock data');
            return this.getMockAnalysis();
        }

        console.log('✅ Using REAL AI - Hugging Face API');
        console.log('📤 Step 1: Analyzing image content...');
        
        try {
            // Step 1: Get image classification
            const visionResult = await this.queryWithRetry(imageFile);
            console.log('📊 Vision AI result:', visionResult);
            
            // Step 2: Validate it's actually soil
            const isSoil = await this.validateSoilImage(visionResult);
            
            if (!isSoil) {
                throw new Error('This does not appear to be a soil image. Please upload a clear photo of soil.');
            }
            
            console.log('✅ Soil detected - Processing analysis...');
            
            // Step 3: Analyze soil characteristics
            const soilAnalysis = await this.analyzeSoilCharacteristics(imageFile, visionResult);
            
            console.log('✅ Real AI analysis complete:', soilAnalysis);
            return soilAnalysis;
            
        } catch (error) {
            console.error('❌ Real AI analysis failed:', error);
            throw error; // Don't fall back - show error to user
        }
    }
    
    // Validate if image contains soil
    async validateSoilImage(visionResult) {
        // Check if any of the top predictions relate to soil/earth
        const soilKeywords = ['soil', 'dirt', 'earth', 'ground', 'sand', 'clay', 'mud', 'terrain', 'land', 'brown', 'agricultural'];
        
        const topPredictions = visionResult.slice(0, 5);
        const hasSoilMatch = topPredictions.some(pred => 
            soilKeywords.some(keyword => 
                pred.label.toLowerCase().includes(keyword)
            )
        );
        
        console.log('🔍 Soil validation:', hasSoilMatch ? 'PASSED' : 'FAILED');
        console.log('📋 Top predictions:', topPredictions.map(p => p.label).join(', '));
        
        return hasSoilMatch;
    }
    
    // Analyze soil characteristics using color and texture
    async analyzeSoilCharacteristics(imageFile, visionResult) {
        // Analyze image colors to determine soil type
        const colorAnalysis = await this.analyzeImageColors(imageFile);
        
        // Combine AI predictions with color analysis
        const soilType = this.determineSoilType(visionResult, colorAnalysis);
        
        // Calculate confidence based on multiple factors
        const confidence = this.calculateConfidence(visionResult, colorAnalysis, soilType);
        
        return {
            soilType: soilType,
            confidence: confidence,
            characteristics: this.getSoilCharacteristics(soilType),
            recommendations: this.getSoilRecommendations(soilType),
            nutrients: this.estimateNutrients(soilType),
            pH: this.estimatePH(soilType),
            colorAnalysis: colorAnalysis,
            rawResults: visionResult.slice(0, 3)
        };
    }
    
    // Analyze image colors to help determine soil type
    async analyzeImageColors(imageFile) {
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    canvas.width = img.width;
                    canvas.height = img.height;
                    const ctx = canvas.getContext('2d');
                    ctx.drawImage(img, 0, 0);
                    
                    // Sample colors from center of image
                    const centerX = Math.floor(img.width / 2);
                    const centerY = Math.floor(img.height / 2);
                    const sampleSize = 50;
                    
                    const imageData = ctx.getImageData(
                        centerX - sampleSize/2, 
                        centerY - sampleSize/2, 
                        sampleSize, 
                        sampleSize
                    );
                    
                    // Calculate average RGB
                    let r = 0, g = 0, b = 0;
                    for (let i = 0; i < imageData.data.length; i += 4) {
                        r += imageData.data[i];
                        g += imageData.data[i + 1];
                        b += imageData.data[i + 2];
                    }
                    const pixels = imageData.data.length / 4;
                    r = Math.round(r / pixels);
                    g = Math.round(g / pixels);
                    b = Math.round(b / pixels);
                    
                    // Determine dominant color
                    const colors = { red: r, green: g, blue: b };
                    const dominant = Object.keys(colors).reduce((a, b) => 
                        colors[a] > colors[b] ? a : b
                    );
                    
                    resolve({
                        rgb: { r, g, b },
                        dominant: dominant,
                        brightness: (r + g + b) / 3,
                        isDark: (r + g + b) / 3 < 100
                    });
                };
                img.src = e.target.result;
            };
            reader.readAsDataURL(imageFile);
        });
    }
    
    // Determine soil type from AI + color analysis
    determineSoilType(visionResult, colorAnalysis) {
        const topLabel = visionResult[0].label.toLowerCase();
        const { rgb, isDark, dominant } = colorAnalysis;
        
        // Dark soil = likely peaty or black soil
        if (isDark && rgb.r < 80) {
            return 'peaty';
        }
        
        // Red dominant = red soil
        if (dominant === 'red' && rgb.r > 120) {
            return 'clay';
        }
        
        // Light/sandy color
        if (rgb.r > 150 && rgb.g > 140 && rgb.b > 120) {
            return 'sandy';
        }
        
        // Check AI labels
        if (topLabel.includes('clay')) return 'clay';
        if (topLabel.includes('sand')) return 'sandy';
        if (topLabel.includes('loam')) return 'loamy';
        if (topLabel.includes('silt')) return 'silty';
        if (topLabel.includes('peat')) return 'peaty';
        if (topLabel.includes('chalk')) return 'chalky';
        
        // Default to loamy for brown/medium soils
        return 'loamy';
    }
    
    // Calculate confidence score
    calculateConfidence(visionResult, colorAnalysis, soilType) {
        let confidence = visionResult[0].score * 100;
        
        // Adjust based on color consistency
        const expectedColors = {
            'clay': { r: 120, g: 80, b: 60 },
            'sandy': { r: 180, g: 160, b: 130 },
            'loamy': { r: 100, g: 80, b: 60 },
            'peaty': { r: 40, g: 30, b: 20 }
        };
        
        if (expectedColors[soilType]) {
            const expected = expectedColors[soilType];
            const actual = colorAnalysis.rgb;
            const colorMatch = 100 - (
                Math.abs(expected.r - actual.r) +
                Math.abs(expected.g - actual.g) +
                Math.abs(expected.b - actual.b)
            ) / 7.65; // Normalize to 0-100
            
            // Blend AI confidence with color match
            confidence = (confidence * 0.6) + (colorMatch * 0.4);
        }
        
        return Math.min(95, Math.max(60, confidence)).toFixed(1);
    }

    // Query Hugging Face API with retry logic
    async queryWithRetry(imageFile, attempt = 1) {
        try {
            const response = await fetch(this.apiUrl, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${CONFIG.HF_API_TOKEN}`,
                    'Content-Type': 'application/octet-stream'
                },
                body: imageFile
            });

            if (!response.ok) {
                if (response.status === 503 && attempt < this.retryAttempts) {
                    // Model is loading, retry after delay
                    await this.sleep(this.retryDelay * attempt);
                    return this.queryWithRetry(imageFile, attempt + 1);
                }
                throw new Error(`API request failed: ${response.statusText}`);
            }

            return await response.json();
        } catch (error) {
            if (attempt < this.retryAttempts) {
                await this.sleep(this.retryDelay);
                return this.queryWithRetry(imageFile, attempt + 1);
            }
            throw error;
        }
    }

    // Process and enhance soil analysis results
    processSoilAnalysis(apiResults) {
        // Map AI results to soil characteristics
        const topResult = apiResults[0];
        const soilType = this.mapToSoilType(topResult.label);
        const confidence = (topResult.score * 100).toFixed(1);

        return {
            soilType: soilType,
            confidence: confidence,
            characteristics: this.getSoilCharacteristics(soilType),
            recommendations: this.getSoilRecommendations(soilType),
            nutrients: this.estimateNutrients(soilType),
            pH: this.estimatePH(soilType),
            rawResults: apiResults.slice(0, 3) // Top 3 predictions
        };
    }

    // Map AI classification to soil types
    mapToSoilType(label) {
        const labelLower = label.toLowerCase();
        
        if (labelLower.includes('clay') || labelLower.includes('heavy')) return 'clay';
        if (labelLower.includes('sand') || labelLower.includes('light')) return 'sandy';
        if (labelLower.includes('loam') || labelLower.includes('balanced')) return 'loamy';
        if (labelLower.includes('silt')) return 'silty';
        if (labelLower.includes('peat') || labelLower.includes('organic')) return 'peaty';
        if (labelLower.includes('chalk') || labelLower.includes('alkaline')) return 'chalky';
        
        // Default to loamy for unknown types
        return 'loamy';
    }

    // Get soil characteristics
    getSoilCharacteristics(soilType) {
        const characteristics = {
            clay: {
                texture: 'Heavy and sticky when wet',
                drainage: 'Poor',
                waterRetention: 'High',
                workability: 'Difficult'
            },
            sandy: {
                texture: 'Gritty and loose',
                drainage: 'Excellent',
                waterRetention: 'Low',
                workability: 'Easy'
            },
            loamy: {
                texture: 'Smooth and slightly gritty',
                drainage: 'Good',
                waterRetention: 'Moderate',
                workability: 'Easy'
            },
            silty: {
                texture: 'Smooth and soapy',
                drainage: 'Moderate',
                waterRetention: 'High',
                workability: 'Moderate'
            },
            peaty: {
                texture: 'Spongy and fibrous',
                drainage: 'Good',
                waterRetention: 'Very High',
                workability: 'Easy'
            },
            chalky: {
                texture: 'Stony and gritty',
                drainage: 'Excellent',
                waterRetention: 'Low',
                workability: 'Moderate'
            }
        };

        return characteristics[soilType] || characteristics.loamy;
    }

    // Get soil recommendations
    getSoilRecommendations(soilType) {
        const recommendations = {
            clay: [
                'Add organic matter to improve drainage',
                'Avoid working when wet',
                'Consider raised beds',
                'Grow crops: Broccoli, cabbage, beans'
            ],
            sandy: [
                'Add compost to retain moisture',
                'Mulch heavily to prevent drying',
                'Fertilize regularly',
                'Grow crops: Carrots, potatoes, lettuce'
            ],
            loamy: [
                'Maintain with regular compost',
                'Ideal for most crops',
                'Practice crop rotation',
                'Grow crops: Tomatoes, peppers, most vegetables'
            ],
            silty: [
                'Add organic matter for structure',
                'Avoid compaction',
                'Mulch to prevent erosion',
                'Grow crops: Vegetables, grasses'
            ],
            peaty: [
                'Add lime to reduce acidity',
                'Ensure good drainage',
                'Rich in nutrients',
                'Grow crops: Root vegetables, brassicas'
            ],
            chalky: [
                'Add organic matter regularly',
                'Choose alkaline-tolerant plants',
                'Mulch to retain moisture',
                'Grow crops: Spinach, beets, cabbage'
            ]
        };

        return recommendations[soilType] || recommendations.loamy;
    }

    // Estimate nutrient levels
    estimateNutrients(soilType) {
        const nutrients = {
            clay: { nitrogen: 75, phosphorus: 70, potassium: 80 },
            sandy: { nitrogen: 40, phosphorus: 35, potassium: 30 },
            loamy: { nitrogen: 70, phosphorus: 65, potassium: 70 },
            silty: { nitrogen: 65, phosphorus: 60, potassium: 55 },
            peaty: { nitrogen: 85, phosphorus: 50, potassium: 45 },
            chalky: { nitrogen: 50, phosphorus: 55, potassium: 60 }
        };

        return nutrients[soilType] || nutrients.loamy;
    }

    // Estimate pH level
    estimatePH(soilType) {
        const pH = {
            clay: { value: 6.5, range: '6.0-7.0', status: 'Slightly Acidic to Neutral' },
            sandy: { value: 6.0, range: '5.5-6.5', status: 'Acidic' },
            loamy: { value: 6.8, range: '6.5-7.5', status: 'Neutral' },
            silty: { value: 6.5, range: '6.0-7.0', status: 'Slightly Acidic to Neutral' },
            peaty: { value: 5.0, range: '4.0-5.5', status: 'Very Acidic' },
            chalky: { value: 7.5, range: '7.0-8.5', status: 'Alkaline' }
        };

        return pH[soilType] || pH.loamy;
    }

    // Mock analysis for demo mode
    getMockAnalysis() {
        return new Promise((resolve) => {
            setTimeout(() => {
                resolve({
                    soilType: 'loamy',
                    confidence: '87.5',
                    characteristics: this.getSoilCharacteristics('loamy'),
                    recommendations: this.getSoilRecommendations('loamy'),
                    nutrients: this.estimateNutrients('loamy'),
                    pH: this.estimatePH('loamy'),
                    rawResults: [
                        { label: 'loamy soil', score: 0.875 },
                        { label: 'clay soil', score: 0.089 },
                        { label: 'sandy soil', score: 0.036 }
                    ]
                });
            }, 2000); // Simulate API delay
        });
    }

    // Utility: Sleep function
    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
}

// Export singleton instance
const huggingFaceAPI = new HuggingFaceAPI();
export default huggingFaceAPI;
