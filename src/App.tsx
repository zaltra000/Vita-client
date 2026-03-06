import { useState, useEffect } from 'react';
import { StatusBar } from '@capacitor/status-bar';
import { Capacitor } from '@capacitor/core';
import { AnimatePresence, motion } from 'motion/react';
import BottomNav from './components/BottomNav';
import Home from './pages/Home';
import Store from './pages/Store';
import Contact from './pages/Contact';
import OrderHistory from './pages/OrderHistory';

import ProductModal from './components/ProductModal';
import SplashScreen from './components/SplashScreen';
import { Product, HistoryOrder } from './types';
import OrderDetailsModal from './components/OrderDetailsModal';
import { useLanguage } from './context/LanguageContext';
import { CartProvider } from './context/CartContext';
import { ThemeProvider } from './context/ThemeContext';
import Cart from './components/Cart';
import { db, auth } from './firebase';
import { ref, onValue } from 'firebase/database';
import { signInAnonymously, onAuthStateChanged } from 'firebase/auth';

export default function App() {
  const [activeTab, setActiveTab] = useState('home');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedHistoryOrder, setSelectedHistoryOrder] = useState<HistoryOrder | null>(null);
  const [showSplash, setShowSplash] = useState(true);
  const [products, setProducts] = useState<Product[]>([]);
  const [dbError, setDbError] = useState<string | null>(null);
  const { dir, language } = useLanguage();

  useEffect(() => {
    const timer = setTimeout(() => setShowSplash(false), 2500);

    // Enable Immersive Full Screen Mode
    if (Capacitor.isNativePlatform()) {
      StatusBar.hide().catch(err => console.warn("StatusBar hide failed", err));

      // Use window.AndroidFullScreen if available (cordova-plugin-fullscreen)
      const AndroidFullScreen = (window as any).AndroidFullScreen;
      if (AndroidFullScreen) {
        AndroidFullScreen.immersiveMode(
          () => console.log("Immersive mode enabled"),
          (error: any) => console.warn("Immersive mode failed", error)
        );
      }
    }

    return () => clearTimeout(timer);
  }, []);

  // Ensure authentication for database access
  useEffect(() => {
    const unsubscribeAuth = onAuthStateChanged(auth, (user) => {
      if (!user) {
        signInAnonymously(auth).catch((error) => {
          console.warn("Anonymous auth failed in App.tsx", error);
        });
      }
    });
    return () => unsubscribeAuth();
  }, []);

  useEffect(() => {
    // 1. Try to load from local cache immediately for instant appearance
    try {
      const cached = localStorage.getItem('products_cache');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (Array.isArray(parsed) && parsed.length > 0) {
          setProducts(parsed);
        }
      }
    } catch (e) {
      console.warn("Failed to load products from cache", e);
    }

    const productsRef = ref(db, 'products');

    const unsubscribe = onValue(productsRef,
      (snapshot) => {
        setDbError(null); // Clear any previous errors
        const data = snapshot.val();
        if (data) {
          const productsList = Object.keys(data).map(key => ({
            id: key,
            ...data[key]
          }));
          setProducts(productsList);

          // 2. Update cache with fresh data
          try {
            localStorage.setItem('products_cache', JSON.stringify(productsList));
          } catch (e) {
            console.warn("Failed to cache products (likely quota exceeded)", e);
          }
        } else {
          // Only clear products if we are sure there is no data (and not just an error)
          // But if data is null, it means the path is empty.
          // We might want to keep showing cached products if we suspect a glitch, but "null" usually means empty.
          // However, if we have cached products and DB returns null, it implies products were deleted.
          setProducts([]);
          localStorage.removeItem('products_cache');
        }
      },
      (error) => {
        console.error("Database read failed:", error);
        setDbError("Failed to load products. Please check your connection.");
        // Do NOT clear products here, keep showing cached version if available
      }
    );

    return () => unsubscribe();
  }, []);

  const [selectedCategory, setSelectedCategory] = useState<string>('All');

  const onNavigateToStore = (catId?: string) => {
    if (catId) setSelectedCategory(catId);
    else setSelectedCategory('All');
    setActiveTab('store');
  };

  const renderPage = () => {
    switch (activeTab) {
      case 'home':
        return <Home products={products} onProductClick={setSelectedProduct} onNavigateToStore={onNavigateToStore} />;
      case 'store':
        return (
          <Store
            products={products}
            onProductClick={setSelectedProduct}
            initialCategory={selectedCategory}
          />
        );
      case 'contact':
        return <Contact />;
      case 'orders':
        return <OrderHistory onOrderClick={setSelectedHistoryOrder} />;
      default:
        return <Home products={products} onProductClick={setSelectedProduct} onNavigateToStore={onNavigateToStore} />;
    }
  };

  return (
    <ThemeProvider>
      <CartProvider>
        <div className="flex justify-center items-center min-h-screen bg-slate-950 font-sans transition-colors duration-500" dir={dir}>
          {/* Mobile Device Container - Eye Protection Warm Ivory Theme / Dark Mode */}
          <div className="w-full max-w-md h-[100dvh] sm:h-[850px] bg-[#F8F7F4] dark:bg-slate-900 relative overflow-hidden sm:rounded-[2.5rem] sm:shadow-2xl sm:border-[8px] sm:border-slate-800 transition-colors duration-500">
            <AnimatePresence>
              {showSplash && <SplashScreen />}
            </AnimatePresence>

            {/* Main Content Area */}
            <div className="h-full overflow-y-auto hide-scrollbar relative">
              <AnimatePresence mode="wait">
                {!showSplash && (
                  <motion.div
                    key={`${activeTab}-${language}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.18 }}
                    className="min-h-full"
                  >
                    {renderPage()}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Bottom Navigation */}
            {!showSplash && <BottomNav activeTab={activeTab} setActiveTab={setActiveTab} />}

            {/* Product Modal */}
            <ProductModal
              product={selectedProduct}
              onClose={() => setSelectedProduct(null)}
              redirectOnAdd={activeTab === 'home'}
              onNavigateToStore={() => setActiveTab('store')}
            />

            {/* Order Details Modal (History) */}
            <OrderDetailsModal
              order={selectedHistoryOrder}
              onClose={() => setSelectedHistoryOrder(null)}
            />

            {/* Shopping Cart */}
            <Cart onNavigateToStore={() => setActiveTab('store')} />
          </div>
        </div>
      </CartProvider>
    </ThemeProvider>
  );
}
