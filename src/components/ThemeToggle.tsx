import React from 'react';
import { Moon, Sun } from 'lucide-react';
import { motion } from 'framer-motion';
import { useTheme } from '../contexts/ThemeContext';

const ThemeToggle: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();

  return (
    <motion.button
      onClick={toggleTheme}
      className={`relative p-2 rounded-lg transition-colors duration-200 ${
        isDark 
          ? 'bg-slate-700 text-white hover:bg-slate-600' 
          : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
      }`}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      aria-label="Toggle theme"
    >
      <motion.div
        initial={false}
        animate={{ 
          rotate: isDark ? 180 : 0,
          scale: isDark ? 0.8 : 1
        }}
        transition={{ duration: 0.3, ease: "easeInOut" }}
      >
        {isDark ? (
          <Moon className="h-5 w-5 text-white" />
        ) : (
          <Sun className="h-5 w-5 text-amber-500" />
        )}
      </motion.div>
      
      {/* Subtle glow effect */}
      <motion.div
        className={`absolute inset-0 rounded-lg ${
          isDark ? 'bg-blue-400/20' : 'bg-orange-400/20'
        }`}
        initial={{ opacity: 0 }}
        animate={{ opacity: isDark ? 0.3 : 0 }}
        transition={{ duration: 0.3 }}
      />
    </motion.button>
  );
};

export default ThemeToggle;