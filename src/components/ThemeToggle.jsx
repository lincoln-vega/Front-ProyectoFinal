import React from 'react';
import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle({ className = "", variant = "auto" }) {
  const { isDarkMode, toggleTheme } = useTheme();
  const isOnDark = variant === "on-dark";

  return (
    <button
      type="button"
      onClick={toggleTheme}
      className={`p-2 rounded-xl transition-all duration-200 cursor-pointer shadow-xs active:scale-95 flex items-center justify-center border ${
        isOnDark
          ? "bg-white/20 hover:bg-white/30 border-white/30 text-amber-300"
          : isDarkMode
          ? "bg-amber-400/15 hover:bg-amber-400/25 border-amber-400/30 text-amber-300"
          : "bg-slate-100 hover:bg-slate-200 border-slate-200 text-indigo-600"
      } ${className}`}
      title={isDarkMode ? "Cambiar a modo claro" : "Cambiar a modo oscuro"}
      aria-label="Alternar modo oscuro y claro"
    >
      {isDarkMode ? (
        <Sun className="w-5 h-5 text-amber-300 fill-amber-300/30" />
      ) : (
        <Moon className={`w-5 h-5 ${isOnDark ? "text-amber-300 fill-amber-300/30" : "text-indigo-600 fill-indigo-600/15"}`} />
      )}
    </button>
  );
}
