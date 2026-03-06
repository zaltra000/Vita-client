import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Package, Clock, MapPin, Phone, ChevronLeft } from 'lucide-react';
import { formatPrice } from '../utils';
import ThemeToggle from '../components/ThemeToggle';
import LanguageSwitcher from '../components/LanguageSwitcher';

import { useLanguage } from '../context/LanguageContext';

interface HistoryOrder {
    orderId: string;
    orderNumber: number;
    customerName: string;
    customerPhone: string;
    area: string;
    locationUrl: string;
    items: { name: string; quantity: number; price: number; subtotal: number }[];
    totalAmount: number;
    totalItems: number;
    timestamp: string;
}

export default function OrderHistory() {
    const { t, language, dir } = useLanguage();
    const [orders, setOrders] = useState<HistoryOrder[]>([]);
    const [selectedOrder, setSelectedOrder] = useState<HistoryOrder | null>(null);

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
                                    onClick={() => setSelectedOrder(order)}
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

            {/* Order Detail Popup — centered overlay */}
            <AnimatePresence>
                {selectedOrder && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            transition={{ duration: 0.15 }}
                            onClick={() => setSelectedOrder(null)}
                            className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[60]"
                        />
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.9 }}
                            transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                            className="absolute inset-x-4 top-[12%] bg-white dark:bg-slate-800 z-[70] rounded-3xl shadow-2xl overflow-hidden"
                            dir={dir}
                        >
                            {/* Header */}
                            <div className="px-5 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-9 h-9 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                        <Package size={18} className="text-emerald-600 dark:text-emerald-400" />
                                    </div>
                                    <div>
                                        <h2 className="text-base font-bold text-stone-800 dark:text-white">{t('orderDetails')}</h2>
                                        <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">#{selectedOrder.orderNumber}</p>
                                    </div>
                                </div>
                                <button
                                    onClick={() => setSelectedOrder(null)}
                                    className="text-xs font-bold text-stone-500 px-3 py-1.5 bg-stone-100 dark:bg-slate-700 dark:text-stone-400 rounded-xl"
                                >
                                    {t('close')}
                                </button>
                            </div>

                            {/* Info Row */}
                            <div className="px-5 py-3 flex flex-wrap gap-x-4 gap-y-2 border-b border-stone-50 dark:border-slate-700/50">
                                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                                    <Phone size={13} className="shrink-0" />
                                    <span dir="ltr">{selectedOrder.customerPhone}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                                    <MapPin size={13} className="shrink-0" />
                                    <span>{selectedOrder.area}</span>
                                </div>
                                <div className="flex items-center gap-2 text-xs text-stone-500 dark:text-stone-400">
                                    <Clock size={13} className="shrink-0" />
                                    <span>{formatDate(selectedOrder.timestamp)}</span>
                                </div>
                            </div>

                            {/* Products */}
                            <div className="px-5 py-4">
                                <h3 className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase tracking-wider mb-3">{t('products')}</h3>
                                <div className="space-y-2">
                                    {selectedOrder.items.map((item, i) => (
                                        <div key={i} className="flex justify-between items-center text-sm">
                                            <span className="text-stone-700 dark:text-stone-300 truncate flex-1">{item.name} × {item.quantity}</span>
                                            <span className="text-stone-800 dark:text-white font-bold mx-2 whitespace-nowrap">{formatPrice(item.subtotal)} {t('sdg')}</span>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            {/* Total Footer */}
                            <div className="px-5 py-4 bg-emerald-50 dark:bg-emerald-900/20 flex justify-between items-center">
                                <span className="font-bold text-stone-700 dark:text-stone-200">{t('total')}</span>
                                <span className="font-black text-emerald-700 dark:text-emerald-400 text-lg">{formatPrice(selectedOrder.totalAmount)} {t('sdg')}</span>
                            </div>
                        </motion.div>
                    </>
                )}
            </AnimatePresence>
        </div>
    );
}
