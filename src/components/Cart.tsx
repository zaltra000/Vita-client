import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingBag, Plus, Minus, Trash2 } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice, getLocalizedString } from '../utils';
import CheckoutScreen, { CompletedOrder } from './CheckoutScreen';
import OrderConfirmation from './OrderConfirmation';

interface CartProps {
  onNavigateToStore?: () => void;
}

export default function Cart({ onNavigateToStore }: CartProps) {
  const { isCartOpen, setIsCartOpen, cartItems, updateQuantity, removeFromCart, cartTotal, cartCount } = useCart();
  const { t, language, dir } = useLanguage();
  const [showCheckout, setShowCheckout] = useState(false);
  const [completedOrder, setCompletedOrder] = useState<CompletedOrder | null>(null);

  const handleContinueShopping = () => {
    setIsCartOpen(false);
    if (onNavigateToStore) {
      onNavigateToStore();
    }
  };

  const getProductPrice = (product: any) => {
    if (product.salePrice !== undefined && product.salePrice !== null) {
      return typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice;
    }
    return typeof product.price === 'string' ? parseFloat(product.price) : product.price;
  };

  const handleOrderComplete = (order: CompletedOrder) => {
    setShowCheckout(false);
    setCompletedOrder(order);
  };

  const handleCloseConfirmation = () => {
    setCompletedOrder(null);
    setIsCartOpen(false);
  };

  return (
    <>
      <AnimatePresence>
        {isCartOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsCartOpen(false)}
              className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
            />
            <motion.div
              initial={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              animate={{ x: 0 }}
              exit={{ x: dir === 'rtl' ? '-100%' : '100%' }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className={`absolute top-0 ${dir === 'rtl' ? 'left-0' : 'right-0'} w-full sm:w-[400px] h-full bg-[#F8F7F4] dark:bg-slate-900 z-[70] flex flex-col shadow-2xl transition-colors duration-500`}
              dir={dir}
            >
              {/* Header */}
              <div className="px-6 py-5 pt-[calc(1.25rem+env(safe-area-inset-top))] bg-white dark:bg-slate-800 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between shrink-0 transition-colors duration-500">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center">
                    <ShoppingBag size={20} />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-stone-800 dark:text-white">{t('cart')}</h2>
                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">{cartCount} {t('items')}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsCartOpen(false)}
                  className="p-2 text-stone-400 dark:text-stone-500 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors"
                >
                  <X size={20} />
                </button>
              </div>

              {/* Cart Items */}
              <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
                {cartItems.length === 0 ? (
                  <div className="h-full flex flex-col items-center justify-center text-stone-400 dark:text-stone-500 space-y-4">
                    <ShoppingBag size={64} className="opacity-20" />
                    <p className="text-sm font-medium">{t('emptyCart')}</p>
                    <button
                      onClick={handleContinueShopping}
                      className="mt-4 px-6 py-2 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full text-sm font-bold hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                    >
                      {t('continueShopping')}
                    </button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {cartItems.map((item) => {
                      if (!item || !item.product || !item.product.id) return null;
                      return (
                        <div key={item.product.id} className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 flex gap-4 transition-colors duration-500">
                          <div className={`w-20 h-20 rounded-xl overflow-hidden relative shrink-0 ${item.product.bgColor || 'bg-stone-50 dark:bg-slate-700'}`}>
                            <img
                              src={item.product.imageUrl || ''}
                              alt={getLocalizedString(item.product.name, language)}
                              className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                            />
                          </div>
                          <div className="flex-1 flex flex-col justify-between">
                            <div className="flex justify-between items-start gap-2">
                              <div>
                                <h3 className="font-bold text-stone-800 dark:text-white text-sm line-clamp-2 leading-tight">
                                  {getLocalizedString(item.product.name, language)}
                                </h3>
                                <span className="text-xs font-bold text-emerald-700 dark:text-emerald-400 mt-1 block">
                                  {getProductPrice(item.product) === 0 ? (t('free') || 'مجاني') : `${formatPrice(getProductPrice(item.product))} ${t('sdg')}`}
                                </span>
                              </div>
                              <button
                                onClick={() => removeFromCart(item.product.id)}
                                className="p-1.5 text-stone-400 dark:text-stone-500 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-colors"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>

                            <div className="flex items-center gap-3 mt-3">
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                                className="w-8 h-8 rounded-full bg-stone-100 dark:bg-slate-700 flex items-center justify-center text-stone-600 dark:text-stone-300 hover:bg-stone-200 dark:hover:bg-slate-600 transition-colors"
                              >
                                <Minus size={14} />
                              </button>
                              <span className="font-bold text-stone-800 dark:text-white min-w-[1.5rem] flex flex-col items-center justify-center leading-none text-center text-sm">
                                <span>{item.quantity}</span>
                                <span className="text-[8px] font-bold text-stone-400 mt-1">{language === 'ar' ? 'كرتونة' : 'Carton'}</span>
                              </span>
                              <button
                                onClick={() => updateQuantity(item.product.id, item.quantity + 1)}
                                className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-900/30 flex items-center justify-center text-emerald-700 dark:text-emerald-400 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 transition-colors"
                              >
                                <Plus size={14} />
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Footer */}
              {cartItems.length > 0 && (
                <div className="bg-white dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 p-6 pb-[calc(1.5rem+env(safe-area-inset-bottom))] shrink-0 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)] transition-colors duration-500">
                  <div className="flex justify-between items-center mb-6">
                    <span className="text-stone-500 dark:text-stone-400 font-medium">{t('total')}</span>
                    <div className={`text-${dir === 'rtl' ? 'left' : 'right'}`}>
                      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 block leading-none">
                        {cartTotal === 0 ? (t('free') || 'مجاني') : formatPrice(cartTotal)}
                      </span>
                      <span className="text-xs text-stone-400 dark:text-stone-500 font-medium">{t('sdg')}</span>
                    </div>
                  </div>

                  <button
                    onClick={() => setShowCheckout(true)}
                    className="w-full bg-emerald-700 dark:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/20 dark:shadow-emerald-900/40 flex items-center justify-center gap-2 active:scale-95 transition-all hover:bg-emerald-800 dark:hover:bg-emerald-500"
                  >
                    {t('checkout')}
                  </button>
                </div>
              )}

              {/* Checkout Overlay */}
              <CheckoutScreen
                isOpen={showCheckout}
                onClose={() => setShowCheckout(false)}
                onOrderComplete={handleOrderComplete}
              />
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Order Confirmation (Full Screen) */}
      <AnimatePresence>
        {completedOrder && (
          <OrderConfirmation
            order={completedOrder}
            onClose={handleCloseConfirmation}
          />
        )}
      </AnimatePresence>
    </>
  );
}
