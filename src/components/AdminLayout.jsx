import React, { useState } from "react";
import { Outlet, NavLink, useNavigate, useLocation } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
  CreditCard,
  BarChart3,
  Settings,
  LogOut,
  Menu,
  X,
  School,
  ChevronRight
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = localStorage.getItem("userName") || "Administrador General";
  const userEmail = localStorage.getItem("userEmail") || "admin@academia.edu.pe";

  const handleLogout = async () => {
    try {
      await signOutFromApp();
      navigate("/login");
    } catch (error) {
      window.alert(error.message);
    }
  };

  const navItems = [
    { name: "Gestión de Usuarios", path: "/admin/usuarios", icon: Users },
    { name: "Cursos y Materias", path: "/admin/cursos", icon: BookOpen },
    { name: "Horarios y Salones", path: "/admin/horarios", icon: Calendar },
    { name: "Docentes y Nóminas", path: "/admin/docentes", icon: CreditCard },
    { name: "Control de Asistencias", path: "/admin/incidentes", icon: ClipboardCheck },
    { name: "Matrículas y Pagos", path: "/admin/matriculas", icon: CreditCard },
    { name: "Métricas y Reportes", path: "/admin/reportes", icon: BarChart3 },
    { name: "Configuración", path: "/admin/configuracion", icon: Settings },
  ];

  const currentModule = navItems.find((item) => location.pathname.startsWith(item.path)) || {
    name: "Panel de Administración",
    icon: Users
  };
  const CurrentIcon = currentModule.icon;

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a0e] flex flex-col md:flex-row transition-colors duration-500 overflow-x-hidden">
      {/* SIDEBAR PARA ESCRITORIO */}
      <aside className="hidden md:flex md:w-64 bg-[#1E3A8A] dark:bg-white/5 dark:backdrop-blur-2xl dark:border-r dark:border-white/10 flex-col justify-between text-white shadow-xl z-20 shrink-0">
        <div>
          {/* Logo Corporativo */}
          <div className="h-16 px-6 flex items-center space-x-3 border-b border-blue-800/80 bg-blue-950/40">
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide uppercase block leading-tight">
                Academia Pre
              </span>
              <span className="text-xs text-blue-200 tracking-wider font-medium uppercase">
                Panel Corporativo
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-blue-300">
              Módulos Principales
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-800 dark:bg-white/15 text-white shadow-xs border-l-4 border-amber-400 font-bold"
                      : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-amber-300" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar con info de usuario y Logout */}
        <div className="p-4 border-t border-blue-800/80 bg-blue-950/30">
          <div className="flex items-center space-x-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm border-2 border-blue-400 text-white shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-sm font-semibold truncate leading-snug">{userName}</div>
              <div className="text-xs text-blue-300 truncate">{userEmail}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg bg-red-600/20 text-red-200 hover:bg-red-600 hover:text-white border border-red-500/30 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* HEADER MÓVIL ÚNICO (SIN DUPLICIDAD NI DESBORDES) */}
      <header className="md:hidden bg-[#1E3A8A] dark:bg-[#0a0a0e]/90 dark:backdrop-blur-2xl border-b border-blue-900/60 dark:border-white/10 text-white px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2.5 min-w-0">
          <div className="p-1.5 bg-white/10 rounded-lg shrink-0">
            <School className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm tracking-tight truncate block leading-tight">Academia Pre</span>
            <span className="text-[10px] text-blue-200 font-bold uppercase tracking-wider block">Administración</span>
          </div>
        </div>

        <div className="flex items-center space-x-2 shrink-0">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            aria-label="Abrir menú de navegación"
            className="p-1.5 rounded-lg text-white hover:bg-white/10 active:bg-white/20 border border-white/15 transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-amber-300" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </header>

      {/* MENÚ MÓVIL DESPLEGABLE */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-950/98 dark:bg-[#0a0a0e]/98 backdrop-blur-2xl text-white border-b border-blue-800/80 dark:border-white/10 p-4 space-y-3 sticky top-[57px] z-30 shadow-2xl animate-fade-in max-h-[calc(100vh-60px)] overflow-y-auto">
          <div className="pb-3 border-b border-blue-800/50 dark:border-white/10">
            <div className="text-sm font-bold text-white">{userName}</div>
            <div className="text-xs text-blue-200 dark:text-slate-400">{userEmail}</div>
          </div>

          <div className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all cursor-pointer ${
                    isActive
                      ? "bg-blue-800 dark:bg-white/15 text-white shadow-xs border-l-4 border-amber-400 font-bold"
                      : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-amber-300" />
                    <span>{item.name}</span>
                  </div>
                  <ChevronRight className="w-4 h-4 opacity-50" />
                </NavLink>
              );
            })}
          </div>

          <div className="pt-2 border-t border-blue-800/50 dark:border-white/10">
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-red-600/30 dark:bg-red-900/40 text-red-200 dark:text-red-400 text-xs font-bold hover:bg-red-600/50 dark:hover:bg-red-900/60 transition-colors cursor-pointer border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar en desktop */}
        <header className="hidden md:flex h-16 bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <CurrentIcon className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
              <span>{currentModule.name}</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1E3A8A] dark:text-blue-300 font-semibold border dark:border-blue-700/50">
              Ciclo 2026-I
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-xs text-slate-500 dark:text-slate-300 bg-slate-100 dark:bg-white/5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Sistema en Línea
            </div>
            
            <ThemeToggle />

            <button
              onClick={handleLogout}
              className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center space-x-1.5 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Área del cuerpo con scroll independiente */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0e]/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
