import { motion } from 'motion/react';
import { Phone, MapPin, Mail, Clock } from 'lucide-react';
import { useLanguage } from '../context/LanguageContext';
import LanguageSwitcher from '../components/LanguageSwitcher';
import ThemeToggle from '../components/ThemeToggle';
import { WhatsAppIcon, FacebookIcon } from '../components/icons/SocialIcons';

export default function Contact() {
  const { t, dir, language } = useLanguage();

  return (
    <div className="pb-32 bg-[#F8F7F4] dark:bg-slate-900 min-h-full transition-colors duration-500">
      <div className="relative h-64 shadow-lg shadow-emerald-900/5 dark:shadow-emerald-900/20">
        <div className="absolute inset-0 bg-gradient-to-br from-slate-800 via-emerald-900 to-slate-900" />
        <img
          src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&q=80&w=800"
          alt="Distribution Center"
          className="absolute inset-0 w-full h-full object-cover opacity-20 mix-blend-overlay"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-[#F8F7F4] dark:from-slate-900 to-transparent transition-colors duration-500" />
        <div className="absolute top-12 right-6 z-10 flex gap-2 sm:gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
        </div>
        <div className="absolute bottom-6 left-6 right-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
          >
            <h1 className="text-3xl font-bold text-stone-800 dark:text-white mb-2 transition-colors duration-500">{t('aboutVita')}</h1>
            <p className="text-stone-600 dark:text-stone-300 text-sm leading-relaxed font-medium transition-colors duration-500">
              {t('aboutDesc')}
            </p>
          </motion.div>
        </div>
      </div>

      <div className="px-6 pt-4 space-y-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-slate-700 transition-colors duration-500"
        >
          <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4 transition-colors duration-500">{t('contactUs')}</h3>

          <div className="space-y-4">
            <a href="tel:+249997736853" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-blue-50 dark:bg-blue-900/30 rounded-full flex items-center justify-center text-blue-600 dark:text-blue-400 shrink-0">
                <Phone size={24} />
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium transition-colors duration-500">{t('phoneSupport')}</p>
                <p className="text-stone-800 dark:text-white font-bold transition-colors duration-500" dir="ltr">+249 99 773 6853</p>
              </div>
            </a>

            <a href="https://wa.me/249997736853" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-[#25D366]/10 dark:bg-[#25D366]/20 rounded-full flex items-center justify-center text-[#25D366] shrink-0">
                <WhatsAppIcon size={24} />
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium transition-colors duration-500">{t('whatsapp')}</p>
                <p className="text-stone-800 dark:text-white font-bold transition-colors duration-500">{t('messageUs')}</p>
              </div>
            </a>

            <a href="https://facebook.com" target="_blank" rel="noreferrer" className="flex items-center gap-4 p-3 rounded-2xl hover:bg-stone-50 dark:hover:bg-slate-700 transition-colors">
              <div className="w-12 h-12 bg-[#0084FF]/10 dark:bg-[#0084FF]/20 rounded-full flex items-center justify-center text-[#0084FF] shrink-0">
                <FacebookIcon size={24} />
              </div>
              <div>
                <p className="text-sm text-stone-500 dark:text-stone-400 font-medium transition-colors duration-500">{t('facebook')}</p>
                <p className="text-stone-800 dark:text-white font-bold transition-colors duration-500">{t('vitaSudan')}</p>
              </div>
            </a>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white dark:bg-slate-800 rounded-3xl p-6 shadow-sm border border-stone-100 dark:border-slate-700 transition-colors duration-500"
        >
          <h3 className="text-lg font-bold text-stone-800 dark:text-white mb-4 transition-colors duration-500">{t('information')}</h3>

          <div className="space-y-4">
            <div className="flex items-start gap-4">
              <MapPin size={20} className="text-stone-400 dark:text-stone-500 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-bold text-stone-800 dark:text-white transition-colors duration-500">{t('headquarters')}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 transition-colors duration-500">{t('hqAddress')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Clock size={20} className="text-stone-400 dark:text-stone-500 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-bold text-stone-800 dark:text-white transition-colors duration-500">{t('workingHours')}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 transition-colors duration-500">{t('hours')}</p>
              </div>
            </div>

            <div className="flex items-start gap-4">
              <Mail size={20} className="text-stone-400 dark:text-stone-500 mt-1 shrink-0" />
              <div>
                <p className="text-sm font-bold text-stone-800 dark:text-white transition-colors duration-500">{t('email')}</p>
                <p className="text-sm text-stone-500 dark:text-stone-400 transition-colors duration-500">orders@vitadirect.com</p>
              </div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
