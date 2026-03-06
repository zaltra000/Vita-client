import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, MapPin, Phone, ChevronLeft } from 'lucide-react';
import { formatPrice } from '../utils';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';

import { useLanguage } from '../context/LanguageContext';

import { HistoryOrder } from '../types';

interface OrderHistoryProps {
    onOrderClick: (order: HistoryOrder) => void;
}

export default function OrderHistory({ onOrderClick }: OrderHistoryProps) {
    const { t, language, dir } = useLanguage();
    const [orders, setOrders] = useState<HistoryOrder[]>([]);

    useEffect(() => {
        try {
            const saved = localStorage.getItem('vita_orders');
            if (saved) setOrders(JSON.parse(saved));
        } catch { /* ignore */ }
    }, []);

    const formatDate = (ts: string) => {
        try {
            const d = new Date(ts);
            return d.toLocaleDateString('ar-SD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return ts; }
    };

    return (
        // Use relative so absolute children stay inside the mobile container
        <div className="relative min-h-full bg-[#F8F7F4] dark:bg-slate-900 transition-colors duration-300">

            {/* Scrollable Content */}
            <div className="pb-36 overflow-y-auto">
                {/* Header */}
                <div className="pt-12 px-6 pb-4 bg-[#F8F7F4]/90 dark:bg-slate-900/90 backdrop-blur-xl sticky top-0 z-30">
                    <div className="flex justify-between items-center mb-1">
                        <h1 className="text-2xl font-bold text-stone-800 dark:text-white">{t('recentOrders')}</h1>
                        <div className="flex items-center gap-2">
                            <ThemeToggle />
                            <LanguageSwitcher />
                        </div>
                    </div>
                    <p className="text-sm text-stone-500 dark:text-stone-400">
                        {orders.length > 0 ? (language === 'ar' ? `${orders.length} طلب سابق` : `${orders.length} past orders`) : (language === 'ar' ? 'لا توجد طلبات سابقة' : 'No past orders')}
                    </p>
                </div>

                <div className="px-6 pt-2">
                    {orders.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 text-stone-400 dark:text-stone-500">
                            <Package size={64} className="opacity-20 mb-4" />
                            <p className="text-sm font-medium">{language === 'ar' ? 'لم تقم بأي طلب بعد' : 'No orders yet'}</p>
                            <p className="text-xs mt-1">{language === 'ar' ? 'طلباتك ستظهر هنا بعد إتمامها' : 'Your orders will appear here'}</p>
                        </div>
                    ) : (
                        <div className="space-y-3">
                            {orders.map((order, i) => (
                                <div
                                    key={order.orderId || i}
                                    onClick={() => onOrderClick(order)}
                                    className="bg-white dark:bg-slate-800 p-4 rounded-2xl shadow-sm border border-stone-100 dark:border-slate-700 active:scale-[0.98] transition-transform cursor-pointer"
                                >
                                    <div className="flex items-center justify-between mb-2">
                                        <div className="flex items-center gap-2">
                                            <div className="w-8 h-8 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                                <Package size={16} className="text-emerald-600 dark:text-emerald-400" />
                                            </div>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-sm">#{order.orderNumber}</span>
                                        </div>
                                        <ChevronLeft size={18} className={`text-stone-300 dark:text-stone-600 ${dir === 'ltr' ? 'rotate-180' : ''}`} />
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center gap-1.5 text-xs text-stone-500 dark:text-stone-400">
                                            <Clock size={12} />
                                            <span>{formatDate(order.timestamp)}</span>
                                        </div>
                                        <span className="text-sm font-bold text-stone-800 dark:text-white">{formatPrice(order.totalAmount)} {t('sdg')}</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-xs text-stone-400 dark:text-stone-500 mt-1">
                                        <MapPin size={12} />
                                        <span>{order.area}</span>
                                        <span className="mx-1">•</span>
                                        <span>{order.totalItems} {t('items')}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>

        </div>
    );
}
