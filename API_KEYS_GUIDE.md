# 🔑 API Keys Setup Guide

This guide helps you configure all the API keys needed for FinanceFlow features.

## Overview

| Feature | Required? | API Keys Needed |
|---------|-----------|-----------------|
| **Basic App** | ✅ Required | None |
| **AI Chat** | ⭐ Recommended | Gemini API Key |
| **Database Persistence** | ⭐ Recommended | Supabase URL + Key |
| **Google Calendar** | Optional | Google Client ID + API Key |
| **Outlook Calendar** | Optional | Microsoft Client ID |

---

## 1. Gemini API Key (AI Chat)

### Get Your API Key:
1. Go to [https://aistudio.google.com/apikey](https://aistudio.google.com/apikey)
2. Click "Create API Key"
3. Copy the key

### Add to .env:
```bash
API_KEY=AIzaSy...your_actual_key_here
```

### Test It:
- Open your app and go to "AI Advisor"
- Ask a question about your finances
- You should get a response!

---

## 2. Supabase (Database Persistence)

See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for detailed instructions.

### Quick Steps:
1. Create project at [supabase.com](https://supabase.com)
2. Get credentials from Settings → API
3. Add to `.env`:
```bash
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc...
```
4. Run migrations:
```bash
supabase db push
```

---

## 3. Google Calendar Integration (Optional)

### Setup Steps:

#### 3.1 Create Google Cloud Project
1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing
3. Enable "Google Calendar API":
   - Go to **APIs & Services** → **Library**
   - Search for "Google Calendar API"
   - Click "Enable"

#### 3.2 Create OAuth 2.0 Credentials
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **OAuth client ID**
3. Configure consent screen if prompted:
   - User Type: External
   - App name: FinanceFlow
   - Add your email
   - Scopes: Leave default
4. Application type: **Web application**
5. Authorized JavaScript origins:
   - `http://localhost:5173` (Vite dev server)
   - `http://localhost:3000` (if using different port)
6. Copy the **Client ID**

#### 3.3 Create API Key
1. Go to **APIs & Services** → **Credentials**
2. Click **Create Credentials** → **API key**
3. Copy the **API Key**
4. (Optional) Restrict the key to Google Calendar API only

#### 3.4 Add to .env:
```bash
REACT_APP_GOOGLE_CLIENT_ID=123456789-abc...apps.googleusercontent.com
REACT_APP_GOOGLE_API_KEY=AIzaSy...your_api_key
```

### Test It:
- Open your app → **Schedule**
- Click "Connect Google Calendar"
- Authorize the app
- Your Google Calendar events should appear!

---

## 4. Microsoft Outlook Calendar (Optional)

### Setup Steps:

#### 4.1 Register App in Azure
1. Go to [Azure Portal](https://portal.azure.com/)
2. Navigate to **Microsoft Entra ID** (formerly Azure Active Directory)
3. Click **App registrations** → **New registration**
4. Fill in details:
   - **Name**: FinanceFlow
   - **Supported account types**: Personal Microsoft accounts only
   - **Redirect URI**: 
     - Platform: **Single-page application (SPA)**
     - URI: `http://localhost:5173`
5. Click "Register"

#### 4.2 Configure Authentication
1. In your app, go to **Authentication**
2. Under **Implicit grant and hybrid flows**, enable:
   - ✅ Access tokens
   - ✅ ID tokens
3. Save

#### 4.3 API Permissions
1. Go to **API permissions**
2. Click **Add a permission** → **Microsoft Graph**
3. Select **Delegated permissions**
4. Add these permissions:
   - `Calendars.Read`
   - `User.Read`
5. Click "Add permissions"

#### 4.4 Get Client ID
1. Go to **Overview**
2. Copy **Application (client) ID**

#### 4.5 Add to .env:
```bash
REACT_APP_MICROSOFT_CLIENT_ID=12345abc-67de-...
REACT_APP_MICROSOFT_TENANT_ID=common
```

### Test It:
- Open your app → **Schedule**
- Click "Connect Outlook Calendar"
- Sign in with your Microsoft account
- Your Outlook events should appear!

---

## 🚨 Security Notes

- ✅ **Never commit `.env` to Git** - it's already in `.gitignore`
- ✅ **Keep API keys secret** - don't share them publicly
- ✅ The "anon" Supabase key is safe for frontend (protected by Row Level Security)
- ⚠️ For production, consider using environment variables in your hosting platform

---

## Troubleshooting

### "API Key not configured"
- Check `.env` file exists in project root
- Ensure variable names match exactly (including `VITE_` and `REACT_APP_` prefixes)
- Restart dev server after updating `.env`

### Calendar not syncing
- Check browser console for errors
- Verify redirect URIs match your dev server URL
- For Google: Make sure Calendar API is enabled in Cloud Console
- For Microsoft: Verify app has correct permissions

### Still having issues?
1. Check browser console for error messages
2. Verify API keys are valid (not expired/revoked)
3. Try in incognito/private browsing mode
4. Clear browser cache and localStorage

---

## Next Steps

Once you have your API keys configured:

1. ✅ Start the app: `npm run dev`
2. ✅ Test each feature:
   - Add accounts and transactions (should persist if Supabase is configured)
   - Try AI Chat (needs Gemini key)
   - Connect calendars (needs respective API keys)
3. ✅ Enjoy your fully-featured personal management app! 🎉
