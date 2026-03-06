export interface LocalizedString {
  en: string;
  ar: string;
}

export interface Category {
  id: string;
  en: string;
  ar: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  price: number;
  salePrice?: number;
  description: string;
  imageUrl: string;
  color: string;
  bgColor: string;
  volume: string;
}
export interface HistoryOrder {
  orderId: string;
  orderNumber: number;
  customerName: string;
  customerPhone: string;
  area: string;
  locationUrl: string;
  items: { name: string; quantity: number; price: number; subtotal: number }[];
  totalAmount: number;
  totalItems: number;
  timestamp: string;
}
