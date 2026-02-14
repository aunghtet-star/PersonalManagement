<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://github.com/user-attachments/assets/0aa67016-6eaf-458a-adb2-6e31a0763ed6" />
</div>

# FinanceFlow MVP - Personal Management App

A comprehensive personal management application with finance tracking, AI advisor, calendar integration, and personal growth tracking.

## ✨ Features

- 💰 **Finance Management**: Track accounts, transactions, and budgets
- 🤖 **AI Advisor**: Get financial advice powered by Google Gemini
- 📅 **Calendar Integration**: Sync with Google Calendar and Outlook
- 📝 **Personal Growth**: Track daily habits (water, exercise, sleep, meditation, study)
- 🗒️ **Notes**: Daily journal and notes
- 💾 **Database Persistence**: All data saved to Supabase

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm

### Installation

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Configure API keys:**
   - Copy `.env` and add your API keys
   - See [API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md) for detailed instructions

3. **Set up Supabase (for database persistence):**
   - See [SUPABASE_SETUP.md](./SUPABASE_SETUP.md) for step-by-step guide

4. **Run the app:**
   ```bash
   npm run dev
   ```

5. **Open in browser:**
   - Navigate to `http://localhost:5173`

## 📚 Documentation

- **[SETUP_COMPLETE.md](./SETUP_COMPLETE.md)** - Overview of what's been set up
- **[API_KEYS_GUIDE.md](./API_KEYS_GUIDE.md)** - How to get all required API keys
- **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)** - Supabase database setup guide

## 🔑 Required API Keys

| Feature | Required? | Where to Get |
|---------|-----------|--------------|
| Basic App | ✅ Always | None needed |
| AI Chat | ⭐ Recommended | [Google AI Studio](https://aistudio.google.com/apikey) |
| Database | ⭐ Recommended | [Supabase](https://supabase.com) |
| Google Calendar | Optional | [Google Cloud Console](https://console.cloud.google.com/) |
| Outlook Calendar | Optional | [Azure Portal](https://portal.azure.com/) |

## 🛠️ Tech Stack

- **Frontend**: React 19 + TypeScript
- **Build Tool**: Vite
- **Database**: Supabase (PostgreSQL)
- **AI**: Google Gemini
- **Calendar APIs**: Google Calendar API, Microsoft Graph API
- **Icons**: Lucide React

## 📁 Project Structure

```
PersonalManagement/
├── components/          # React components
│   ├── Dashboard.tsx
│   ├── Accounts.tsx
│   ├── Transactions.tsx
│   ├── Schedule.tsx
│   ├── Personal.tsx
│   ├── Notes.tsx
│   └── Chat.tsx
├── hooks/              # Custom React hooks
│   ├── useAccounts.ts
│   ├── useTransactions.ts
│   ├── usePersonalLogs.ts
│   └── useCalendarEvents.ts
├── lib/                # Utilities
│   └── supabase.ts     # Supabase client
├── supabase/           # Database migrations
│   └── migrations/
├── App.tsx             # Main app component
├── types.ts            # TypeScript type definitions
└── .env                # Environment variables (not in git)
```

## 🎯 Development

```bash
# Run development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🌟 App Views

1. **Dashboard** - Overview of accounts and recent transactions
2. **Accounts** - Manage bank accounts, cash, mobile money
3. **Transactions** - Track income and expenses
4. **Schedule** - Calendar with Google/Outlook integration
5. **Notes** - Daily journal
6. **Personal Growth** - Track daily habits
7. **AI Advisor** - Get financial advice

## 📝 Environment Variables

Create a `.env` file with:

```bash
# AI Chat (Gemini)
API_KEY=your_gemini_api_key

# Database (Supabase)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key

# Google Calendar (Optional)
REACT_APP_GOOGLE_CLIENT_ID=your_google_client_id
REACT_APP_GOOGLE_API_KEY=your_google_api_key

# Microsoft Outlook (Optional)
REACT_APP_MICROSOFT_CLIENT_ID=your_microsoft_client_id
REACT_APP_MICROSOFT_TENANT_ID=common
```

## 🤝 Contributing

This is a personal project, but feel free to fork and customize!

## 📄 License

Private project

## 🔗 Links

- View your app in AI Studio: https://ai.studio/apps/drive/16W_uF9uMtY3XBLFgAe3ly069cpl97DeU
