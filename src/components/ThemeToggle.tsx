import { Moon, Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import { motion } from 'motion/react';

export default function ThemeToggle() {
  const { theme, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="relative w-10 h-10 sm:w-12 sm:h-12 bg-white dark:bg-slate-800 shadow-sm border border-stone-100 dark:border-slate-700 rounded-full flex items-center justify-center text-emerald-700 dark:text-emerald-400 hover:bg-stone-50 dark:hover:bg-slate-700 transition-all duration-300 overflow-hidden"
      aria-label="Toggle Dark Mode"
    >
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'dark' ? 1 : 0,
          opacity: theme === 'dark' ? 1 : 0,
          rotate: theme === 'dark' ? 0 : -90
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
      >
        <Moon size={20} className="sm:w-[22px] sm:h-[22px]" />
      </motion.div>
      <motion.div
        initial={false}
        animate={{
          scale: theme === 'light' ? 1 : 0,
          opacity: theme === 'light' ? 1 : 0,
          rotate: theme === 'light' ? 0 : 90
        }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="absolute"
      >
        <Sun size={20} className="sm:w-[22px] sm:h-[22px]" />
      </motion.div>
    </button>
  );
}
