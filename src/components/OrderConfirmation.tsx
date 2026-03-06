import { motion } from 'motion/react';
import { CheckCircle, X, Package, Phone, MapPin, Copy, Check } from 'lucide-react';
import { useState } from 'react';
import { CompletedOrder } from './CheckoutScreen';
import { formatPrice } from '../utils';
import { useLanguage } from '../context/LanguageContext';

interface OrderConfirmationProps {
    order: CompletedOrder;
    onClose: () => void;
}

export default function OrderConfirmation({ order, onClose }: OrderConfirmationProps) {
    const { t, dir } = useLanguage();
    const [copied, setCopied] = useState(false);

    const handleCopyOrderNumber = () => {
        navigator.clipboard.writeText(`#${order.orderNumber}`).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        }).catch(() => { });
    };

    return (
        <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-[#F8F7F4] dark:bg-slate-900 z-[90] flex flex-col overflow-hidden"
            dir={dir}
        >
            {/* Close Button */}
            <div className={`absolute top-12 ${dir === 'rtl' ? 'left-6' : 'right-6'} z-10`}>
                <button
                    onClick={onClose}
                    className="p-2 bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm rounded-full text-stone-500 dark:text-stone-400 hover:text-stone-800 dark:hover:text-white transition-colors shadow-sm"
                >
                    <X size={20} />
                </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto hide-scrollbar flex flex-col items-center justify-center p-6">
                {/* Success Animation */}
                <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: 'spring', damping: 12, stiffness: 200, delay: 0.2 }}
                    className="w-28 h-28 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-200/50 dark:shadow-emerald-900/30"
                >
                    <motion.div
                        initial={{ scale: 0, rotate: -45 }}
                        animate={{ scale: 1, rotate: 0 }}
                        transition={{ type: 'spring', damping: 10, stiffness: 200, delay: 0.5 }}
                    >
                        <CheckCircle size={56} className="text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
                    </motion.div>
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.6 }}
                    className="text-2xl font-bold text-stone-800 dark:text-white mb-2 text-center"
                >
                    {t('orderSuccess')}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.7 }}
                    className="text-stone-500 dark:text-stone-400 text-sm text-center mb-8"
                >
                    {t('contactSoon')}
                </motion.p>

                {/* Order Number Card */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8 }}
                    className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-slate-700 mb-4"
                >
                    <div className="text-center mb-4">
                        <p className="text-xs font-bold text-stone-400 dark:text-stone-500 uppercase tracking-widest mb-1">{t('orderNumberLabel')}</p>
                        <div className="flex items-center justify-center gap-2">
                            <span className="text-3xl font-black text-emerald-700 dark:text-emerald-400 tracking-wider">#{order.orderNumber}</span>
                            <button
                                onClick={handleCopyOrderNumber}
                                className="p-1.5 bg-stone-100 dark:bg-slate-700 rounded-lg text-stone-500 dark:text-stone-400 hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors"
                            >
                                {copied ? <Check size={14} /> : <Copy size={14} />}
                            </button>
                        </div>
                    </div>

                    <div className="border-t border-stone-100 dark:border-slate-700 pt-4 space-y-3">
                        <div className="flex items-center gap-3">
                            <Package size={16} className="text-stone-400 shrink-0" />
                            <span className="text-sm text-stone-600 dark:text-stone-300">{order.totalItems} {t('items')}</span>
                            <span className="text-sm font-bold text-stone-800 dark:text-white mr-auto">
                                {formatPrice(order.totalAmount)} {t('sdg')}
                            </span>
                        </div>
                        <div className="flex items-center gap-3">
                            <Phone size={16} className="text-stone-400 shrink-0" />
                            <span className="text-sm text-stone-600 dark:text-stone-300" dir="ltr">{order.customerPhone}</span>
                        </div>
                        <div className="flex items-center gap-3">
                            <MapPin size={16} className="text-stone-400 shrink-0" />
                            <span className="text-sm text-stone-600 dark:text-stone-300">{order.area}</span>
                        </div>
                    </div>
                </motion.div>

                {/* Items */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.9 }}
                    className="w-full bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-slate-700 mb-6"
                >
                    <h3 className="text-sm font-bold text-stone-800 dark:text-white mb-3">{t('orderDetails')}</h3>
                    <div className="space-y-2">
                        {order.items.map((item, i) => (
                            <div key={i} className="flex justify-between items-center text-sm">
                                <span className="text-stone-600 dark:text-stone-300 truncate flex-1">{item.name} × {item.quantity}</span>
                                <span className="text-stone-800 dark:text-white font-bold mr-3">{formatPrice(item.subtotal)} {t('sdg')}</span>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.p
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1.1 }}
                    className="text-xs text-stone-400 dark:text-stone-500 text-center"
                >
                    {t('keepOrderNumber')}
                </motion.p>
            </div>

            {/* Footer */}
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 1 }}
                className="p-6 shrink-0"
            >
                <button
                    onClick={onClose}
                    className="w-full bg-emerald-700 dark:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/20 active:scale-95 transition-all text-center"
                >
                    {t('backToStore')}
                </button>
            </motion.div>
        </motion.div>
    );
}
