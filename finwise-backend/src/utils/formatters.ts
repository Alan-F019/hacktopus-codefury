export const roundTo = (num: number, decimals: number = 1): number => {
  const factor = Math.pow(10, decimals);
  return Math.round(num * factor) / factor;
};

export const formatCurrency = (amount: number): string => {
  return `$${amount.toLocaleString('en-US')}`;
};

export const formatPercentage = (val: number): string => {
  return `${roundTo(val, 1)}%`;
};
