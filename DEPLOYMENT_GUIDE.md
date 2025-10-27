# Deployment Guide - Gomata Aadhaar System

## Overview
This guide explains how to create a persistent dataset of enrolled cows that will be available across all deployments and instances.

## Problem Solved
- **Before**: Data stored in browser localStorage (lost on browser clear, not shared across devices)
- **After**: Data stored in a JSON dataset file that's deployed with the app (persistent, shared across all users)

## Step-by-Step Process

### 1. Enroll All 42 Cows

1. Go to the **Dashboard** tab
2. Check the box: **"Skip duplicate detection"** (recommended for initial dataset creation)
3. Click **"Select Folder for Bulk Upload"**
4. Select your parent folder containing 42 subfolders (one per cow, each with 6 images)
5. Wait for all cows to be enrolled (this may take 15-20 minutes due to API rate limits)

### 2. Export the Dataset

1. After all cows are enrolled, click **"📥 Export Dataset (.json)"**
2. Save the file as `cows-dataset.json`

### 3. Deploy the Dataset

**Option A: For Development/Testing**
1. Place the exported file in: `public/dataset/cows-dataset.json`
2. Restart the dev server: `npm run dev`
3. Clear your browser's localStorage (or use incognito mode)
4. Refresh the page - all 42 cows should load automatically

**Option B: For Production Deployment**
1. Place the exported file in: `public/dataset/cows-dataset.json`
2. Build the app: `npm run build`
3. Deploy the `dist` folder to your hosting service (Vercel, Netlify, etc.)
4. The dataset will be available to all users automatically

### 4. How It Works

- On first load, the app checks if localStorage is empty
- If empty, it fetches `/dataset/cows-dataset.json`
- The dataset is loaded into localStorage for fast access
- Users can still enroll new cows, which are saved locally
- Export/Import functionality allows syncing between instances

## Key Changes Made

### 1. Improved Duplicate Detection
- Added confidence threshold (95% minimum)
- Enhanced AI prompt to be more strict about matches
- Added confidence scoring to match results
- Option to skip duplicate checking during bulk enrollment

### 2. Dataset Management
- Created `public/dataset/` folder for persistent storage
- Added automatic dataset loading on app initialization
- Export creates deployment-ready JSON file
- Import allows restoring from backups

### 3. Better Cow Identification
- Uses folder name as cow ID (e.g., "s1868" instead of random number)
- Makes tracking and debugging easier
- Consistent IDs across exports/imports

## Troubleshooting

### Issue: Still getting duplicate errors
**Solution**: Check the "Skip duplicate detection" checkbox during bulk enrollment

### Issue: Dataset not loading after deployment
**Solution**: Verify `cows-dataset.json` is in the `public/dataset/` folder before building

### Issue: Some cows failed to enroll
**Solution**: Check the error messages, likely API rate limits. Wait 5 minutes and try again with just the failed folders

### Issue: Need to reset everything
**Solution**: Use "Clear Entire Database" button in Dashboard, then reload from dataset

## API Rate Limits

The Gemini API has rate limits. The app includes:
- 5-second delay between each cow enrollment
- Automatic retry with exponential backoff (up to 4 retries)
- For 42 cows: expect ~15-20 minutes total enrollment time

## Best Practices

1. **Initial Setup**: Use "Skip duplicate detection" for your first 42 cows
2. **Regular Backups**: Export your dataset regularly
3. **Version Control**: Keep dataset files in version control (Git)
4. **Testing**: Test authentication with the dataset before production deployment
5. **Updates**: When adding new cows, export and redeploy the updated dataset

## File Structure

```
gomata-aadhaar-system/
├── public/
│   └── dataset/
│       └── cows-dataset.json    # Your 42 enrolled cows
├── src/
│   ├── utils.ts                 # Database functions
│   └── services/
│       └── geminiService.ts     # AI matching logic
└── .env.local                   # Your Gemini API key
```

## Next Steps

After deployment, users can:
- ✅ Authenticate any of the 42 enrolled cows
- ✅ View all cows in the dashboard
- ✅ Enroll additional cows (saved locally)
- ✅ Export/import for syncing between devices
