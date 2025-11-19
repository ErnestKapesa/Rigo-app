# Rigo-AI Complete Setup Guide

This guide will walk you through setting up the Rigo-AI Soil Analysis Platform from scratch.

## 📋 Prerequisites

- Modern web browser (Chrome, Firefox, Safari, Edge)
- Text editor (VS Code, Sublime, or Kiro IDE)
- Internet connection
- (Optional) Local web server

## 🎯 Step-by-Step Setup

### Step 1: Get Hugging Face API Access

1. **Create Account**
   - Go to https://huggingface.co/
   - Click "Sign Up" and create a free account
   - Verify your email

2. **Generate API Token**
   - Go to https://huggingface.co/settings/tokens
   - Click "New token"
   - Name it "Rigo-AI" and select "Read" access
   - Copy the token (starts with `hf_...`)
   - **IMPORTANT**: Save this token securely!

3. **Test the Token** (Optional)
   ```bash
   curl https://api-inference.huggingface.co/models/google/vit-base-patch16-224 \
     -H "Authorization: Bearer YOUR_TOKEN_HERE" \
     -d '{"inputs": "test"}'
   ```

### Step 2: Set Up Supabase (Recommended)

1. **Create Supabase Project**
   - Go to https://supabase.com/
   - Click "Start your project"
   - Create a new organization (if needed)
   - Click "New project"
   - Fill in:
     - Name: `rigo-ai-soil-analysis`
     - Database Password: (create a strong password)
     - Region: Choose closest to your users
   - Click "Create new project"
   - Wait 2-3 minutes for setup

2. **Get API Credentials**
   - In your project dashboard, go to Settings > API
   - Copy these values:
     - **Project URL**: `https://xxxxx.supabase.co`
     - **Anon/Public Key**: `eyJhbGc...` (long string)

3. **Create Storage Bucket**
   - Go to Storage in the left sidebar
   - Click "New bucket"
   - Name: `soil-images`
   - Make it **Public**
   - Click "Create bucket"

4. **Set Up Database**
   - Go to SQL Editor in the left sidebar
   - Click "New query"
   - Paste this SQL:

```sql
-- Create analyses table
CREATE TABLE analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    image_url TEXT NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Allow anyone to insert (for demo purposes)
-- In production, you'd want authentication
CREATE POLICY "Anyone can insert analyses"
ON analyses FOR INSERT
WITH CHECK (true);

-- Allow anyone to view analyses
CREATE POLICY "Anyone can view analyses"
ON analyses FOR SELECT
USING (true);

-- Create index for faster queries
CREATE INDEX idx_analyses_created_at ON analyses(created_at DESC);
```

   - Click "Run" to execute
   - You should see "Success. No rows returned"

5. **Configure Storage Policies**
   - Go to Storage > Policies
   - For `soil-images` bucket, add these policies:

```sql
-- Allow public read access
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'soil-images' );

-- Allow anyone to upload (for demo)
CREATE POLICY "Anyone can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'soil-images' );
```

### Step 3: Configure the Application

1. **Open config.js**
   - Navigate to `Rigo-AI/js/config.js`
   - Find these lines:

```javascript
HF_API_TOKEN: '', // Set this in your deployment
SUPABASE_URL: '', // Set this after creating Supabase project
SUPABASE_ANON_KEY: '', // Set this after creating Supabase project
```

2. **Add Your Credentials**
   - Replace with your actual values:

```javascript
HF_API_TOKEN: 'hf_your_token_here',
SUPABASE_URL: 'https://xxxxx.supabase.co',
SUPABASE_ANON_KEY: 'eyJhbGc...',
```

3. **Save the file**

### Step 4: Test the Application

1. **Open in Browser**
   - Double-click `Rigo-AI/index.html`
   - Or use a local server:

```bash
# Python 3
cd /path/to/project
python -m http.server 8000

# Then visit: http://localhost:8000/Rigo-AI/
```

2. **Test Image Upload**
   - Go to "Analyze" page
   - Upload a soil image (or any image for testing)
   - Click "Analyze Soil"
   - Wait for results (first request may take 20-30 seconds as model loads)

3. **Check Console**
   - Open browser DevTools (F12)
   - Check Console tab for any errors
   - If you see errors, check your API credentials

### Step 5: Kiro IDE Setup (Optional)

If you're using Kiro IDE, enhance your development experience:

1. **MCP Configuration**
   Create `.kiro/settings/mcp.json`:

```json
{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "./Rigo-AI"],
      "disabled": false
    }
  }
}
```

2. **Agent Hooks**
   - Open Command Palette (Cmd/Ctrl + Shift + P)
   - Search "Open Kiro Hook UI"
   - Create hooks for:
     - **On Save**: Run linting/formatting
     - **On Message**: Remind about coding standards
     - **Manual**: Deploy to production

3. **Steering Rules**
   - Already configured in `.kiro/steering/project-guidelines.md`
   - Edit to add your own project-specific rules

## 🧪 Testing Checklist

- [ ] Home page loads correctly
- [ ] Navigation works between all pages
- [ ] Image upload accepts valid files
- [ ] Image upload rejects invalid files (>5MB, wrong format)
- [ ] Analysis runs and shows results
- [ ] Results display all sections (soil type, nutrients, pH, recommendations)
- [ ] Download report works
- [ ] Dashboard shows empty state (if no history)
- [ ] Mobile responsive design works
- [ ] No console errors

## 🐛 Troubleshooting

### "Model is loading" error
- **Cause**: Hugging Face model needs to warm up
- **Solution**: Wait 20-30 seconds and try again

### "Failed to fetch" error
- **Cause**: Invalid API token or network issue
- **Solution**: Check your HF_API_TOKEN in config.js

### Images not saving to Supabase
- **Cause**: Incorrect Supabase credentials or bucket not created
- **Solution**: Verify SUPABASE_URL and SUPABASE_ANON_KEY, check bucket exists

### CORS errors
- **Cause**: Opening HTML file directly (file://)
- **Solution**: Use a local web server (python -m http.server)

### Module import errors
- **Cause**: Browser doesn't support ES6 modules
- **Solution**: Use a modern browser or add a build step

## 🚀 Deployment Options

### Option 1: Netlify (Recommended)
1. Push code to GitHub
2. Connect to Netlify
3. Add environment variables in Netlify dashboard
4. Deploy!

### Option 2: Vercel
1. Install Vercel CLI: `npm i -g vercel`
2. Run `vercel` in project directory
3. Follow prompts

### Option 3: GitHub Pages
1. Push to GitHub
2. Go to Settings > Pages
3. Select branch and folder
4. Save

**Note**: For GitHub Pages, you'll need to hardcode API keys (not recommended for production) or use GitHub Secrets with Actions.

## 📞 Support

Need help? Contact:
- Email: info@rigo-ai.com
- Phone: (+260) 960-422-681
- Instagram: @agririgo

## 🎉 Next Steps

1. Customize colors and branding
2. Add more soil types to the model
3. Implement user authentication
4. Add export to PDF functionality
5. Create mobile app version
6. Integrate with IoT sensors

Happy farming! 🌱
