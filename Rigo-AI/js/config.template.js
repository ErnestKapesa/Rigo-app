// Configuration template for deployment
// Copy this to config.js and add your API token

const CONFIG = {
    // Hugging Face API Configuration
    // Get your token from: https://huggingface.co/settings/tokens
    HF_API_TOKEN: 'YOUR_HUGGING_FACE_TOKEN_HERE',
    HF_MODEL_ID: 'facebook/bart-large-mnli',
    HF_VISION_MODEL: 'google/vit-base-patch16-224',
    HF_API_URL: 'https://api-inference.huggingface.co/models/',
    
    // Soil type labels for classification
    SOIL_LABELS: [
        'clay soil',
        'sandy soil', 
        'loamy soil',
        'silty soil',
        'peaty soil',
        'chalky soil',
        'red soil',
        'black soil',
        'not soil - invalid image'
    ],
    
    // Supabase Configuration (optional)
    SUPABASE_URL: '',
    SUPABASE_ANON_KEY: '',
    
    // Application Settings
    MAX_IMAGE_SIZE: 5242880, // 5MB in bytes
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    
    // Soil Type Definitions
    SOIL_TYPES: {
        clay: {
            color: '#8B4513',
            description: 'Heavy soil with fine particles, excellent for nutrients but poor drainage'
        },
        sandy: {
            color: '#F4A460',
            description: 'Light, gritty soil with excellent drainage but low nutrient retention'
        },
        loamy: {
            color: '#6B4423',
            description: 'Ideal balanced soil with good drainage and nutrient retention'
        },
        silty: {
            color: '#A0826D',
            description: 'Smooth soil with good fertility and moderate drainage'
        },
        peaty: {
            color: '#3E2723',
            description: 'Dark, organic-rich soil with high water retention'
        },
        chalky: {
            color: '#D3D3D3',
            description: 'Alkaline soil with stones, free-draining but low nutrients'
        }
    },
    
    // Helper methods
    isHuggingFaceConfigured() {
        return Boolean(this.HF_API_TOKEN && this.HF_API_TOKEN.trim() && this.HF_API_TOKEN !== 'YOUR_HUGGING_FACE_TOKEN_HERE');
    },
    
    isSupabaseConfigured() {
        return Boolean(this.SUPABASE_URL && this.SUPABASE_ANON_KEY);
    },
    
    isFullyConfigured() {
        return this.isHuggingFaceConfigured() && this.isSupabaseConfigured();
    },
    
    validateImageFile(file) {
        if (!file) {
            return { valid: false, error: 'No file provided' };
        }
        
        if (file.size > this.MAX_IMAGE_SIZE) {
            return { 
                valid: false, 
                error: `File size exceeds ${(this.MAX_IMAGE_SIZE / 1024 / 1024).toFixed(1)}MB limit` 
            };
        }
        
        if (!this.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            return { 
                valid: false, 
                error: 'Invalid file type. Please upload JPEG or PNG images only' 
            };
        }
        
        return { valid: true };
    }
};

export default CONFIG;
