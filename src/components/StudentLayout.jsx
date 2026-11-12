import React, { useState } from "react";
import { Outlet, NavLink, Link, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  School,
  Calendar,
  Sparkles,
  BookOpen,
  Clock,
  CreditCard,
  Menu,
  X,
  ChevronRight
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";

export default function StudentLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const studentName = localStorage.getItem("userName") || "Estudiante";
  const studentEmail = localStorage.getItem("userEmail") || "estudiante@academia.edu.pe";

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "ES";

  const handleLogout = async () => {
    try {
      await signOutFromApp();
      navigate("/login");
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0e] flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      {/* NAVBAR SUPERIOR ESTUDIANTIL */}
      <header className="bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 shadow-2xs transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2 sm:gap-4">
          
          {/* Logo y Nombre con Redirección a Inicio */}
          <Link
            to="/estudiante/panel"
            className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 hover:opacity-90 transition-opacity cursor-pointer group"
            title="Ir al inicio del campus estudiantil"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1E3A8A] dark:bg-white/10 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-800 dark:text-white tracking-tight">
                  Academia Pre
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Campus Virtual
                </span>
              </div>
              <p className="text-[11px] sm:text-xs text-slate-500 dark:text-slate-400 hidden sm:block">
                Portal del Alumno
              </p>
            </div>
          </Link>

          {/* Menú de Navegación de Pestañas (Visible en Tablets y Desktop) */}
          <nav className="hidden md:flex items-center space-x-1 sm:space-x-2">
            <NavLink
              to="/estudiante/panel"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Mis Cursos</span>
            </NavLink>
            <NavLink
              to="/estudiante/horarios"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Calendar className="w-4 h-4" />
              <span>Mi Horario</span>
            </NavLink>
            <NavLink
              to="/estudiante/pagos"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <CreditCard className="w-4 h-4" />
              <span>Mis Pagos</span>
            </NavLink>
          </nav>

          {/* Perfil del Estudiante, Toggle y Botones */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <ThemeToggle />
            
            <div className="flex items-center space-x-2 text-right">
              <div className="hidden lg:block text-left">
                <div className="text-xs sm:text-sm font-bold text-slate-800 dark:text-white leading-tight">{studentName}</div>
                <div className="text-[11px] text-slate-500 dark:text-slate-400 leading-tight">{studentEmail}</div>
              </div>
              <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-emerald-200 dark:border-emerald-800">
                {initials}
              </div>
            </div>

            <div className="hidden md:block h-6 w-px bg-slate-200 dark:bg-white/10" />

            <button
              onClick={handleLogout}
              className="hidden md:inline-flex items-center space-x-1 px-3 py-1.5 text-xs font-bold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>

            {/* Botón de Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de navegación"
              className="md:hidden p-1.5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE PARA ESTUDIANTE */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0a0a0e]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 p-4 space-y-3 shadow-xl animate-fade-in">
            <div className="pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="text-sm font-bold text-slate-800 dark:text-white">{studentName}</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">{studentEmail}</div>
            </div>

            <nav className="space-y-1">
              <NavLink
                to="/estudiante/panel"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Mis Cursos Matriculados</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>

              <NavLink
                to="/estudiante/horarios"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Mi Horario de Clases</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>

              <NavLink
                to="/estudiante/pagos"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Estado de Cuenta y Boletas</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>
            </nav>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-500">
        <p>© 2026 Academia Preuniversitaria • Plataforma Virtual</p>
      </footer>
    </div>
  );
}
