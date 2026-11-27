import React, { useEffect, useRef, useState } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
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
  ChevronRight,
  Bell,
  Video,
  AlertTriangle,
  FileText
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";
import { reportesService } from "../services/reportesService";
import { clasesVivoService } from "../services/clasesVivoService";

export default function AdminLayout() {
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const [cicloVigenteLabel, setCicloVigenteLabel] = useState("Semestral San Marcos 2026-II");
  const [adminAlerts, setAdminAlerts] = useState([]);
  const notifRef = useRef(null);

  const userName = localStorage.getItem("userName") || "Administrador General";
  const userEmail = localStorage.getItem("userEmail") || "admin@academia.edu.pe";

  useEffect(() => {
    let cancelled = false;

    const syncAdminPulse = async () => {
      try {
        const summary = await reportesService.getResumenEjecutivo();
        if (cancelled || !summary) return;
        if (summary.cicloVigente) {
          setCicloVigenteLabel(summary.cicloVigente);
        }

        const alerts = [];
        for (const live of summary.clasesEnVivo || []) {
          alerts.push({
            id: `live-${live.sesionId}`,
            type: "live",
            title: `Aula en Vivo: ${live.asignatura}`,
            desc: `Dictando ahora: ${live.docente} (${live.horaProgramada})`,
            target: "/admin/reportes"
          });
        }
        for (const inc of (summary.incidenciasPendientes || []).slice(0, 4)) {
          alerts.push({
            id: `inc-${inc.id}`,
            type: "incident",
            title: `Incidencia Pendiente: ${inc.tipo}`,
            desc: `${inc.docente}${inc.materia ? ` • ${inc.materia}` : ""}`,
            target: "/admin/incidentes"
          });
        }
        if ((summary.kpis?.cuentasConSaldoCount || 0) > 0) {
          alerts.push({
            id: "fin-deuda",
            type: "finance",
            title: `${summary.kpis.cuentasConSaldoCount} matrícula(s) con saldo pendiente`,
            desc: `Por cobrar: S/ ${Number(summary.kpis.saldoPendienteTotal || 0).toFixed(2)}`,
            target: "/admin/matriculas"
          });
        }
        setAdminAlerts(alerts);
      } catch {}
    };

    syncAdminPulse();
    const timer = setInterval(() => {
      if (!document.hidden) syncAdminPulse();
    }, 35000);
    const unsub = clasesVivoService.subscribeLiveChanges(() => {
      syncAdminPulse();
    });

    const handleClickOutside = (ev) => {
      if (notifRef.current && !notifRef.current.contains(ev.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
      cancelled = true;
      clearInterval(timer);
      unsub();
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

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
    { name: "Configuración", path: "/admin/configuracion", icon: Settings }
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
          <Link
            to="/admin/usuarios"
            className="h-16 px-6 flex items-center space-x-3 border-b border-blue-800/80 bg-blue-950/40 hover:bg-blue-900/60 transition-colors cursor-pointer group"
            title="Ir al panel de administración"
          >
            <div className="p-2 bg-white/10 rounded-lg backdrop-blur-xs group-hover:scale-105 transition-transform">
              <School className="w-6 h-6 text-white" />
            </div>
            <div>
              <span className="font-extrabold text-base tracking-wide uppercase block leading-tight">
                Academia Pre
              </span>
              <span className="text-xs text-blue-200 tracking-wider font-bold uppercase">
                Panel Corporativo
              </span>
            </div>
          </Link>

          <nav className="p-4 space-y-1.5">
            <div className="px-3 py-2 text-xs font-bold uppercase tracking-wider text-blue-300">
              Módulos Principales
            </div>
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-800 dark:bg-white/15 text-white shadow-xs border-l-4 border-amber-400 font-bold"
                        : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5 hover:text-white"
                    }`
                  }
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

        <div className="p-4 border-t border-blue-800/80 bg-blue-950/30">
          <div className="flex items-center space-x-3 mb-3 px-1">
            <div className="w-9 h-9 rounded-full bg-blue-700 flex items-center justify-center font-bold text-sm border-2 border-blue-400 text-white shrink-0">
              {userName.charAt(0)}
            </div>
            <div className="overflow-hidden min-w-0">
              <div className="text-sm font-bold truncate leading-snug">{userName}</div>
              <div className="text-xs text-blue-300 truncate">{userEmail}</div>
            </div>
          </div>
          <button
            onClick={handleLogout}
            className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 text-xs font-bold rounded-xl bg-red-600/20 text-red-200 hover:bg-red-600 hover:text-white border border-red-500/30 transition-all cursor-pointer shadow-xs active:scale-[0.98]"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </aside>

      {/* HEADER MÓVIL */}
      <header className="md:hidden bg-[#1E3A8A] dark:bg-[#0a0a0e]/90 dark:backdrop-blur-2xl border-b border-blue-900/60 dark:border-white/10 text-white px-4 py-3 sticky top-0 z-40 flex items-center justify-between shadow-md">
        <Link
          to="/admin/usuarios"
          className="flex items-center space-x-2.5 min-w-0 hover:opacity-90 transition-opacity cursor-pointer group"
        >
          <div className="p-1.5 bg-white/10 rounded-lg shrink-0 group-hover:scale-105 transition-transform">
            <School className="w-5 h-5 text-amber-300" />
          </div>
          <div className="min-w-0">
            <span className="font-extrabold text-sm sm:text-base tracking-tight truncate block leading-tight">
              Academia Pre
            </span>
            <span className="text-[11px] text-blue-200 font-bold uppercase tracking-wider block truncate">
              {cicloVigenteLabel}
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-2 shrink-0">
          <ThemeToggle variant="on-dark" />
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

      {mobileMenuOpen && (
        <div className="md:hidden bg-blue-950/98 dark:bg-[#0a0a0e]/98 backdrop-blur-2xl text-white border-b border-blue-800/80 dark:border-white/10 p-4 space-y-3 sticky top-[57px] z-30 shadow-2xl animate-fade-in max-h-[calc(100vh-60px)] overflow-y-auto">
          <div className="pb-3 border-b border-blue-800/50 dark:border-white/10">
            <div className="text-sm font-bold text-white">{userName}</div>
            <div className="text-xs text-blue-200 dark:text-slate-400">{userEmail}</div>
          </div>

          <div className="space-y-1.5">
            {navItems.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  onClick={() => setMobileMenuOpen(false)}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      isActive
                        ? "bg-blue-800 dark:bg-white/15 text-white shadow-xs border-l-4 border-amber-400 font-bold"
                        : "text-blue-100 dark:text-slate-300 hover:bg-blue-800/50 dark:hover:bg-white/5"
                    }`
                  }
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
              className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-red-600/30 dark:bg-red-900/40 text-red-200 dark:text-red-400 text-xs sm:text-sm font-bold hover:bg-red-600/50 dark:hover:bg-red-900/60 transition-colors cursor-pointer border border-red-500/30"
            >
              <LogOut className="w-4 h-4" />
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </div>
      )}

      {/* CONTENIDO PRINCIPAL */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="hidden md:flex h-16 bg-white dark:bg-white/5 dark:backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 px-6 items-center justify-between shadow-2xs relative z-30">
          <div className="flex items-center space-x-3 min-w-0">
            <h1 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2 truncate">
              <CurrentIcon className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400 shrink-0" />
              <span className="truncate">{currentModule.name}</span>
            </h1>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 dark:bg-blue-900/40 text-[#1E3A8A] dark:text-blue-300 font-semibold border border-blue-200 dark:border-blue-700/50 truncate max-w-[240px]">
              {cicloVigenteLabel}
            </span>
          </div>

          <div className="flex items-center space-x-3 shrink-0">
            <Link
              to="/admin/reportes"
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 text-[#1E3A8A] dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 text-xs font-extrabold transition-colors"
              title="Abrir Centro Institucional de Reportes PDF / Excel"
            >
              <FileText className="w-3.5 h-3.5" />
              <span>Emitir Reportes</span>
            </Link>

            {/* Campana de Alertas Operativas en Tiempo Real */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotifOpen((v) => !v)}
                className="relative p-2 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
                title="Alertas operativas de Dirección"
              >
                <Bell className="w-4 h-4" />
                {adminAlerts.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white text-[10px] font-black flex items-center justify-center">
                    {adminAlerts.length}
                  </span>
                )}
              </button>

              {notifOpen && (
                <div className="absolute right-0 mt-2 w-80 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 shadow-2xl overflow-hidden z-50 animate-fade-in">
                  <div className="px-4 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50/80 dark:bg-white/5">
                    <span className="text-xs font-extrabold text-slate-900 dark:text-white">
                      Centro de Alertas Admin
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 dark:bg-blue-950 text-blue-800 dark:text-blue-300">
                      {adminAlerts.length} activas
                    </span>
                  </div>

                  <div className="max-h-72 overflow-y-auto divide-y divide-slate-100 dark:divide-white/5">
                    {adminAlerts.length === 0 ? (
                      <div className="p-5 text-center text-xs text-slate-400">
                        Sin alertas críticas pendientes en este momento.
                      </div>
                    ) : (
                      adminAlerts.map((al) => (
                        <button
                          key={al.id}
                          type="button"
                          onClick={() => {
                            setNotifOpen(false);
                            navigate(al.target);
                          }}
                          className="w-full text-left p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer flex items-start gap-2.5"
                        >
                          <div className="p-1.5 rounded-lg bg-slate-100 dark:bg-white/10 shrink-0 mt-0.5">
                            {al.type === "live" ? (
                              <Video className="w-4 h-4 text-rose-500 animate-pulse" />
                            ) : al.type === "incident" ? (
                              <AlertTriangle className="w-4 h-4 text-amber-500" />
                            ) : (
                              <CreditCard className="w-4 h-4 text-blue-500" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <p className="text-xs font-extrabold text-slate-800 dark:text-slate-100 leading-snug">
                              {al.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                              {al.desc}
                            </p>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>
              )}
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

        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50 dark:bg-[#0a0a0e]/50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
