import { Account, Transaction } from './types';

export const BANK_LOGOS: Record<string, string> = {
  // Using Clearbit Logo API for reliability where possible, and App Store icons for wallets
  'kbz': 'https://logo.clearbit.com/kbzbank.com',
  'kpay': 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/aa/62/73/aa627375-db66-b25c-6020-0082a623126f/AppIcon-0-0-1x_U007emarketing-0-5-0-85-220.png/512x512bb.jpg',
  'kbzpay': 'https://is1-ssl.mzstatic.com/image/thumb/Purple211/v4/aa/62/73/aa627375-db66-b25c-6020-0082a623126f/AppIcon-0-0-1x_U007emarketing-0-5-0-85-220.png/512x512bb.jpg',
  'aya': 'https://logo.clearbit.com/ayabank.com',
  'cb': 'https://logo.clearbit.com/cbbank.com.mm',
  'wave': 'https://is1-ssl.mzstatic.com/image/thumb/Purple221/v4/c7/26/5d/c7265d6e-c533-356a-3607-b67db36450d0/AppIcon-0-0-1x_U007emarketing-0-7-0-85-220.png/512x512bb.jpg',
  'yoma': 'https://logo.clearbit.com/yomabank.com',
  'agd': 'https://logo.clearbit.com/agdbank.com',
  'uab': 'https://logo.clearbit.com/uab.com.mm',
  'mab': 'https://logo.clearbit.com/mabbank.com',
  'a bank': 'https://logo.clearbit.com/abank.com.mm'
};

export const INITIAL_ACCOUNTS: Account[] = [
  { 
    id: '1', 
    name: 'KBZ Banking', 
    type: 'Bank', 
    balance: 0, 
    color: 'bg-blue-600',
    logo: BANK_LOGOS['kbz']
  },
  { 
    id: '2', 
    name: 'Hand Cash', 
    type: 'Cash', 
    balance: 0, 
    color: 'bg-green-500' 
  },
  { 
    id: '3', 
    name: 'KPay', 
    type: 'Mobile Money', 
    balance: 0, 
    color: 'bg-blue-500',
    logo: BANK_LOGOS['kpay']
  },
];

export const INITIAL_TRANSACTIONS: Transaction[] = [];

export const CATEGORIES = {
  Income: ['Salary', 'Freelance', 'Gift', 'Interest', 'Other'],
  Expense: ['Rent', 'Food', 'Transport', 'Utilities', 'Entertainment', 'Health', 'Shopping', 'Other'],
};

export const COLORS = [
  'bg-blue-500', 'bg-green-500', 'bg-purple-500', 'bg-yellow-500', 'bg-red-500', 'bg-pink-500', 'bg-indigo-500'
];