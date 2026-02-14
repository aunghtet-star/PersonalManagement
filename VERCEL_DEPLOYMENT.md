# Vercel Deployment Guide

## ✅ Build Fixed!

The deployment error has been resolved. The issue was an outdated `@google/genai` package version in `package.json`.

**What was fixed:**
- Updated `@google/genai` from `^0.2.1` (doesn't exist) to `^1.41.0` ✓
- Merged Supabase dependencies ✓
- Verified production build works ✓

---

## 🚀 Deploy to Vercel

### Option 1: Push to GitHub (Recommended)

```bash
# Add all changes
git add .

# Commit
git commit -m "fix: Update dependencies and add Supabase integration"

# Push to GitHub
git push origin main
```

Vercel will automatically detect the push and redeploy! 🎉

---

### Option 2: Deploy via Vercel CLI

```bash
# Install Vercel CLI (if not installed)
npm i -g vercel

# Deploy
vercel --prod
```

---

## ⚙️ Environment Variables in Vercel

**IMPORTANT:** You need to add your environment variables in Vercel Dashboard:

1. Go to your project in [Vercel Dashboard](https://vercel.com)
2. Click **Settings** → **Environment Variables**
3. Add these variables:

### Required for AI Chat:
```
API_KEY = your_gemini_api_key_here
```

### Required for Database:
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your_supabase_anon_key_here
```

### Optional for Calendar Integration:
```
REACT_APP_GOOGLE_CLIENT_ID = your_google_client_id
REACT_APP_GOOGLE_API_KEY = your_google_api_key
REACT_APP_MICROSOFT_CLIENT_ID = your_microsoft_client_id
REACT_APP_MICROSOFT_TENANT_ID = common
```

4. **Important:** After adding environment variables, click **Redeploy** to apply them

---

## 🔧 Vercel Configuration

The project includes `vercel.json` with optimized settings:
- ✅ Rewrites configured for SPA
- ✅ Build output directory set to `dist`
- ✅ Node.js version specified

---

## 📝 Post-Deployment Checklist

After deploying:

1. **Update OAuth Redirect URIs** (if using Google/Microsoft Calendar):
   - Google Cloud Console: Add your Vercel URL to authorized origins
   - Azure Portal: Add your Vercel URL to redirect URIs
   - Format: `https://your-app.vercel.app`

2. **Test Your Deployment**:
   - Visit your Vercel URL
   - Check all features work
   - Verify database persistence
   - Test AI Chat

3. **Monitor Build Logs**:
   - If deployment fails, check Vercel build logs
   - Common issues: Missing environment variables

---

## 🐛 Troubleshooting

### Build fails on Vercel
- Check package versions in `package.json`
- Verify all dependencies are published and accessible
- Check Vercel build logs for specific errors

### Environment variables not working
- Ensure variable names match exactly (including prefixes)
- Redeploy after adding/changing variables
- Check Vercel dashboard shows all variables

### Calendar OAuth not working
- Update redirect URIs in Google/Microsoft consoles
- Use your production Vercel URL, not localhost

---

## 🎉 You're Ready!

Your app is now ready to deploy to Vercel. Just commit and push your changes, or use the Vercel CLI!
