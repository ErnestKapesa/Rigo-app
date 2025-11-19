// API utilities for Hugging Face integration
import CONFIG from './config.js';

class HuggingFaceAPI {
    constructor() {
        this.apiUrl = CONFIG.HF_API_URL + CONFIG.HF_MODEL_ID;
        this.retryAttempts = 3;
        this.retryDelay = 2000;
    }

    // Analyze soil image using Hugging Face model
    async analyzeSoilImage(imageFile) {
        if (!CONFIG.HF_API_TOKEN) {
            // Demo mode - return mock data
            return this.getMockAnalysis();
        }

        try {
            const result = await this.queryWithRetry(imageFile);
            return this.processSoilAnalysis(result);
        } catch (error) {
            console.error('Soil analysis failed:', error);
            throw new Error('Failed to analyze soil image. Please try again.');
        }
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
