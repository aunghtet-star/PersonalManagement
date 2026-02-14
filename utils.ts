import { BANK_LOGOS } from './constants';

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'MMK',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatDate = (dateString: string) => {
  return new Date(dateString).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const generateId = () => Math.random().toString(36).substr(2, 9);

export const getBankLogo = (accountName: string): string | undefined => {
  const lowerName = accountName.toLowerCase();
  for (const [key, url] of Object.entries(BANK_LOGOS)) {
    if (lowerName.includes(key)) {
      return url;
    }
  }
  return undefined;
};