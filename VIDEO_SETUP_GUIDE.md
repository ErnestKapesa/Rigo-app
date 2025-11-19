# How to Add Your Agriculture Video

## Problem
Most free video sites (Pixabay, Pexels, Mixkit) block direct video embedding to save bandwidth.

## Solution: Download and Host Locally

### Steps:

1. **Download the video:**
   - Go to: https://pixabay.com/videos/hen-chick-farm-agriculture-grass-67069/
   - Click "Free Download" button
   - Choose "Large" size (1920x1080)
   - Save the file

2. **Add to your project:**
   - Place the downloaded video in the `images` folder
   - Rename it to `farm-video.mp4`

3. **Update index.html:**
   Replace the video source line with:
   ```html
   <source src="images/farm-video.mp4" type="video/mp4">
   ```

4. **Full video element should look like:**
   ```html
   <video autoplay muted loop playsinline id="heroVideo" preload="auto">
       <source src="images/farm-video.mp4" type="video/mp4">
       Your browser does not support the video tag.
   </video>
   ```

## Alternative: Use YouTube/Vimeo Embed
If you want to use external videos, upload to YouTube or Vimeo and use their embed codes instead.

## Current Status
The Google sample video is working as a placeholder to prove the video system works.
