# 🚀 Supabase Setup Guide for FinanceFlow

This guide will walk you through setting up Supabase for your FinanceFlow application.

## Prerequisites

✅ Already completed:
- [x] npm dependencies installed
- [x] Supabase CLI installed
- [x] Local Supabase project initialized
- [x] Database migrations created
- [x] React hooks created

## Step 1: Create a Supabase Project (Online)

1. Go to [https://supabase.com](https://supabase.com)
2. Sign up or log in
3. Click "New Project"
4. Fill in the details:
   - **Project Name**: `financeflow` (or any name you prefer)
   - **Database Password**: Create a strong password (save this!)
   - **Region**: Choose closest to you
5. Click "Create new project" and wait 2-3 minutes

## Step 2: Get Your API Credentials

1. In your Supabase Dashboard, go to **Settings** → **API**
2. Copy these two values:

   **Project URL**: `https://xxxxxxxxxxxxx.supabase.co`
   **anon public key**: `eyJhbGc.............` (very long string)

## Step 3: Update Your .env File

Open your `.env` file and replace the placeholder values:

```bash
# Replace these with your actual Supabase credentials:
VITE_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGc.............
```

## Step 4: Link Your Local Project (Optional but Recommended)

This allows you to sync local migrations with your remote database:

```bash
# Get your Project Reference ID from Supabase Dashboard → Settings → General
supabase link --project-ref <your-project-ref>
```

## Step 5: Push Database Schema to Supabase

Run the migrations to create your tables:

```bash
supabase db push
```

This will create all 5 tables:
- ✅ accounts
- ✅ transactions
- ✅ personal_logs
- ✅ calendar_events
- ✅ external_calendars

## Step 6: Verify Your Setup

1. **Check Tables**: Go to your Supabase Dashboard → **Table Editor**
   - You should see all 5 tables
   - `accounts` should have 3 initial accounts (KBZ Banking, Hand Cash, KPay)

2. **Run Your App**:
   ```bash
   npm run dev
   ```

3. **Test Persistence**:
   - Add a new account or transaction
   - Refresh the page
   - Data should persist! 🎉

## Troubleshooting

### "Supabase credentials not configured"
- Make sure `.env` has correct `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY`
- Restart your dev server after updating `.env`

### "relation does not exist"
- Run `supabase db push` to create tables
- Check Supabase Dashboard → **Table Editor** to verify tables exist

### Data not persisting
- Check browser console for errors
- Verify API keys are correct
- Check Supabase Dashboard → **Authentication** → **Policies** to ensure RLS policies are enabled

## Next Steps (Optional)

### Add Authentication
If you want multi-user support:
1. Enable Email/Password auth in Supabase Dashboard
2. Update RLS policies to filter by user ID
3. Add login/signup components

### Enable Realtime
To sync data across tabs instantly:
1. Enable Realtime in Supabase Dashboard → **Database** → **Replication**
2. Subscribe to table changes in your hooks

## Need Help?

- Supabase Docs: https://supabase.com/docs
- FinanceFlow now works offline if Supabase is not configured (falls back to in-memory state)
