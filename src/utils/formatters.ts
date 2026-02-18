// Formatters for currency, numbers, dates, etc.

export const formatCurrency = (amount: number, currency: string = 'SGD'): string => {
  const prefix = currency === 'SGD' ? 'S$' : currency;
  return `${prefix}${amount.toLocaleString('en-SG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;
};

export const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('en-SG', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
};

export const formatDate = (date: string | Date): string => {
  const d = typeof date === 'string' ? new Date(date) : date;
  return d.toLocaleDateString('en-SG', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
};

export const formatWeight = (grams: number): string => {
  return `${grams}g`;
};

export const parseNumber = (value: string): number => {
  const parsed = parseFloat(value.replace(/[^0-9.-]/g, ''));
  return isNaN(parsed) ? 0 : parsed;
};
