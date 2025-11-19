// Mobile Menu Toggle
const menuToggle = document.querySelector('.menu-toggle');
const navLinks = document.querySelector('.nav-links');

menuToggle.addEventListener('click', () => {
    navLinks.style.display = navLinks.style.display === 'flex' ? 'none' : 'flex';
});

// Smooth Scrolling
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        document.querySelector(this.getAttribute('href')).scrollIntoView({
            behavior: 'smooth'
        });
    });
});

// File Upload Handling
const dropZone = document.getElementById('dropZone');
const fileInput = document.getElementById('fileInput');
const previewArea = document.getElementById('previewArea');

// Trigger file input when clicking the upload button
document.querySelector('.upload-button').addEventListener('click', () => {
    fileInput.click();
});

// Handle file selection
fileInput.addEventListener('change', handleFiles);

// Drag and drop handlers
['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, preventDefaults, false);
});

function preventDefaults(e) {
    e.preventDefault();
    e.stopPropagation();
}

['dragenter', 'dragover'].forEach(eventName => {
    dropZone.addEventListener(eventName, highlight, false);
});

['dragleave', 'drop'].forEach(eventName => {
    dropZone.addEventListener(eventName, unhighlight, false);
});

function highlight() {
    dropZone.classList.add('highlight');
}

function unhighlight() {
    dropZone.classList.remove('highlight');
}

dropZone.addEventListener('drop', handleDrop, false);

function handleDrop(e) {
    const dt = e.dataTransfer;
    const files = dt.files;
    handleFiles(files);
}

function handleFiles(files) {
    if (files instanceof FileList) {
        files = Array.from(files);
    } else if (files instanceof Event) {
        files = Array.from(files.target.files);
    }

    files.forEach(uploadFile);
    files.forEach(previewFile);
}

function uploadFile(file) {
    // Simulate file upload - In a real application, you would send this to your server
    console.log(`Uploading file: ${file.name}`);
    
    // Here you would typically have your API endpoint for file upload
    // const url = 'your-upload-endpoint';
    // const formData = new FormData();
    // formData.append('file', file);
    
    // fetch(url, {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Success:', data);
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
}

function previewFile(file) {
    const reader = new FileReader();
    reader.readAsDataURL(file);
    
    reader.onloadend = function() {
        const preview = document.createElement('div');
        preview.className = 'preview-item';
        
        if (file.type.startsWith('image/')) {
            const img = document.createElement('img');
            img.src = reader.result;
            preview.appendChild(img);
        } else if (file.type.startsWith('video/')) {
            const video = document.createElement('video');
            video.src = reader.result;
            video.controls = true;
            preview.appendChild(video);
        }
        
        const info = document.createElement('div');
        info.className = 'file-info';
        info.textContent = file.name;
        preview.appendChild(info);
        
        previewArea.appendChild(preview);
    }
}

// Form Submission
const contactForm = document.querySelector('.contact-form');

contactForm.addEventListener('submit', (e) => {
    e.preventDefault();
    
    // Simulate form submission - In a real application, you would send this to your server
    const formData = new FormData(contactForm);
    console.log('Form submitted with data:', Object.fromEntries(formData));
    
    // Here you would typically have your API endpoint for form submission
    // fetch('your-form-endpoint', {
    //     method: 'POST',
    //     body: formData
    // })
    // .then(response => response.json())
    // .then(data => {
    //     console.log('Success:', data);
    //     contactForm.reset();
    // })
    // .catch(error => {
    //     console.error('Error:', error);
    // });
    
    // For demo purposes, just reset the form
    contactForm.reset();
    alert('Message sent successfully!');
});

// Add some additional styles for the preview items
const style = document.createElement('style');
style.textContent = `
    .preview-item {
        position: relative;
        border-radius: 8px;
        overflow: hidden;
        box-shadow: 0 2px 5px rgba(0,0,0,0.1);
    }
    
    .preview-item img,
    .preview-item video {
        width: 100%;
        height: 150px;
        object-fit: cover;
    }
    
    .file-info {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background: rgba(0,0,0,0.7);
        color: white;
        padding: 5px;
        font-size: 0.8rem;
        text-overflow: ellipsis;
        overflow: hidden;
        white-space: nowrap;
    }
    
    .highlight {
        background: rgba(46, 204, 113, 0.1);
        border-color: var(--secondary-color);
    }
`;
document.head.appendChild(style); 