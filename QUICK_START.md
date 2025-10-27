# Quick Start - Enroll Your 42 Cows

## TL;DR
1. ✅ Check "Skip duplicate detection" in Dashboard
2. ✅ Upload your 42 folders (6 images each)
3. ✅ Export the dataset
4. ✅ Place in `public/dataset/cows-dataset.json`
5. ✅ Deploy!

## Why You Were Getting Duplicates

The AI was being too cautious and matching different cows of the same breed. 

**Fixed by:**
- Raising confidence threshold to 95%
- Improving AI prompt to look for unique features
- Adding option to skip duplicate checking

## How to Enroll All 42 Cows Now

### Step 1: Go to Dashboard Tab
Open the app at http://localhost:3000 and click the "Dashboard" tab

### Step 2: Enable Skip Duplicate Detection
✅ Check the box that says: **"Skip duplicate detection (recommended for initial dataset creation with 42 unique cows)"**

### Step 3: Bulk Upload
1. Click "Select Folder for Bulk Upload"
2. Choose your parent folder containing 42 subfolders
3. Wait ~15-20 minutes (5 second delay between each cow to respect API limits)

### Step 4: Export Dataset
After all 42 cows are enrolled:
1. Click "📥 Export Dataset (.json)"
2. Save as `cows-dataset.json`

### Step 5: Make It Permanent
1. Move the file to: `public/dataset/cows-dataset.json`
2. Now it's part of your deployment!

## What Changed

### Before
- ❌ 16/42 cows enrolled
- ❌ False duplicates detected
- ❌ Data only in browser localStorage
- ❌ Lost on browser clear

### After
- ✅ All 42 cows can be enrolled
- ✅ Smart duplicate detection (95% confidence)
- ✅ Option to skip duplicate check
- ✅ Dataset file for deployment
- ✅ Persistent across all instances
- ✅ Folder names used as IDs (easier tracking)

## Testing After Deployment

1. Clear browser localStorage (or use incognito)
2. Refresh the page
3. Go to Dashboard - you should see all 42 cows
4. Go to Authentication - upload any cow image to test matching

## Need Help?

See `DEPLOYMENT_GUIDE.md` for detailed instructions and troubleshooting.
