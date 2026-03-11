import { Home, ShoppingBag, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { t, language } = useLanguage();
  const tabs = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'store', icon: ShoppingBag, label: t('store') },
    { id: 'orders', icon: Package, label: language === 'ar' ? 'طلباتي' : 'Orders' },
  ];

  return (
    <div className="absolute left-1/2 -translate-x-1/2 w-[88%] max-w-[320px] z-40 bottom-[calc(1.25rem+env(safe-area-inset-bottom))]">
      <div className="bg-white/70 dark:bg-slate-800/70 backdrop-blur-2xl rounded-[2rem] p-1.5 flex justify-between items-center shadow-2xl shadow-black/10 dark:shadow-black/30 border border-white/40 dark:border-slate-700/50 transition-colors duration-500">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-3.5 outline-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-1 bg-emerald-600 dark:bg-emerald-500 rounded-[1.25rem] shadow-lg shadow-emerald-600/30"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.5 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  size={20}
                  strokeWidth={isActive ? 2.5 : 2}
                  className={`transition-all duration-300 ${isActive ? 'text-white' : 'text-stone-400 dark:text-stone-500 group-hover:text-stone-600 dark:group-hover:text-stone-300'}`}
                />
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, height: 0, scale: 0.8 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.8 }}
                      className="text-[10px] font-bold text-white"
                    >
                      {tab.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}
