import React from "react";
import { Outlet, NavLink, useNavigate } from "react-router-dom";
import { BookOpen, Calendar, LogOut, School, Briefcase } from "lucide-react";

export default function DocenteLayout() {
  const navigate = useNavigate();
  const userName = localStorage.getItem("userName") || "Docente";
  const userEmail = localStorage.getItem("userEmail") || "docente@academia.edu.pe";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col md:flex-row">
      <aside className="hidden md:flex md:w-64 bg-[#1E3A8A] flex-col justify-between text-white shadow-xl z-20 shrink-0">
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
            <NavLink to="/docente/panel" className={({ isActive }) => `flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${isActive ? "bg-blue-800 text-white shadow-xs border-l-4 border-amber-400" : "text-blue-100 hover:bg-blue-800/50 hover:text-white"}`}>
              <Briefcase className="w-4 h-4 text-amber-300" />
              <span>Mi Panel</span>
            </NavLink>
            <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100/70 cursor-not-allowed">
              <BookOpen className="w-4 h-4 text-blue-300/60" />
              <span>Mis Cursos</span>
            </div>
            <div className="flex items-center space-x-3 px-3 py-2.5 rounded-lg text-sm font-medium text-blue-100/70 cursor-not-allowed">
              <Calendar className="w-4 h-4 text-blue-300/60" />
              <span>Horarios</span>
            </div>
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

      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <header className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shadow-2xs">
          <h1 className="text-lg font-bold text-slate-800 flex items-center gap-2">Portal Docente</h1>
          <button onClick={handleLogout} className="md:hidden text-xs font-medium text-slate-600 hover:text-red-600 flex items-center space-x-1 p-2 rounded-md hover:bg-slate-100 transition-colors cursor-pointer">
            <LogOut className="w-4 h-4" />
            <span>Salir</span>
          </button>
        </header>
        <main className="flex-1 overflow-y-auto p-4 md:p-6 bg-slate-50">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
