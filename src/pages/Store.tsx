import { useState, useMemo } from 'react';
import { Product, Category } from '../types';
import { Search, ShoppingBag, LayoutGrid, List, Plus, Minus } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import ThemeToggle from '../components/ThemeToggle';
import { formatPrice, getLocalizedString } from '../utils';

interface StoreProps {
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
  initialCategory?: string | null;
}

export default function Store({ products, categories, onProductClick, initialCategory }: StoreProps) {
  const { t, language, dir } = useLanguage();
  const { cartCount, setIsCartOpen, cartItems, addToCart, updateQuantity } = useCart();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(initialCategory || null);
  const [isGridView, setIsGridView] = useState(true);

  const filteredProducts = useMemo(() => {
    return products.filter(product => {
      const matchesSearch = getLocalizedString(product.name, language).toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !selectedCategory || product.category === selectedCategory || (selectedCategory === 'General' && !product.category);
      return matchesSearch && matchesCategory;
    });
  }, [products, searchQuery, selectedCategory, language]);

  // Sync internal category state with prop if it changes (e.g. via navigation)
  useMemo(() => {
    if (initialCategory !== undefined) {
      setSelectedCategory(initialCategory);
    }
  }, [initialCategory]);

  const getItemQuantity = (productId: string) => {
    const item = cartItems.find(i => i.product.id === productId);
    return item ? item.quantity : 0;
  };

  return (
    <div className="pb-36 bg-[#F8F7F4] dark:bg-slate-900 transition-colors duration-300 min-h-screen" dir={dir}>
      
      {/* ─── Top Bar ─── */}
      <div className="sticky top-0 z-30 bg-[#F8F7F4]/80 dark:bg-slate-900/80 backdrop-blur-xl px-5 pt-12 pb-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-black text-stone-800 dark:text-white tracking-tight">{t('ourStore')}</h1>
            <p className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 uppercase tracking-widest">{filteredProducts.length} {t('products')}</p>
          </div>
          <div className="flex items-center gap-3">
            <button 
              onClick={() => setIsGridView(!isGridView)}
              className="w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-100 dark:border-slate-700 flex items-center justify-center text-stone-400 dark:text-stone-500 active:scale-90 transition-transform"
            >
              {isGridView ? <List size={18} /> : <LayoutGrid size={18} />}
            </button>
            <ThemeToggle />
            <button 
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 bg-white dark:bg-slate-800 rounded-xl shadow-sm border border-stone-100 dark:border-slate-700 flex items-center justify-center text-emerald-600 dark:text-emerald-400 active:scale-90 transition-transform"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-emerald-600 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#F8F7F4] dark:border-slate-900">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-6 group">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-stone-400 group-focus-within:text-emerald-600 transition-colors" size={18} />
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full bg-white dark:bg-slate-800 border-none rounded-[1.25rem] py-4 pl-12 pr-6 text-sm text-stone-800 dark:text-white placeholder:text-stone-400 dark:placeholder:text-stone-600 shadow-sm focus:ring-2 focus:ring-emerald-500/20 transition-all outline-none"
          />
        </div>

        {/* Categories */}
        <div className="flex gap-2 overflow-x-auto hide-scrollbar -mx-5 px-5">
          <button
            onClick={() => setSelectedCategory(null)}
            className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
              selectedCategory === null 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105' 
                : 'bg-white dark:bg-slate-800 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-slate-700'
            }`}
          >
            {t('all')}
          </button>
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-6 py-2.5 rounded-full text-xs font-bold transition-all whitespace-nowrap active:scale-95 ${
                selectedCategory === cat.id 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20 scale-105' 
                  : 'bg-white dark:bg-slate-800 text-stone-500 dark:text-stone-400 border border-stone-100 dark:border-slate-700'
              }`}
            >
              {getLocalizedString(cat, language)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Product Grid ─── */}
      <div className="px-5">
        <AnimatePresence mode="popLayout">
          {filteredProducts.length > 0 ? (
            <motion.div 
              layout
              className={isGridView ? "grid grid-cols-2 gap-4" : "flex flex-col gap-4"}
            >
              {filteredProducts.map((product) => {
                const quantity = getItemQuantity(product.id);
                return (
                  <motion.div
                    key={product.id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    className={`bg-white dark:bg-slate-800 rounded-[2rem] border border-stone-100 dark:border-slate-700 shadow-sm overflow-hidden transition-all group flex ${isGridView ? 'flex-col' : 'flex-row h-32'}`}
                  >
                    <div 
                      onClick={() => onProductClick(product)}
                      className={`relative cursor-pointer ${isGridView ? 'h-40 w-full' : 'w-32 h-full'} ${product.bgColor || 'bg-stone-50 dark:bg-slate-700'} flex items-center justify-center overflow-hidden shrink-0`}
                    >
                      <img
                        src={product.imageUrl}
                        alt={getLocalizedString(product.name, language)}
                        className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-700"
                        loading="lazy"
                      />
                      {product.salePrice !== undefined && product.salePrice !== null && (
                        <div className="absolute top-3 left-3 bg-rose-500 text-white text-[9px] font-black px-2 py-1 rounded-full shadow-lg">
                          -{Math.round((1 - (product.salePrice / product.price)) * 100)}%
                        </div>
                      )}
                    </div>
                    
                    <div className={`p-4 flex flex-col justify-between flex-1 ${dir === 'rtl' ? 'text-right' : 'text-left'}`}>
                      <div onClick={() => onProductClick(product)} className="cursor-pointer">
                        <h3 className="text-sm font-bold text-stone-800 dark:text-white mb-1 line-clamp-1 group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">
                          {getLocalizedString(product.name, language)}
                        </h3>
                        {product.stock === 0 && (
                          <span className="text-[10px] font-bold text-rose-500 bg-rose-50 dark:bg-rose-900/20 px-2 py-0.5 rounded-full">{language === 'ar' ? 'نفد المخزون' : 'Out of Stock'}</span>
                        )}
                      </div>
                      
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex flex-col" onClick={() => onProductClick(product)}>
                          {product.salePrice !== undefined && product.salePrice !== null ? (
                            <>
                              <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{formatPrice(product.salePrice)} {t('sdg')}</span>
                              <span className="text-[10px] text-stone-400 line-through">{formatPrice(product.price)}</span>
                            </>
                          ) : (
                            <span className="text-emerald-700 dark:text-emerald-400 font-black text-sm">{formatPrice(product.price)} {t('sdg')}</span>
                          )}
                        </div>

                        {/* Quantity Controls Direct on Card */}
                        <div className="flex items-center gap-1.5" onClick={(e) => e.stopPropagation()}>
                          {quantity > 0 ? (
                            <div className="flex items-center bg-stone-100 dark:bg-slate-700 rounded-2xl h-11 px-1.5 transition-all">
                              <button
                                onClick={() => updateQuantity(product.id, quantity - 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-white dark:bg-slate-600 rounded-xl flex items-center justify-center text-stone-500 dark:text-stone-300 shadow-sm active:scale-90 transition-transform"
                              >
                                <Minus size={16} strokeWidth={2.5} />
                              </button>
                              <span className="w-6 sm:w-8 text-center text-sm font-black text-stone-800 dark:text-white">{quantity}</span>
                              <button
                                onClick={() => updateQuantity(product.id, quantity + 1)}
                                className="w-8 h-8 sm:w-9 sm:h-9 bg-emerald-600 text-white rounded-xl flex items-center justify-center shadow-sm active:scale-90 transition-transform"
                              >
                                <Plus size={16} strokeWidth={2.5} />
                              </button>
                            </div>
                          ) : (
                            <button 
                              onClick={() => addToCart(product, 1)}
                              disabled={product.stock === 0}
                              className={`w-11 h-11 ${product.stock === 0 ? 'bg-stone-50 dark:bg-slate-800 text-stone-300' : 'bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 active:scale-90 hover:bg-emerald-600 hover:text-white shadow-sm border border-stone-100 dark:border-slate-700/50'} rounded-2xl flex items-center justify-center transition-all`}
                            >
                              <Plus size={22} strokeWidth={2.5} />
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="py-24 text-center"
            >
              <div className="w-20 h-20 bg-stone-100 dark:bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6 text-stone-300 dark:text-stone-600">
                <Search size={32} />
              </div>
              <p className="text-stone-500 dark:text-stone-400 font-medium">{t('noProducts')}</p>
              <button 
                onClick={() => {setSearchQuery(''); setSelectedCategory(null);}}
                className="mt-4 text-sm font-bold text-emerald-600 dark:text-emerald-400"
              >
                {language === 'ar' ? 'عرض كل المنتجات' : 'View all products'}
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
