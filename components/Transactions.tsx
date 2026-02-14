import React, { useState, useEffect, useRef } from 'react';
import { Transaction, Account, TransactionType } from '../types';
import { CATEGORIES } from '../constants';
import { generateId, formatCurrency, formatDate } from '../utils';
import { PlusCircle, Search, Filter, X, Calendar, ChevronLeft, ChevronRight, Clock } from 'lucide-react';

interface TransactionsProps {
  transactions: Transaction[];
  accounts: Account[];
  onAddTransaction: (transaction: Transaction) => void;
}

// Helper component for table rows
const TransactionRow: React.FC<{ transaction: Transaction, account?: Account }> = ({ transaction: t, account }) => {
  const [imgError, setImgError] = useState(false);
  const showLogo = account?.logo && !imgError;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex flex-col">
          <span className="font-medium text-slate-800 dark:text-white">{t.description}</span>
          <span className="text-xs text-slate-400">{t.category}</span>
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-600 dark:text-slate-300">
        <div className="flex items-center gap-2">
            {showLogo && (
               <img 
                 src={account?.logo} 
                 alt="Logo" 
                 className="w-4 h-4 object-contain" 
                 onError={() => setImgError(true)}
               />
            )}
            {account?.name}
        </div>
      </td>
      <td className="px-6 py-4 text-sm text-slate-500 dark:text-slate-400">{formatDate(t.date)}</td>
      <td className={`px-6 py-4 text-right font-bold ${
        t.type === 'Income' ? 'text-emerald-600 dark:text-emerald-400' : 'text-red-600 dark:text-red-400'
      }`}>
        {t.type === 'Income' ? '+' : '-'}{formatCurrency(t.amount)}
      </td>
    </tr>
  );
};

