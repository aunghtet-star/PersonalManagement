import React, { useState, useEffect } from 'react';
import { Account, Transaction, View, DailyLog, CalendarEvent, ExternalCalendar } from './types';
import { INITIAL_ACCOUNTS, INITIAL_TRANSACTIONS } from './constants';
import { generateId } from './utils';
import Sidebar from './components/Sidebar';
import Dashboard from './components/Dashboard';
import Accounts from './components/Accounts';
import Transactions from './components/Transactions';
import Chat from './components/Chat';
import Personal from './components/Personal';
import Schedule from './components/Schedule';
import Notes from './components/Notes';
import { Menu } from 'lucide-react';

// --- Configuration ---
const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "";
const GOOGLE_API_KEY = import.meta.env.VITE_GOOGLE_API_KEY || "";
const MICROSOFT_CLIENT_ID = import.meta.env.VITE_MICROSOFT_CLIENT_ID || "";
const MICROSOFT_TENANT_ID = import.meta.env.VITE_MICROSOFT_TENANT_ID || "common";

const GOOGLE_DISCOVERY_DOCS = ['https://www.googleapis.com/discovery/v1/apis/calendar/v3/rest'];
const GOOGLE_SCOPES = 'https://www.googleapis.com/auth/calendar.readonly';
const MICROSOFT_SCOPES = ['Calendars.Read', 'User.Read'];

