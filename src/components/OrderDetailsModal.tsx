import { motion, AnimatePresence } from 'motion/react';
import { Package, Phone, MapPin, Clock, X } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice } from '../utils';

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

interface OrderDetailsModalProps {
    order: HistoryOrder | null;
    onClose: () => void;
}

export default function OrderDetailsModal({ order, onClose }: OrderDetailsModalProps) {
    const { t, dir } = useLanguage();

    const formatDate = (ts: string) => {
        try {
            const d = new Date(ts);
            return d.toLocaleDateString('ar-SD', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
        } catch { return ts; }
    };

    return (
        <AnimatePresence>
            {order && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-md z-[100]"
                    />
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 350 }}
                        className="absolute inset-x-4 top-[15%] bg-white dark:bg-slate-800 z-[110] rounded-3xl shadow-2xl overflow-hidden border border-white/20 dark:border-slate-700"
                        dir={dir}
                    >
                        {/* Header */}
                        <div className="px-5 py-4 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between bg-white dark:bg-slate-800">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 rounded-full flex items-center justify-center">
                                    <Package size={20} className="text-emerald-600 dark:text-emerald-400" />
                                </div>
                                <div>
                                    <h2 className="text-base font-bold text-stone-800 dark:text-white">{t('orderDetails')}</h2>
                                    <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold">#{order.orderNumber}</p>
                                </div>
                            </div>
                            <button
                                onClick={onClose}
                                className="text-xs font-bold text-stone-500 px-3 py-1.5 bg-stone-100 dark:bg-slate-700 dark:text-stone-400 rounded-xl active:scale-95 transition-transform"
                            >
                                {t('close')}
                            </button>
                        </div>

                        {/* Info Section */}
                        <div className="px-5 py-4 space-y-3 bg-stone-50/50 dark:bg-slate-900/20">
                            <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                                <Phone size={14} className="text-stone-400 shrink-0" />
                                <span dir="ltr" className="font-medium">{order.customerPhone}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                                <MapPin size={14} className="text-stone-400 shrink-0" />
                                <span className="font-medium">{order.area}</span>
                            </div>
                            <div className="flex items-center gap-3 text-sm text-stone-600 dark:text-stone-300">
                                <Clock size={14} className="text-stone-400 shrink-0" />
                                <span className="font-medium">{formatDate(order.timestamp)}</span>
                            </div>
                        </div>

                        {/* Products List */}
                        <div className="px-5 py-4 max-h-[35vh] overflow-y-auto hide-scrollbar">
                            <h3 className="text-[10px] font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-3">{t('products')}</h3>
                            <div className="space-y-3">
                                {order.items.map((item, i) => (
                                    <div key={i} className="flex justify-between items-start gap-4">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-bold text-stone-800 dark:text-white truncate">{item.name}</p>
                                            <p className="text-xs text-stone-500 font-medium">Qty: {item.quantity}</p>
                                        </div>
                                        <span className="text-sm font-black text-stone-900 dark:text-white whitespace-nowrap">
                                            {formatPrice(item.subtotal)} {t('sdg')}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Footer Total */}
                        <div className="px-5 py-5 bg-emerald-600 dark:bg-emerald-600 flex justify-between items-center mt-auto">
                            <span className="font-bold text-emerald-50">{t('total')}</span>
                            <span className="font-black text-white text-xl">{formatPrice(order.totalAmount)} {t('sdg')}</span>
                        </div>
                    </motion.div>
                </>
            )}
        </AnimatePresence>
    );
}
