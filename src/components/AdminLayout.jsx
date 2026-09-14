import React, { useState } from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  ClipboardCheck,
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

export default function AdminLayout() {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const userName = localStorage.getItem("userName") || "Administrador General";
  const userEmail = localStorage.getItem("userEmail") || "admin@academia.edu.pe";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  const navItems = [
    { name: "Gestión de Usuarios", path: "/admin/usuarios", icon: Users },
    { name: "Cursos y Materias", path: "/admin/cursos", icon: BookOpen },
    { name: "Horarios y Salones", path: "/admin/horarios", icon: Calendar },
    { name: "Control de Asistencias", path: "/admin/incidentes", icon: ClipboardCheck },
    { name: "Métricas y Reportes", path: null, icon: BarChart3 },
    { name: "Configuración", path: null, icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      {/* SIDEBAR PARA ESCRITORIO */}
      <aside className="hidden md:flex md:w-64 bg-[#1E3A8A] flex-col justify-between text-white shadow-xl z-20 shrink-0">
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
              <span className="text-[11px] text-blue-200 tracking-wider font-medium uppercase">
                Panel Corporativo
              </span>
            </div>
          </div>

          {/* Menú de Navegación */}
          <nav className="p-4 space-y-1">
            <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-blue-300">
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
                      ? "bg-blue-800 text-white shadow-xs border-l-4 border-amber-400"
                      : "text-blue-100 hover:bg-blue-800/50 hover:text-white"
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
                  title="Módulo de demostración futura"
                >
                  <div className="flex items-center space-x-3">
                    <Icon className="w-4 h-4 text-blue-300/60" />
                    <span>{item.name}</span>
                  </div>
                  {item.badge && (
                    <span className="text-[10px] bg-blue-950 text-blue-200 px-1.5 py-0.5 rounded">
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
              <div className="text-[11px] text-blue-300 truncate">{userEmail}</div>
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
      <div className="md:hidden bg-[#1E3A8A] text-white px-4 py-3 flex items-center justify-between shadow-md">
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
        <div className="md:hidden bg-blue-900 text-white border-b border-blue-800 p-4 space-y-3">
          <div className="text-xs text-blue-200">Conectado como: {userName}</div>
          <NavLink
            to="/admin/usuarios"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded bg-blue-800 text-sm font-medium"
          >
            Gestión de Usuarios 
          </NavLink>
          <NavLink
            to="/admin/cursos"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded bg-blue-800 text-sm font-medium"
          >
            Cursos y Materias
          </NavLink>
          <NavLink
            to="/admin/incidentes"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded bg-blue-800 text-sm font-medium"
          >
            Control de Asistencias
          </NavLink>
          <button
            onClick={handleLogout}
            className="w-full text-left px-3 py-2 rounded bg-red-600/30 text-red-200 text-sm font-medium"
          >
            Cerrar Sesión
          </button>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Navbar */}
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <div className="flex items-center space-x-3">
            <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">
              <Users className="w-5 h-5 text-[#1E3A8A]" />
              Directorio Institucional de Usuarios
            </h1>
            <span className="hidden lg:inline-flex text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-[#1E3A8A] font-semibold">
              Ciclo 2026-I
            </span>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex items-center text-xs text-slate-500 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2 animate-pulse" />
              Servidor Local Simulado Activo
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-medium text-slate-600 hover:text-red-600 flex items-center space-x-1 p-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-4 h-4" />
              <span className="hidden sm:inline">Salir</span>
            </button>
          </div>
        </header>

        {/* Área del cuerpo con scroll independiente */}
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
