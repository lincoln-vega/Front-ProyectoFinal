import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
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
  ChevronRight,
  Bell,
  MessageSquare,
  HelpCircle,
  Settings,
  Library,
  ExternalLink,
  CheckCircle2,
  FileText,
  AlertCircle,
  Video
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";

export default function StudentLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const notifRef = useRef(null);

  const studentName = localStorage.getItem("userName") || "Lincoln Jhoel";
  const studentEmail = localStorage.getItem("userEmail") || "estudiante@academia.edu.pe";

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "LJ";

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

  // Notificaciones interactivas para el estudiante
  const notifications = [
    {
      id: 1,
      title: "Nueva Tarea: Práctica N° 4",
      course: "Álgebra y Funciones",
      time: "Hace 15 min",
      type: "task",
      unread: true
    },
    {
      id: 2,
      title: "Próxima Clase en Vivo",
      course: "Física Fundamental (Meet)",
      time: "Comienza a las 08:00 AM",
      type: "class",
      unread: true
    },
    {
      id: 3,
      title: "Simulacro Habilitado",
      course: "Simulacro General Tipo Admisión",
      time: "Disponible hasta el domingo",
      type: "exam",
      unread: true
    }
  ];

  const handleLogout = async () => {
    try {
      await signOutFromApp();
      navigate("/login");
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* 1. BARRA VERTICAL LATERAL (SLIM SIDEBAR DESKTOP) */}
      <aside className="hidden md:flex flex-col fixed left-0 top-0 bottom-0 w-20 bg-[#0A1128] dark:bg-[#060814] border-r border-slate-800/80 z-40 text-white shadow-xl transition-all">
        {/* Brand Icon Superior */}
        <Link
          to="/estudiante/panel"
          className="h-16 flex flex-col items-center justify-center border-b border-white/10 hover:bg-white/5 transition-colors group cursor-pointer"
          title="Ir a Mis Cursos"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <School className="w-5 h-5 text-amber-300" />
          </div>
        </Link>

        {/* Enlaces Principales de Navegación Vertical */}
        <nav className="flex-1 py-4 flex flex-col items-center space-y-2">
          {/* Cursos */}
          <NavLink
            to="/estudiante/panel"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mis Cursos"
          >
            <BookOpen className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Cursos</span>
          </NavLink>

          {/* Chat / Consultas */}
          <button
            type="button"
            onClick={() => setChatModalOpen(true)}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
            title="Chat y Consultas con Docentes"
          >
            <MessageSquare className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Chat</span>
          </button>

          {/* Horario */}
          <NavLink
            to="/estudiante/horarios"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mi Horario de Clases"
          >
            <Calendar className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Horario</span>
          </NavLink>

          {/* Pagos / Boletas */}
          <NavLink
            to="/estudiante/pagos"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mis Pagos y Boletas"
          >
            <CreditCard className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Pagos</span>
          </NavLink>

          {/* Biblioteca Virtual */}
          <button
            type="button"
            onClick={() => setLibraryModalOpen(true)}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
            title="Biblioteca Virtual y Banco de Ejercicios"
          >
            <Library className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Biblioteca</span>
          </button>

          {/* Ayuda y Soporte */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
            title="Centro de Ayuda y Tutoría"
          >
            <HelpCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Ayuda</span>
          </button>
        </nav>

        {/* Botón Salir Inferior */}
        <div className="p-3 border-t border-white/10 flex flex-col items-center">
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
          <Link
            to="/estudiante/panel"
            className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 hover:opacity-90 transition-opacity cursor-pointer group"
            title="Ir al inicio del campus estudiantil"
          >
            <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-[#1E3A8A] dark:bg-blue-600 flex items-center justify-center text-white shadow-xs group-hover:scale-105 transition-transform">
              <School className="w-5 h-5 sm:w-6 sm:h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  Academia Pre
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  Campus Virtual
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Preparación Preuniversitaria de Alto Rendimiento
              </p>
            </div>
          </Link>

          {/* Menú de Navegación Superior Rápido (Tablet/Desktop) */}
          <nav className="hidden lg:flex items-center space-x-1.5">
            <NavLink
              to="/estudiante/panel"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-100 dark:bg-white/10 text-blue-700 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <BookOpen className="w-3.5 h-3.5" />
              <span>Mis Cursos</span>
            </NavLink>
            <NavLink
              to="/estudiante/horarios"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-100 dark:bg-white/10 text-blue-700 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <Calendar className="w-3.5 h-3.5" />
              <span>Mi Horario</span>
            </NavLink>
            <NavLink
              to="/estudiante/pagos"
              className={({ isActive }) => `flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                isActive
                  ? "bg-slate-100 dark:bg-white/10 text-blue-700 dark:text-blue-400"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-white/5"
              }`}
            >
              <CreditCard className="w-3.5 h-3.5" />
              <span>Mis Pagos</span>
            </NavLink>
          </nav>

          {/* Controles de la Derecha: Campana, Modo Oscuro, Avatar Estudiante */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Campana de Notificaciones con Badge */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Notificaciones y avisos académicos"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-5 h-5" />
                <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-sm animate-pulse">
                  3
                </span>
              </button>

              {/* Menú Desplegable de Notificaciones */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-3 z-50 animate-scale-up">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      Notificaciones Académicas
                    </span>
                    <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                      3 pendientes
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
                            {notif.type === "task" && <FileText className="w-4 h-4" />}
                            {notif.type === "class" && <Video className="w-4 h-4" />}
                            {notif.type === "exam" && <Sparkles className="w-4 h-4" />}
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

                  <div className="px-4 pt-2 border-t border-slate-100 dark:border-white/10 text-center">
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Cerrar panel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Alternador de Tema Claro / Oscuro */}
            <ThemeToggle />

            {/* Perfil del Alumno (Avatar + Saludo) */}
            <div className="flex items-center space-x-2.5 pl-1 sm:pl-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  Hola, {studentName}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 leading-tight flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Estudiante</span>
                </div>
              </div>

              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-sm ring-2 ring-blue-300 dark:ring-blue-800 cursor-pointer"
                title={`${studentName} (${studentEmail})`}
              >
                {initials}
              </div>
            </div>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de navegación"
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0a0a0e]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 p-4 space-y-3 shadow-xl animate-fade-in">
            <div className="pb-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
              <div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">{studentName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{studentEmail}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Estudiante
              </span>
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

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setLibraryModalOpen(true); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Library className="w-4 h-4" />
                  <span>Biblioteca y Materiales</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setHelpModalOpen(true); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Centro de Ayuda y Tutoría</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </nav>

            <div className="pt-2 border-t border-slate-100 dark:border-white/10">
              <button
                type="button"
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

      {/* 3. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 md:pl-20 w-full transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <Outlet />
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="md:pl-20 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-white/10 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <p>© 2026 Academia Preuniversitaria • Plataforma Virtual de Alto Rendimiento</p>
      </footer>

      {/* MODAL: CHAT Y CONSULTAS */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Canal de Consultas y Chat Académico
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comunícate con tus docentes y tutores de preparación
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 text-xs space-y-2 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Docentes en línea listos para resolver dudas</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Puedes formular preguntas sobre las tareas de la semana, problemas de álgebra, leyes de física o temas del simulacro.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Selecciona la asignatura o docente:
              </label>
              <select className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-medium">
                <option>Prof. Carmen Rosa Herrera — Álgebra y Funciones</option>
                <option>Prof. Miguel Ángel Paredes — Física Fundamental</option>
                <option>Dra. Elena Sofía Torres — Biología y Anatomía</option>
                <option>Tutoría y Orientación Vocacional</option>
              </select>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Escribe tu consulta o duda:
              </label>
              <textarea
                rows={3}
                placeholder="Hola profesor(a), tengo una duda sobre el ejercicio 7 de la separata..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={() => {
                  alert("¡Consulta enviada exitosamente al docente! Recibirás la respuesta en tu panel.");
                  setChatModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                Enviar Consulta
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: BIBLIOTECA VIRTUAL Y SEPARATAS */}
      {libraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Biblioteca Digital y Separatas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Materiales de clase, bancos de preguntas y exámenes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLibraryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {[
                { title: "Separata Teórico-Práctica N° 4: Álgebra", size: "2.4 MB", type: "PDF", tag: "Semana Actual" },
                { title: "Guía de Problemas Resueltos: Cinemática y Dinámica", size: "3.8 MB", type: "PDF", tag: "Física" },
                { title: "Compendio de Biología Celular y Genética", size: "5.1 MB", type: "PDF", tag: "Biología" },
                { title: "Banco de 500 Preguntas Tipo Admisión San Marcos / UNI", size: "8.2 MB", type: "PDF", tag: "Exámenes" }
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {doc.title}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {doc.type} • {doc.size} • <span className="text-indigo-600 dark:text-indigo-400 font-bold">{doc.tag}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Descargando material: ${doc.title}`)}
                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 text-xs font-bold shrink-0 ml-2 cursor-pointer"
                    title="Descargar material"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLibraryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CENTRO DE AYUDA Y TUTORÍA */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Centro de Ayuda Estudiantil
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Soporte técnico y coordinación académica
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                <strong className="text-slate-900 dark:text-white block">WhatsApp de Coordinación Pre:</strong>
                <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">+51 987 654 321</p>
                <p className="text-[11px] text-slate-400">Horario de atención: Lunes a Sábado de 07:30 a 19:30 hrs.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                <strong className="text-slate-900 dark:text-white block">Soporte Técnico de Plataforma:</strong>
                <p className="font-mono text-blue-600 dark:text-blue-400 font-bold">soporte@academiapre.edu.pe</p>
                <p className="text-[11px] text-slate-400">Para problemas con Google Meet, acceso a salas o restablecimiento de contraseña.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
