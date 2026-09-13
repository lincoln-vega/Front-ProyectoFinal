import React from "react";
import { Outlet, useNavigate } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  School,
  Calendar,
  Sparkles,
  BookOpen,
  Clock
} from "lucide-react";

export default function StudentLayout() {
  const navigate = useNavigate();
  const studentName = localStorage.getItem("userName") || "Juan Carlos Flores";
  const studentEmail = localStorage.getItem("userEmail") || "j.flores@academia.edu.pe";

  const handleLogout = () => {
    localStorage.removeItem("userRole");
    localStorage.removeItem("userName");
    localStorage.removeItem("userEmail");
    navigate("/login");
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* NAVBAR SUPERIOR ESTUDIANTIL */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-2xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          {/* Logo y Nombre */}
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-[#1E3A8A] flex items-center justify-center text-white shadow-xs">
              <School className="w-6 h-6 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-extrabold text-base text-slate-800 tracking-tight">
                  Academia Pre
                </span>
                <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                  Campus Virtual
                </span>
              </div>
              <p className="text-xs text-slate-500 hidden sm:block">
                Ciclo Anual San Marcos 2026 • Campus Virtual
              </p>
            </div>
          </div>

          {/* Perfil del Estudiante y Logout */}
          <div className="flex items-center space-x-3 sm:space-x-4">
            <div className="flex items-center space-x-2 sm:space-x-3 text-right">
              <div className="hidden sm:block">
                <div className="text-xs font-bold text-slate-800">{studentName}</div>
                <div className="text-[11px] text-slate-500">{studentEmail}</div>
              </div>
              <div className="w-9 h-9 rounded-full bg-emerald-600 text-white flex items-center justify-center font-bold text-sm shadow-xs border-2 border-emerald-200">
                JC
              </div>
            </div>

            <div className="h-6 w-px bg-slate-200" />

            <button
              onClick={handleLogout}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors cursor-pointer"
              title="Cerrar sesión"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Cerrar Sesión</span>
            </button>
          </div>
        </div>
      </header>

      {/* ÁREA DE CONTENIDO */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <Outlet />
      </main>

      {/* FOOTER */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500">
        <p>© 2026 Plataforma Educativa Preuniversitaria — Requerimiento SCRM-30</p>
      </footer>
    </div>
  );
}