export default function App() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [personalLogs, setPersonalLogs] = useState<DailyLog[]>([]);

  // Calendar State
  const [events, setEvents] = useState<CalendarEvent[]>([]);
  const [externalCalendars, setExternalCalendars] = useState<ExternalCalendar[]>([
    { id: 'local-1', summary: 'My Personal Calendar', provider: 'local', selected: true, backgroundColor: '#3b82f6' }
  ]);

  const [isGoogleConnected, setIsGoogleConnected] = useState(false);
  const [isMicrosoftConnected, setIsMicrosoftConnected] = useState(false);

  const [currentView, setCurrentView] = useState<View>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);

  // API State
  const [tokenClient, setTokenClient] = useState<any>(null);
  const [gapiInited, setGapiInited] = useState(false);
  const [msalInstance, setMsalInstance] = useState<any>(null);

  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  // --- API Initializations ---
  useEffect(() => {
    const checkGoogleScripts = setInterval(() => {
      if (typeof window !== 'undefined' && window.gapi && window.google) {
        clearInterval(checkGoogleScripts);
        initializeGoogleAPI();
      }
    }, 500);

    const checkMsalScripts = setInterval(() => {
      if (typeof window !== 'undefined' && window.msal) {
        clearInterval(checkMsalScripts);
        initializeMicrosoftAPI();
      }
    }, 500);

    return () => {
      clearInterval(checkGoogleScripts);
      clearInterval(checkMsalScripts);
    };
  }, []);

  const initializeGoogleAPI = () => {
    // Safety check: Don't initialize if keys are missing or default
    if (!GOOGLE_CLIENT_ID || !GOOGLE_API_KEY || GOOGLE_CLIENT_ID.includes('your_google_client_id')) {
      console.warn("Google Client ID/API Key not configured in .env");
      return;
    }

    window.gapi.load('client', async () => {
      try {
        await window.gapi.client.init({
          apiKey: GOOGLE_API_KEY,
          discoveryDocs: GOOGLE_DISCOVERY_DOCS,
        });
        setGapiInited(true);
      } catch (error) {
        console.error("Error initializing GAPI client:", error);
      }
    });

    try {
      const client = window.google.accounts.oauth2.initTokenClient({
        client_id: GOOGLE_CLIENT_ID,
        scope: GOOGLE_SCOPES,
        callback: async (resp: any) => {
          if (resp.error) return;
          setIsGoogleConnected(true);
          await fetchGoogleData();
        },
      });
      setTokenClient(client);
    } catch (error) {
      console.error("Error initializing GIS client:", error);
    }
  };

  const initializeMicrosoftAPI = async () => {
    // Safety check: Don't initialize if Client ID is missing or default
    if (!MICROSOFT_CLIENT_ID || MICROSOFT_CLIENT_ID.includes('your_microsoft_client_id')) {
      console.warn("Microsoft Client ID not configured in .env");
      return;
    }

    try {
      const msalConfig = {
        auth: {
          clientId: MICROSOFT_CLIENT_ID,
          authority: `https://login.microsoftonline.com/${MICROSOFT_TENANT_ID}`,
          redirectUri: window.location.origin,
        },
        cache: {
          cacheLocation: "sessionStorage",
          storeAuthStateInCookie: false,
        }
      };
      const msalPC = new window.msal.PublicClientApplication(msalConfig);
      await msalPC.initialize();
      setMsalInstance(msalPC);

      // Check for existing session and auto-connect
      const accounts = msalPC.getAllAccounts();
      if (accounts.length > 0) {
        setIsMicrosoftConnected(true);
        fetchMicrosoftData(accounts[0], msalPC);
      }
    } catch (error) {
      console.error("Error initializing MSAL:", error);
    }
  };

  // --- Auth Handlers ---

  const handleConnectGoogle = () => {
    if (!tokenClient) {
      alert("Google Calendar is not configured. Please add VITE_GOOGLE_CLIENT_ID and VITE_GOOGLE_API_KEY to your .env file.");
      return;
    }
    if (window.gapi.client.getToken() === null) {
      tokenClient.requestAccessToken({ prompt: 'consent' });
    } else {
      tokenClient.requestAccessToken({ prompt: '' });
    }
  };

  const handleConnectMicrosoft = async () => {
    if (!msalInstance) {
      alert("Outlook Calendar is not configured. Please add REACT_APP_MICROSOFT_CLIENT_ID to your .env file.");
      return;
    }
    try {
      // Check if already connected first
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        setIsMicrosoftConnected(true);
        await fetchMicrosoftData(accounts[0], msalInstance);
        return;
      }

      // Otherwise login
      const loginResponse = await msalInstance.loginPopup({
        scopes: MICROSOFT_SCOPES
      });
      if (loginResponse && loginResponse.account) {
        setIsMicrosoftConnected(true);
        await fetchMicrosoftData(loginResponse.account, msalInstance);
      }
    } catch (error) {
      console.error("Microsoft Login Error:", error);
    }
  };

  // --- Data Fetching Logic ---

  // Google Data
  const fetchGoogleData = async () => {
    if (!gapiInited) return;
    try {
      // 1. Fetch Calendars
      const response = await window.gapi.client.calendar.calendarList.list();
      const googleCals: ExternalCalendar[] = response.result.items.map((item: any) => ({
        id: item.id,
        summary: item.summary,
        backgroundColor: item.backgroundColor,
        primary: item.primary,
        selected: item.primary || false,
        provider: 'google'
      }));

      setExternalCalendars(prev => {
        const others = prev.filter(c => c.provider !== 'google');
        return [...others, ...googleCals];
      });

      // 2. Fetch Events for selected
      await fetchGoogleEvents(googleCals.filter(c => c.selected));
    } catch (err) {
      console.error("Error fetching Google data:", err);
      setIsGoogleConnected(false); // Likely token expired
    }
  };

  const fetchGoogleEvents = async (calendarsToFetch: ExternalCalendar[]) => {
    try {
      const promises = calendarsToFetch.map(async (cal) => {
        try {
          const response = await window.gapi.client.calendar.events.list({
            'calendarId': cal.id,
            'timeMin': (new Date()).toISOString(),
            'showDeleted': false,
            'singleEvents': true,
            'maxResults': 50,
            'orderBy': 'startTime',
          });
          return response.result.items.map((item: any) => ({
            id: item.id,
            title: item.summary || '(No Title)',
            start: item.start.dateTime || item.start.date,
            end: item.end.dateTime || item.end.date,
            type: 'google',
            description: item.description,
            location: item.location,
            color: cal.backgroundColor,
            calendarId: cal.id
          }));
        } catch { return []; }
      });

      const results = await Promise.all(promises);
      const newEvents = results.flat();

      setEvents(prev => {
        const nonGoogle = prev.filter(e => e.type !== 'google');
        return [...nonGoogle, ...newEvents];
      });
    } catch (err) { console.error(err); }
  };

  // Microsoft Data
  const fetchMicrosoftData = async (account: any, instance: any = msalInstance) => {
    if (!instance) return;
    try {
      // Get Token
      const response = await instance.acquireTokenSilent({
        account: account,
        scopes: MICROSOFT_SCOPES
      }).catch(async () => {
        return await instance.acquireTokenPopup({ scopes: MICROSOFT_SCOPES });
      });

      const accessToken = response.accessToken;

      // 1. Fetch Calendars
      const calendarsRes = await fetch("https://graph.microsoft.com/v1.0/me/calendars", {
        headers: { Authorization: `Bearer ${accessToken}` }
      });
      const calendarsData = await calendarsRes.json();

      const msCals: ExternalCalendar[] = calendarsData.value.map((item: any) => ({
        id: item.id,
        summary: item.name,
        backgroundColor: item.hexColor || '#8b5cf6', // Default purple for Outlook
        selected: item.isDefaultCalendar || false,
        primary: item.isDefaultCalendar,
        provider: 'microsoft'
      }));

      setExternalCalendars(prev => {
        const others = prev.filter(c => c.provider !== 'microsoft');
        return [...others, ...msCals];
      });

      // 2. Fetch Events
      await fetchMicrosoftEvents(msCals.filter(c => c.selected), accessToken);

    } catch (error) {
      console.error("Error fetching Microsoft data:", error);
      setIsMicrosoftConnected(false);
    }
  };

  const fetchMicrosoftEvents = async (calendarsToFetch: ExternalCalendar[], token?: string) => {
    if (!calendarsToFetch.length) return;

    // If token not provided, try to get it silently
    let accessToken = token;
    if (!accessToken && msalInstance) {
      const accounts = msalInstance.getAllAccounts();
      if (accounts.length > 0) {
        const response = await msalInstance.acquireTokenSilent({
          account: accounts[0],
          scopes: MICROSOFT_SCOPES
        });
        accessToken = response.accessToken;
      }
    }
    if (!accessToken) return;

    const now = new Date();
    // Go back 1 month and forward 3 months
    const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const end = new Date(now.getFullYear(), now.getMonth() + 3, 0);

    const promises = calendarsToFetch.map(async (cal) => {
      try {
        // Request UTC time explicitly using Prefer header
        const url = `https://graph.microsoft.com/v1.0/me/calendars/${cal.id}/events?startDateTime=${start.toISOString()}&endDateTime=${end.toISOString()}&$top=100`;
        const res = await fetch(url, {
          headers: {
            Authorization: `Bearer ${accessToken}`,
            'Prefer': 'outlook.timezone="UTC"'
          }
        });
        const data = await res.json();
        return data.value.map((item: any) => ({
          id: item.id,
          title: item.subject,
          // MS Graph with 'Prefer: outlook.timezone="UTC"' returns time without 'Z'. We append it.
          start: item.start.dateTime.endsWith('Z') ? item.start.dateTime : item.start.dateTime + 'Z',
          end: item.end.dateTime.endsWith('Z') ? item.end.dateTime : item.end.dateTime + 'Z',
          type: 'microsoft',
          description: item.bodyPreview,
          location: item.location?.displayName,
          color: cal.backgroundColor,
          calendarId: cal.id
        }));
      } catch { return []; }
    });

    const results = await Promise.all(promises);
    const newEvents = results.flat();

    setEvents(prev => {
      const nonMs = prev.filter(e => e.type !== 'microsoft');
      return [...nonMs, ...newEvents];
    });
  };


  // --- Event Handling ---

  const handleToggleCalendar = (calendarId: string) => {
    const targetCal = externalCalendars.find(c => c.id === calendarId);
    if (!targetCal) return;

    const newSelectionState = !targetCal.selected;

    // Update State
    const updatedCalendars = externalCalendars.map(cal =>
      cal.id === calendarId ? { ...cal, selected: newSelectionState } : cal
    );
    setExternalCalendars(updatedCalendars);

    // Re-fetch logic based on provider
    const activeForProvider = updatedCalendars.filter(c => c.provider === targetCal.provider && c.selected);

    if (targetCal.provider === 'google') {
      if (activeForProvider.length === 0) {
        setEvents(prev => prev.filter(e => e.type !== 'google'));
      } else {
        fetchGoogleEvents(activeForProvider);
      }
    } else if (targetCal.provider === 'microsoft') {
      if (activeForProvider.length === 0) {
        setEvents(prev => prev.filter(e => e.type !== 'microsoft'));
      } else {
        fetchMicrosoftEvents(activeForProvider);
      }
    } else if (targetCal.provider === 'team' || targetCal.provider === 'local') {
      // For local/team, we don't fetch, we just rely on filtering in the view
      // But we update the 'selected' state so the view knows to hide/show
    }
  };

  const handleAddCalendar = (newCalendar: ExternalCalendar) => {
    setExternalCalendars(prev => [...prev, newCalendar]);
  };

  const handleAddTransaction = (newTransaction: Transaction) => {
    setTransactions(prev => [newTransaction, ...prev]);
    setAccounts(prevAccounts =>
      prevAccounts.map(acc => {
        if (acc.id === newTransaction.accountId) {
          const newBalance = newTransaction.type === 'Income'
            ? acc.balance + newTransaction.amount
            : acc.balance - newTransaction.amount;
          return { ...acc, balance: newBalance };
        }
        return acc;
      })
    );
  };

  const handleAddAccount = (newAccount: Account) => {
    setAccounts(prev => [...prev, newAccount]);
  };

  const handleUpdateLog = (updatedLog: DailyLog) => {
    setPersonalLogs(prev => {
      const index = prev.findIndex(log => log.date === updatedLog.date);
      if (index >= 0) {
        const newLogs = [...prev];
        newLogs[index] = updatedLog;
        return newLogs;
      }
      return [...prev, updatedLog];
    });
  };

  const handleAddEvent = (newEvent: CalendarEvent) => {
    setEvents(prev => [...prev, newEvent]);
  };

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-950 font-inter text-slate-900 dark:text-slate-100 overflow-hidden transition-colors duration-300">
      <Sidebar
        currentView={currentView}
        onViewChange={setCurrentView}
        isDarkMode={isDarkMode}
        onToggleDarkMode={() => setIsDarkMode(!isDarkMode)}
      />

      <div className="flex-1 flex flex-col h-full overflow-hidden relative">
        <div className="md:hidden bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-slate-800 p-4 flex justify-between items-center z-20">
          <h1 className="font-bold text-lg text-slate-800 dark:text-white">FinanceFlow</h1>
          <div className="flex items-center gap-4">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="text-slate-600 dark:text-slate-400">
              {isDarkMode ? '☀️' : '🌙'}
            </button>
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="p-2 text-slate-600 dark:text-slate-400">
              <Menu />
            </button>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="absolute top-[60px] left-0 w-full bg-white dark:bg-slate-900 shadow-xl border-b border-slate-200 dark:border-slate-800 z-30 flex flex-col p-4 md:hidden">
            {['dashboard', 'schedule', 'notes', 'accounts', 'transactions', 'personal', 'chat'].map((view) => (
              <button
                key={view}
                onClick={() => {
                  setCurrentView(view as View);
                  setIsMobileMenuOpen(false);
                }}
                className={`text-left py-3 px-4 rounded-lg capitalize mb-2 ${currentView === view
                  ? 'bg-blue-50 dark:bg-slate-800 text-blue-600 dark:text-blue-400 font-bold'
                  : 'text-slate-600 dark:text-slate-400'
                  }`}
              >
                {view === 'chat' ? 'AI Advisor' : view === 'personal' ? 'Personal Growth' : view}
              </button>
            ))}
          </div>
        )}

        <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth">
          <div className="max-w-7xl mx-auto h-full">
            {currentView === 'dashboard' && (
              <Dashboard accounts={accounts} transactions={transactions} />
            )}
            {currentView === 'schedule' && (
              <Schedule
                events={events}
                onAddEvent={handleAddEvent}
                isGoogleConnected={isGoogleConnected}
                onConnectGoogle={handleConnectGoogle}
                isMicrosoftConnected={isMicrosoftConnected}
                onConnectMicrosoft={handleConnectMicrosoft}
                calendars={externalCalendars}
                onToggleCalendar={handleToggleCalendar}
                onAddCalendar={handleAddCalendar}
              />
            )}
            {currentView === 'notes' && (
              <Notes logs={personalLogs} onUpdateLog={handleUpdateLog} />
            )}
            {currentView === 'accounts' && (
              <Accounts accounts={accounts} onAddAccount={handleAddAccount} />
            )}
            {currentView === 'transactions' && (
              <Transactions
                transactions={transactions}
                accounts={accounts}
                onAddTransaction={handleAddTransaction}
              />
            )}
            {currentView === 'personal' && (
              <Personal logs={personalLogs} onUpdateLog={handleUpdateLog} />
            )}
            {currentView === 'chat' && (
              <Chat
                accounts={accounts}
                transactions={transactions}
                events={events}
                onAddEvent={handleAddEvent}
              />
            )}
          </div>
        </main>
      </div>
    </div>
  );
}