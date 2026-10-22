import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { isDarkMode, toggleTheme } = useTheme();

  return (
    <button
      onClick={toggleTheme}
      className="p-2 rounded-full transition-colors bg-white/10 hover:bg-white/20 dark:bg-black/20 dark:hover:bg-black/40 border border-transparent dark:border-white/10 text-gray-700 dark:text-gray-200 backdrop-blur-md"
      aria-label="Toggle Dark Mode"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5" />
      ) : (
        <Moon className="w-5 h-5" />
      )}
    </button>
  );
}
