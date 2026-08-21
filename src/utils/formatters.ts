export const formatCurrency = (amount: number, compact: boolean = false): string => {
  if (isNaN(amount) || amount === null || amount === undefined) return '$0';
  
  if (compact && Math.abs(amount) >= 1000000) {
    return `$${(amount / 1000000).toFixed(1)}M`;
  }
  if (compact && Math.abs(amount) >= 1000) {
    return `$${(amount / 1000).toFixed(1)}k`;
  }

  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: amount % 1 === 0 ? 0 : 2,
    minimumFractionDigits: 0,
  }).format(amount);
};

export const formatPercent = (val: number, decimals: number = 1): string => {
  if (isNaN(val) || val === null || val === undefined) return '0%';
  return `${val.toFixed(decimals)}%`;
};

export const formatDate = (dateStr: string): string => {
  try {
    const d = new Date(dateStr);
    if (isNaN(d.getTime())) return dateStr;
    return d.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    });
  } catch {
    return dateStr;
  }
};
