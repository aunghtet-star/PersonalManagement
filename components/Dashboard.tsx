import React, { useState } from 'react';
import { Account, Transaction } from '../types';
import { formatCurrency, formatDate } from '../utils';
import { TrendingUp, TrendingDown, Wallet, PieChart } from 'lucide-react';

interface DashboardProps {
  accounts: Account[];
  transactions: Transaction[];
}

// Helper component to handle image state individually per row
const DashboardTableRow: React.FC<{ transaction: Transaction, account?: Account }> = ({ transaction: t, account }) => {
  const [imgError, setImgError] = useState(false);
  const showLogo = account?.logo && !imgError;

  return (
    <tr className="hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center">
          <div className={`w-10 h-10 rounded-full flex items-center justify-center mr-3 flex-shrink-0 ${
            t.type === 'Income' 
              ? 'bg-emerald-100 dark:bg-emerald-900/30' 
              : 'bg-red-100 dark:bg-red-900/30'
          }`}>
              {showLogo ? (
                <img 
                  src={account?.logo} 
                  alt={account?.name} 
                  className="w-6 h-6 object-contain"
                  onError={() => setImgError(true)}
                />
              ) : (
                t.type === 'Income' 
                ? <TrendingUp size={16} className="text-emerald-600 dark:text-emerald-400" /> 
                : <TrendingDown size={16} className="text-red-600 dark:text-red-400" />
              )}
          </div>
          <div>
            <p className="font-medium text-slate-800 dark:text-slate-200">{t.description}</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">{account?.name || 'Unknown Account'}</p>
          </div>
        </div>
      </td>
      <td className="px-6 py-4">
        <span className="px-2 py-1 bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 rounded text-xs font-medium">
          {t.category}
        </span>
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

export default function Dashboard({ accounts, transactions }: DashboardProps) {
  const totalBalance = accounts.reduce((sum, acc) => sum + acc.balance, 0);
  
  // Calculate this month's income and expense
  const currentMonth = new Date().getMonth();
  const currentYear = new Date().getFullYear();
  
  const monthlyStats = transactions.reduce(
    (acc, t) => {
      const tDate = new Date(t.date);
      if (tDate.getMonth() === currentMonth && tDate.getFullYear() === currentYear) {
        if (t.type === 'Income') acc.income += t.amount;
        if (t.type === 'Expense') acc.expense += t.amount;
      }
      return acc;
    },
    { income: 0, expense: 0 }
  );

  const recentTransactions = [...transactions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 5);

  // Calculate Expenses by Category
  const expenseTransactions = transactions.filter(t => t.type === 'Expense');
  const totalExpenses = expenseTransactions.reduce((sum, t) => sum + t.amount, 0);
  
  const expensesByCategory = expenseTransactions.reduce((acc, t) => {
    acc[t.category] = (acc[t.category] || 0) + t.amount;
    return acc;
  }, {} as Record<string, number>);

  const categoryStats = Object.entries(expensesByCategory)
    .map(([category, amount]) => ({
      category,
      amount,
      percentage: totalExpenses > 0 ? (amount / totalExpenses) * 100 : 0
    }))
    .sort((a, b) => b.amount - a.amount);

  return (
    <div className="space-y-6">
      <header className="mb-8">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Financial Overview</h2>
        <p className="text-slate-500 dark:text-slate-400">Welcome back! Here's your financial summary.</p>
      </header>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-600 to-blue-700 rounded-2xl p-6 text-white shadow-lg shadow-blue-200 dark:shadow-none">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-white/20 rounded-lg">
              <Wallet className="w-6 h-6 text-white" />
            </div>
            <span className="text-sm font-medium opacity-80">Total Balance</span>
          </div>
          <h3 className="text-3xl font-bold">{formatCurrency(totalBalance)}</h3>
          <p className="text-sm opacity-70 mt-1">Across {accounts.length} accounts</p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg">
              <TrendingUp className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Income</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(monthlyStats.income)}</h3>
          <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1 flex items-center">
            + This Month
          </p>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 transition-colors">
          <div className="flex justify-between items-start mb-4">
            <div className="p-2 bg-red-100 dark:bg-red-900/30 rounded-lg">
              <TrendingDown className="w-6 h-6 text-red-600 dark:text-red-400" />
            </div>
            <span className="text-sm font-medium text-slate-500 dark:text-slate-400">Monthly Expenses</span>
          </div>
          <h3 className="text-3xl font-bold text-slate-800 dark:text-white">{formatCurrency(monthlyStats.expense)}</h3>
          <p className="text-sm text-red-600 dark:text-red-400 mt-1 flex items-center">
            - This Month
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-100 dark:border-slate-700 overflow-hidden transition-colors">
          <div className="p-6 border-b border-slate-100 dark:border-slate-700 flex justify-between items-center">
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Recent Transactions</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead className="bg-slate-50 dark:bg-slate-700/50 text-slate-500 dark:text-slate-400 text-xs uppercase font-semibold">
                <tr>
                  <th className="px-6 py-4">Transaction</th>
                  <th className="px-6 py-4">Category</th>
                  <th className="px-6 py-4">Date</th>
                  <th className="px-6 py-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-700">
                {recentTransactions.map((t) => {
                   const account = accounts.find(a => a.id === t.accountId);
                   return (
                     <DashboardTableRow key={t.id} transaction={t} account={account} />
                  );
                })}
                {recentTransactions.length === 0 && (
                  <tr>
                    <td colSpan={4} className="px-6 py-8 text-center text-slate-400 dark:text-slate-500">
                      No transactions found.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Expenses by Category Breakdown */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-700 flex flex-col h-fit transition-colors">
          <div className="flex items-center gap-2 mb-6">
            <div className="p-2 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
              <PieChart className="w-5 h-5 text-orange-600 dark:text-orange-400" />
            </div>
            <h3 className="font-bold text-lg text-slate-800 dark:text-white">Expenses by Category</h3>
          </div>
          
          <div className="space-y-6">
            {categoryStats.map((stat, index) => (
              <div key={stat.category} className="group">
                <div className="flex justify-between items-end mb-2">
                  <div className="flex flex-col">
                    <span className="text-sm font-medium text-slate-700 dark:text-slate-200">{stat.category}</span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">{stat.percentage.toFixed(1)}%</span>
                  </div>
                  <span className="font-bold text-slate-900 dark:text-white">{formatCurrency(stat.amount)}</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-100 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full rounded-full transition-all duration-500 ease-out ${
                       // Alternate colors for variety
                       index % 3 === 0 ? 'bg-blue-500' : 
                       index % 3 === 1 ? 'bg-purple-500' : 'bg-pink-500'
                    }`}
                    style={{ width: `${stat.percentage}%` }}
                  ></div>
                </div>
              </div>
            ))}

            {categoryStats.length === 0 && (
               <div className="text-center py-8 text-slate-400 dark:text-slate-500">
                  <p>No expenses recorded yet.</p>
               </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}