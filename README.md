# 🐄 Gomata Aadhaar System

**National Cattle Identification Platform** - A professional, government-standard digital identity system for cattle using AI-powered biometric recognition.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https://github.com/amioykr82/gomata-aadhaar)
[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/amioykr82/gomata-aadhaar)

---

## 🌟 Features

- **12-Digit Aadhaar IDs** - Government-standard unique identification for each cattle
- **AI-Powered Breed Recognition** - Automatic breed identification using Google Gemini AI
- **Biometric Authentication** - Verify cattle identity using image matching (95%+ accuracy)
- **Bulk Enrollment** - Process multiple cattle records at once
- **Professional UI** - Clean, government-standard interface
- **Offline-First** - Works with localStorage, no backend required
- **Export/Import** - Portable dataset for deployment and backup

---

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ 
- Gemini API Key ([Get one free](https://ai.google.dev/))

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/amioykr82/gomata-aadhaar.git
   cd gomata-aadhaar
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   ```bash
   cp .env.example .env.local
   # Edit .env.local and add your GEMINI_API_KEY
   ```

4. **Run the development server**
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

---

## 📦 Deployment

### Option 1: Vercel (Recommended)

1. **Push to GitHub** (see instructions below)

2. **Deploy to Vercel**
   - Go to [vercel.com](https://vercel.com)
   - Click "New Project"
   - Import your GitHub repository
   - Add environment variable: `GEMINI_API_KEY`
   - Click "Deploy"

3. **Done!** Your app is live at `https://your-app.vercel.app`

### Option 2: Netlify

1. **Push to GitHub** (see instructions below)

2. **Deploy to Netlify**
   - Go to [netlify.com](https://netlify.com)
   - Click "Add new site" → "Import an existing project"
   - Connect to GitHub and select your repository
   - Build settings are auto-detected from `netlify.toml`
   - Add environment variable: `GEMINI_API_KEY`
   - Click "Deploy"

3. **Done!** Your app is live at `https://your-app.netlify.app`

### Option 3: Cloudflare Pages

1. **Push to GitHub** (see instructions below)

2. **Deploy to Cloudflare Pages**
   - Go to [pages.cloudflare.com](https://pages.cloudflare.com)
   - Click "Create a project"
   - Connect to GitHub and select your repository
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Add environment variable: `GEMINI_API_KEY`
   - Click "Save and Deploy"

3. **Done!** Your app is live at `https://your-app.pages.dev`

---

## 📤 Push to GitHub

### First Time Setup

1. **Initialize Git** (if not already done)
   ```bash
   git init
   ```

2. **Add all files**
   ```bash
   git add .
   ```

3. **Commit**
   ```bash
   git commit -m "Initial commit: Gomata Aadhaar System"
   ```

4. **Create repository on GitHub**
   - Go to [github.com/new](https://github.com/new)
   - Repository name: `gomata-aadhaar`
   - Description: "National Cattle Identification System"
   - Public or Private (your choice)
   - Don't initialize with README (we already have one)
   - Click "Create repository"

5. **Push to GitHub**
   ```bash
   git remote add origin https://github.com/amioykr82/gomata-aadhaar.git
   git branch -M main
   git push -u origin main
   ```

### Future Updates

```bash
git add .
git commit -m "Your commit message"
git push
```

---

## 🗂️ Project Structure

```
gomata-aadhaar/
├── components/          # React components
│   ├── icons/          # Icon components
│   ├── CowCard.tsx     # Cattle detail card
│   ├── Dashboard.tsx   # Management dashboard
│   └── ...
├── services/           # API services
│   └── geminiService.ts # Gemini AI integration
├── public/
│   └── dataset/        # Dataset storage
│       └── cows-dataset.json # Deployed cattle records
├── App.tsx             # Main application
├── utils.ts            # Utility functions
├── types.ts            # TypeScript types
├── vite.config.ts      # Vite configuration
├── vercel.json         # Vercel deployment config
├── netlify.toml        # Netlify deployment config
└── package.json        # Dependencies
```

---

## 🔑 Environment Variables

Create a `.env.local` file:

```env
GEMINI_API_KEY=your_api_key_here
```

**Get your API key:**
1. Visit [ai.google.dev](https://ai.google.dev/)
2. Sign in with Google account
3. Click "Get API key"
4. Copy and paste into `.env.local`

---

## 📊 Usage

### 1. Enrollment
- Go to "Enrollment" tab
- Upload cattle images
- Add notes (optional)
- Click "Generate Aadhaar ID"
- System generates unique 12-digit ID

### 2. Authentication
- Go to "Authentication" tab
- Upload cattle image
- Click "Verify Cattle Identity"
- System matches against enrolled records

### 3. Bulk Enrollment
- Go to "Management" tab
- Check "Skip duplicate detection" (for first time)
- Click "Select Folder for Bulk Upload"
- Select parent folder with subfolders (one per cattle)
- Wait for processing (~5 seconds per cattle)

### 4. Export Dataset
- Go to "Management" tab
- Click "Export Dataset"
- Save the JSON file
- Place in `public/dataset/cows-dataset.json`
- Redeploy for production use

---

## 🛠️ Tech Stack

- **Frontend:** React 19, TypeScript
- **Build Tool:** Vite
- **AI:** Google Gemini 2.5 Flash
- **Styling:** Tailwind CSS (via CDN)
- **Storage:** Browser localStorage + JSON dataset
- **Deployment:** Vercel / Netlify / Cloudflare Pages

---

## 📝 License

MIT License - feel free to use for any purpose

---

## 🤝 Contributing

Contributions welcome! Please feel free to submit a Pull Request.

---

## 📧 Support

For issues or questions, please open an issue on GitHub.

---

## 🙏 Acknowledgments

- Powered by Google Gemini AI
- Inspired by India's Aadhaar system
- Built for cattle welfare and management

---

**Made with ❤️ for cattle welfare**
