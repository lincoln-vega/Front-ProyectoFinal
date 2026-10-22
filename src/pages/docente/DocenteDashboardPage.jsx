import React, { useEffect, useState } from "react";
import {
  BookOpen,
  Calendar,
  Users,
  AlertCircle,
  ArrowRightLeft,
  Plus,
  CheckCircle2,
  Clock,
  FileText,
  DollarSign
} from "lucide-react";
import { incidentService, courseService } from "../../services/api";
import SolicitudPermutaModal from "../../components/docente/SolicitudPermutaModal";
import Notification from "../../components/admin/Notification";

export default function DocenteDashboardPage() {
  const userName = localStorage.getItem("userName") || "Prof. Carmen Rosa Herrera";
  const [docenteData, setDocenteData] = useState(null);
  const [incidents, setIncidents] = useState([]);
  const [courses, setCourses] = useState([]);
  const [isPermutaModalOpen, setIsPermutaModalOpen] = useState(false);
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  const loadData = () => {
    // Buscar la data del docente en localStorage basado en el nombre (como demo)
    const stored = localStorage.getItem("docentesData");
    if (stored) {
      const docentes = JSON.parse(stored);
      const mine = docentes.find((d) => d.nombre === userName);
      if (mine) setDocenteData(mine);
    }

    const allIncidents = incidentService.getIncidents() || [];
    setIncidents(allIncidents);

    const allCourses = courseService.getCourses() || [];
    setCourses(allCourses);
  };

  useEffect(() => {
    loadData();
  }, [userName]);

  const handlePermutaSuccess = (newInc) => {
    showNotification("Solicitud de permuta enviada exitosamente a Coordinación Académica.");
    loadData();
  };

  // Filtrar incidencias del docente actual o mostrar todas para demo si no hay coincidencia estricta
  const myIncidents = incidents.filter(
    (i) => i.docente?.toLowerCase().includes("carmen") ||
           i.docente?.toLowerCase().includes("herrera") ||
           i.docente?.toLowerCase().includes(userName.toLowerCase())
  );
  const displayIncidents = myIncidents.length > 0 ? myIncidents : incidents;

  return (
    <div className="space-y-6">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      {/* BANNER PRINCIPAL */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 border border-blue-200 dark:border-blue-500/30 mb-2 inline-block">
            Portal Docente
          </span>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">
            ¡Bienvenido(a), {userName}!
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xl">
            Panel de control docente. Gestiona tus horarios lectivos, solicitudes de permuta y justificaciones de inasistencia en tiempo real.
          </p>
        </div>

        <button
          onClick={() => setIsPermutaModalOpen(true)}
          className="inline-flex items-center space-x-2 px-4 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer shrink-0"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>+ Solicitar Permuta / Justificación</span>
        </button>
      </div>

      {/* TARJETAS DE MÉTRICAS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl text-blue-600 dark:text-blue-400">
            <BookOpen className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Cursos Asignados</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{courses.length}</p>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Total Estudiantes</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">120 activos</p>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl text-purple-600 dark:text-purple-400">
            <ArrowRightLeft className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Permutas Solicitadas</p>
            <p className="text-xl font-extrabold text-slate-800 dark:text-white">{displayIncidents.length}</p>
          </div>
        </div>

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10 shadow-xs flex items-center space-x-3.5">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-xl text-amber-600 dark:text-amber-400">
            <DollarSign className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">Tarifa por Hora</p>
            <p className="text-xl font-extrabold text-emerald-600 dark:text-emerald-400">S/ 50.00 / hr</p>
          </div>
        </div>
      </div>

      {/* BANDEJA DE PERMUTAS Y JUSTIFICACIONES (SCRM-106) */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs p-6 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
          <div>
            <h3 className="font-bold text-base text-slate-800 dark:text-white flex items-center gap-2">
              <ArrowRightLeft className="w-4 h-4 text-[#1E3A8A]" />
              Mis Solicitudes de Permuta y Justificaciones
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Estado de aprobación de solicitudes de reemplazo docente y sustentos de asistencia.
            </p>
          </div>

          <button
            onClick={() => setIsPermutaModalOpen(true)}
            className="inline-flex items-center space-x-1.5 px-3 py-1.5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-white hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5 text-blue-600" />
            <span>Nueva Solicitud</span>
          </button>
        </div>

        <div className="space-y-3">
          {displayIncidents.length > 0 ? (
            displayIncidents.map((inc) => (
              <div
                key={inc.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/40 dark:bg-white/5 space-y-2 text-xs"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold font-mono text-slate-700 dark:text-slate-300">
                      {inc.id}
                    </span>
                    <span className="text-slate-400">•</span>
                    <span className="font-semibold text-slate-900 dark:text-white">
                      {inc.materia}
                    </span>
                    <span className="text-slate-500 dark:text-slate-400 font-mono text-[11px]">
                      ({inc.horario})
                    </span>
                  </div>

                  <span
                    className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                      inc.estado === "Aprobado"
                        ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                        : inc.estado === "Rechazado"
                        ? "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                        : "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border-amber-200 dark:border-amber-500/30"
                    }`}
                  >
                    {inc.estado}
                  </span>
                </div>

                <p className="text-slate-600 dark:text-slate-300 italic text-[11px]">
                  "{inc.motivo}"
                </p>

                {inc.docenteReemplazo && (
                  <div className="p-2.5 bg-emerald-50/70 dark:bg-emerald-950/20 rounded-lg border border-emerald-200 dark:border-emerald-500/30 flex items-center space-x-2 text-[11px] text-emerald-900 dark:text-emerald-300">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>
                      Reemplazo confirmado: <strong>{inc.docenteReemplazo}</strong> • Horario:{" "}
                      {inc.horarioActualizado || inc.horario}
                    </span>
                  </div>
                )}
              </div>
            ))
          ) : (
            <p className="text-center py-6 text-slate-400 text-xs">
              No tienes solicitudes de permuta o incidencias registradas.
            </p>
          )}
        </div>
      </div>

      {/* MODAL SOLICITUD DE PERMUTA */}
      <SolicitudPermutaModal
        isOpen={isPermutaModalOpen}
        onClose={() => setIsPermutaModalOpen(false)}
        onSuccess={handlePermutaSuccess}
        currentTeacherName={userName}
      />
    </div>
  );
}
