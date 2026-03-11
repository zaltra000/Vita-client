import { motion, AnimatePresence } from 'motion/react';
import { X, ShoppingCart, Droplets, Plus, Minus, Trash2 } from 'lucide-react';
import { Product } from '../types';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import { formatPrice, getLocalizedString } from '../utils';

interface ProductModalProps {
  product: Product | null;
  onClose: () => void;
  redirectOnAdd?: boolean;
  onNavigateToStore?: () => void;
}

export default function ProductModal({ product, onClose, redirectOnAdd, onNavigateToStore }: ProductModalProps) {
  const { t, language, dir } = useLanguage();
  const { addToCart, setIsCartOpen, cartItems, updateQuantity, removeFromCart } = useCart();

  const cartItem = product ? cartItems.find(item => item.product.id === product.id) : null;
  const quantity = cartItem ? cartItem.quantity : 0;

  const handleAddToCart = () => {
    if (product) {
      addToCart(product);
      if (redirectOnAdd && onNavigateToStore) {
        onClose();
        onNavigateToStore();
      } else {
        // If not redirecting, we just stay here. The UI will update to show quantity controls.
        // User requested: "It switches to + and - and doesn't take you to the cart"
      }
    }
  };

  const handleIncrement = () => {
    if (product) {
      updateQuantity(product.id, quantity + 1);
    }
  };

  const handleDecrement = () => {
    if (product) {
      if (quantity > 1) {
        updateQuantity(product.id, quantity - 1);
      } else {
        removeFromCart(product.id);
      }
    }
  };

  return (
    <AnimatePresence>
      {product && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-50"
          />
            <motion.div
            initial={{ y: '100%' }}
            animate={{ y: 0 }}
            exit={{ y: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="absolute bottom-0 left-0 w-full bg-[#F8F7F4] dark:bg-slate-900 rounded-t-[2.5rem] z-50 overflow-hidden flex flex-col max-h-[90%] transition-colors duration-500"
            dir={dir}
          >
            <div className="relative h-64 w-full shrink-0">
              <div className={`absolute inset-0 ${product.bgColor || 'bg-stone-50 dark:bg-slate-800'} opacity-50`} />
              <img
                src={product.imageUrl || ''}
                alt={getLocalizedString(product.name, language)}
                className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
              />
              {product.salePrice && (
                <div className="absolute top-0 right-0 bg-rose-600 text-white text-sm font-bold px-3 py-1.5 rounded-bl-xl z-10">
                  {Math.round(((product.price - product.salePrice) / product.price) * 100)}% OFF
                </div>
              )}
              <button
                onClick={onClose}
                className={`absolute top-4 ${dir === 'rtl' ? 'left-4' : 'right-4'} w-10 h-10 bg-white/80 dark:bg-slate-800/80 backdrop-blur-md rounded-full flex items-center justify-center text-stone-800 dark:text-white shadow-sm hover:bg-white dark:hover:bg-slate-700 transition-colors`}
              >
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto pb-24 hide-scrollbar">
              <div className="flex justify-between items-start mb-2">
                <div>
                  <span className={`text-xs font-bold uppercase tracking-wider ${product.color || 'text-emerald-700 dark:text-emerald-400'}`}>
                    {getLocalizedString(product.category, language)}
                  </span>
                  <h2 className="text-2xl font-bold text-stone-800 dark:text-white mt-1 transition-colors duration-500">{getLocalizedString(product.name, language)}</h2>
                </div>
                <div className={`text-${dir === 'rtl' ? 'left' : 'right'}`}>
                  {product.salePrice !== undefined && product.salePrice !== null ? (
                    <div className="flex flex-col items-end">
                      <span className="text-2xl font-bold text-rose-600 dark:text-rose-400 transition-colors duration-500">
                        {product.salePrice === 0 ? t('free') : formatPrice(product.salePrice)}
                      </span>
                      <span className="text-sm text-stone-400 line-through decoration-stone-400">
                        {formatPrice(product.price)} {t('sdg')}
                      </span>
                    </div>
                  ) : (
                    <>
                      <span className="text-2xl font-bold text-emerald-700 dark:text-emerald-400 transition-colors duration-500">
                        {product.price === 0 ? t('free') : formatPrice(product.price || 0)}
                      </span>
                      <span className="text-sm text-stone-500 dark:text-stone-400 block transition-colors duration-500">{t('sdg')}</span>
                    </>
                  )}
                </div>
              </div>

              {product.volume && (
                <div className="flex items-center gap-2 text-stone-500 dark:text-stone-400 text-sm mb-6 bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 w-fit px-3 py-1.5 rounded-full shadow-sm transition-colors duration-500">
                  <Droplets size={16} className="text-emerald-600 dark:text-emerald-400" />
                  <span dir="ltr" className="font-medium">{product.volume}</span>
                </div>
              )}

              <div className="mb-8">
                <h3 className="text-sm font-semibold text-stone-800 dark:text-white mb-2 transition-colors duration-500">{t('description')}</h3>
                <p className="text-stone-600 dark:text-stone-300 leading-relaxed text-sm transition-colors duration-500">
                  {getLocalizedString(product.description, language)}
                </p>
              </div>

              <div className="mt-auto">
                {quantity > 0 ? (
                  <div className="flex items-center justify-between bg-white dark:bg-slate-800 rounded-2xl p-2 shadow-lg shadow-emerald-900/10 dark:shadow-emerald-900/20 border border-emerald-100 dark:border-emerald-900/30">
                    <button 
                      onClick={handleDecrement}
                      className="w-14 h-14 rounded-xl bg-stone-100 dark:bg-slate-700 text-stone-600 dark:text-stone-300 flex items-center justify-center hover:bg-red-50 dark:hover:bg-red-900/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                    >
                      {quantity === 1 ? <Trash2 size={24} /> : <Minus size={24} />}
                    </button>
                    
                    <div className="flex flex-col items-center px-4">
                      <span className="text-2xl font-bold text-stone-800 dark:text-white">{quantity}</span>
                      <span className="text-[10px] text-stone-400 font-bold whitespace-nowrap">{language === 'ar' ? 'في السلة (كرتونة)' : 'Cartons in Cart'}</span>
                    </div>

                    <button 
                      onClick={handleIncrement}
                      className="w-14 h-14 rounded-xl bg-emerald-600 text-white flex items-center justify-center hover:bg-emerald-700 transition-colors shadow-md shadow-emerald-600/20"
                    >
                      <Plus size={24} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={handleAddToCart}
                    className="w-full bg-emerald-700 dark:bg-emerald-600 text-white py-4 rounded-2xl font-semibold text-lg shadow-lg shadow-emerald-900/20 dark:shadow-emerald-900/40 flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-emerald-800 dark:hover:bg-emerald-500"
                  >
                    <ShoppingCart size={20} />
                    {t('addToCart')}
                  </button>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
