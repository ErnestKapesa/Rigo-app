# Rigo-AI Soil Analysis Platform

Advanced agricultural technology web application that uses AI to analyze soil images and provide detailed insights about soil composition, nutrients, and recommendations.

## 🌱 Features

- **AI-Powered Analysis**: Uses Hugging Face image classification models
- **Instant Results**: Get comprehensive soil analysis in seconds
- **Detailed Insights**: Soil type, nutrient levels, pH balance
- **Smart Recommendations**: Actionable advice for optimal crop growth
- **Analysis History**: Track and compare soil health over time
- **Responsive Design**: Works on desktop, tablet, and mobile devices

## 🚀 Quick Start

### 1. Set Up Hugging Face API

1. Create a free account at [Hugging Face](https://huggingface.co/)
2. Generate an API token from your [settings page](https://huggingface.co/settings/tokens)
3. Copy the token for later use

### 2. Set Up Supabase (Optional but Recommended)

1. Create a free account at [Supabase](https://supabase.com/)
2. Create a new project
3. Go to Project Settings > API to get your:
   - Project URL
   - Anon/Public Key

#### Create Storage Bucket:
```sql
-- In Supabase SQL Editor
CREATE POLICY "Public Access"
ON storage.objects FOR SELECT
USING ( bucket_id = 'soil-images' );

CREATE POLICY "Authenticated users can upload"
ON storage.objects FOR INSERT
WITH CHECK ( bucket_id = 'soil-images' AND auth.role() = 'authenticated' );
```

#### Create Database Table:
```sql
CREATE TABLE analyses (
    id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
    user_id UUID REFERENCES auth.users,
    image_url TEXT NOT NULL,
    results JSONB NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE analyses ENABLE ROW LEVEL SECURITY;

-- Create policy for users to see their own data
CREATE POLICY "Users can view own analyses"
ON analyses FOR SELECT
USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own analyses"
ON analyses FOR INSERT
WITH CHECK (auth.uid() = user_id);
```

### 3. Configure the Application

1. Copy `.env.example` to create your configuration
2. Open `Rigo-AI/js/config.js`
3. Add your API credentials:

```javascript
const CONFIG = {
    HF_API_TOKEN: 'your_huggingface_token_here',
    HF_MODEL_ID: 'google/vit-base-patch16-224',
    SUPABASE_URL: 'your_supabase_url_here',
    SUPABASE_ANON_KEY: 'your_supabase_key_here',
    // ... rest of config
};
```

### 4. Run the Application

Simply open `Rigo-AI/index.html` in a modern web browser, or use a local server:

```bash
# Using Python
python -m http.server 8000

# Using Node.js
npx http-server

# Then visit http://localhost:8000/Rigo-AI/
```

## 📁 Project Structure

```
Rigo-AI/
├── index.html          # Home page
├── analyze.html        # Soil analysis page
├── dashboard.html      # Analysis history
├── about.html          # About page
├── css/
│   └── main.css        # Main styles with animations
├── js/
│   ├── config.js       # Configuration management
│   ├── api.js          # Hugging Face API integration
│   ├── supabase-client.js  # Supabase integration
│   └── app.js          # Main application logic
├── images/             # Image assets
└── README.md           # This file
```

## 🎨 Customization

### Colors
Edit CSS variables in `css/main.css`:
```css
:root {
    --primary-green: #04CB57;
    --dark-green: #039647;
    --light-green: #E8F8F0;
    /* ... */
}
```

### AI Model
Change the Hugging Face model in `js/config.js`:
```javascript
HF_MODEL_ID: 'your-preferred-model-id'
```

## 🔧 Development with Kiro

### Steering Rules
Project guidelines are in `.kiro/steering/project-guidelines.md`

### MCP Configuration (Optional)
For enhanced development experience, configure MCP in `.kiro/settings/mcp.json`

### Agent Hooks
Set up automatic testing or deployment hooks in Kiro's Agent Hooks panel

## 📊 How It Works

1. **Image Upload**: User uploads a soil sample photo
2. **Preprocessing**: Image is validated and prepared
3. **AI Analysis**: Sent to Hugging Face model for classification
4. **Processing**: Results are mapped to soil characteristics
5. **Storage**: Analysis saved to Supabase (if configured)
6. **Display**: Comprehensive report shown to user

## 🌍 Supported Soil Types

- **Clay**: Heavy, nutrient-rich, poor drainage
- **Sandy**: Light, well-draining, low nutrients
- **Loamy**: Balanced, ideal for most crops
- **Silty**: Smooth, moisture-retentive
- **Peaty**: Organic-rich, acidic
- **Chalky**: Alkaline, good drainage

## 🤝 Contributing

This is part of the agririgo ecosystem. For contributions or questions, contact:
- Email: info@rigo-ai.com
- Phone: (+260) 960-422-681

## 📝 License

© 2024 Rigo-AI. All rights reserved. Powered by agririgo.

## 🙏 Acknowledgments

- Hugging Face for AI infrastructure
- Supabase for backend services
- Bootstrap for UI framework
- Font Awesome for icons
