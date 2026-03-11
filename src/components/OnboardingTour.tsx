import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useLanguage } from '../context/LanguageContext';
import { PackageOpen, Search, ShoppingCart, ChevronRight, ChevronLeft, Check } from 'lucide-react';

export default function OnboardingTour() {
    const [isVisible, setIsVisible] = useState(false);
    const [currentStep, setCurrentStep] = useState(0);
    const { language, dir } = useLanguage();

    useEffect(() => {
        // Check if user has seen the tour before
        const hasSeenTour = localStorage.getItem('vita_tour_seen_v1');
        if (!hasSeenTour) {
            // Add a small delay for dramatic effect after app load
            const timer = setTimeout(() => {
                setIsVisible(true);
            }, 1000);
            return () => clearTimeout(timer);
        }
    }, []);

    const steps = [
        {
            id: 'wholesale',
            icon: <PackageOpen size={48} className="text-emerald-600 dark:text-emerald-400" />,
            title: language === 'ar' ? 'مرحباً بك في المتجر الشامل' : 'Welcome to Wholesale',
            description: language === 'ar' 
                ? 'نحن هنا لتسهيل تجارتك! جميع الأسعار والكميات في التطبيق مخصصة للبيع بالجملة (بالكرتونة أو الباكت).' 
                : 'We are here to ease your business! All prices and quantities are for wholesale (by carton or package).',
            color: 'bg-emerald-100 dark:bg-emerald-900/30'
        },
        {
            id: 'browse',
            icon: <Search size={48} className="text-blue-600 dark:text-blue-400" />,
            title: language === 'ar' ? 'تصفح بذكاء وسرعة' : 'Browse Faster',
            description: language === 'ar' 
                ? 'استخدم شريط البحث أو فلتر الأقسام للوصول إلى المنتجات التي تهمك بضغطة زر، مع عرض نبذة عن المنتج مباشرة.' 
                : 'Use the search bar or category filters to find products instantly, with quick description previews.',
            color: 'bg-blue-100 dark:bg-blue-900/30'
        },
        {
            id: 'order',
            icon: <ShoppingCart size={48} className="text-amber-600 dark:text-amber-400" />,
            title: language === 'ar' ? 'تأكيد الطلب بسهولة' : 'Easy Checkout',
            description: language === 'ar' 
                ? 'أضف الكميات المطلوبة لسلتك، ثم حدد موقع توصيلك على الخريطة وسنصلك في أسرع وقت ممكن.' 
                : 'Add quantities to your cart, set your delivery location on the map, and we will deliver ASAP.',
            color: 'bg-amber-100 dark:bg-amber-900/30'
        }
    ];

    const nextStep = () => {
        if (currentStep < steps.length - 1) {
            setCurrentStep(prev => prev + 1);
        } else {
            finishTour();
        }
    };

    const prevStep = () => {
        if (currentStep > 0) {
            setCurrentStep(prev => prev - 1);
        }
    };

    const finishTour = () => {
        setIsVisible(false);
        localStorage.setItem('vita_tour_seen_v1', 'true');
    };

    if (!isVisible) return null;

    return (
        <AnimatePresence>
            {isVisible && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
                    {/* Backdrop */}
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="absolute inset-0 bg-slate-900/70 backdrop-blur-md"
                        onClick={finishTour}
                    />

                    {/* Modal */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.9, y: 20 }}
                        transition={{ type: "spring", damping: 25, stiffness: 300 }}
                        className="relative w-full max-w-sm bg-white dark:bg-slate-800 rounded-[2.5rem] shadow-2xl overflow-hidden flex flex-col"
                        dir={dir}
                    >
                        {/* Skip Button */}
                        <button 
                            onClick={finishTour}
                            className="absolute top-4 right-4 z-10 text-xs font-bold text-stone-400 hover:text-stone-600 dark:hover:text-stone-200 px-3 py-1.5 rounded-full bg-stone-100/50 dark:bg-slate-700/50 transition-colors"
                        >
                            {language === 'ar' ? 'تخطي' : 'Skip'}
                        </button>

                        <div className="p-8 pt-12 flex flex-col items-center text-center">
                            {/* Animated Content Wrapper */}
                            <AnimatePresence mode="wait">
                                <motion.div
                                    key={currentStep}
                                    initial={{ opacity: 0, x: dir === 'rtl' ? -20 : 20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    exit={{ opacity: 0, x: dir === 'rtl' ? 20 : -20 }}
                                    transition={{ duration: 0.3 }}
                                    className="flex flex-col items-center"
                                >
                                    <div className={`w-28 h-28 rounded-full ${steps[currentStep].color} flex items-center justify-center mb-6 shadow-inner relative overflow-hidden`}>
                                        <motion.div
                                            initial={{ scale: 0.5, opacity: 0 }}
                                            animate={{ scale: 1, opacity: 1 }}
                                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                                        >
                                            {steps[currentStep].icon}
                                        </motion.div>
                                    </div>
                                    
                                    <h2 className="text-2xl font-black text-stone-800 dark:text-white mb-3">
                                        {steps[currentStep].title}
                                    </h2>
                                    
                                    <p className="text-stone-500 dark:text-stone-300 leading-relaxed text-sm">
                                        {steps[currentStep].description}
                                    </p>
                                </motion.div>
                            </AnimatePresence>
                        </div>

                        {/* Controls Footer */}
                        <div className="px-6 py-6 bg-stone-50 dark:bg-slate-800/50 flex items-center justify-between border-t border-stone-100 dark:border-slate-700 mt-auto">
                            <div className="flex items-center gap-1.5">
                                {steps.map((_, idx) => (
                                    <div 
                                        key={idx} 
                                        className={`h-2 rounded-full transition-all duration-300 ${
                                            idx === currentStep 
                                                ? 'w-6 bg-emerald-600' 
                                                : 'w-2 bg-stone-300 dark:bg-slate-600'
                                        }`}
                                    />
                                ))}
                            </div>

                            <div className="flex gap-2">
                                {currentStep > 0 && (
                                    <button 
                                        onClick={prevStep}
                                        className="w-12 h-12 rounded-2xl bg-white dark:bg-slate-700 border border-stone-200 dark:border-slate-600 flex items-center justify-center text-stone-600 dark:text-stone-300 active:scale-95 transition-all shadow-sm"
                                    >
                                        {dir === 'rtl' ? <ChevronRight size={20} /> : <ChevronLeft size={20} />}
                                    </button>
                                )}
                                
                                <button 
                                    onClick={nextStep}
                                    className={`h-12 px-6 rounded-2xl flex items-center justify-center gap-2 font-bold text-white active:scale-95 transition-all shadow-lg ${
                                        currentStep === steps.length - 1 
                                            ? 'bg-emerald-600 shadow-emerald-600/20' 
                                            : 'bg-stone-800 dark:bg-slate-600'
                                    }`}
                                >
                                    {currentStep === steps.length - 1 ? (
                                        <>
                                            <Check size={18} />
                                            {language === 'ar' ? 'البدء الآن' : 'Start'}
                                        </>
                                    ) : (
                                        <>
                                            {language === 'ar' ? 'التالي' : 'Next'}
                                            {dir === 'rtl' ? <ChevronLeft size={18} /> : <ChevronRight size={18} />}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    );
}
