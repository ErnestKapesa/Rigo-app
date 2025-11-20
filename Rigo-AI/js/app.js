// Main application controller
import CONFIG from './config.prod.js';
import huggingFaceAPI from './api.js';
import supabaseClient from './supabase-client.js';
import localDB from './local-storage.js';

class SoilAnalysisApp {
    constructor() {
        this.currentAnalysis = null;
        this.isProcessing = false;
    }

    // Initialize the application
    async init() {
        console.log('🌱 Initializing Rigo-AI Soil Analysis Platform...');
        
        try {
            // Initialize Supabase
            await supabaseClient.init();
            
            // Set up event listeners
            this.setupEventListeners();
            
            // Load analysis history if on dashboard
            if (window.location.pathname.includes('dashboard')) {
                await this.loadAnalysisHistory();
            }
            
            console.log('✅ Application initialized successfully');
            console.log('📊 Demo mode:', !CONFIG.HF_API_TOKEN);
        } catch (error) {
            console.error('❌ Initialization error:', error);
            this.showError('Failed to initialize application. Please refresh the page.');
        }
    }

    // Set up event listeners
    setupEventListeners() {
        console.log('Setting up event listeners...');
        
        // Image upload handling
        const uploadInput = document.getElementById('imageUpload');
        const uploadArea = document.getElementById('uploadArea');
        
        if (uploadInput) {
            console.log('✅ Upload input found');
            uploadInput.addEventListener('change', (e) => this.handleImageSelect(e));
        } else {
            console.warn('⚠️ Upload input not found');
        }
        
        if (uploadArea) {
            console.log('✅ Upload area found');
            
            // Drag and drop
            uploadArea.addEventListener('dragover', (e) => {
                e.preventDefault();
                uploadArea.classList.add('drag-over');
                console.log('Drag over');
            });
            
            uploadArea.addEventListener('dragleave', () => {
                uploadArea.classList.remove('drag-over');
                console.log('Drag leave');
            });
            
            uploadArea.addEventListener('drop', (e) => {
                e.preventDefault();
                uploadArea.classList.remove('drag-over');
                const file = e.dataTransfer.files[0];
                console.log('File dropped:', file);
                if (file) this.processImage(file);
            });
        } else {
            console.warn('⚠️ Upload area not found');
        }

        // Analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            console.log('✅ Analyze button found');
            analyzeBtn.addEventListener('click', () => this.startAnalysis());
        } else {
            console.warn('⚠️ Analyze button not found');
        }

        // New analysis button
        const newAnalysisBtn = document.getElementById('newAnalysisBtn');
        if (newAnalysisBtn) {
            newAnalysisBtn.addEventListener('click', () => this.resetAnalysis());
        }
        
        console.log('✅ Event listeners setup complete');
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
        console.log('Processing image:', file.name, file.type, file.size);
        
        // Validate file type
        if (!CONFIG.ALLOWED_IMAGE_TYPES.includes(file.type)) {
            console.error('Invalid file type:', file.type);
            this.showError('Please upload a valid image file (JPEG, PNG, or JPG)');
            return;
        }

        // Validate file size
        if (file.size > CONFIG.MAX_IMAGE_SIZE) {
            console.error('File too large:', file.size);
            this.showError('Image size must be less than 5MB');
            return;
        }

        console.log('✅ Image validation passed');
        
        // Display preview
        this.displayImagePreview(file);
        
        // Store file for analysis
        this.currentImageFile = file;
        
