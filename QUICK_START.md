# 🚀 Rigo-AI Quick Start Guide

Get up and running in 5 minutes!

## ⚡ Fastest Setup (Demo Mode)

The app works out of the box in **demo mode** without any API keys!

1. Open `Rigo-AI/index.html` in your browser
2. Go to "Analyze" page
3. Upload any soil image
4. Click "Analyze Soil"
5. See mock results instantly!

**Note**: Demo mode uses simulated data. For real AI analysis, follow the steps below.

## 🔑 Add Real AI (5 minutes)

### Get Hugging Face Token
1. Go to https://huggingface.co/join
2. Sign up (free)
3. Go to https://huggingface.co/settings/tokens
4. Click "New token" → Copy it

### Configure App
1. Open `Rigo-AI/js/config.js`
2. Find line 6: `HF_API_TOKEN: ''`
3. Paste your token: `HF_API_TOKEN: 'hf_your_token_here'`
4. Save file

### Test It
1. Refresh browser
2. Upload soil image
3. Wait 20-30 seconds (first time only)
4. Get real AI results! 🎉

## 💾 Add Storage (Optional - 10 minutes)

To save analysis history:

1. Go to https://supabase.com/dashboard
2. Create new project (free)
3. Copy URL and API key from Settings > API
4. In `Rigo-AI/js/config.js`:
   ```javascript
   SUPABASE_URL: 'your_url_here'
   SUPABASE_ANON_KEY: 'your_key_here'
   ```
5. Run SQL from `SETUP_GUIDE.md` Step 2.4
6. Done!

## 📱 Pages Overview

- **index.html** - Landing page with features
- **analyze.html** - Upload & analyze soil images
- **dashboard.html** - View analysis history
- **about.html** - Technology & team info

## 🎨 Customize Colors

Edit `Rigo-AI/css/main.css` line 3-10:
```css
--primary-green: #04CB57;  /* Your brand color */
--dark-green: #039647;     /* Darker shade */
```

## 🐛 Common Issues

**"Model is loading"** → Wait 30 seconds, try again  
**"Failed to fetch"** → Check your API token  
**CORS error** → Use local server: `python -m http.server`  
**No results** → Check browser console (F12) for errors

## 📞 Need Help?

- Full guide: See `SETUP_GUIDE.md`
- Email: info@rigo-ai.com
- Phone: (+260) 960-422-681

## ✅ What's Included

✓ AI-powered soil analysis  
✓ 6 soil types detection  
✓ Nutrient level estimation  
✓ pH balance analysis  
✓ Crop recommendations  
✓ Responsive design  
✓ Analysis history  
✓ Report downloads  
✓ Beautiful animations  

Start analyzing! 🌱
