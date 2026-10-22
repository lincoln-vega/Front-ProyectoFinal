import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
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
  Bell,
  Search,
  ShieldCheck
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";

export default function AdminLayout() {
  const navigate = useNavigate();
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

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-[#0a0a0e] flex flex-col md:flex-row transition-colors duration-500">
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
            <div className="px-3 py-2 text-xs font-semibold uppercase tracking-wider text-blue-300">
              Módulos Principales
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return item.path ? (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) => `flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400"
                      : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-amber-300" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              ) : (
                <div
                  key={item.name}
                  className="flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100/70 hover:bg-blue-800/50 hover:text-white cursor-not-allowed transition-colors"
                  title="Próximamente disponible"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-blue-300/60" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-xs bg-blue-950 text-blue-200 px-1.5 py-0.5 rounded">
                      {item.badge}
                    </span>
                  )}
                </div>
              );
            })}
          </nav>
        </div>

        {/* Footer del Sidebar con info de usuario y Logout */}
        <div className="p-4 border-t border-blue-800/80 bg-blue-950/30">
          <div className="flex items-center space-x-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm border-2 border-blue-400 text-white">
              RM
            </div>
            <div className="overflow-hidden">
              <div className="text-sm font-semibold truncate leading-snug">{userName}</div>
              <div className="text-xs text-blue-300 truncate">{userEmail}</div>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3 py-2 text-xs font-semibold rounded-lg bg-red-600/20 text-red-200 hover:bg-red-600 hover:text-white border border-red-500/30 transition-all cursor-pointer"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* HEADER MÓVIL */}
      <div className="md:hidden bg-[#1E3A8A] dark:bg-white/5 dark:backdrop-blur-2xl dark:border-b dark:border-white/10 text-white px-4 py-3 flex items-center justify-between shadow-md">
        <div className="flex items-center space-x-2">
          <School className="w-6 h-6 text-amber-300" />
          <span className="font-bold text-sm">Academia Pre - Admin</span>
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
          {navItems.map((item) => {
            const Icon = item.icon;
            return item.path ? (
              <NavLink
                key={item.name}
                to={item.path}
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center space-x-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? "bg-blue-800 dark:bg-white/10 text-white shadow-xs border-l-4 border-amber-400"
                    : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"
                }`}
              >
                <Icon className="w-4 h-4 text-amber-300" />
                <span>{item.name}</span>
              </NavLink>
            ) : null;
          })}
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

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
              Directorio Institucional
            </h1>
            <span className="hidden lg:inline-flex text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1E3A8A] dark:text-blue-300 font-semibold border dark:border-blue-700/50">
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
              className="text-xs font-medium text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 flex items-center space-x-1 p-2 rounded-md hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
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
