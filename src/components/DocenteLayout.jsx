import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, LogOut, School, Briefcase, Menu, X } from "lucide-react";
import ThemeToggle from "./ThemeToggle";

export default function DocenteLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = localStorage.getItem("userName") || "Docente";
  const userEmail = localStorage.getItem("userEmail") || "docente@academia.edu.pe";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a0e] flex flex-col md:flex-row transition-colors duration-500">
      <aside className="hidden md:flex md:w-64 bg-[#1E3A8A] dark:bg-white/5 dark:backdrop-blur-2xl dark:border-r dark:border-white/10 flex-col justify-between text-white shadow-xl z-20 shrink-0">
        <div>
          <div className="h-16 px-6 flex items-center space-x-3 border-b border-blue-800/80 bg-blue-950/40">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide uppercase block leading-tight">Academia Pre</span>
              <span className="text-[11px] text-amber-300 tracking-wider font-medium uppercase">Portal Docente</span>
            </div>
          </div>
          <nav className="p-4 space-y-1">
            <NavLink to="/docente/panel" className={({ isActive }) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400" : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"}`}>
              <Briefcase className="w-4 h-4 text-amber-300" />
              <span>Mi Panel</span>
            </NavLink>
            <NavLink to="/docente/cursos" className={({ isActive }) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400" : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"}`}>
              <BookOpen className="w-4 h-4 text-amber-300" />
              <span>Mis Cursos</span>
            </NavLink>
            <NavLink to="/docente/horarios" className={({ isActive }) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400" : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"}`}>
              <Calendar className="w-4 h-4 text-amber-300" />
              <span>Horarios</span>
            </NavLink>
          </nav>
        </div>
        <div className="p-4 border-t border-blue-800/80 bg-blue-950/30">
          <div className="flex items-center space-x-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm border-2 border-blue-400 text-white">
              {userName.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate leading-snug">{userName}</div>
              <div className="text-[11px] text-blue-300 truncate">{userEmail}</div>
            </div>
          </div>
          <button onClick={handleLogout} className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg bg-red-600/20 text-red-200 hover:bg-red-600 hover:text-white border border-red-500/30 transition-all cursor-pointer">
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* HEADER MÓVIL */}
      <div className="md:hidden bg-[#1E3A8A] dark:bg-white/5 dark:backdrop-blur-2xl dark:border-b dark:border-white/10 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <School className="w-6 h-6 text-amber-300" />
          <span className="font-bold text-sm">Academia Pre - Docente</span>
        </div>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1 rounded-md text-white hover:bg-blue-800 focus:outline-hidden"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-900 dark:bg-[#0a0a0e]/95 dark:backdrop-blur-2xl text-white border-b border-blue-800 dark:border-white/10 p-4 space-y-3 relative z-50">
          <div className="text-xs text-blue-200 dark:text-slate-400 pb-2 border-b border-blue-800/50 dark:border-white/10">Conectado como: {userName}</div>
          
          <NavLink to="/docente/panel" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400" : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"}`}>
            <Briefcase className="w-4 h-4 text-amber-300" />
            <span>Mi Panel</span>
          </NavLink>
          <NavLink to="/docente/cursos" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400" : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"}`}>
            <BookOpen className="w-4 h-4 text-amber-300" />
            <span>Mis Cursos</span>
          </NavLink>
          <NavLink to="/docente/horarios" onClick={() => setMobileMenuOpen(false)} className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400" : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"}`}>
            <Calendar className="w-4 h-4 text-amber-300" />
            <span>Horarios</span>
          </NavLink>

          <div className="pt-2">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3 py-2 rounded bg-red-600/30 dark:bg-red-900/40 text-red-200 dark:text-red-400 text-sm font-medium hover:bg-red-600/50 dark:hover:bg-red-900/60 transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 flex items-center justify-between shadow-2xs">
          <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">Portal Docente</h1>
          <div className="flex items-center space-x-4">
            <ThemeToggle />
            <button onClick={handleLogout} className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center space-x-1 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer" title="Cerrar sesión">
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0e]/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
