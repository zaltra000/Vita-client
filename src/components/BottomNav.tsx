import { Home, ShoppingBag, Phone, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';

interface BottomNavProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
}

export default function BottomNav({ activeTab, setActiveTab }: BottomNavProps) {
  const { t } = useLanguage();
  const tabs = [
    { id: 'home', icon: Home, label: t('home') },
    { id: 'store', icon: ShoppingBag, label: t('store') },
    { id: 'orders', icon: Package, label: 'طلباتي' },
    { id: 'contact', icon: Phone, label: t('contact') },
  ];

  return (
    <div className="absolute bottom-6 left-1/2 -translate-x-1/2 w-[90%] max-w-[340px] z-40">
      <div className="bg-gray-900/95 dark:bg-slate-800/95 backdrop-blur-xl rounded-full p-2 flex justify-between items-center shadow-2xl shadow-emerald-900/20 dark:shadow-emerald-900/40 border border-white/10 dark:border-slate-700 transition-colors duration-500">
        {tabs.map((tab) => {
          const isActive = activeTab === tab.id;
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className="relative flex-1 flex flex-col items-center justify-center py-3 outline-none group"
            >
              {isActive && (
                <motion.div
                  layoutId="activeTabIndicator"
                  className="absolute inset-0 bg-emerald-500 dark:bg-emerald-600 rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
              <div className="relative z-10 flex flex-col items-center gap-1">
                <Icon
                  size={20}
                  className={`transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-400 group-hover:text-gray-200'
                    }`}
                />
                <AnimatePresence>
                  {isActive && (
                    <motion.span
                      initial={{ opacity: 0, height: 0, scale: 0.8 }}
                      animate={{ opacity: 1, height: 'auto', scale: 1 }}
                      exit={{ opacity: 0, height: 0, scale: 0.8 }}
                      className="text-[10px] font-semibold text-white"
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
