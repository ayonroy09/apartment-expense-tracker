# 🚀 GitHub Setup Commands

## Quick Setup (Copy & Paste)

### 1. Initialize Git Repository
```bash
cd apartment-expense-tracker
git init
git add .
git commit -m "Initial commit: Apartment Expense Tracker"
git branch -M main
```

### 2. Configure Git (If First Time)
```bash
git config --global user.name "Your Name"
git config --global user.email "your.email@example.com"
```

### 3. Create GitHub Repository
1. Go to https://github.com/new
2. Repository name: `apartment-expense-tracker`
3. Make it **PUBLIC** (required for free deployment)
4. **Don't** initialize with README
5. Click "Create repository"

### 4. Connect and Push to GitHub
```bash
# Replace YOUR_USERNAME with your actual GitHub username
git remote add origin https://github.com/YOUR_USERNAME/apartment-expense-tracker.git
git push -u origin main
```

## 🌐 Deploy to Free Hosting

### Option 1: Render (Recommended)
1. Visit https://render.com
2. Sign up with GitHub
3. Click "New +" → "Web Service"
4. Connect your repository
5. Settings:
   - **Build Command**: `bun install && bun run build`
   - **Start Command**: `bun start`
   - **Plan**: Free

### Option 2: Cyclic
1. Visit https://cyclic.sh
2. Sign in with GitHub
3. Click "Link Your Own"
4. Select your repository
5. Automatic deployment!

### Option 3: Glitch
1. Visit https://glitch.com
2. Sign up with GitHub
3. "New Project" → "Import from GitHub"
4. Enter: `https://github.com/YOUR_USERNAME/apartment-expense-tracker`

## ✅ Verification Checklist

After deployment:
- [ ] Website loads successfully
- [ ] Can login with member passcode: `kayes2024`
- [ ] Can add test expense
- [ ] Can login with admin passcode: `admin2024`
- [ ] Admin dashboard shows data
- [ ] Month/year selector works
- [ ] Currency shows BDT (৳)

## 🔑 Access Codes Reference

### Members
- S.M Kayes Zaman: `kayes2024`
- Arafat Hossain: `arafat2024`
- Ayon Roy: `ayon2024`
- Rashed Khan: `rashed2024`
- Protik Sarker Opu: `protik2024`

### Admin
- Administrator: `admin2024`

## 🆘 Troubleshooting

**Build fails?**
- Check all files are committed to GitHub
- Try build command: `npm install && npm run build`

**Can't connect to GitHub?**
- Verify repository is PUBLIC
- Check GitHub username in URL
- Ensure you have push permissions

**App won't start?**
- Check start command: `bun start` or `node server.js`
- Verify package.json has correct scripts

## 📞 Need Help?

Check the detailed guide: `FREE-HOSTING-GUIDE.md`