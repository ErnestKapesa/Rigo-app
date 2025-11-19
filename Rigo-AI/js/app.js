// Main application controller
import CONFIG from './config.js';
import huggingFaceAPI from './api.js';
import supabaseClient from './supabase-client.js';

class SoilAnalysisApp {
    constructor() {
        this.currentAnalysis = null;
        this.isProcessing = false;
    }

    // Initialize the application
    async init() {
        console.log('🌱 Initializing Rigo-AI Soil Analysis Platform...');
        
        // Initialize Supabase
        await supabaseClient.init();
        
        // Set up event listeners
        this.setupEventListeners();
        
        // Load analysis history if on dashboard
        if (window.location.pathname.includes('dashboard')) {
            await this.loadAnalysisHistory();
        }
        
        console.log('✅ Application initialized');
    }

    // Set up event listeners
    setupEventListeners() {
        // Image upload handling
        const uploadInput = document.getElementById('imageUpload');
        const uploadArea = document.getElementById('uploadArea');
        
        if (uploadInput) {
            uploadInput.addEventListener('change', (e) => this.handleImageSelect(e));
        }
        
        if (uploadArea) {
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                if (file) this.processImage(file);
            });
        }

        // Analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.addEventListener('click', () => this.startAnalysis());
        }

        // New analysis button
        const newAnalysisBtn = document.getElementById('newAnalysisBtn');
        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());
        }
    }

    // Handle image selection
    handleImageSelect(event) {
        const file = event.target.files[0];
        if (file) {
            this.processImage(file);
        }
    }

    // Process and validate image
    processImage(file) {
        // Validate file type
        if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            this.showError('Please upload a valid image file (JPEG, PNG, or JPG)');
            return;
        }

        // Validate file size
        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            this.showError('Image size must be less than 5MB');
            return;
        }

        // Display preview
        this.displayImagePreview(file);
        
        // Store file for analysis
        this.currentImageFile = file;
        
        // Enable analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.classList.add('pulse-animation');
        }
    }

    // Display image preview
    displayImagePreview(file) {
        const reader = new FileReader();
        reader.onload = (e) => {
            const previewContainer = document.getElementById('imagePreview');
            const uploadArea = document.getElementById('uploadArea');
            
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <img src="${e.target.result}" alt="Soil sample" class="preview-image fade-in">
                    <div class="preview-overlay">
                        <button class="btn-remove" onclick="app.removeImage()">
                            <i class="fas fa-times"></i>
                        </button>
                    </div>
                `;
                previewContainer.style.display = 'block';
            }
            
            if (uploadArea) {
                uploadArea.style.display = 'none';
            }
        };
        reader.readAsDataURL(file);
    }

    // Remove image and reset
    removeImage() {
        this.currentImageFile = null;
        const previewContainer = document.getElementById('imagePreview');
        const uploadArea = document.getElementById('uploadArea');
        const analyzeBtn = document.getElementById('analyzeBtn');
        
        if (previewContainer) {
            previewContainer.style.display = 'none';
            previewContainer.innerHTML = '';
        }
        
        if (uploadArea) {
            uploadArea.style.display = 'flex';
        }
        
        if (analyzeBtn) {
            analyzeBtn.disabled = true;
            analyzeBtn.classList.remove('pulse-animation');
        }
    }

    // Start soil analysis
    async startAnalysis() {
        if (!this.currentImageFile || this.isProcessing) return;

        this.isProcessing = true;
        this.showLoadingState();

        try {
            // Step 1: Upload to Supabase (if configured)
            let imageUrl = null;
            if (supabaseClient.initialized) {
                this.updateLoadingMessage('Uploading image...');
                imageUrl = await supabaseClient.uploadImage(this.currentImageFile);
            }

            // Step 2: Analyze with Hugging Face
            this.updateLoadingMessage('Analyzing soil composition...');
            const analysis = await huggingFaceAPI.analyzeSoilImage(this.currentImageFile);
            
            // Step 3: Save to database (if configured)
            if (supabaseClient.initialized && imageUrl) {
                this.updateLoadingMessage('Saving results...');
                await supabaseClient.saveAnalysis(imageUrl, analysis);
            }

            // Step 4: Display results
            this.currentAnalysis = analysis;
            this.displayResults(analysis);

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Analysis failed. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideLoadingState();
        }
    }

    // Display analysis results
    displayResults(analysis) {
        const resultsContainer = document.getElementById('resultsContainer');
        if (!resultsContainer) return;

        const soilInfo = CONFIG.SOIL_TYPES[analysis.soilType] || {};
        
        resultsContainer.innerHTML = `
            <div class="results-content fade-in">
                <div class="result-header">
                    <h2>Analysis Complete</h2>
                    <div class="confidence-badge" style="background: ${soilInfo.color}20; color: ${soilInfo.color}">
                        ${analysis.confidence}% Confidence
                    </div>
                </div>

                <div class="soil-type-card" style="border-left: 4px solid ${soilInfo.color}">
                    <h3>${analysis.soilType.charAt(0).toUpperCase() + analysis.soilType.slice(1)} Soil</h3>
                    <p class="soil-description">${soilInfo.description}</p>
                </div>

                <div class="characteristics-grid">
                    <div class="char-card">
                        <i class="fas fa-hand-paper"></i>
                        <h4>Texture</h4>
                        <p>${analysis.characteristics.texture}</p>
                    </div>
                    <div class="char-card">
                        <i class="fas fa-tint"></i>
                        <h4>Drainage</h4>
                        <p>${analysis.characteristics.drainage}</p>
                    </div>
                    <div class="char-card">
                        <i class="fas fa-water"></i>
                        <h4>Water Retention</h4>
                        <p>${analysis.characteristics.waterRetention}</p>
                    </div>
                    <div class="char-card">
                        <i class="fas fa-tools"></i>
                        <h4>Workability</h4>
                        <p>${analysis.characteristics.workability}</p>
                    </div>
                </div>

                <div class="nutrients-section">
                    <h3><i class="fas fa-flask"></i> Nutrient Levels</h3>
                    <div class="nutrient-bars">
                        <div class="nutrient-item">
                            <label>Nitrogen (N)</label>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${analysis.nutrients.nitrogen}%; background: #04CB57"></div>
                                <span>${analysis.nutrients.nitrogen}%</span>
                            </div>
                        </div>
                        <div class="nutrient-item">
                            <label>Phosphorus (P)</label>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${analysis.nutrients.phosphorus}%; background: #FF6B35"></div>
                                <span>${analysis.nutrients.phosphorus}%</span>
                            </div>
                        </div>
                        <div class="nutrient-item">
                            <label>Potassium (K)</label>
                            <div class="progress-bar">
                                <div class="progress-fill" style="width: ${analysis.nutrients.potassium}%; background: #4ECDC4"></div>
                                <span>${analysis.nutrients.potassium}%</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="ph-section">
                    <h3><i class="fas fa-vial"></i> pH Level</h3>
                    <div class="ph-indicator">
                        <div class="ph-value">${analysis.pH.value}</div>
                        <div class="ph-range">${analysis.pH.range}</div>
                        <div class="ph-status">${analysis.pH.status}</div>
                    </div>
                </div>

                <div class="recommendations-section">
                    <h3><i class="fas fa-lightbulb"></i> Recommendations</h3>
                    <ul class="recommendations-list">
                        ${analysis.recommendations.map(rec => `<li>${rec}</li>`).join('')}
                    </ul>
                </div>

                <div class="action-buttons">
                    <button id="downloadReportBtn" class="btn btn-primary" onclick="app.downloadReport()">
                        <i class="fas fa-download"></i> Download Report
                    </button>
                    <button id="newAnalysisBtn" class="btn btn-secondary" onclick="app.resetAnalysis()">
                        <i class="fas fa-plus"></i> New Analysis
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Download analysis report as PDF/Image
    downloadReport() {
        if (!this.currentAnalysis) return;

        const reportData = {
            timestamp: new Date().toLocaleString(),
            soilType: this.currentAnalysis.soilType,
            confidence: this.currentAnalysis.confidence,
            characteristics: this.currentAnalysis.characteristics,
            nutrients: this.currentAnalysis.nutrients,
            pH: this.currentAnalysis.pH,
            recommendations: this.currentAnalysis.recommendations
        };

        // Create downloadable JSON report
        const dataStr = JSON.stringify(reportData, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `soil-analysis-${Date.now()}.json`;
        link.click();
        URL.revokeObjectURL(url);

        this.showSuccess('Report downloaded successfully!');
    }

    // Reset analysis
    resetAnalysis() {
        this.currentAnalysis = null;
        this.removeImage();
        
        const resultsContainer = document.getElementById('resultsContainer');
        if (resultsContainer) {
            resultsContainer.style.display = 'none';
            resultsContainer.innerHTML = '';
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Load analysis history
    async loadAnalysisHistory() {
        try {
            const history = await supabaseClient.getAnalysisHistory();
            this.displayHistory(history);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }

    // Display analysis history
    displayHistory(history) {
        const historyContainer = document.getElementById('historyContainer');
        if (!historyContainer || !history.length) return;

        historyContainer.innerHTML = history.map(item => `
            <div class="history-card fade-in">
                <img src="${item.image_url}" alt="Soil sample">
                <div class="history-info">
                    <h4>${item.results.soilType} Soil</h4>
                    <p>${new Date(item.created_at).toLocaleDateString()}</p>
                    <span class="confidence">${item.results.confidence}% confidence</span>
                </div>
            </div>
        `).join('');
    }

    // UI Helper: Show loading state
    showLoadingState() {
        const loader = document.getElementById('loadingOverlay');
        if (loader) {
            loader.style.display = 'flex';
        }
    }

    // UI Helper: Hide loading state
    hideLoadingState() {
        const loader = document.getElementById('loadingOverlay');
        if (loader) {
            loader.style.display = 'none';
        }
    }

    // UI Helper: Update loading message
    updateLoadingMessage(message) {
        const loadingText = document.getElementById('loadingText');
        if (loadingText) {
            loadingText.textContent = message;
        }
    }

    // UI Helper: Show error message
    showError(message) {
        this.showNotification(message, 'error');
    }

    // UI Helper: Show success message
    showSuccess(message) {
        this.showNotification(message, 'success');
    }

    // UI Helper: Show notification
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type} fade-in`;
        notification.innerHTML = `
            <i class="fas fa-${type === 'error' ? 'exclamation-circle' : 'check-circle'}"></i>
            <span>${message}</span>
        `;
        
        document.body.appendChild(notification);
        
        setTimeout(() => {
            notification.classList.add('fade-out');
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize app when DOM is ready
let app;
document.addEventListener('DOMContentLoaded', () => {
    app = new SoilAnalysisApp();
    app.init();
});

// Export for global access
window.app = app;
