#!/bin/bash

echo "🌱 Rigo-AI Backend Setup Script"
echo "================================"
echo ""

# Check if config exists
if [ ! -f "Rigo-AI/js/config.js" ]; then
    echo "❌ Config file not found!"
    exit 1
fi

echo "📝 Current Configuration Status:"
echo ""

# Check Hugging Face
if grep -q "HF_API_TOKEN: ''" Rigo-AI/js/config.js; then
    echo "❌ Hugging Face: NOT CONFIGURED (Demo mode)"
    echo "   → Get token from: https://huggingface.co/settings/tokens"
else
    echo "✅ Hugging Face: CONFIGURED"
fi

# Check Supabase
if grep -q "SUPABASE_URL: ''" Rigo-AI/js/config.js; then
    echo "❌ Supabase: NOT CONFIGURED (Demo mode)"
    echo "   → Create project at: https://supabase.com"
else
    echo "✅ Supabase: CONFIGURED"
fi

echo ""
echo "================================"
echo ""
echo "🚀 Quick Setup Instructions:"
echo ""
echo "1. HUGGING FACE (Required for AI):"
echo "   - Visit: https://huggingface.co/settings/tokens"
echo "   - Click 'New token'"
echo "   - Copy the token (starts with hf_)"
echo "   - Edit Rigo-AI/js/config.js line 6"
echo "   - Replace: HF_API_TOKEN: ''"
echo "   - With: HF_API_TOKEN: 'hf_YOUR_TOKEN_HERE'"
echo ""
echo "2. SUPABASE (Optional for storage):"
echo "   - Visit: https://supabase.com"
echo "   - Create new project"
echo "   - Get URL and anon key from Settings > API"
echo "   - Update config.js lines 11-12"
echo ""
echo "3. TEST:"
echo "   - Open: http://localhost:8080/diagnostic.html"
echo "   - Check all tests pass"
echo "   - Open: http://localhost:8080/analyze.html"
echo "   - Upload soil image and analyze!"
echo ""
