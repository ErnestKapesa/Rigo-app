# Rigo-AI Soil Analysis Platform - Development Guidelines

## Project Overview
Rigo-AI is an agricultural technology web application that uses AI to analyze soil images and provide detailed insights about soil composition, type, and health.

## Technology Stack
- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **AI/ML**: Hugging Face Inference API for image classification
- **Backend/Storage**: Supabase (PostgreSQL database, Storage, Auth)
- **Design**: Bootstrap 5, custom animations, green/earth-tone color palette

## Design Principles
- **Color Scheme**: Keep the agririgo green (#04CB57) as primary, earth tones (browns, greens)
- **Animations**: Smooth transitions, fade-ins, hover effects
- **Responsive**: Mobile-first approach
- **Accessibility**: WCAG 2.1 AA compliance

## Code Standards
- Use semantic HTML5 elements
- CSS: BEM naming convention for custom classes
- JavaScript: Async/await for API calls, error handling required
- Comments: Explain complex logic, API integrations
- File structure: Modular, organized by feature

## API Integration Guidelines
### Hugging Face
- Model: Use image classification models (e.g., `google/vit-base-patch16-224`)
- Endpoint: `https://api-inference.huggingface.co/models/{model-id}`
- Headers: Include `Authorization: Bearer {HF_TOKEN}`
- Error handling: Retry logic, user-friendly messages

### Supabase
- Storage bucket: `soil-images` (public read, authenticated write)
- Tables: `analyses` (id, user_id, image_url, results, created_at)
- RLS policies: Users can only access their own data
- Environment variables: Never commit API keys

## File References
- Main config: #[[file:.env.example]]
- API utilities: #[[file:Rigo-AI/js/api.js]]
- Supabase client: #[[file:Rigo-AI/js/supabase-client.js]]

## Development Workflow
1. Test locally before committing
2. Use browser DevTools for debugging
3. Check console for errors
4. Validate API responses
5. Test image upload flow end-to-end
