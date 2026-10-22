import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  School,
  Calendar,
  Sparkles,
  BookOpen,
  Clock,
  CreditCard
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";

export default function StudentLayout() {
  const navigate = useNavigate();
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
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0e] flex flex-col font-sans transition-colors duration-500">
      {/* NAVBAR SUPERIOR ESTUDIANTIL */}
      <header className="bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 shadow-2xs transition-colors duration-500">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3 shrink-0">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] dark:bg-white/10 flex items-center justify-center text-white shadow-xs">
              <School className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-slate-800 dark:text-white tracking-tight">
                  Academia Pre
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                  Campus Virtual
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Portal del Alumno
              </p>
            </div>
          </div>

          {/* Menú de Navegación de Pestañas */}
          <nav className="flex items-center space-x-1 sm:space-x-2">
            <NavLink
              to="/estudiante/panel"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mis Cursos</span>
            </NavLink>
            <NavLink
              to="/estudiante/horarios"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mi Horario</span>
            </NavLink>
            <NavLink
              to="/estudiante/pagos"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                isActive
                  ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Mis Pagos</span>
            </NavLink>
          </nav>

          {/* Perfil del Estudiante y Logout */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            <ThemeToggle />
            
            <div className="flex items-center space-x-2 text-right">
              <div className="hidden lg:block text-left">
                <div className="text-xs font-bold text-slate-800 dark:text-white leading-tight">{studentName}</div>
                <div className="text-[10px] text-slate-500 dark:text-slate-400 leading-tight">{studentEmail}</div>
              </div>
              <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-xs shadow-xs border-2 border-emerald-200 dark:border-emerald-800">
                {initials}
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200 dark:border-white/10" />

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1 px-2.5 py-1.5 text-xs font-semibold text-rose-700 dark:text-rose-400 bg-rose-50 dark:bg-rose-900/20 hover:bg-rose-100 dark:hover:bg-rose-900/40 border border-rose-200 dark:border-rose-800 rounded-lg transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-t border-slate-200 dark:border-white/10 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors duration-500">
        <p>© 2026 Plataforma Educativa Preuniversitaria. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}
