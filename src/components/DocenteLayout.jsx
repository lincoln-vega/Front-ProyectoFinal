import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  Briefcase,
  BookOpen,
  Calendar,
  LogOut,
  School,
  Menu,
  X,
  ChevronRight,
  Bell,
  ArrowRightLeft,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  FileText,
  Clock
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";
import SolicitudPermutaModal from "./docente/SolicitudPermutaModal";

export default function DocenteLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [isPermutaModalOpen, setIsPermutaModalOpen] = useState(false);
  const notifRef = useRef(null);

  const userName = localStorage.getItem("userName") || "Docente";
  const userEmail = localStorage.getItem("userEmail") || "docente@academia.edu.pe";

  const initials = userName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "DC";

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const getPageTitle = () => {
    if (location.pathname.includes("/docente/cursos")) return "Mis Cursos y Asistencia";
    if (location.pathname.includes("/docente/horarios")) return "Horario Semanal";
    return "Panel Principal";
  };

  const handleLogout = async () => {
    try {
      await signOutFromApp();
      navigate("/login");
    } catch (error) {
      window.alert(error.message);
    }
  };

  // Notificaciones interactivas para el docente
  const notifications = [
    {
      id: 1,
      title: "Asistencia Auditoría Meet",
      course: "Registro automático activo",
      time: "Hoy",
      type: "asistencia",
      unread: true
    },
    {
      id: 2,
      title: "Ciclo Académico 2026-I",
      course: "Semana 4 en curso",
      time: "Coordinación",
      type: "info",
      unread: false
    },
    {
      id: 3,
      title: "Módulo de Permutas Habilitado",
      course: "Trámite 100% digitalizado",
      time: "Dirección",
      type: "permuta",
      unread: false
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* 1. BARRA VERTICAL LATERAL (SLIM SIDEBAR DESKTOP) - ESTILO V2 ESTUDIANTE */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 h-screen w-20 bg-[#0A1128] dark:bg-[#060814] border-r border-slate-800/80 z-40 text-white shadow-xl overflow-y-auto overflow-x-hidden transition-all">
        {/* Brand Icon Superior en Sidebar */}
        <Link
          to="/docente/panel"
          className="h-16 flex items-center justify-center border-b border-white/10 hover:bg-white/5 transition-colors group cursor-pointer shrink-0"
          title="Ir a Mi Panel Docente"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <School className="w-5 h-5 text-amber-300" />
          </div>
        </Link>

        {/* Enlaces Principales de Navegación Vertical */}
        <nav className="flex-1 py-4 flex flex-col items-center space-y-3 shrink-0">
          {/* Mi Panel */}
          <NavLink
            to="/docente/panel"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mi Panel Principal"
          >
            <Briefcase className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Panel</span>
          </NavLink>

          {/* Mis Cursos */}
          <NavLink
            to="/docente/cursos"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mis Cursos, Nómina y Asistencia"
          >
            <BookOpen className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Cursos</span>
          </NavLink>

          {/* Horario Semanal */}
          <NavLink
            to="/docente/horarios"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mi Horario Semanal"
          >
            <Calendar className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Horario</span>
          </NavLink>

          {/* Botón Rápido de Permuta / Reemplazo */}
          <button
            type="button"
            onClick={() => setIsPermutaModalOpen(true)}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-amber-300 hover:text-amber-200 hover:bg-amber-400/10 border border-amber-400/20 transition-all group cursor-pointer"
            title="Solicitar Permuta o Reemplazo de Horario"
          >
            <ArrowRightLeft className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Permuta</span>
          </button>
        </nav>

        {/* Botón Salir Inferior */}
        <div className="p-3 border-t border-white/10 flex flex-col items-center shrink-0">
          <button
            type="button"
            onClick={handleLogout}
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* 2. HEADER SUPERIOR MODERNO (DESKTOP + MOBILE) */}
      <header className="bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 shadow-xs md:pl-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo y Nombre de Marca */}
          <div className="flex items-center space-x-3">
            <button
              type="button"
              onClick={() => setMobileMenuOpen(true)}
              className="md:hidden p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10"
              aria-label="Abrir menú"
            >
              <Menu className="w-5 h-5" />
            </button>

            <Link
              to="/docente/panel"
              className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 hover:opacity-90 transition-opacity cursor-pointer group"
              title="Ir a Mi Panel Docente"
            >
              <div className="md:hidden w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-xs">
                <School className="w-5 h-5 text-amber-300" />
              </div>
              <div>
                <div className="flex items-center space-x-1.5 sm:space-x-2">
                  <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                    Academia Pre
                  </span>
                  <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
                    Portal Docente
                  </span>
                  <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                    Ciclo 2026-I
                  </span>
                </div>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                  {getPageTitle()}
                </p>
              </div>
            </Link>
          </div>

          {/* Controles de la Derecha: Campana, Modo Oscuro, Perfil Docente */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Campana de Notificaciones con Badge */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Avisos e incidencias"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-blue-600 text-white text-[10px] font-black rounded-full shadow-sm">
                  1
                </span>
              </button>

              {/* Menú Desplegable de Notificaciones */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-3 z-50 animate-scale-up">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      Notificaciones Docentes
                    </span>
                    <span className="text-[10px] bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300 font-bold px-2 py-0.5 rounded-full">
                      1 activa
                    </span>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => setNotificationsOpen(false)}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                            {notif.type === "asistencia" && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
                            {notif.type === "info" && <Sparkles className="w-4 h-4 text-amber-400" />}
                            {notif.type === "permuta" && <ArrowRightLeft className="w-4 h-4 text-indigo-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {notif.course}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              {notif.time}
                            </span>
                          </div>
                          {notif.unread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Alternador de Modo Claro / Oscuro */}
            <ThemeToggle />

            {/* Avatar Docente */}
            <div className="flex items-center space-x-2.5 pl-1 sm:pl-2 border-l border-slate-200 dark:border-white/10">
              <div className="w-9 h-9 rounded-xl bg-blue-600 text-white font-extrabold text-xs flex items-center justify-center shadow-sm">
                {initials}
              </div>
              <div className="hidden lg:block text-left">
                <span className="text-xs font-bold text-slate-800 dark:text-white block leading-tight truncate max-w-[140px]">
                  {userName}
                </span>
                <span className="text-[10px] text-amber-600 dark:text-amber-400 font-semibold block leading-tight">
                  Docente Titular
                </span>
              </div>
            </div>

            {/* Salir rápido en desktop */}
            <button
              onClick={handleLogout}
              className="hidden sm:flex text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-red-600 dark:hover:text-red-400 items-center space-x-1 px-2.5 py-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Salir</span>
            </button>
          </div>
        </div>
      </header>

      {/* 3. DRAWER MÓVIL (MENÚ RESPONSIVE) */}
      {mobileMenuOpen && (
        <div className="fixed inset-0 z-50 md:hidden bg-slate-900/60 backdrop-blur-xs flex">
          <div className="w-72 bg-[#0A1128] text-white p-5 flex flex-col justify-between h-full shadow-2xl animate-slide-right">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center space-x-2.5">
                  <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white">
                    <School className="w-5 h-5 text-amber-300" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-white">Academia Pre</h3>
                    <p className="text-[10px] text-amber-300 font-semibold uppercase">Portal Docente</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setMobileMenuOpen(false)}
                  className="p-1 rounded-lg hover:bg-white/10 text-slate-400 hover:text-white"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Perfil en Drawer */}
              <div className="py-4 border-b border-white/10 flex items-center space-x-3">
                <div className="w-10 h-10 rounded-xl bg-blue-600 text-white font-black text-sm flex items-center justify-center">
                  {initials}
                </div>
                <div className="min-w-0">
                  <p className="text-xs font-bold text-white truncate">{userName}</p>
                  <p className="text-[10px] text-slate-400 truncate">{userEmail}</p>
                </div>
              </div>

              {/* Navegación Móvil */}
              <nav className="py-4 space-y-1.5">
                <NavLink
                  to="/docente/panel"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md font-bold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Briefcase className="w-4.5 h-4.5 text-amber-300" />
                    <span>Mi Panel</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </NavLink>

                <NavLink
                  to="/docente/cursos"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md font-bold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <BookOpen className="w-4.5 h-4.5 text-amber-300" />
                    <span>Mis Cursos</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </NavLink>

                <NavLink
                  to="/docente/horarios"
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                      isActive
                        ? "bg-blue-600 text-white shadow-md font-bold"
                        : "text-slate-300 hover:bg-white/10 hover:text-white"
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <Calendar className="w-4.5 h-4.5 text-amber-300" />
                    <span>Mi Horario</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </NavLink>

                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setIsPermutaModalOpen(true);
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-semibold text-amber-300 hover:bg-white/10 transition-all text-left"
                >
                  <div className="flex items-center space-x-3">
                    <ArrowRightLeft className="w-4.5 h-4.5 text-amber-300" />
                    <span>Solicitar Permuta</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-400" />
                </button>
              </nav>
            </div>

            {/* Salir en Drawer */}
            <div className="pt-4 border-t border-white/10">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 py-2.5 px-4 rounded-xl bg-rose-600/20 text-rose-300 hover:bg-rose-600 hover:text-white transition-all text-xs font-bold"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
          <div className="flex-1" onClick={() => setMobileMenuOpen(false)} />
        </div>
      )}

      {/* 4. CONTENIDO PRINCIPAL */}
      <main className="md:pl-20 flex-1 p-4 sm:p-6 md:p-8 max-w-7xl mx-auto w-full transition-all">
        <Outlet />
      </main>

      {/* Modal global de permuta accesible desde el layout */}
      {isPermutaModalOpen && (
        <SolicitudPermutaModal
          isOpen={isPermutaModalOpen}
          onClose={() => setIsPermutaModalOpen(false)}
          onSuccess={() => {
            setIsPermutaModalOpen(false);
            window.location.reload();
          }}
        />
      )}
    </div>
  );
}
