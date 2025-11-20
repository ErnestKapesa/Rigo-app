#!/bin/bash
# Build script for Vercel deployment
# This copies the config template and replaces the token

echo "🔧 Setting up configuration for deployment..."

# Copy template to config.js
cp Rigo-AI/js/config.template.js Rigo-AI/js/config.js

# Replace token if HF_API_TOKEN environment variable is set
if [ ! -z "$HF_API_TOKEN" ]; then
    echo "✅ Using HF_API_TOKEN from environment"
    sed -i "s/YOUR_HUGGING_FACE_TOKEN_HERE/$HF_API_TOKEN/g" Rigo-AI/js/config.js
else
    echo "⚠️  No HF_API_TOKEN found in environment"
    echo "⚠️  Using placeholder - AI will not work!"
fi

echo "✅ Build complete!"
