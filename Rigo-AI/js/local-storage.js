// Local storage database for analysis history
// Uses browser localStorage to save analysis data

class LocalDatabase {
    constructor() {
        this.storageKey = 'rigo_ai_analyses';
        this.maxRecords = 50; // Keep last 50 analyses
    }

    // Save analysis to local storage
    saveAnalysis(imageData, results) {
        try {
            const analysis = {
                id: this.generateId(),
                timestamp: new Date().toISOString(),
                imageData: imageData, // Base64 image
                results: results,
                soilType: results.soilType,
                confidence: results.confidence
            };

            const analyses = this.getAllAnalyses();
            analyses.unshift(analysis); // Add to beginning

            // Keep only last maxRecords
            if (analyses.length > this.maxRecords) {
                analyses.splice(this.maxRecords);
            }

            localStorage.setItem(this.storageKey, JSON.stringify(analyses));
            console.log('✅ Analysis saved to local database');
            
            return analysis;
        } catch (error) {
            console.error('Failed to save analysis:', error);
            return null;
        }
    }

    // Get all analyses from storage
    getAllAnalyses() {
        try {
            const data = localStorage.getItem(this.storageKey);
            return data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('Failed to load analyses:', error);
            return [];
        }
    }

    // Get analysis by ID
    getAnalysisById(id) {
        const analyses = this.getAllAnalyses();
        return analyses.find(a => a.id === id);
    }

    // Get recent analyses (last N)
    getRecentAnalyses(count = 10) {
        const analyses = this.getAllAnalyses();
        return analyses.slice(0, count);
    }

    // Delete analysis by ID
    deleteAnalysis(id) {
        try {
            const analyses = this.getAllAnalyses();
            const filtered = analyses.filter(a => a.id !== id);
            localStorage.setItem(this.storageKey, JSON.stringify(filtered));
            console.log('✅ Analysis deleted');
            return true;
        } catch (error) {
            console.error('Failed to delete analysis:', error);
            return false;
        }
    }

    // Clear all analyses
    clearAll() {
        try {
            localStorage.removeItem(this.storageKey);
            console.log('✅ All analyses cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear analyses:', error);
            return false;
        }
    }

    // Export all data as JSON file
    exportToJSON() {
        const analyses = this.getAllAnalyses();
        const dataStr = JSON.stringify(analyses, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `rigo-ai-history-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);
        console.log('✅ Data exported to JSON');
    }

    // Import data from JSON file
    async importFromJSON(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = (e) => {
                try {
                    const imported = JSON.parse(e.target.result);
                    if (Array.isArray(imported)) {
                        localStorage.setItem(this.storageKey, JSON.stringify(imported));
                        console.log('✅ Data imported successfully');
                        resolve(imported.length);
                    } else {
                        reject(new Error('Invalid JSON format'));
                    }
                } catch (error) {
                    reject(error);
                }
            };
            reader.onerror = reject;
            reader.readAsText(file);
        });
    }

    // Get statistics
    getStatistics() {
        const analyses = this.getAllAnalyses();
        
        const soilTypeCounts = {};
        analyses.forEach(a => {
            soilTypeCounts[a.soilType] = (soilTypeCounts[a.soilType] || 0) + 1;
        });

        const avgConfidence = analyses.length > 0
            ? analyses.reduce((sum, a) => sum + parseFloat(a.confidence), 0) / analyses.length
            : 0;

        return {
            totalAnalyses: analyses.length,
            soilTypeCounts: soilTypeCounts,
            averageConfidence: avgConfidence.toFixed(1),
            oldestAnalysis: analyses[analyses.length - 1]?.timestamp,
            newestAnalysis: analyses[0]?.timestamp
        };
    }

    // Generate unique ID
    generateId() {
        return `analysis_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    }

    // Get storage size
    getStorageSize() {
        const data = localStorage.getItem(this.storageKey);
        const bytes = data ? new Blob([data]).size : 0;
        const kb = (bytes / 1024).toFixed(2);
        const mb = (bytes / 1024 / 1024).toFixed(2);
        return { bytes, kb, mb };
    }
}

// Export singleton instance
const localDB = new LocalDatabase();
export default localDB;
