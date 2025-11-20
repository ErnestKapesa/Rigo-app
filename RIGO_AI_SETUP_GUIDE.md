# Rigo-AI Full Stack Setup Guide

## Overview
Complete guide to set up the AI-powered soil analysis platform with Hugging Face AI and Supabase backend.

---

## 🚀 Quick Start (Demo Mode)

The app works out of the box in **demo mode** without any configuration:
1. Open `Rigo-AI/analyze.html` in your browser
2. Upload a soil image
3. Click "Analyze Soil"
4. Download PDF report

Demo mode uses mock AI responses for testing.

---

## 🔧 Full Production Setup

### Step 1: Hugging Face API Setup

1. **Create Hugging Face Account**
   - Go to https://huggingface.co/join
   - Sign up for free account

2. **Get API Token**
   - Go to https://huggingface.co/settings/tokens
   - Click "New token"
   - Name it "Rigo-AI"
   - Copy the token

3. **Choose AI Model**
   - Recommended: `google/vit-base-patch16-224` (image classification)
   - Alternative: `microsoft/resnet-50` (faster)
   - For soil-specific: Train custom model or use `nateraw/food` (can classify textures)

---

### Step 2: Supabase Backend Setup

1. **Create Supabase Project**
   - Go to https://supabase.com
   - Click "Start your project"
   - Create new organization and project
   - Wait for project to initialize (~2 minutes)

2. **Get API Credentials**
   - Go to Project Settings > API
   - Copy:
     - Project URL
     - `anon` public key

3. **Create Storage Bucket**
   ```sql
   -- Go to Storage in Supabase dashboard
   -- Click "New bucket"
   -- Name: soil-images
   -- Public bucket: YES
   ```

4. **Create Database Table**
   ```sql
   -- Go to SQL Editor in Supabase dashboard
   -- Run this query:
   
   create table analyses (
     id uuid default uuid_generate_v4() primary key,
     image_url text not null,
     results jsonb not null,
     created_at timestamp with time zone default timezone('utc'::text, now()) not null
   );
   
   -- Enable Row Level Security
   alter table analyses enable row level security;
   
   -- Create policy to allow anyone to insert (for demo)
   create policy "Allow public insert" on analyses
     for insert with check (true);
   
   -- Create policy to allow anyone to read (for demo)
   create policy "Allow public read" on analyses
     for select using (true);
   ```

---

### Step 3: Configure Environment

1. **Create Config File**
   ```bash
   cd Rigo-AI/js
   cp config.js.example config.js  # If doesn't exist, create it
   ```

2. **Update `Rigo-AI/js/config.js`**
   ```javascript
   const CONFIG = {
       // Hugging Face Configuration
       HF_API_TOKEN: 'hf_YOUR_TOKEN_HERE',
       HF_MODEL_ID: 'google/vit-base-patch16-224',
       HF_API_URL: 'https://api-inference.huggingface.co/models/',
       
       // Supabase Configuration
       SUPABASE_URL: 'https://your-project.supabase.co',
       SUPABASE_ANON_KEY: 'your-anon-key-here',
       
       // Application Settings
       MAX_IMAGE_SIZE: 5242880, // 5MB
       ALLOWED_IMAGE_TYPES: ['image/jpeg', 'image/png', 'image/jpg'],
       
       // Soil type definitions
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
       }
   };
   
   export default CONFIG;
   ```

---

### Step 4: Test the System

1. **Open analyze.html**
   ```bash
   # Option 1: Direct file
   open Rigo-AI/analyze.html
   
   # Option 2: Local server (recommended)
   python3 -m http.server 8000
   # Then visit: http://localhost:8000/Rigo-AI/analyze.html
   ```

2. **Upload Test Image**
   - Use any soil image (JPEG/PNG)
   - Max size: 5MB
   - Clear, well-lit photos work best

3. **Verify Features**
   - ✅ Image upload works
   - ✅ AI analysis completes
   - ✅ Results display correctly
   - ✅ PDF download works
   - ✅ Data saves to Supabase

---

## 📊 Features Implemented

### ✅ Frontend
- Drag & drop image upload
- Image preview with remove option
- Real-time validation (file type, size)
- Responsive design (mobile-friendly)
- Loading states with progress messages
- Error handling with user-friendly messages

