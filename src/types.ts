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
