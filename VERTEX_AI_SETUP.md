# 🚀 Complete Setup Guide for Vertex AI with Vercel

Congratulations! Your app now uses **Vertex AI with serverless backend** – the best solution for production! 🎉

---

## 📋 What Was Done

✅ Created `/api/chat.ts` - Backend endpoint for Vertex AI  
✅ Created `/api/function-response.ts` - Handles function call responses  
✅ Updated `Chat.tsx` - Now calls backend API (credentials stay secure!)  
✅ Updated `vercel.json` - Configured for API routes  
✅ Installed `@vercel/node` - TypeScript types for Vercel  

---

## 🔑 Setup Steps

### Step 1: Get Your Google Cloud Project ID

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Select or create a project
3. Copy your **Project ID** (Example: `financeflow-123456`)
   - Find it in the project selector dropdown

### Step 2: Enable Vertex AI API

1. In Google Cloud Console → **APIs & Services** → **Library**
2. Search for **"Vertex AI API"**
3. Click **Enable**

### Step 3: Set Up Authentication

For **local development**:
```bash
gcloud auth application-default login
```

This authenticates your local machine with Google Cloud.

---

## 🔧 Local Development Setup

### 1. Update `.env` File

Open `.env` and add your Project ID:

```bash
# ===========================
# Vertex AI Configuration (Backend API)
# ===========================
VERTEX_AI_PROJECT_ID=your-actual-project-id-here
VERTEX_AI_LOCATION=us-central1

# API endpoint (for local dev)
VITE_API_URL=http://localhost:5173
```

### 2. Run Authentication

```bash
gcloud auth application-default login
```

Follow the browser prompt to authenticate.

### 3. Start Development Server

```bash
npm run dev
```

Your app will run at `http://localhost:5173`

### 4. Test the AI Chat

Try asking:
- "What's my total balance?"
- "Schedule a meeting with John tomorrow at 2pm"
- "Am I free on Friday?"

---

## 🌐 Vercel Deployment

### Step 1: Install Vercel CLI (Optional)

```bash
npm i -g vercel
```

### Step 2: Create Service Account for Production

Since Vercel can't use `gcloud auth`, you need a service account:

1. Go to **IAM & Admin** → **Service Accounts** → **Create Service Account**
2. Name it: `financeflow-vercel`
3. Grant role: **Vertex AI User**
4. Click **Done**
5. Click on the service account → **Keys** → **Add Key** → **Create New Key**
6. Choose **JSON** → **Create**
7. Download the JSON file (keep it safe!)

### Step 3: Add Environment Variables in Vercel

1. Go to [Vercel Dashboard](https://vercel.com)
2. Select your project
3. Go to **Settings** → **Environment Variables**
4. Add these variables:

```
VERTEX_AI_PROJECT_ID = your-project-id
VERTEX_AI_LOCATION = us-central1
GOOGLE_APPLICATION_CREDENTIALS_JSON = <paste the ENTIRE contents of the JSON file here>
```

**Important:** For `GOOGLE_APPLICATION_CREDENTIALS_JSON`:
- Open the downloaded JSON file in a text editor
- Copy **ALL** the text (should look like `{"type":"service_account",...}`)
- Paste it as the value in Vercel

**Also add other environment variables:**
```
VITE_SUPABASE_URL = https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY = your_anon_key
REACT_APP_GOOGLE_CLIENT_ID = your_google_client_id
REACT_APP_GOOGLE_API_KEY = your_google_api_key
```

### Step 4: Update API Route to Use JSON Credentials

The backend needs a small update to parse the JSON credentials. Let me create that file:

Create or update `/api/chat.ts` to include at the top (before VertexAI initialization):

```typescript
// Parse credentials from environment
let credentials;
if (process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON) {
  credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON);
}

const vertexAI = new VertexAI({
  project: projectId,
  location: location,
  googleAuthOptions: credentials ? { credentials } : undefined
});
```

### Step 5: Deploy

```bash
# Commit your changes
git add .
git commit -m "feat: Add Vertex AI backend with serverless functions"
git push origin main
```

Vercel will automatically deploy! 🎉

Or use Vercel CLI:
```bash
vercel --prod
```

---

## 🧪 Testing Your Deployment

After deployment, visit:
- Frontend: `https://your-app.vercel.app`
- Test API: `https://your-app.vercel.app/api/chat` (should show CORS headers)

Try the AI chat feature to confirm it works!

---

## 💰 Cost & Credits

Your **Google Developer Program** gives you:
- ✅ $200-300 in free credits (depending on program tier)
- ✅ Credits renew monthly
- ✅ Covers both Vertex AI and other Google Cloud services

**Estimated Costs:**
- Gemini 2.0 Flash: ~$0.0001-0.0005 per request
- For personal use: **< $1/month**
- Well within your free credits!

**Vercel Free Tier:**
- 100GB bandwidth/month
- 100,000 function invocations/month
- More than enough for personal use!

---

## 🐛 Troubleshooting

### Error: "Vertex AI not configured"
- Make sure `VERTEX_AI_PROJECT_ID` is set in Vercel environment variables
- Redeploy after adding variables

### Error: "Permission denied"
- For local: Run `gcloud auth application-default login`
- For Vercel: Check service account key JSON is correct
- Ensure service account has "Vertex AI User" role

### Error: "API not found" or 404
- Ensure `vercel.json` is configured correctly
- API routes should be in `/api` folder
- Redeploy to Vercel

### Function timeout
- Default is 10 seconds (configured in `vercel.json`)
- Should be enough for most requests
- Can increase to 60s on Pro plan

---

## 📁 Project Structure

```
your-project/
├── api/                        # Backend API (Vercel Serverless)
│   ├── chat.ts                # Main chat endpoint
│   └── function-response.ts   # Function call handler
├── components/
│   └── Chat.tsx               # Frontend chat (calls /api/chat)
├── .env                       # Local environment variables
├── vercel.json                # Vercel configuration
└── package.json
```

---

## 🎯 Next Steps

1. ✅ Update `.env` with your Project ID
2. ✅ Run `gcloud auth application-default login`
3. ✅ Test locally with `npm run dev`
4. ✅ Create service account for Vercel
5. ✅ Add environment variables in Vercel Dashboard
6. ✅ Deploy to production!

Your app is now **production-ready** with secure backend API! 🚀

---

## 📚 Additional Resources

- [Vertex AI Documentation](https://cloud.google.com/vertex-ai/docs)
- [Vercel Serverless Functions](https://vercel.com/docs/functions)
- [Google Cloud Free Tier](https://cloud.google.com/free)

Need help? Let me know! 🙌
