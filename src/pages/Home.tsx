import { useState, useEffect } from 'react';
import { Product, Category } from '../types';
import { ShoppingBag, ChevronLeft, Tag, Layers, Sparkles } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { formatPrice, getLocalizedString } from '../utils';
import { db } from '../firebase';
import { ref, onValue } from 'firebase/database';

interface HomeProps {
  products: Product[];
  onProductClick: (product: Product) => void;
  onNavigateToStore: (categoryId?: string) => void;
}

export default function Home({ products, onProductClick, onNavigateToStore }: HomeProps) {
  const { t, language, dir } = useLanguage();
  const { setIsCartOpen, cartCount } = useCart();
  const [categories, setCategories] = useState<Category[]>([]);

  const featuredProducts = products.slice(0, 8);
  const onSaleProducts = products.filter(p => p.salePrice !== undefined && p.salePrice !== null).slice(0, 6);

  useEffect(() => {
    const categoriesRef = ref(db, 'categories');
    const unsubscribe = onValue(categoriesRef, (snapshot) => {
      const data = snapshot.val();
      if (data) {
        const list = Object.keys(data)
          .filter(key => !key.startsWith('area_'))
          .map(key => ({ id: key, ...data[key] }));
        setCategories(list);
      } else {
        setCategories([
          { id: 'General', en: 'General', ar: 'عام' },
          { id: 'Soft Drinks', en: 'Soft Drinks', ar: 'مشروبات غازية' },
          { id: 'Water', en: 'Water', ar: 'مياه' },
          { id: 'Juices', en: 'Juices', ar: 'عصائر' },
        ]);
      }
    });
    return () => unsubscribe();
  }, []);

  const getPrice = (product: Product) => {
    if (product.salePrice !== undefined && product.salePrice !== null) return product.salePrice;
    return product.price;
  };

  return (
    <div className="pb-36 bg-[#F8F7F4] dark:bg-slate-900 transition-colors duration-300 min-h-full" dir={dir}>

      {/* ─── Header ─── */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-black text-stone-800 dark:text-white tracking-tight">
            {language === 'ar' ? (
              <>ڤيتا <span className="text-emerald-600 dark:text-emerald-400">دايركت</span></>
            ) : (
              <>Vita <span className="text-emerald-600 dark:text-emerald-400">Direct</span></>
            )}
          </h1>
          <p className="text-xs text-stone-400 dark:text-stone-500 font-medium mt-0.5">{t('wholesaleDistributor')}</p>
        </div>
        <div className="flex items-center gap-2">
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

      {/* ─── Hero Banner ─── */}
      <div className="px-5 mb-8">
        <div
          onClick={() => onNavigateToStore()}
          className="relative rounded-[2.5rem] overflow-hidden h-48 shadow-xl cursor-pointer active:scale-[0.98] transition-transform group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900" />
          <img
            src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-15 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          <div className={`absolute inset-0 bg-gradient-to-${dir === 'rtl' ? 'l' : 'r'} from-transparent via-emerald-950/30 to-emerald-950/80`} />

          <div className="absolute inset-0 p-8 flex flex-col justify-center">
            <span className="text-emerald-300 text-[10px] font-bold uppercase tracking-[0.25em] mb-2 drop-shadow-sm">{t('newInStock')}</span>
            <h2 className="text-white text-[26px] font-black mb-5 leading-tight whitespace-pre-line drop-shadow-md">
              {t('shopCatalog')}
            </h2>
            <span className="inline-flex items-center gap-2 bg-white text-emerald-900 text-xs font-black px-6 py-2.5 rounded-full w-fit shadow-lg shadow-emerald-950/20 active:bg-emerald-50 transition-colors">
              {t('shopNow')} <ChevronLeft size={16} className={dir === 'rtl' ? '' : 'rotate-180'} />
            </span>
          </div>
        </div>
      </div>

      {/* ─── Exclusive Discounts Section ─── */}
      {onSaleProducts.length > 0 && (
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-10 h-10 bg-rose-100 dark:bg-rose-900/30 rounded-2xl flex items-center justify-center text-rose-600 dark:text-rose-400 rotate-3 shadow-sm border border-rose-200/50 dark:border-rose-900/50">
                <Sparkles size={20} />
              </div>
              <div>
                <span className="text-lg font-black text-stone-800 dark:text-white tracking-tight block leading-tight">{t('exclusiveDiscounts')}</span>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{language === 'ar' ? 'لفترة محدودة' : 'Limited Time'}</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateToStore()}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl"
            >
              {t('seeAll')}
            </button>
          </div>

          <div className="flex gap-4 overflow-x-auto -mx-5 px-5 pb-2 hide-scrollbar snap-x">
            {onSaleProducts.map(product => {
              const discount = Math.round((1 - (product.salePrice! / product.price)) * 100);
              return (
                <div
                  key={product.id}
                  onClick={() => onProductClick(product)}
                  className="min-w-[160px] bg-white dark:bg-slate-800 rounded-[2rem] p-3 shadow-md border border-stone-100 dark:border-slate-700 overflow-hidden active:scale-[0.97] transition-all snap-start relative group"
                >
                  {/* Glow effect */}
                  <div className="absolute -top-10 -right-10 w-24 h-24 bg-rose-500/10 dark:bg-rose-500/5 blur-2xl rounded-full" />

                  <div className={`h-28 rounded-3xl mb-3 flex items-center justify-center relative overflow-hidden ${product.bgColor || 'bg-stone-50 dark:bg-slate-700'}`}>
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} bg-rose-600 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-rose-900/40 z-10`}>
                      {discount}% {language === 'ar' ? 'خصم' : 'OFF'}
                    </div>
                  </div>

                  <div className="px-1">
                    <h3 className="text-[13px] font-bold text-stone-800 dark:text-white truncate mb-1">{getLocalizedString(product.name, language)}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">{formatPrice(product.salePrice!)}</span>
                      <span className="text-[10px] text-stone-400 line-through opacity-60">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* ─── Categories Quick Access ─── */}
      <div className="px-5 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <Layers size={18} className="text-emerald-600" />
          <span className="text-base font-bold text-stone-800 dark:text-white tracking-tight">{t('categories')}</span>
        </div>
        <div className="flex gap-2.5 overflow-x-auto -mx-5 px-5 pb-1 hide-scrollbar">
          {categories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onNavigateToStore(cat.id)}
              className="px-6 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 text-stone-700 dark:text-stone-300 text-xs font-bold whitespace-nowrap active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              {getLocalizedString(cat, language)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Featured Products (Most Requested) ─── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Tag size={18} className="text-emerald-600" />
            <span className="text-base font-bold text-stone-800 dark:text-white tracking-tight">{t('mostRequested')}</span>
          </div>
          <button onClick={() => onNavigateToStore()} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-full transition-colors">
            {t('seeAll')}
          </button>
        </div>

        <div className="flex gap-4 overflow-x-auto -mx-5 px-5 pb-4 hide-scrollbar snap-x">
          {featuredProducts.map(product => (
            <div
              key={product.id}
              onClick={() => onProductClick(product)}
              className="min-w-[170px] bg-white dark:bg-slate-800 rounded-[2rem] shadow-sm border border-stone-100 dark:border-slate-700 cursor-pointer active:scale-95 transition-all snap-start shrink-0 overflow-hidden group p-2.5"
            >
              <div className={`h-32 rounded-[1.5rem] relative overflow-hidden transition-colors ${product.bgColor || 'bg-stone-50 dark:bg-slate-700'}`}>
                <img
                  src={product.imageUrl}
                  alt={getLocalizedString(product.name, language)}
                  className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal group-hover:scale-110 transition-transform duration-500"
                  loading="lazy"
                />
                {product.salePrice === 0 && (
                  <span className="absolute top-3 right-3 bg-emerald-500 text-white text-[9px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-emerald-900/20">{t('free')}</span>
                )}
              </div>
              <div className="p-2 pt-3">
                <p className="text-[13px] font-bold text-stone-800 dark:text-white truncate leading-tight group-hover:text-emerald-700 dark:group-hover:text-emerald-400 transition-colors">{getLocalizedString(product.name, language)}</p>
                <div className="flex items-center justify-between mt-1">
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {getPrice(product) === 0 ? t('free') : `${formatPrice(getPrice(product))} ${t('sdg')}`}
                  </p>
                  <div className="w-6 h-6 bg-stone-50 dark:bg-slate-700 rounded-full flex items-center justify-center">
                    <ShoppingBag size={12} className="text-stone-400" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        {products.length === 0 && (
          <div className="text-center py-20 flex flex-col items-center">
            <div className="w-16 h-16 bg-stone-100 dark:bg-slate-800 rounded-full flex items-center justify-center mb-4 animate-pulse">
              <ShoppingBag className="text-stone-300" size={32} />
            </div>
            <p className="text-stone-400 dark:text-stone-500 text-sm font-medium">{t('loadingProducts')}</p>
          </div>
        )}
      </div>
    </div>
  );
}
