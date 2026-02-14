export type AccountType = 'Bank' | 'Cash' | 'Mobile Money' | 'Credit Card';

export interface Account {
  id: string;
  name: string;
  type: AccountType;
  balance: number;
  color: string;
  logo?: string;
}

export type TransactionType = 'Income' | 'Expense';

export interface Transaction {
  id: string;
  accountId: string;
  type: TransactionType;
  amount: number;
  category: string;
  date: string;
  description: string;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'model';
  text: string;
  timestamp: number;
  isError?: boolean;
}

export interface DailyLog {
  date: string; // YYYY-MM-DD
  waterIntake: number; // in cups (approx 250ml)
  exerciseMinutes: number;
  buddhistTimeMinutes: number; // Meditation/Prayer
  sleepHours: number;
  studyMinutes: number;
  screenTimeMinutes: number;
  notes: string;
}

export type CalendarProvider = 'google' | 'microsoft' | 'local' | 'team';

export interface ExternalCalendar {
  id: string;
  summary: string; // Name
  backgroundColor?: string;
  selected: boolean;
  primary?: boolean;
  provider: CalendarProvider;
}

export interface CalendarEvent {
  id: string;
  title: string;
  start: string; // ISO Date String
  end: string;
  type: CalendarProvider; 
  color?: string; // Tailwind class OR Hex Code
  description?: string;
  location?: string;
  calendarId?: string;
}

export type View = 'dashboard' | 'accounts' | 'transactions' | 'chat' | 'personal' | 'schedule' | 'notes';

declare global {
  interface Window {
    gapi: any;
    google: any;
    msal: any;
  }
}