### ✅ AI Analysis
- Hugging Face API integration
- Retry logic for model loading
- Confidence scoring
- Soil type classification
- Nutrient estimation (N, P, K)
- pH level prediction
- Mock mode for testing

### ✅ Backend (Supabase)
- Image storage in cloud
- Analysis history database
- Public URL generation
- Row-level security
- Optional authentication

### ✅ PDF Generation
- Professional report layout
- Branded header with logo colors
- Complete analysis data
- Visual nutrient bars
- Recommendations list
- Timestamp and report ID
- Downloadable format

---

## 🎨 Customization

### Change AI Model
```javascript
// In config.js
HF_MODEL_ID: 'your-custom-model-id'
```

### Adjust Soil Types
```javascript
// In config.js, add/modify SOIL_TYPES
SOIL_TYPES: {
    custom_type: {
        color: '#HEX_COLOR',
        description: 'Your description'
    }
}
```

### Modify PDF Layout
```javascript
// In app.js, downloadReport() function
// Adjust positions, colors, fonts
doc.setFontSize(24);
doc.text('Your Custom Title', x, y);
```

---

## 🔒 Security Best Practices

### For Production:

1. **Enable Supabase Authentication**
   ```sql
   -- Update RLS policies to require auth
   create policy "Authenticated users only" on analyses
     for all using (auth.uid() is not null);
   ```

2. **Add User Association**
   ```sql
   -- Add user_id column
   alter table analyses add column user_id uuid references auth.users;
   
   -- Update policy
   create policy "Users see own data" on analyses
     for select using (auth.uid() = user_id);
   ```

3. **Environment Variables**
   - Never commit API keys to Git
   - Use `.env` files (add to `.gitignore`)
   - Use environment-specific configs

4. **Rate Limiting**
   - Implement on backend
   - Use Supabase Edge Functions
   - Add CAPTCHA for public access

---

## 🐛 Troubleshooting

### Issue: "Model is loading"
**Solution:** Hugging Face models sleep after inactivity. Wait 20-30 seconds and retry.

### Issue: "403 Forbidden" on Supabase
**Solution:** Check RLS policies. For testing, allow public access.

### Issue: PDF not downloading
**Solution:** Check browser console. Ensure jsPDF library loaded correctly.

### Issue: Image upload fails
**Solution:** 
- Check file size (<5MB)
- Verify file type (JPEG/PNG/JPG)
- Check Supabase storage bucket is public

### Issue: No AI results
**Solution:**
- Verify HF_API_TOKEN is correct
- Check browser console for errors
- Test with demo mode first (remove API token)

---

## 📱 Mobile Optimization

The app is fully responsive:
- Touch-friendly upload area
- Optimized image sizes
- Mobile-friendly PDF viewing
- Responsive navigation

---

## 🚀 Deployment Options

### Option 1: GitHub Pages
```bash
# Push to GitHub
git add .
git commit -m "Deploy Rigo-AI"
git push origin main

# Enable GitHub Pages in repo settings
# Select main branch, root folder
```

### Option 2: Netlify
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

### Option 3: Vercel
```bash
# Install Vercel CLI
npm install -g vercel

# Deploy
vercel --prod
```

---

## 📈 Future Enhancements

- [ ] User authentication system
- [ ] Analysis history dashboard
- [ ] Crop recommendation engine
- [ ] Weather integration
- [ ] Multi-language support
- [ ] Mobile app (React Native)
- [ ] Batch image processing
- [ ] Export to Excel/CSV
- [ ] Email report delivery
- [ ] GPS location tagging

---

## 💡 Tips for Best Results

1. **Image Quality**
   - Use natural lighting
   - Clear, focused photos
   - Fill frame with soil
   - Avoid shadows

2. **Sample Preparation**
   - Remove debris
   - Break up clumps
   - Consistent moisture level
   - Representative sample

3. **AI Accuracy**
   - Multiple angles help
   - Compare with manual testing
   - Use as guidance, not absolute
   - Consider local conditions

---

## 📞 Support

- **Documentation:** This guide
- **Issues:** GitHub Issues
- **Email:** info@agririgo.com
- **Phone:** (+260) 960-422-681

---

## 📄 License

Copyright © 2024 agririgo. All rights reserved.

---

**Built with ❤️ by the agririgo team**
