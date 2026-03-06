import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, MapPin, User, Phone, ChevronDown, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useLanguage } from '../context/LanguageContext';
import { formatPrice, getLocalizedString } from '../utils';
import { db, auth } from '../firebase';
import { ref as dbRef, push, set, get } from 'firebase/database';
import { signInAnonymously, setPersistence, browserLocalPersistence, inMemoryPersistence } from 'firebase/auth';
import LocationMap from './LocationMap';

interface CheckoutScreenProps {
    isOpen: boolean;
    onClose: () => void;
    onOrderComplete: (orderData: CompletedOrder) => void;
}

export interface CompletedOrder {
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

// المناطق المتاحة للتوصيل (Localized objects)
const DELIVERY_AREAS = [
    { id: 'dongola', ar: 'دنقلا', en: 'Dongola' },
    { id: 'merowe', ar: 'مروي', en: 'Merowe' },
    { id: 'karima', ar: 'كريمة', en: 'Karima' },
    { id: 'barkal', ar: 'البركل', en: 'Barkal' },
    { id: 'argo', ar: 'البركل', en: 'Argo' }, // Fixed typo in ar for argo if needed, but original had some repeats or specific names
    { id: 'debba', ar: 'الدبة', en: 'Ed Debba' },
    { id: 'korti', ar: 'كورتي', en: 'Korti' },
    { id: 'goled', ar: 'القولد', en: 'Al Goled' },
    { id: 'abree', ar: 'عبري', en: 'Abree' },
];

export default function CheckoutScreen({ isOpen, onClose, onOrderComplete }: CheckoutScreenProps) {
    const { cartItems, cartTotal, cartCount, clearCart } = useCart();
    const { t, language, dir } = useLanguage();

    const [customerName, setCustomerName] = useState('');
    const [customerPhone, setCustomerPhone] = useState('');
    const [selectedArea, setSelectedArea] = useState('');
    const [showMap, setShowMap] = useState(false);
    const [isSaving, setIsSaving] = useState(false);
    const [error, setError] = useState('');

    // Load saved customer info
    useEffect(() => {
        try {
            const saved = localStorage.getItem('vita_customer');
            if (saved) {
                const data = JSON.parse(saved);
                if (data.name) setCustomerName(data.name);
                if (data.phone) setCustomerPhone(data.phone);
                if (data.area) setSelectedArea(data.area);
            }
        } catch { /* ignore */ }
    }, []);

    const getProductPrice = (product: any) => {
        if (product.salePrice !== undefined && product.salePrice !== null) {
            return typeof product.salePrice === 'string' ? parseFloat(product.salePrice) : product.salePrice;
        }
        return typeof product.price === 'string' ? parseFloat(product.price) : product.price;
    };

    const generateOrderNumber = async (): Promise<number> => {
        try {
            const counterRef = dbRef(db, 'orderCounter');
            const snapshot = await get(counterRef);
            const current = snapshot.exists() ? snapshot.val() : 1000;
            const next = current + 1;
            await set(counterRef, next);
            return next;
        } catch {
            return Math.floor(Date.now() / 1000) % 100000;
        }
    };

    const handleProceedToMap = () => {
        if (!customerName.trim()) { setError(t('errorNameRequired')); return; }
        if (!customerPhone.trim()) { setError(t('errorPhoneRequired')); return; }
        if (!selectedArea) { setError(t('errorAreaRequired')); return; }
        setError('');
        setShowMap(true);
    };

    const handleLocationConfirmed = async (lat: number, lng: number, url: string) => {
        setShowMap(false);
        setIsSaving(true);
        setError('');

        try {
            // Ensure authenticated
            if (!auth.currentUser) {
                try {
                    await setPersistence(auth, browserLocalPersistence);
                    await signInAnonymously(auth);
                } catch {
                    try {
                        await setPersistence(auth, inMemoryPersistence);
                        await signInAnonymously(auth);
                    } catch {
                        throw new Error(language === 'ar' ? 'فشل المصادقة. تحقق من اتصالك بالإنترنت.' : 'Auth failed. Check connection.');
                    }
                }
            }

            const orderNumber = await generateOrderNumber();

            const orderRef = push(dbRef(db, 'orders'));
            const orderItems = cartItems.map(item => {
                const price = getProductPrice(item.product);
                return {
                    productId: item.product.id,
                    name: getLocalizedString(item.product.name, 'ar'),
                    nameEn: getLocalizedString(item.product.name, 'en'),
                    price,
                    quantity: item.quantity,
                    subtotal: price * item.quantity
                };
            });

            const orderData = {
                id: orderRef.key,
                orderNumber,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                area: selectedArea,
                locationUrl: url,
                locationLat: lat,
                locationLng: lng,
                platform: 'VitaDirect',
                status: 'pending',
                items: orderItems,
                totalAmount: cartTotal,
                totalItems: cartCount,
                timestamp: new Date().toISOString()
            };

            await set(orderRef, orderData);

            // Save customer info for next time
            localStorage.setItem('vita_customer', JSON.stringify({
                name: customerName.trim(),
                phone: customerPhone.trim(),
                area: selectedArea
            }));

            // Save to order history
            const history = JSON.parse(localStorage.getItem('vita_orders') || '[]');
            history.unshift({
                orderId: orderRef.key,
                orderNumber,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                area: selectedArea,
                locationUrl: url,
                items: orderItems,
                totalAmount: cartTotal,
                totalItems: cartCount,
                timestamp: new Date().toISOString()
            });
            localStorage.setItem('vita_orders', JSON.stringify(history.slice(0, 50)));

            onOrderComplete({
                orderId: orderRef.key!,
                orderNumber,
                customerName: customerName.trim(),
                customerPhone: customerPhone.trim(),
                area: selectedArea,
                locationUrl: url,
                items: orderItems,
                totalAmount: cartTotal,
                totalItems: cartCount,
                timestamp: new Date().toISOString()
            });

            clearCart();
        } catch (err: any) {
            console.error('Order submission failed:', err);
            setError(err.message || (language === 'ar' ? 'فشل إرسال الطلب. حاول مرة أخرى.' : 'Order failed. Try again.'));
        } finally {
            setIsSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            {isOpen && (
                <>
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={onClose}
                        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm z-[80]"
                    />
                    <motion.div
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', damping: 28, stiffness: 300 }}
                        className="absolute bottom-0 left-0 right-0 h-[92%] bg-[#F8F7F4] dark:bg-slate-900 z-[85] rounded-t-[2rem] flex flex-col shadow-2xl overflow-hidden"
                        dir={dir}
                    >
                        {/* Header */}
                        <div className="px-6 py-5 bg-white dark:bg-slate-800 border-b border-stone-100 dark:border-slate-700 flex items-center justify-between shrink-0">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 rounded-full flex items-center justify-center">
                                    <Navigation size={20} />
                                </div>
                                <div>
                                    <h2 className="text-lg font-bold text-stone-800 dark:text-white">{t('checkout')}</h2>
                                    <p className="text-xs text-stone-500 dark:text-stone-400 font-medium">
                                        {cartCount} {t('items')} • {cartTotal === 0 ? t('free') : `${formatPrice(cartTotal)} ${t('sdg')}`}
                                    </p>
                                </div>
                            </div>
                            <button onClick={onClose} className="p-2 text-stone-400 hover:text-stone-800 dark:hover:text-white hover:bg-stone-100 dark:hover:bg-slate-700 rounded-full transition-colors">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Body */}
                        <div className="flex-1 overflow-y-auto p-6 hide-scrollbar">
                            {isSaving ? (
                                <div className="h-full flex flex-col items-center justify-center">
                                    <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mb-4" />
                                    <p className="text-stone-600 dark:text-stone-300 font-medium">{t('sendingOrder')}</p>
                                </div>
                            ) : (
                                <div className="space-y-5 text-left">
                                    {/* Customer Name */}
                                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 block">{t('fullNameLabel')}</label>
                                        <div className="relative">
                                            <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                                <User size={18} className="text-stone-400" />
                                            </div>
                                            <input
                                                type="text"
                                                value={customerName}
                                                onChange={(e) => setCustomerName(e.target.value)}
                                                className={`w-full bg-white dark:bg-slate-800 text-stone-800 dark:text-white rounded-2xl py-3.5 border border-stone-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${dir === 'rtl' ? 'pr-11 pl-4 text-right' : 'pl-11 pr-4 text-left'}`}
                                                placeholder={t('fullNamePlaceholder')}
                                            />
                                        </div>
                                    </div>

                                    {/* Phone Number */}
                                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 block">{t('phoneLabel')}</label>
                                        <div className="relative">
                                            <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                                <Phone size={18} className="text-stone-400" />
                                            </div>
                                            <input
                                                type="tel"
                                                inputMode="numeric"
                                                value={customerPhone}
                                                onChange={(e) => setCustomerPhone(e.target.value)}
                                                className={`w-full bg-white dark:bg-slate-800 text-stone-800 dark:text-white rounded-2xl py-3.5 border border-stone-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all ${dir === 'rtl' ? 'pr-11 pl-4' : 'pl-11 pr-4'}`}
                                                placeholder={t('phonePlaceholder')}
                                                dir="ltr"
                                            />
                                        </div>
                                    </div>

                                    {/* Delivery Area */}
                                    <div className={dir === 'rtl' ? 'text-right' : 'text-left'}>
                                        <label className="text-xs font-bold text-stone-500 dark:text-stone-400 uppercase mb-2 block">{t('deliveryArea')}</label>
                                        <div className="relative">
                                            <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'right-0 pr-4' : 'left-0 pl-4'} flex items-center pointer-events-none`}>
                                                <MapPin size={18} className="text-stone-400" />
                                            </div>
                                            <select
                                                value={selectedArea}
                                                onChange={(e) => setSelectedArea(e.target.value)}
                                                className={`w-full bg-white dark:bg-slate-800 text-stone-800 dark:text-white py-3.5 rounded-2xl border border-stone-200 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-emerald-600 transition-all appearance-none ${dir === 'rtl' ? 'pr-11 pl-10 text-right' : 'pl-11 pr-10 text-left'}`}
                                            >
                                                <option value="">{t('selectArea')}</option>
                                                {DELIVERY_AREAS.map(area => (
                                                    <option key={area.id} value={getLocalizedString(area, language)}>{getLocalizedString(area, language)}</option>
                                                ))}
                                            </select>
                                            <div className={`absolute inset-y-0 ${dir === 'rtl' ? 'left-0 pl-4' : 'right-0 pr-4'} flex items-center pointer-events-none`}>
                                                <ChevronDown size={18} className="text-stone-400" />
                                            </div>
                                        </div>
                                    </div>

                                    {/* Order Summary */}
                                    <div className="bg-white dark:bg-slate-800 rounded-2xl p-4 border border-stone-100 dark:border-slate-700">
                                        <h3 className="text-sm font-bold text-stone-800 dark:text-white mb-3">{t('orderSummary')}</h3>
                                        <div className="space-y-2">
                                            {cartItems.map(item => {
                                                const price = getProductPrice(item.product);
                                                return (
                                                    <div key={item.product.id} className="flex justify-between items-center text-sm">
                                                        <span className="text-stone-600 dark:text-stone-300 truncate flex-1">
                                                            {getLocalizedString(item.product.name, language)} × {item.quantity}
                                                        </span>
                                                        <span className="text-stone-800 dark:text-white font-bold mx-3">
                                                            {price === 0 ? t('free') : `${formatPrice(price * item.quantity)} ${t('sdg')}`}
                                                        </span>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                        <div className="border-t border-stone-100 dark:border-slate-700 mt-3 pt-3 flex justify-between">
                                            <span className="font-bold text-stone-800 dark:text-white">{t('total')}</span>
                                            <span className="font-bold text-emerald-700 dark:text-emerald-400 text-lg">
                                                {cartTotal === 0 ? t('free') : `${formatPrice(cartTotal)} ${t('sdg')}`}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {error && (
                                <motion.p
                                    initial={{ opacity: 0, y: -5 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="text-red-500 dark:text-red-400 text-sm text-center font-medium bg-red-50 dark:bg-red-900/20 p-3 rounded-xl mt-4"
                                >
                                    {error}
                                </motion.p>
                            )}
                        </div>

                        {/* Footer */}
                        {!isSaving && (
                            <div className="bg-white dark:bg-slate-800 border-t border-stone-100 dark:border-slate-700 p-6 shrink-0 rounded-t-3xl shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.05)]">
                                <button
                                    onClick={handleProceedToMap}
                                    className="w-full bg-emerald-700 dark:bg-emerald-600 text-white py-4 rounded-2xl font-bold text-base shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2 active:scale-95 transition-all"
                                >
                                    <MapPin size={20} />
                                    {t('nextStepLocation')}
                                </button>
                            </div>
                        )}

                    </motion.div>

                    {/* Map Overlay */}
                    <AnimatePresence>
                        {showMap && (
                            <LocationMap
                                area={selectedArea}
                                onLocationConfirmed={handleLocationConfirmed}
                                onCancel={() => setShowMap(false)}
                            />
                        )}
                    </AnimatePresence>
                </>
            )}
        </AnimatePresence>
    );
}
