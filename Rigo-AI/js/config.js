// Configuration management
// Note: In production, use environment variables. For demo, we'll use placeholder values.

const CONFIG = {
    // Hugging Face Configuration
    HF_API_TOKEN: '', // Set this in your deployment
    HF_MODEL_ID: 'google/vit-base-patch16-224',
    HF_API_URL: 'https://api-inference.huggingface.co/models/',
    
    // Supabase Configuration
    SUPABASE_URL: '', // Set this after creating Supabase project
    SUPABASE_ANON_KEY: '', // Set this after creating Supabase project
    
    // Application Settings
    MAX_IMAGE_SIZE: 5 * 1024 * 1024, // 5MB
    ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
    
    // Soil type mappings (customize based on your model)
    SOIL_TYPES: {
        'clay': { color: '#8B4513', description: 'Heavy, nutrient-rich soil with poor drainage' },
        'sandy': { color: '#F4A460', description: 'Light, well-draining soil with low nutrients' },
        'loamy': { color: '#654321', description: 'Ideal balanced soil with good drainage and nutrients' },
        'silty': { color: '#A0522D', description: 'Smooth, moisture-retentive soil' },
        'peaty': { color: '#2F1B0C', description: 'Organic-rich, acidic soil' },
        'chalky': { color: '#D3D3D3', description: 'Alkaline soil with good drainage' }
    }
};

// Validate configuration
CONFIG.isConfigured = () => {
    return CONFIG.HF_API_TOKEN && CONFIG.SUPABASE_URL && CONFIG.SUPABASE_ANON_KEY;
};

export default CONFIG;
