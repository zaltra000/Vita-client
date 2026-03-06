import { Product } from './types';

export const categories = [
  { id: 'All', en: 'All', ar: 'الكل' },
  { id: 'Natural Juices', en: 'Natural Juices', ar: 'عصائر طبيعية' },
  { id: 'Soft Drinks', en: 'Soft Drinks', ar: 'مشروبات غازية' },
  { id: 'Bottled Water', en: 'Bottled Water', ar: 'مياه معبأة' },
  { id: 'Powdered Juices', en: 'Powdered Juices', ar: 'عصائر بودرة' }
];

export const products: Product[] = [
  {
    id: '1',
    name: 'Vita Mango Splash',
    category: 'Natural Juices',
    price: 1500,
    description: '100% natural mango juice made from the finest Sudanese mangoes. Rich in Vitamin C and perfectly sweet, bringing the taste of summer to every sip.',
    imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
    volume: '500ml'
  },
  {
    id: '2',
    name: 'Vita Pure Spring',
    category: 'Bottled Water',
    price: 500,
    description: 'Crystal clear, purified drinking water sourced from the purest springs. Essential for your daily hydration and well-being.',
    imageUrl: 'https://images.unsplash.com/photo-1523362628745-0c100150b504?auto=format&fit=crop&q=80&w=800',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
    volume: '1.5L'
  },
  {
    id: '3',
    name: 'Vita Orange Burst',
    category: 'Natural Juices',
    price: 1500,
    description: 'Freshly squeezed orange juice packed with natural energy and vitamins. No added sugar, just pure citrus goodness.',
    imageUrl: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800',
    color: 'text-amber-500',
    bgColor: 'bg-amber-100',
    volume: '500ml'
  },
  {
    id: '4',
    name: 'Vita Lemon Mint',
    category: 'Soft Drinks',
    price: 1200,
    description: 'A refreshing blend of zesty lemon and cool mint. The ultimate thirst quencher for hot Sudanese days.',
    imageUrl: 'https://images.unsplash.com/photo-1513558161293-cdaf765ed2fd?auto=format&fit=crop&q=80&w=800',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
    volume: '330ml'
  },
  {
    id: '5',
    name: 'Vita Berry Mix Powder',
    category: 'Powdered Juices',
    price: 800,
    description: 'Convenient and delicious mixed berry juice powder. Just add water for an instant, fruity refreshment for the whole family.',
    imageUrl: 'https://images.unsplash.com/photo-1588715834894-3965d1d61c60?auto=format&fit=crop&q=80&w=800',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
    volume: '12 Sachets'
  },
  {
    id: '6',
    name: 'Vita Apple Crisp',
    category: 'Natural Juices',
    price: 1500,
    description: 'Crisp and refreshing apple juice made from hand-picked apples. A classic favorite with a perfect balance of sweet and tart.',
    imageUrl: 'https://images.unsplash.com/photo-1568569350062-ebfa3cb195df?auto=format&fit=crop&q=80&w=800',
    color: 'text-red-500',
    bgColor: 'bg-red-100',
    volume: '1L'
  }
];
