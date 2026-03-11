import { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { Search, Plus, ShoppingBag, Minus, Trash2, LayoutGrid, List } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { formatPrice, getLocalizedString } from '../utils';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface StoreProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  initialCategory?: string;
}

export default function Store({ products, onProductClick, initialCategory = 'All' }: StoreProps) {
  const { t, language, dir } = useLanguage();
  const { setIsCartOpen, cartCount, addToCart, cartItems, updateQuantity } = useCart();
  const [activeCategory, setActiveCategory] = useState(initialCategory);
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [viewMode, setViewMode] = useState<'list' | 'grid'>('list');

  useEffect(() => {
    setActiveCategory(initialCategory);
  }, [initialCategory]);

  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data)
          .filter(key => !key.startsWith('area_'))
          .map(key => ({ id: key, ...data[key] }));
        setCategories([{ id: 'All', en: 'All', ar: 'الكل' }, ...list]);
      } else {
        setCategories([
          { id: 'All', en: 'All', ar: 'الكل' },
          { id: 'General', en: 'General', ar: 'عام' },
          { id: 'Soft Drinks', en: 'Soft Drinks', ar: 'مشروبات غازية' },
          { id: 'Water', en: 'Water', ar: 'مياه' },
          { id: 'Juices', en: 'Juices', ar: 'عصائر' },
          { id: 'Energy Drinks', en: 'Energy Drinks', ar: 'مشروبات طاقة' },
          { id: 'Powders', en: 'Powders', ar: 'بودرة' },
        ]);
      }
    });
    return () => unsubscribe();
  }, []);

  const filteredProducts = products.filter(p => {
    const matchesCategory = activeCategory === 'All' || p.category === activeCategory;
    const nameLocalized = getLocalizedString(p.name, language);
    const matchesSearch = nameLocalized.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const getCartQty = (productId: string) => cartItems.find(i => i.product.id === productId)?.quantity || 0;

  const getPrice = (product: Product) => {
    if (product.salePrice !== undefined && product.salePrice !== null) return { price: product.salePrice, isOriginal: product.price };
    return { price: product.price, isOriginal: null };
  };

  return (
    <div className="pb-36 min-h-full flex flex-col bg-[#F8F7F4] dark:bg-slate-900 transition-colors duration-300" dir={dir}>

      {/* ─── Sticky Header ─── */}
      <div className="pt-12 px-5 pb-3 bg-[#F8F7F4]/95 dark:bg-slate-900/95 backdrop-blur-xl sticky top-0 z-30 transition-colors duration-300">
        <div className="flex justify-between items-center mb-3">
          <h1 className="text-xl font-black text-stone-800 dark:text-white">{t('ourStore')}</h1>
          <div className="flex items-center gap-2">
            {/* View mode toggle */}
            <div className="flex bg-white dark:bg-slate-800 border border-stone-200 dark:border-slate-700 rounded-xl overflow-hidden">
              <button
                onClick={() => setViewMode('list')}
                className={`p-2 transition-colors ${viewMode === 'list' ? 'bg-emerald-600 text-white' : 'text-stone-400'}`}
              >
                <List size={15} />
              </button>
              <button
                onClick={() => setViewMode('grid')}
                className={`p-2 transition-colors ${viewMode === 'grid' ? 'bg-emerald-600 text-white' : 'text-stone-400'}`}
              >
                <LayoutGrid size={15} />
              </button>
            </div>
            <ThemeToggle />
            <LanguageSwitcher />
            <button
              onClick={() => setIsCartOpen(true)}
              className="relative w-10 h-10 bg-white dark:bg-slate-800 shadow-sm border border-stone-100 dark:border-slate-700 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400"
            >
              <ShoppingBag size={18} />
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-[#F8F7F4] dark:border-slate-900">
                  {cartCount}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Search */}
        <div className="relative mb-3">
          <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-4' : 'left-4'} flex items-center pointer-events-none`}>
            <Search size={16} className="text-stone-400" />
          </div>
          <input
            type="text"
            placeholder={t('searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className={`w-full bg-white dark:bg-slate-800 text-stone-800 dark:text-white rounded-2xl py-3 ${dir === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'} focus:outline-none focus:ring-2 focus:ring-emerald-600 text-sm border border-stone-200 dark:border-slate-700 placeholder:text-stone-400`}
          />
        </div>

        {/* Category pills */}
        <div className="flex gap-2 overflow-x-auto pb-1 -mx-5 px-5 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-bold transition-all ${activeCategory === cat.id
                ? 'bg-emerald-700 dark:bg-emerald-600 text-white shadow-sm'
                : 'bg-white dark:bg-slate-800 text-stone-600 dark:text-stone-300 border border-stone-200 dark:border-slate-700'
                }`}
            >
              {getLocalizedString(cat, language)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Product List ─── */}
      <div className="px-5 pt-3 flex-1">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-16 text-stone-400 dark:text-stone-500">
            <ShoppingBag size={48} className="opacity-20 mx-auto mb-3" />
            <p className="text-sm">{t('noProducts')}</p>
          </div>
        ) : viewMode === 'list' ? (
          /* ── List View ── */
          <div className="space-y-3">
            {filteredProducts.map(product => {
              const qty = getCartQty(product.id);
              const { price, isOriginal } = getPrice(product);
              return (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm overflow-hidden flex active:scale-[0.99] transition-transform cursor-pointer"
                >
                  {/* Product Image */}
                  <div className={`w-28 h-28 shrink-0 relative ${product.bgColor || 'bg-stone-50'}`}>
                    <img
                      src={product.imageUrl || ''}
                      alt={getLocalizedString(product.name, language)}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                      loading="lazy"
                    />
                    {price === 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">{t('free')}</span>
                    )}
                    {isOriginal !== null && price > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        -{Math.round(((isOriginal - price) / isOriginal) * 100)}%
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 p-3 flex flex-col justify-between min-w-0">
                    <div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${product.color || 'text-emerald-600'}`}>
                        {getLocalizedString(product.category, language)}
                      </span>
                      <h4 className="font-bold text-stone-800 dark:text-white text-sm leading-tight line-clamp-2 mt-0.5">
                        {getLocalizedString(product.name, language)}
                      </h4>
                      {product.volume && (
                        <span className="text-[10px] text-stone-400 dark:text-stone-500">{product.volume}</span>
                      )}
                    </div>

                    <div className="flex items-center justify-between mt-2" onClick={e => e.stopPropagation()}>
                      <div>
                        <span className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                          {price === 0 ? t('free') : `${formatPrice(price)} ${t('sdg')}`}
                        </span>
                        {isOriginal !== null && price > 0 && (
                          <span className="text-[10px] text-stone-400 line-through block">{formatPrice(isOriginal)}</span>
                        )}
                      </div>

                      {qty > 0 ? (
                        <div className="flex items-center gap-2 bg-stone-100 dark:bg-slate-700 rounded-xl p-1">
                          <button
                            onClick={() => updateQuantity(product.id, qty - 1)}
                            className="w-9 h-9 bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-200 active:scale-95 transition-transform shadow-sm"
                          >
                            {qty === 1 ? <Trash2 size={16} /> : <Minus size={16} />}
                          </button>
                          <span className="font-bold text-stone-800 dark:text-white text-base w-6 text-center">{qty}</span>
                          <button
                            onClick={() => addToCart(product)}
                            className="w-9 h-9 bg-emerald-600 text-white rounded-lg flex items-center justify-center active:scale-95 transition-transform shadow-sm"
                          >
                            <Plus size={16} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={() => addToCart(product)}
                          className="bg-emerald-700 dark:bg-emerald-600 text-white text-xs font-bold px-3 py-2 rounded-xl flex items-center gap-1.5 active:scale-95 transition-transform"
                        >
                          <Plus size={13} />
                          {t('addToCart')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* ── Grid View ── */
          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map(product => {
              const qty = getCartQty(product.id);
              const { price, isOriginal } = getPrice(product);
              return (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="bg-white dark:bg-slate-800 rounded-2xl border border-stone-100 dark:border-slate-700 shadow-sm overflow-hidden cursor-pointer active:scale-95 transition-transform"
                >
                  <div className={`w-full aspect-square relative ${product.bgColor || 'bg-stone-50'}`}>
                    <img
                      src={product.imageUrl || ''}
                      alt={getLocalizedString(product.name, language)}
                      className="absolute inset-0 w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal"
                      loading="lazy"
                    />
                    {isOriginal !== null && price > 0 && (
                      <span className="absolute top-1.5 right-1.5 bg-rose-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full">
                        -{Math.round(((isOriginal - price) / isOriginal) * 100)}%
                      </span>
                    )}
                  </div>
                  <div className="p-2.5">
                    <p className="text-xs font-bold text-stone-800 dark:text-white truncate">{getLocalizedString(product.name, language)}</p>
                    <p className="text-xs font-black text-emerald-700 dark:text-emerald-400 mt-1">
                      {price === 0 ? t('free') : `${formatPrice(price)} ${t('sdg')}`}
                    </p>
                    <div className="mt-2 h-9">
                      {qty > 0 ? (
                        <div className="flex items-center justify-between w-full h-full bg-stone-100 dark:bg-slate-700 rounded-xl p-1" onClick={e => e.stopPropagation()}>
                          <button
                            onClick={() => updateQuantity(product.id, qty - 1)}
                            className="w-8 h-full bg-white dark:bg-slate-600 rounded-lg flex items-center justify-center text-stone-600 dark:text-stone-200 active:scale-95 transition-transform shadow-sm"
                          >
                            {qty === 1 ? <Trash2 size={14} /> : <Minus size={14} />}
                          </button>
                          <span className="font-bold text-stone-800 dark:text-white text-sm">{qty}</span>
                          <button
                            onClick={() => addToCart(product)}
                            className="w-8 h-full bg-emerald-600 text-white rounded-lg flex items-center justify-center active:scale-95 transition-transform shadow-sm"
                          >
                            <Plus size={14} />
                          </button>
                        </div>
                      ) : (
                        <button
                          onClick={e => { e.stopPropagation(); addToCart(product); }}
                          className="w-full h-full bg-emerald-600 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1 active:scale-95 transition-transform"
                        >
                          <Plus size={14} />
                          {t('addToCart').replace('Add to Order', 'Add').replace('أضف للطلب', 'أضف')}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
