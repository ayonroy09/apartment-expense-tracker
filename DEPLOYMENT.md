# Deployment Guide - Apartment Expense Tracker

This guide covers how to deploy your apartment expense tracker to various free hosting platforms.

## 🚀 Quick Overview

Your application now includes:
- **Frontend**: React + Vite + TypeScript + TailwindCSS
- **Backend**: Express.js API server with SQLite database
- **Database**: SQLite (file-based, no external dependencies)

## 📋 Prerequisites

Before deploying, ensure you have:
- Git installed on your local machine
- Node.js 18+ installed
- A GitHub account (for most deployment options)

## 🌐 Deployment Options

### Option 1: Railway (Recommended)
Railway offers excellent Node.js support with automatic builds and SQLite persistence.

#### Steps:
1. **Create a GitHub repository**:
   ```bash
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/yourusername/apartment-expense-tracker.git
   git push -u origin main
   ```

2. **Deploy to Railway**:
   - Visit [railway.app](https://railway.app)
   - Sign in with GitHub
   - Click "New Project" → "Deploy from GitHub repo"
   - Select your repository
   - Railway will automatically detect Node.js and deploy

3. **Configuration**:
   - Railway automatically runs `bun start` (which runs `node server.js`)
   - Your app will be available at `https://your-app-name.railway.app`
   - SQLite database persists automatically

#### Environment Variables (Optional):
- `PORT`: Railway sets this automatically
- `NODE_ENV`: Set to `production`

### Option 2: Render
Render offers reliable hosting with good SQLite support.

#### Steps:
1. **Push to GitHub** (same as Railway step 1)

2. **Deploy to Render**:
   - Visit [render.com](https://render.com)
   - Sign in with GitHub
   - Click "New" → "Web Service"
   - Connect your repository

3. **Configuration**:
   - **Build Command**: `bun install && bun run build`
   - **Start Command**: `bun start`
   - **Environment**: Node
   - **Auto-Deploy**: Yes

### Option 3: Heroku
Free tier has limitations but works well for small applications.

#### Steps:
1. **Install Heroku CLI**:
   ```bash
   # macOS
   brew install heroku/brew/heroku
   
   # Windows/Linux - visit heroku.com/platform
   ```

2. **Deploy**:
   ```bash
   heroku login
   heroku create your-app-name
   git push heroku main
   ```

3. **Configuration**:
   - Heroku automatically detects Node.js
   - Add `"engines": { "node": "18.x" }` to package.json if needed

### Option 4: Vercel (Frontend + Serverless Functions)
Good for frontend with API routes, but database persistence is limited.

#### Steps:
1. **Install Vercel CLI**:
   ```bash
   npm i -g vercel
   ```

2. **Configure for Vercel**:
   Create `vercel.json`:
   ```json
   {
     "version": 2,
     "builds": [
       { "src": "server.js", "use": "@vercel/node" },
       { "src": "package.json", "use": "@vercel/static-build" }
     ],
     "routes": [
       { "src": "/api/(.*)", "dest": "/server.js" },
       { "src": "/(.*)", "dest": "/dist/$1" }
     ]
   }
   ```

3. **Deploy**:
   ```bash
   vercel --prod
   ```

**Note**: Vercel has limitations with SQLite persistence. Consider using PostgreSQL for production.

## 🗄️ Database Considerations

### SQLite (Current Setup)
- ✅ **Pros**: No external dependencies, simple setup
- ✅ **Works well for**: Small teams (5-10 users), low traffic
- ❌ **Limitations**: File-based, limited concurrent writes

### PostgreSQL (Production Alternative)
For higher traffic or better reliability, consider PostgreSQL:

#### Free PostgreSQL Options:
1. **Supabase** (recommended)
2. **Railway PostgreSQL addon**
3. **Render PostgreSQL**
4. **ElephantSQL**

#### Migration to PostgreSQL:
If you want to upgrade later, replace SQLite with PostgreSQL:
```bash
bun add pg
bun add -D @types/pg
```

Update connection string in `server.js`.

## 🔧 Build Configuration

### Production Optimizations

1. **Update package.json**:
   ```json
   {
     "scripts": {
       "build": "vite build",
       "start": "node server.js",
       "dev": "vite",
       "dev:server": "node server.js"
     },
     "engines": {
       "node": "18.x"
     }
   }
   ```

2. **Environment Variables**:
   Create `.env` file (don't commit this):
   ```
   NODE_ENV=production
   PORT=5000
   ADMIN_PASSCODE=admin2024
   ```

## 🛡️ Security Best Practices

1. **Environment Variables**:
   - Store sensitive data in environment variables
   - Never commit passwords or API keys
   - Use different passcodes for production

2. **HTTPS**:
   - All recommended platforms provide HTTPS automatically
   - Always use HTTPS in production

3. **Database Security**:
   - Regular backups
   - Monitor for unusual activity
   - Consider encryption for sensitive data

## 🚀 Going Live

### Pre-deployment Checklist:
- [ ] Test all functionality locally
- [ ] Update passcodes for production
- [ ] Configure environment variables
- [ ] Test with multiple users
- [ ] Backup strategy in place

### Post-deployment:
- [ ] Test all features on live site
- [ ] Share access credentials with roommates
- [ ] Set up monitoring/alerts (optional)
- [ ] Document the URL for easy access

## 📱 Mobile Access

Your app is fully responsive and works great on mobile devices. Users can:
- Bookmark the URL on their phone's home screen
- Use it like a native app
- Access it from anywhere with internet

## 🔄 Updates and Maintenance

### Updating the Application:
1. Make changes locally
2. Test thoroughly
3. Commit and push to GitHub
4. Most platforms auto-deploy from GitHub

### Database Backups:
- SQLite: Copy the `apartment_tracker.db` file
- PostgreSQL: Use platform-specific backup tools

### Monitoring:
- Check logs regularly for errors
- Monitor database size
- Keep dependencies updated

## 🆘 Troubleshooting

### Common Issues:

1. **Build Failures**:
   - Check Node.js version compatibility
   - Ensure all dependencies are in package.json
   - Check build logs for specific errors

2. **Database Connection Issues**:
   - Verify database file permissions
   - Check SQLite version compatibility
   - Review connection string format

3. **API Errors**:
   - Check CORS configuration
   - Verify API endpoints
   - Review server logs

### Getting Help:
- Check platform-specific documentation
- Review application logs
- Test locally first
- Check GitHub issues for similar problems

## 📞 Support

For deployment-specific issues:
- **Railway**: [docs.railway.app](https://docs.railway.app)
- **Render**: [render.com/docs](https://render.com/docs)
- **Heroku**: [devcenter.heroku.com](https://devcenter.heroku.com)
- **Vercel**: [vercel.com/docs](https://vercel.com/docs)

---

## 🎉 You're Ready!

Choose your preferred platform and follow the steps above. Railway is recommended for its simplicity and SQLite support, but all options will work well for your apartment expense tracker.

Your roommates will love having easy access to expense tracking from any device! 🏠💰