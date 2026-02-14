import React from 'react';
import { View } from '../types';
import { LayoutDashboard, Wallet, Receipt, Sun, Moon, Bot, UserCheck, CalendarDays, BookOpen } from 'lucide-react';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
  isDarkMode: boolean;
  onToggleDarkMode: () => void;
}

export default function Sidebar({ currentView, onViewChange, isDarkMode, onToggleDarkMode }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'schedule', label: 'Schedule', icon: CalendarDays },
    { id: 'notes', label: 'Notes & Focus', icon: BookOpen },
    { id: 'accounts', label: 'Accounts', icon: Wallet },
    { id: 'transactions', label: 'Transactions', icon: Receipt },
    { id: 'personal', label: 'Personal Growth', icon: UserCheck },
    { id: 'chat', label: 'AI Advisor', icon: Bot },
  ];

  return (
    <div className="w-64 bg-slate-900 dark:bg-slate-950 text-white flex-shrink-0 hidden md:flex flex-col h-full border-r border-slate-800 dark:border-slate-900">
      <div className="p-6 border-b border-slate-800 dark:border-slate-900">
        <h1 className="text-2xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-emerald-400">
          FinanceFlow
        </h1>
      </div>
      <nav className="flex-1 p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`w-full flex items-center space-x-3 px-4 py-3 rounded-lg transition-colors ${
                isActive
                  ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20'
                  : 'text-slate-400 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <Icon size={20} />
              <span className="font-medium">{item.label}</span>
            </button>
          );
        })}
      </nav>
      
      <div className="p-4 border-t border-slate-800 dark:border-slate-900 space-y-4">
        <button 
            onClick={onToggleDarkMode}
            className="w-full flex items-center justify-between px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
        >
            <span className="text-sm font-medium">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
            {isDarkMode ? <Sun size={18} /> : <Moon size={18} />}
        </button>
        <p className="text-xs text-slate-600 text-center">MVP Version 1.0</p>
      </div>
    </div>
  );
}