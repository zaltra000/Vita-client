import React, { createContext, useContext, useState, useEffect } from 'react';
import { Product } from '../types';

export interface CartItem {
  product: Product;
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (product: Product, quantity?: number) => void;
  removeFromCart: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;
  isCartOpen: boolean;
  setIsCartOpen: (isOpen: boolean) => void;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>(() => {
    try {
      const saved = localStorage.getItem('vitadirect_cart');
      if (saved) {
        try {
          const parsed = JSON.parse(saved);
          if (Array.isArray(parsed)) {
            // Filter out invalid items immediately upon load
            return parsed.filter(item => item && item.product && item.product.id && typeof item.quantity === 'number');
          }
          return [];
        } catch (e) {
          console.error("Failed to parse cart from local storage", e);
          return [];
        }
      }
    } catch (e) {
      console.error("Failed to access local storage", e);
      return [];
    }
    return [];
  });
  const [isCartOpen, setIsCartOpen] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem('vitadirect_cart', JSON.stringify(cartItems));
    } catch (e) {
      console.error("Failed to save cart to local storage", e);
    }
  }, [cartItems]);

  const addToCart = (product: Product, quantity: number = 1) => {
    if (!product || !product.id) {
      console.error("Attempted to add invalid product to cart", product);
      return;
    }

    setCartItems(prev => {
      const existing = prev.find(item => item.product && item.product.id === product.id);
      if (existing) {
        return prev.map(item => 
          item.product && item.product.id === product.id 
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const removeFromCart = (productId: string) => {
    if (!productId) return;
    setCartItems(prev => prev.filter(item => item.product && item.product.id !== productId));
  };

  const updateQuantity = (productId: string, quantity: number) => {
    if (!productId) return;
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCartItems(prev => prev.map(item => 
      item.product && item.product.id === productId ? { ...item, quantity } : item
    ));
  };

  const clearCart = () => {
    setCartItems([]);
  };

  const cartTotal = cartItems.reduce((total, item) => {
    if (!item || !item.product) return total;
    const price = item.product.salePrice !== undefined && item.product.salePrice !== null
      ? (typeof item.product.salePrice === 'string' ? parseFloat(item.product.salePrice) : item.product.salePrice)
      : (typeof item.product.price === 'string' ? parseFloat(item.product.price) : item.product.price);
    return total + (Number(price) || 0) * (Number(item.quantity) || 0);
  }, 0);

  const cartCount = cartItems.reduce((count, item) => count + (Number(item.quantity) || 0), 0);

  return (
    <CartContext.Provider value={{
      cartItems,
      addToCart,
      removeFromCart,
      updateQuantity,
      clearCart,
      cartTotal,
      cartCount,
      isCartOpen,
      setIsCartOpen
    }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
