import React, { useState, useEffect } from 'react';
import { Account, AccountType } from '../types';
import { formatCurrency, generateId, getBankLogo } from '../utils';
import { Plus, CreditCard, Banknote, Landmark, Smartphone, Trash2 } from 'lucide-react';

interface AccountsProps {
  accounts: Account[];
  onAddAccount: (account: Account) => void;
}

export default function Accounts({ accounts, onAddAccount }: AccountsProps) {
  const [showForm, setShowForm] = useState(false);
  const [newAccount, setNewAccount] = useState({
    name: '',
    type: 'Bank' as AccountType,
    balance: '',
  });
  const [detectedLogo, setDetectedLogo] = useState<string | undefined>(undefined);

  // Auto-detect logo as user types
  useEffect(() => {
    if (newAccount.name) {
      setDetectedLogo(getBankLogo(newAccount.name));
    } else {
      setDetectedLogo(undefined);
    }
  }, [newAccount.name]);

  const getIcon = (type: AccountType) => {
    switch(type) {
      case 'Cash': return Banknote;
      case 'Mobile Money': return Smartphone;
      case 'Credit Card': return CreditCard;
      default: return Landmark;
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAccount.name || !newAccount.balance) return;

    onAddAccount({
      id: generateId(),
      name: newAccount.name,
      type: newAccount.type,
      balance: parseFloat(newAccount.balance),
      color: 'bg-slate-500', // Default fallback color
      logo: detectedLogo
    });
    setNewAccount({ name: '', type: 'Bank', balance: '' });
    setShowForm(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">My Accounts</h2>
          <p className="text-slate-500 dark:text-slate-400">Manage your bank accounts and cash wallets.</p>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus size={20} />
          <span>Add Account</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-xl shadow-sm border border-slate-200 dark:border-slate-700 mb-6 animate-fade-in transition-colors">
          <h3 className="font-semibold text-lg mb-4 text-slate-800 dark:text-white">Add New Account</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Account Name</label>
              <div className="relative">
                <input
                  type="text"
                  placeholder="e.g. KBZ Banking"
                  className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 pr-10 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                  value={newAccount.name}
                  onChange={e => setNewAccount({...newAccount, name: e.target.value})}
                  required
                />
                {detectedLogo && (
                  <div className="absolute right-2 top-1/2 -translate-y-1/2 w-6 h-6 rounded-full overflow-hidden border border-slate-200 bg-white">
                    <img 
                      src={detectedLogo} 
                      alt="Logo" 
                      className="w-full h-full object-contain"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        setDetectedLogo(undefined);
                      }}
                    />
                  </div>
                )}
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Type</label>
              <select
                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                value={newAccount.type}
                onChange={e => setNewAccount({...newAccount, type: e.target.value as AccountType})}
              >
                <option value="Bank">Bank Account</option>
                <option value="Cash">Cash</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Mobile Money">Mobile Money</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">Initial Balance</label>
              <input
                type="number"
                step="1"
                placeholder="0"
                className="w-full border border-slate-300 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 outline-none transition-colors"
                value={newAccount.balance}
                onChange={e => setNewAccount({...newAccount, balance: e.target.value})}
                required
              />
            </div>
            <button type="submit" className="bg-emerald-500 hover:bg-emerald-600 text-white font-medium py-2 px-4 rounded-lg">
              Save Account
            </button>
          </form>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {accounts.map((account) => {
          const Icon = getIcon(account.type);
          const [imgError, setImgError] = useState(false);
          const hasLogo = !!account.logo && !imgError;
          
          return (
            <div key={account.id} className="bg-white dark:bg-slate-800 rounded-xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 hover:shadow-md transition-all relative overflow-hidden group">
              {/* Decorative Background Blob */}
              {!hasLogo && (
                <div className={`absolute top-0 right-0 w-24 h-24 ${account.color} opacity-10 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110`}></div>
              )}
              
              <div className="flex justify-between items-start relative z-10">
                <div className={`
                   ${hasLogo ? 'w-16 h-16 bg-white dark:bg-white rounded-xl shadow-sm border border-slate-100 flex items-center justify-center p-1' : `p-3 rounded-lg ${account.color} text-white`}
                `}>
                  {hasLogo ? (
                    <img 
                      src={account.logo} 
                      alt={account.name} 
                      className="w-full h-full object-contain" 
                      onError={() => setImgError(true)}
                    />
                  ) : (
                    <Icon size={24} />
                  )}
                </div>
                <span className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500 border border-slate-100 dark:border-slate-700 px-2 py-1 rounded">
                  {account.type}
                </span>
              </div>
              
              <div className="mt-6 relative z-10">
                <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">{account.name}</h3>
                <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{formatCurrency(account.balance)}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}