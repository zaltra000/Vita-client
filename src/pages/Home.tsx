import { Product, Category } from '../types';
import { ShoppingBag, ChevronLeft, Layers, Sparkles, Flame } from 'lucide-react';
import { motion } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { useCart } from '../context/CartContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { formatPrice, getLocalizedString } from '../utils';

interface HomeProps {
  products: Product[];
  categories: Category[];
  onProductClick: (product: Product) => void;
  onNavigateToStore: (categoryId?: string) => void;
}

export default function Home({ products, categories, onProductClick, onNavigateToStore }: HomeProps) {
  const { t, language, dir } = useLanguage();
  const { setIsCartOpen, cartCount } = useCart();

  const featuredProducts = products.slice(0, 8);
  const onSaleProducts = products.filter(p => p.salePrice !== undefined && p.salePrice !== null).slice(0, 6);

  const getPrice = (product: Product) => {
    if (product.salePrice !== undefined && product.salePrice !== null) return product.salePrice;
    return product.price;
  };

  return (
    <div className="pb-36 bg-[#F8F7F4] dark:bg-slate-900 transition-colors duration-300 min-h-full" dir={dir}>

      {/* ─── Header ─── */}
      <div className="px-5 pt-12 pb-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <img src="/logo.png" alt="Vita" className="w-10 h-10 rounded-xl shadow-sm" />
          <div>
            <h1 className="text-xl font-black text-stone-800 dark:text-white tracking-tight">
              {language === 'ar' ? (
                <>ڤيتا <span className="text-emerald-600 dark:text-emerald-400">دايركت</span></>
              ) : (
                <>Vita <span className="text-emerald-600 dark:text-emerald-400">Direct</span></>
              )}
            </h1>
            <p className="text-[10px] text-stone-400 dark:text-stone-500 font-medium">{t('wholesaleDistributor')}</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />
          <button
            onClick={() => setIsCartOpen(true)}
            className="relative w-10 h-10 bg-white dark:bg-slate-800 shadow-sm border border-stone-100 dark:border-slate-700 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 active:scale-90 transition-transform"
          >
            <ShoppingBag size={18} />
            {cartCount > 0 && (
              <motion.span 
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 bg-red-500 text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-[#F8F7F4] dark:border-slate-900"
              >
                {cartCount}
              </motion.span>
            )}
          </button>
        </div>
      </div>

      {/* ─── Hero Banner ─── */}
      <div className="px-5 mb-8">
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          onClick={() => onNavigateToStore()}
          className="relative rounded-[2rem] overflow-hidden h-52 shadow-xl cursor-pointer active:scale-[0.98] transition-transform group"
        >
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-800 via-emerald-900 to-slate-900" />
          <img
            src="https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&q=80&w=800"
            alt=""
            className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay group-hover:scale-110 transition-transform duration-700"
            loading="lazy"
          />
          {/* Glassmorphism overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />

          <div className="absolute inset-0 p-7 flex flex-col justify-end">
            <span className="text-emerald-300/90 text-[10px] font-bold uppercase tracking-[0.25em] mb-2 drop-shadow-sm">{t('newInStock')}</span>
            <h2 className="text-white text-[28px] font-black mb-5 leading-[1.15] whitespace-pre-line drop-shadow-lg">
              {t('shopCatalog')}
            </h2>
            <span className="inline-flex items-center gap-2 bg-white/95 text-emerald-900 text-xs font-black px-6 py-2.5 rounded-full w-fit shadow-lg active:bg-emerald-50 transition-colors backdrop-blur-sm">
              {t('shopNow')} <ChevronLeft size={16} className={dir === 'rtl' ? '' : 'rotate-180'} />
            </span>
          </div>
        </motion.div>
      </div>

      {/* ─── Exclusive Discounts Section ─── */}
      {onSaleProducts.length > 0 && (
        <div className="px-5 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 bg-gradient-to-br from-rose-500 to-orange-500 rounded-2xl flex items-center justify-center text-white shadow-md shadow-rose-500/20 rotate-3">
                <Sparkles size={20} />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-lg font-black text-stone-800 dark:text-white tracking-tight leading-tight">{t('exclusiveDiscounts')}</span>
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                  </span>
                </div>
                <span className="text-[10px] font-bold text-rose-500 uppercase tracking-wider">{language === 'ar' ? 'لفترة محدودة' : 'Limited Time'}</span>
              </div>
            </div>
            <button
              onClick={() => onNavigateToStore()}
              className="text-[11px] font-bold text-rose-600 dark:text-rose-400 px-4 py-1.5 bg-rose-50 dark:bg-rose-900/20 rounded-xl active:scale-95 transition-transform"
            >
              {t('seeAll')}
            </button>
          </div>

          <div className="flex gap-3.5 overflow-x-auto -mx-5 px-5 pb-2 hide-scrollbar snap-x">
            {onSaleProducts.map(product => {
              const discount = Math.round((1 - (product.salePrice! / product.price)) * 100);
              return (
                <motion.div
                  key={product.id}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  onClick={() => onProductClick(product)}
                  className="min-w-[155px] bg-white dark:bg-slate-800 rounded-[1.75rem] p-2.5 shadow-md border border-stone-100 dark:border-slate-700 overflow-hidden active:scale-[0.96] transition-all snap-start relative group"
                >
                  {/* Gradient glow */}
                  <div className="absolute -top-8 -right-8 w-20 h-20 bg-gradient-to-br from-rose-500/15 to-orange-500/10 blur-2xl rounded-full" />

                  <div className={`h-28 rounded-[1.25rem] mb-2.5 flex items-center justify-center relative overflow-hidden ${product.bgColor || 'bg-stone-50 dark:bg-slate-700'}`}>
                    <img
                      src={product.imageUrl}
                      alt=""
                      className="w-full h-full object-cover mix-blend-multiply dark:mix-blend-normal transform group-hover:scale-110 transition-transform duration-500"
                      loading="lazy"
                    />
                    <div className={`absolute top-2 ${dir === 'rtl' ? 'right-2' : 'left-2'} bg-gradient-to-r from-rose-600 to-rose-500 text-white text-[10px] font-black px-2.5 py-1 rounded-full shadow-lg shadow-rose-900/30 z-10`}>
                      {discount}% {language === 'ar' ? 'خصم' : 'OFF'}
                    </div>
                  </div>

                  <div className="px-1 pb-1">
                    <h3 className="text-[13px] font-bold text-stone-800 dark:text-white truncate mb-1">{getLocalizedString(product.name, language)}</h3>
                    <div className="flex items-baseline gap-2">
                      <span className="text-base font-black text-rose-600 dark:text-rose-400">{formatPrice(product.salePrice!)}</span>
                      <span className="text-[10px] text-stone-400 line-through opacity-60">{formatPrice(product.price)}</span>
                    </div>
                  </div>
                </motion.div>
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
              className="px-5 py-3 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 text-stone-700 dark:text-stone-300 text-xs font-bold whitespace-nowrap active:scale-95 transition-all hover:bg-emerald-50 dark:hover:bg-emerald-950/20 hover:border-emerald-200 dark:hover:border-emerald-800"
            >
              {getLocalizedString(cat, language)}
            </button>
          ))}
        </div>
      </div>

      {/* ─── Featured Products (Most Requested) ─── */}
      <div className="px-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Flame size={18} />
            </div>
            <span className="text-base font-bold text-stone-800 dark:text-white tracking-tight">{t('mostRequested')}</span>
          </div>
          <button onClick={() => onNavigateToStore()} className="text-xs font-bold text-emerald-700 dark:text-emerald-400 px-3 py-1.5 hover:bg-emerald-50 dark:hover:bg-emerald-950/30 rounded-xl transition-colors active:scale-95">
            {t('seeAll')}
          </button>
        </div>

        <div className="flex gap-3.5 overflow-x-auto -mx-5 px-5 pb-4 hide-scrollbar snap-x">
          {featuredProducts.map((product, idx) => (
            <motion.div
              key={product.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.05 }}
              onClick={() => onProductClick(product)}
              className="min-w-[165px] bg-white dark:bg-slate-800 rounded-[1.75rem] shadow-sm border border-stone-100 dark:border-slate-700 cursor-pointer active:scale-[0.96] transition-all snap-start shrink-0 overflow-hidden group p-2.5"
            >
              <div className={`h-32 rounded-[1.25rem] relative overflow-hidden transition-colors ${product.bgColor || 'bg-stone-50 dark:bg-slate-700'}`}>
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
                <div className="flex items-center justify-between mt-1.5">
                  <p className="text-sm font-black text-emerald-700 dark:text-emerald-400">
                    {getPrice(product) === 0 ? t('free') : `${formatPrice(getPrice(product))} ${t('sdg')}`}
                  </p>
                  <div className="w-7 h-7 bg-emerald-50 dark:bg-emerald-900/20 rounded-full flex items-center justify-center group-hover:bg-emerald-100 dark:group-hover:bg-emerald-900/40 transition-colors">
                    <ShoppingBag size={13} className="text-emerald-600 dark:text-emerald-400" />
                  </div>
                </div>
              </div>
            </motion.div>
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
