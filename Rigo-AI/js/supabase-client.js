// Supabase client initialization and utilities
import CONFIG from './config.js';

class SupabaseClient {
    constructor() {
        this.client = null;
        this.initialized = false;
    }

    // Initialize Supabase client
    async init() {
        if (!CONFIG.SUPABASE_URL || !CONFIG.SUPABASE_ANON_KEY) {
            console.warn('Supabase not configured. Running in demo mode.');
            this.initialized = false;
            return false;
        }

        try {
            // Check if Supabase is loaded from CDN
            if (typeof window.supabase === 'undefined') {
                console.warn('Supabase library not loaded. Running in demo mode.');
                this.initialized = false;
                return false;
            }
            
            // Load Supabase from CDN
            const { createClient } = window.supabase;
            this.client = createClient(CONFIG.SUPABASE_URL, CONFIG.SUPABASE_ANON_KEY);
            this.initialized = true;
            console.log('✅ Supabase initialized');
            return true;
        } catch (error) {
            console.error('Failed to initialize Supabase:', error);
            this.initialized = false;
            return false;
        }
    }

    // Upload image to Supabase Storage
    async uploadImage(file) {
        if (!this.initialized) {
            throw new Error('Supabase not initialized');
        }

        const fileName = `${Date.now()}_${file.name}`;
        const { data, error } = await this.client.storage
            .from('soil-images')
            .upload(fileName, file, {
                cacheControl: '3600',
                upsert: false
            });

        if (error) throw error;

        // Get public URL
        const { data: urlData } = this.client.storage
            .from('soil-images')
            .getPublicUrl(fileName);

        return urlData.publicUrl;
    }

    // Save analysis result to database
    async saveAnalysis(imageUrl, results) {
        if (!this.initialized) {
            throw new Error('Supabase not initialized');
        }

        const { data, error } = await this.client
            .from('analyses')
            .insert([
                {
                    image_url: imageUrl,
                    results: results,
                    created_at: new Date().toISOString()
                }
            ])
            .select();

        if (error) throw error;
        return data[0];
    }

    // Get user's analysis history
    async getAnalysisHistory(limit = 10) {
        if (!this.initialized) {
            return [];
        }

        const { data, error } = await this.client
            .from('analyses')
            .select('*')
            .order('created_at', { ascending: false })
            .limit(limit);

        if (error) throw error;
        return data;
    }
}

// Export singleton instance
const supabaseClient = new SupabaseClient();
export default supabaseClient;