// Custom Date Picker Component
const DatePicker = ({ label, value, onChange }: { label: string, value: string, onChange: (date: string) => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [viewDate, setViewDate] = useState(new Date());
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse value to set initial view if exists
  useEffect(() => {
    if (value) {
      const [y, m, d] = value.split('-').map(Number);
      setViewDate(new Date(y, m - 1, d));
    }
  }, [isOpen]); // Only reset when opening or value changes

  // Close on click outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const monthNames = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  
  const getDaysInMonth = (year: number, month: number) => new Date(year, month + 1, 0).getDate();
  const getFirstDayOfMonth = (year: number, month: number) => new Date(year, month, 1).getDay();

  const handlePrevMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() - 1, 1));
  };

  const handleNextMonth = () => {
    setViewDate(new Date(viewDate.getFullYear(), viewDate.getMonth() + 1, 1));
  };

  const handleDayClick = (day: number) => {
    const year = viewDate.getFullYear();
    const month = viewDate.getMonth();
    const formattedDate = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
    onChange(formattedDate);
    setIsOpen(false);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInCurrentMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDay = getFirstDayOfMonth(currentYear, currentMonth);
  const days = Array.from({ length: daysInCurrentMonth }, (_, i) => i + 1);
  const blanks = Array.from({ length: firstDay }, (_, i) => i);

  return (
    <div className="relative" ref={containerRef}>
      <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">{label}</label>
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full pl-3 pr-2 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none flex items-center justify-between cursor-pointer"
      >
        <span>{value ? formatDate(value) : 'Select date'}</span>
        <Calendar size={16} className="text-slate-400" />
      </div>

      {isOpen && (
        <div className="absolute z-50 mt-1 p-4 bg-white dark:bg-slate-800 rounded-xl shadow-xl border border-slate-200 dark:border-slate-600 w-72 left-0 sm:left-auto">
          <div className="flex justify-between items-center mb-4">
            <button onClick={handlePrevMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <ChevronLeft size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
            <span className="font-semibold text-slate-800 dark:text-white">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button onClick={handleNextMonth} className="p-1 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full transition-colors">
              <ChevronRight size={20} className="text-slate-600 dark:text-slate-300" />
            </button>
          </div>
          
          <div className="grid grid-cols-7 gap-1 mb-2">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map(d => (
              <div key={d} className="text-center text-xs font-medium text-slate-400">{d}</div>
            ))}
          </div>
          
          <div className="grid grid-cols-7 gap-1">
            {blanks.map(b => <div key={`blank-${b}`} />)}
            {days.map(d => {
              const isSelected = value === `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
              const isToday = new Date().toDateString() === new Date(currentYear, currentMonth, d).toDateString();
              return (
                <button
                  key={d}
                  onClick={() => handleDayClick(d)}
                  className={`
                    w-8 h-8 rounded-full text-sm flex items-center justify-center transition-all
                    ${isSelected 
                      ? 'bg-blue-600 text-white shadow-md shadow-blue-500/30' 
                      : isToday 
                        ? 'bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 font-bold'
                        : 'text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700'}
                  `}
                >
                  {d}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};

export default function Transactions({ transactions, accounts, onAddTransaction }: TransactionsProps) {
  // Add Transaction Form State
  const [formData, setFormData] = useState({
    type: 'Expense' as TransactionType,
    amount: '',
    accountId: accounts[0]?.id || '',
    category: '',
    date: new Date().toISOString().split('T')[0],
    description: ''
  });

  // Filter State
  const todayStr = new Date().toISOString().split('T')[0];
  const [searchTerm, setSearchTerm] = useState('');
  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [dateFilterType, setDateFilterType] = useState<'today' | 'week' | 'month' | 'all' | 'custom'>('today');
  const [filterDateFrom, setFilterDateFrom] = useState(todayStr);
  const [filterDateTo, setFilterDateTo] = useState(todayStr);
  const [filterCategory, setFilterCategory] = useState('');
  const [filterAccountId, setFilterAccountId] = useState('');

  // Combine categories for filter dropdown
  const allCategories = Array.from(new Set([...CATEGORIES.Income, ...CATEGORIES.Expense])).sort();

  // Handle Quick Filter Changes
  const handleQuickFilter = (type: 'today' | 'week' | 'month' | 'all') => {
    setDateFilterType(type);
    const now = new Date();
    
    if (type === 'all') {
      setFilterDateFrom('');
      setFilterDateTo('');
      return;
    }

    let start = new Date();
    let end = new Date();

    if (type === 'today') {
       // start and end are already now
    } else if (type === 'week') {
       // Calculate Start of Week (Monday)
       const day = now.getDay();
       const diff = now.getDate() - day + (day === 0 ? -6 : 1);
       start = new Date(now.setDate(diff));
       
       // Calculate End of Week (Sunday)
       const endWeek = new Date(start);
       endWeek.setDate(start.getDate() + 6);
       end = endWeek;
    } else if (type === 'month') {
       start = new Date(now.getFullYear(), now.getMonth(), 1);
       end = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    }

    setFilterDateFrom(start.toISOString().split('T')[0]);
    setFilterDateTo(end.toISOString().split('T')[0]);
  };

  // Handle Manual Date Change
  const handleManualDateChange = (isFrom: boolean, date: string) => {
    setDateFilterType('custom');
    if (isFrom) setFilterDateFrom(date);
    else setFilterDateTo(date);
  };

  // Filter Logic
  const filteredTransactions = transactions.filter(t => {
    const matchesSearch = t.description.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          t.amount.toString().includes(searchTerm);
    const matchesAccount = filterAccountId ? t.accountId === filterAccountId : true;
    const matchesCategory = filterCategory ? t.category === filterCategory : true;
    const matchesDateFrom = filterDateFrom ? t.date >= filterDateFrom : true;
    const matchesDateTo = filterDateTo ? t.date <= filterDateTo : true;

    return matchesSearch && matchesAccount && matchesCategory && matchesDateFrom && matchesDateTo;
  });
  
  const sortedTransactions = filteredTransactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Count active filters (ignoring default dates if they match "Today" logic implies a filter is active, but we can just show dot if any filter is non-empty/default)
  // Since 'Today' is default, we only show count if user changes something or searches
  const isDefaultDate = dateFilterType === 'today';
  const activeFiltersCount = [
    !isDefaultDate, // Count if date is not default
    filterCategory, 
    filterAccountId
  ].filter(Boolean).length;

  const clearFilters = () => {
    setFilterCategory('');
    setFilterAccountId('');
    setSearchTerm('');
    // Reset to Default (Today)
    handleQuickFilter('today');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.amount || !formData.accountId) return;

    onAddTransaction({
      id: generateId(),
      type: formData.type,
      amount: parseFloat(formData.amount),
      accountId: formData.accountId,
      category: formData.category || 'Other',
      date: formData.date,
      description: formData.description || 'Untitled Transaction'
    });

    // Reset form but keep date
    setFormData(prev => ({
      ...prev,
      amount: '',
      description: '',
      category: ''
    }));
  };

  return (
    <div className="flex flex-col-reverse lg:grid lg:grid-cols-3 gap-8 lg:h-[calc(100vh-4rem)]">
      {/* Transaction List */}
      <div className="lg:col-span-2 flex flex-col bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 relative transition-colors">
        
        {/* Header & Filters */}
        <div className="p-6 border-b border-slate-100 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 rounded-t-2xl">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4 sm:mb-0">
            <h2 className="text-xl font-bold text-slate-800 dark:text-white">Transaction History</h2>
            <div className="flex items-center gap-2 w-full sm:w-auto">
               <div className="relative flex-1 sm:flex-none">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 w-4 h-4" />
                  <input 
                     type="text" 
                     placeholder="Search..." 
                     value={searchTerm}
                     onChange={(e) => setSearchTerm(e.target.value)}
                     className="pl-9 pr-4 py-2 w-full sm:w-48 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm outline-none focus:border-blue-500 transition-colors" 
                  />
               </div>
               <button 
                onClick={() => setIsFilterOpen(!isFilterOpen)}
                className={`p-2 rounded-lg border transition-colors flex items-center gap-2 ${
                  isFilterOpen || activeFiltersCount > 0
                    ? 'bg-blue-50 border-blue-200 text-blue-600 dark:bg-slate-700 dark:border-slate-600 dark:text-blue-400' 
                    : 'bg-white border-slate-200 text-slate-600 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-300'
                }`}
               >
                 <Filter size={18} />
                 {activeFiltersCount > 0 && (
                   <span className="bg-blue-600 text-white text-[10px] w-5 h-5 flex items-center justify-center rounded-full">
                     {activeFiltersCount}
                   </span>
                 )}
               </button>
            </div>
          </div>

          {/* Collapsible Filter Panel */}
          {isFilterOpen && (
            <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 animate-in slide-in-from-top-2 fade-in duration-200">
              
              {/* Quick Date Filters */}
              <div className="flex flex-wrap gap-2 mb-4">
                {[
                  { id: 'today', label: 'Today' },
                  { id: 'week', label: 'This Week' },
                  { id: 'month', label: 'This Month' },
                  { id: 'all', label: 'All Time' }
                ].map((filter) => (
                   <button
                     key={filter.id}
                     onClick={() => handleQuickFilter(filter.id as any)}
                     className={`px-3 py-1.5 rounded-full text-xs font-medium transition-colors border ${
                       dateFilterType === filter.id
                         ? 'bg-blue-600 text-white border-blue-600'
                         : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border-slate-200 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600'
                     }`}
                   >
                     {filter.label}
                   </button>
                ))}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <DatePicker 
                  label="From Date" 
                  value={filterDateFrom} 
                  onChange={(d) => handleManualDateChange(true, d)} 
                />
                
                <DatePicker 
                  label="To Date" 
                  value={filterDateTo} 
                  onChange={(d) => handleManualDateChange(false, d)} 
                />

                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Category</label>
                  <select 
                    value={filterCategory}
                    onChange={(e) => setFilterCategory(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Categories</option>
                    {allCategories.map(c => (
                      <option key={c} value={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-500 dark:text-slate-400 mb-1">Account</label>
                  <select 
                    value={filterAccountId}
                    onChange={(e) => setFilterAccountId(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-700 text-slate-900 dark:text-white rounded-lg text-sm focus:ring-2 focus:ring-blue-500 outline-none"
                  >
                    <option value="">All Accounts</option>
                    {accounts.map(a => (
                      <option key={a.id} value={a.id}>{a.name}</option>
                    ))}
                  </select>
                </div>
                {activeFiltersCount > 0 && (
                   <div className="sm:col-span-2 lg:col-span-4 flex justify-end">
                      <button 
                        onClick={clearFilters}
                        className="text-sm text-red-500 hover:text-red-600 flex items-center gap-1"
                      >
                        <X size={14} /> Reset Filters
                      </button>
                   </div>
                )}
              </div>
            </div>
          )}
        </div>

        <div className="flex-1 overflow-x-auto overflow-y-auto rounded-b-2xl">
          <table className="w-full text-left min-w-[600px] lg:min-w-0">
            <thead className="bg-white dark:bg-slate-800 sticky top-0 z-10 shadow-sm">
              <tr className="text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Account</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50 dark:divide-slate-700">
              {sortedTransactions.map((t) => {
                 const account = accounts.find(a => a.id === t.accountId);
                 return (
                   <TransactionRow key={t.id} transaction={t} account={account} />
                 );
              })}
              {sortedTransactions.length === 0 && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-400 dark:text-slate-500">
                    <div className="flex flex-col items-center justify-center gap-2">
                       <div className="p-4 bg-slate-50 dark:bg-slate-800 rounded-full">
                          <Clock size={32} className="opacity-20" />
                       </div>
                       <p className="font-medium">No transactions found</p>
                       <p className="text-xs text-slate-400">Try adjusting your filters or adding a new transaction.</p>
                       <button onClick={clearFilters} className="text-blue-500 hover:underline text-sm mt-1">
                         Reset filters to Today
                       </button>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add Transaction Form */}
      <div className="bg-slate-900 dark:bg-slate-950 rounded-2xl p-6 lg:p-8 text-white h-fit shadow-xl shadow-slate-900/10 dark:shadow-none border border-transparent dark:border-slate-800">
        <h2 className="text-xl font-bold mb-6 flex items-center gap-2">
          <PlusCircle className="text-blue-400" />
          Log Transaction
        </h2>
        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Type Toggle */}
          <div className="flex bg-slate-800 dark:bg-slate-900 p-1 rounded-lg">
            {['Expense', 'Income'].map((type) => (
              <button
                key={type}
                type="button"
                onClick={() => setFormData({ ...formData, type: type as TransactionType })}
                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                  formData.type === type
                    ? type === 'Income' ? 'bg-emerald-500 text-white' : 'bg-red-500 text-white'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">K</span>
              <input
                type="number"
                step="1"
                required
                value={formData.amount}
                onChange={e => setFormData({ ...formData, amount: e.target.value })}
                className="w-full bg-slate-800 dark:bg-slate-900 border-none rounded-lg pl-8 pr-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
                placeholder="0"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Description</label>
            <input
              type="text"
              required
              value={formData.description}
              onChange={e => setFormData({ ...formData, description: e.target.value })}
              className="w-full bg-slate-800 dark:bg-slate-900 border-none rounded-lg px-4 py-3 text-white placeholder-slate-500 focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Grocery Shopping"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
             <div>
               <label className="block text-sm text-slate-400 mb-1">Date</label>
               <input
                 type="date"
                 required
                 value={formData.date}
                 onChange={e => setFormData({ ...formData, date: e.target.value })}
                 className="w-full bg-slate-800 dark:bg-slate-900 border-none rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-blue-500 text-sm"
               />
             </div>
             <div>
               <label className="block text-sm text-slate-400 mb-1">Category</label>
               <select
                 value={formData.category}
                 onChange={e => setFormData({ ...formData, category: e.target.value })}
                 className="w-full bg-slate-800 dark:bg-slate-900 border-none rounded-lg px-3 py-3 text-white focus:ring-2 focus:ring-blue-500 text-sm appearance-none"
               >
                 <option value="" disabled>Select</option>
                 {CATEGORIES[formData.type].map(c => (
                   <option key={c} value={c}>{c}</option>
                 ))}
               </select>
             </div>
          </div>

          <div>
            <label className="block text-sm text-slate-400 mb-1">Account</label>
            <select
              value={formData.accountId}
              onChange={e => setFormData({ ...formData, accountId: e.target.value })}
              className="w-full bg-slate-800 dark:bg-slate-900 border-none rounded-lg px-4 py-3 text-white focus:ring-2 focus:ring-blue-500"
            >
              {accounts.map(a => (
                <option key={a.id} value={a.id}>{a.name} ({formatCurrency(a.balance)})</option>
              ))}
            </select>
          </div>

          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-3 rounded-lg mt-4 transition-colors"
          >
            Add Transaction
          </button>
        </form>
      </div>
    </div>
  );
}