        // Enable analyze button
        const analyzeBtn = document.getElementById('analyzeBtn');
        if (analyzeBtn) {
            analyzeBtn.disabled = false;
            analyzeBtn.classList.add('pulse-animation');
            console.log('✅ Analyze button enabled');
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
            // Step 1: Convert image to base64 for local storage
            this.updateLoadingMessage('Preparing image...');
            const imageBase64 = await this.fileToBase64(this.currentImageFile);
            
            // Step 2: Upload to Supabase (if configured)
            let imageUrl = null;
            if (supabaseClient.initialized) {
                this.updateLoadingMessage('Uploading image...');
                imageUrl = await supabaseClient.uploadImage(this.currentImageFile);
            }

            // Step 3: Analyze with Hugging Face AI
            this.updateLoadingMessage('Analyzing soil with AI...');
            const analysis = await huggingFaceAPI.analyzeSoilImage(this.currentImageFile);
            
            // Step 4: Save to local database
            this.updateLoadingMessage('Saving to local database...');
            localDB.saveAnalysis(imageBase64, analysis);
            
            // Step 5: Save to Supabase (if configured)
            if (supabaseClient.initialized && imageUrl) {
                this.updateLoadingMessage('Syncing to cloud...');
                await supabaseClient.saveAnalysis(imageUrl, analysis);
            }

            // Step 6: Display results
            this.currentAnalysis = analysis;
            this.displayResults(analysis);
            
            this.showSuccess('Analysis complete and saved!');

        } catch (error) {
            console.error('Analysis error:', error);
            this.showError(error.message || 'Analysis failed. Please try again.');
        } finally {
            this.isProcessing = false;
            this.hideLoadingState();
        }
    }
    
    // Convert file to base64
    fileToBase64(file) {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.onload = () => resolve(reader.result);
            reader.onerror = reject;
            reader.readAsDataURL(file);
        });
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
                        <i class="fas fa-download"></i> Download PDF
                    </button>
                    <button class="btn btn-secondary" onclick="app.exportHistory()">
                        <i class="fas fa-file-export"></i> Export History
                    </button>
                    <button id="newAnalysisBtn" class="btn btn-secondary" onclick="app.resetAnalysis()">
                        <i class="fas fa-plus"></i> New Analysis
                    </button>
                    <button class="btn btn-secondary" onclick="window.location.href='dashboard.html'">
                        <i class="fas fa-history"></i> View History
                    </button>
                </div>
            </div>
        `;

        resultsContainer.style.display = 'block';
        resultsContainer.scrollIntoView({ behavior: 'smooth' });
    }

    // Download analysis report as PDF
    downloadReport() {
        if (!this.currentAnalysis) return;

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF();
            const analysis = this.currentAnalysis;
            const soilInfo = CONFIG.SOIL_TYPES[analysis.soilType] || {};
            
            // Header with agririgo branding
            doc.setFillColor(4, 203, 87);
            doc.rect(0, 0, 210, 45, 'F');
            
            // Add agririgo logo text (since we can't easily embed SVG)
            doc.setTextColor(255, 255, 255);
            doc.setFontSize(28);
            doc.setFont(undefined, 'bold');
            doc.text('agririgo', 20, 20);
            
            doc.setFontSize(20);
            doc.text('Rigo-AI Soil Analysis Report', 105, 22, { align: 'center' });
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text('Advanced AI-Powered Soil Analysis', 105, 32, { align: 'center' });
            doc.setFontSize(9);
            doc.text('Powered by Hugging Face AI', 105, 38, { align: 'center' });
            
            // Reset text color
            doc.setTextColor(0, 0, 0);
            
            // Report Info
            doc.setFontSize(10);
            doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 50);
            doc.text(`Time: ${new Date().toLocaleTimeString()}`, 20, 56);
            doc.text(`Report ID: ${Date.now()}`, 20, 62);
            
            // Soil Type Section
            doc.setFontSize(16);
            doc.setFont(undefined, 'bold');
            doc.text('Soil Classification', 20, 75);
            doc.setFontSize(12);
            doc.setFont(undefined, 'normal');
            doc.text(`Type: ${analysis.soilType.charAt(0).toUpperCase() + analysis.soilType.slice(1)} Soil`, 20, 85);
            doc.text(`Confidence: ${analysis.confidence}%`, 20, 92);
            
            // Characteristics
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Soil Characteristics', 20, 105);
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`Texture: ${analysis.characteristics.texture}`, 25, 115);
            doc.text(`Drainage: ${analysis.characteristics.drainage}`, 25, 122);
            doc.text(`Water Retention: ${analysis.characteristics.waterRetention}`, 25, 129);
            doc.text(`Workability: ${analysis.characteristics.workability}`, 25, 136);
            
            // Nutrient Levels
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Nutrient Analysis', 20, 150);
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            
            // Nitrogen bar
            doc.text(`Nitrogen (N): ${analysis.nutrients.nitrogen}%`, 25, 160);
            doc.setFillColor(4, 203, 87);
            doc.rect(25, 163, analysis.nutrients.nitrogen * 1.5, 5, 'F');
            
            // Phosphorus bar
            doc.text(`Phosphorus (P): ${analysis.nutrients.phosphorus}%`, 25, 175);
            doc.setFillColor(255, 107, 53);
            doc.rect(25, 178, analysis.nutrients.phosphorus * 1.5, 5, 'F');
            
            // Potassium bar
            doc.text(`Potassium (K): ${analysis.nutrients.potassium}%`, 25, 190);
            doc.setFillColor(78, 205, 196);
            doc.rect(25, 193, analysis.nutrients.potassium * 1.5, 5, 'F');
            
            // pH Level
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('pH Analysis', 20, 210);
            doc.setFontSize(11);
            doc.setFont(undefined, 'normal');
            doc.text(`pH Value: ${analysis.pH.value}`, 25, 220);
            doc.text(`Range: ${analysis.pH.range}`, 25, 227);
            doc.text(`Status: ${analysis.pH.status}`, 25, 234);
            
            // Recommendations
            doc.setFontSize(14);
            doc.setFont(undefined, 'bold');
            doc.text('Recommendations', 20, 248);
            doc.setFontSize(10);
            doc.setFont(undefined, 'normal');
            
            let yPos = 258;
            analysis.recommendations.forEach((rec, index) => {
                const lines = doc.splitTextToSize(`${index + 1}. ${rec}`, 170);
                doc.text(lines, 25, yPos);
                yPos += lines.length * 6;
            });
            
            // Footer
            doc.setFontSize(8);
            doc.setTextColor(128, 128, 128);
            doc.text('Generated by Rigo-AI | agririgo', 105, 285, { align: 'center' });
            doc.text('For more information, visit agririgo.com', 105, 290, { align: 'center' });
            
            // Save PDF
            doc.save(`Rigo-AI-Soil-Analysis-${Date.now()}.pdf`);
            this.showSuccess('PDF report downloaded successfully!');
            
        } catch (error) {
            console.error('PDF generation error:', error);
            this.showError('Failed to generate PDF. Please try again.');
        }
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
            // Load from local database
            const localHistory = localDB.getRecentAnalyses(20);
            
            // Try to load from Supabase if configured
            let cloudHistory = [];
            if (supabaseClient.initialized) {
                cloudHistory = await supabaseClient.getAnalysisHistory();
            }
            
            // Combine and display
            const allHistory = [...localHistory, ...cloudHistory];
            this.displayHistory(allHistory);
            
            // Show statistics
            const stats = localDB.getStatistics();
            this.displayStatistics(stats);
        } catch (error) {
            console.error('Failed to load history:', error);
        }
    }
    
    // Export history as JSON
    exportHistory() {
        localDB.exportToJSON();
        this.showSuccess('History exported successfully!');
    }

    // Display analysis history
    displayHistory(history) {
        const historyContainer = document.getElementById('historyContainer');
        if (!historyContainer) return;
        
        if (!history || history.length === 0) {
            historyContainer.innerHTML = `
                <div class="empty-state fade-in">
                    <i class="fas fa-clipboard-list"></i>
                    <h3>No Analysis History Yet</h3>
                    <p class="text-muted">Start by analyzing your first soil sample</p>
                    <a href="analyze.html" class="btn btn-primary mt-3">
                        <i class="fas fa-microscope"></i> Analyze Soil Now
                    </a>
                </div>
            `;
            return;
        }

        historyContainer.innerHTML = history.map(item => {
            const imageUrl = item.imageData || item.image_url || 'images/placeholder.jpg';
            const timestamp = item.timestamp || item.created_at;
            const date = new Date(timestamp);
            const soilType = item.results?.soilType || item.soilType || 'Unknown';
            const confidence = item.results?.confidence || item.confidence || '0';
            
            return `
                <div class="history-card fade-in">
                    <img src="${imageUrl}" alt="Soil sample" onerror="this.src='images/placeholder.jpg'">
                    <div class="history-info">
                        <h4>${soilType.charAt(0).toUpperCase() + soilType.slice(1)} Soil</h4>
                        <p><i class="fas fa-calendar"></i> ${date.toLocaleDateString()} at ${date.toLocaleTimeString()}</p>
                        <span class="confidence">${confidence}% confidence</span>
                    </div>
                    <div class="history-actions">
                        <button class="btn btn-sm btn-primary" onclick="app.viewAnalysis('${item.id}')">
                            <i class="fas fa-eye"></i> View
                        </button>
                        <button class="btn btn-sm btn-secondary" onclick="app.deleteAnalysis('${item.id}')">
                            <i class="fas fa-trash"></i> Delete
                        </button>
                    </div>
                </div>
            `;
        }).join('');
    }
    
    // Display statistics
    displayStatistics(stats) {
        const statsContainer = document.getElementById('statsContainer');
        if (!statsContainer) return;
        
        const mostCommon = Object.entries(stats.soilTypeCounts)
            .sort((a, b) => b[1] - a[1])[0];
        
        statsContainer.innerHTML = `
            <div class="row g-4">
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${stats.totalAnalyses}</h3>
                        <p>Total Analyses</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${stats.averageConfidence}%</h3>
                        <p>Avg Confidence</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${mostCommon ? mostCommon[0] : 'N/A'}</h3>
                        <p>Most Common</p>
                    </div>
                </div>
                <div class="col-md-3">
                    <div class="stat-card">
                        <h3>${localDB.getStorageSize().kb} KB</h3>
                        <p>Storage Used</p>
                    </div>
                </div>
            </div>
        `;
    }
    
    // View specific analysis
    viewAnalysis(id) {
        const analysis = localDB.getAnalysisById(id);
        if (analysis) {
            this.currentAnalysis = analysis.results;
            this.displayResults(analysis.results);
            window.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }
    
    // Delete analysis
    deleteAnalysis(id) {
        if (confirm('Are you sure you want to delete this analysis?')) {
            localDB.deleteAnalysis(id);
            this.loadAnalysisHistory();
            this.showSuccess('Analysis deleted successfully');
        }
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
document.addEventListener('DOMContentLoaded', () => {
    window.app = new SoilAnalysisApp();
    window.app.init();
});
