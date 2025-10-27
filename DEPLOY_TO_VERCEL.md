# 🚀 Deploy to Vercel - Quick Guide

## ✅ Your Code is on GitHub!

**Repository:** https://github.com/amioykr82/Gomata-Adhaar-System

---

## 🌐 Deploy to Vercel (3 Minutes)

### Step 1: Go to Vercel

Open: https://vercel.com

### Step 2: Sign Up / Sign In

- Click "Sign Up" or "Login"
- Choose "Continue with GitHub"
- Authorize Vercel to access your GitHub

### Step 3: Import Project

1. Click "Add New..." → "Project"
2. You'll see your GitHub repositories
3. Find "Gomata-Adhaar-System"
4. Click "Import"

### Step 4: Configure Project

**Framework Preset:** Vite (should be auto-detected)

**Build Settings:**
- Build Command: `npm run build` ✅ (auto-filled)
- Output Directory: `dist` ✅ (auto-filled)
- Install Command: `npm install` ✅ (auto-filled)

### Step 5: Add Environment Variable

**IMPORTANT:** Add your Gemini API key

1. Click "Environment Variables"
2. Add variable:
   - **Name:** `GEMINI_API_KEY`
   - **Value:** Your API key from https://ai.google.dev/
3. Click "Add"

### Step 6: Deploy!

1. Click "Deploy"
2. Wait 1-2 minutes (watch the build logs)
3. ✅ Done!

---

## 🎉 Your Live URL

After deployment, you'll get a URL like:

```
https://gomata-adhaar-system.vercel.app
```

Or:

```
https://gomata-adhaar-system-amioykr82.vercel.app
```

---

## 🧪 Test Your Deployment

1. Visit your live URL
2. Test enrollment
3. Test authentication
4. Check if everything works

---

## 🔄 Automatic Deployments

From now on, every time you push to GitHub:

```bash
git add .
git commit -m "Update feature"
git push
```

Vercel will automatically:
1. Detect the push
2. Build your app
3. Deploy the new version
4. Update your live URL

---

## 🌍 Custom Domain (Optional)

Want your own domain like `cattle-aadhaar.com`?

1. Go to Project Settings → Domains
2. Click "Add Domain"
3. Enter your domain
4. Follow DNS instructions
5. Done!

---

## 📊 Monitor Your App

**Vercel Dashboard:**
- View deployments
- Check analytics
- See build logs
- Monitor performance

---

## 🎯 Next Steps

After deployment:

1. ✅ Share your live URL
2. ✅ Test all features
3. ✅ Add custom domain (optional)
4. ✅ Monitor usage
5. ✅ Keep updating via GitHub

---

## 🆘 Need Help?

- **Vercel Docs:** https://vercel.com/docs
- **Support:** https://vercel.com/support
- **Community:** https://github.com/vercel/vercel/discussions

---

**Your app is ready to deploy! 🚀**

**Start here:** https://vercel.com
