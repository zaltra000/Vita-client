export const formatPrice = (price: number | string): string => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  if (isNaN(num)) return '0';
  return new Intl.NumberFormat('en-US').format(num);
};

export const getLocalizedString = (value: any, lang: string = 'en'): string => {
  if (!value) return '';
  if (typeof value === 'string') return value;
  if (typeof value === 'object') return value[lang] || value.en || value.ar || '';
  return String(value);
};
