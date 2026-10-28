import React, { useState, useEffect } from "react";
import {
  ListTodo,
  Clock,
  CheckCircle2,
  AlertCircle,
  FileText,
  Calendar,
  ExternalLink,
  ChevronRight,
  Video,
  Sparkles,
  BookOpen
} from "lucide-react";
import { academicActivitiesService } from "../../services/academicActivitiesService";

export default function WeeklyActivitiesWidget({ activeCourses = [], onJoinMeet }) {
  const [filter, setFilter] = useState("pendientes");
  const [selectedTask, setSelectedTask] = useState(null);
  const [activities, setActivities] = useState(() => academicActivitiesService.getTasks());

  // Sincronizar tareas al cargar o cuando cambie la ventana/pestaña
  useEffect(() => {
    const refreshTasks = () => {
      setActivities(academicActivitiesService.getTasks());
    };
    refreshTasks();
    window.addEventListener("storage", refreshTasks);
    return () => window.removeEventListener("storage", refreshTasks);
  }, []);

  const handleDeliverTask = (taskId) => {
    const updated = academicActivitiesService.toggleTaskStatus(taskId);
    setActivities(updated);
    setSelectedTask(null);
    alert("¡Tarea entregada exitosamente! Tu docente ha sido notificado.");
  };

  const filteredActivities = activities.filter((act) => {
    if (filter === "pendientes") return act.estado === "Por entregar";
    if (filter === "completadas") return act.estado === "Entregado";
    return true;
  });

  // Próxima clase destacada
  const nextClass = activeCourses.length > 0 ? activeCourses[0] : null;

  return (
    <div className="space-y-5 animate-fade-in">
      {/* TARJETA PRÓXIMA CLASE EN VIVO */}
      {nextClass && (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-[#1E3A8A] text-white rounded-2xl p-5 shadow-lg border border-indigo-700/40 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          
          <div className="flex items-center justify-between gap-2 mb-3">
            <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Próxima Clase
            </span>
            <span className="text-xs font-mono text-blue-200">
              {nextClass.horaInicio || "08:00"} AM
            </span>
          </div>

          <h4 className="text-base font-extrabold text-white leading-tight">
            {nextClass.asignatura}
          </h4>
          <p className="text-xs text-blue-200 mt-1 truncate">
            Docente: {nextClass.docente || "A cargo"}
          </p>

          <button
            type="button"
            onClick={() => onJoinMeet ? onJoinMeet(nextClass) : window.open(nextClass.meetUrl, '_blank')}
            className="w-full mt-4 bg-emerald-500 hover:bg-emerald-600 active:bg-emerald-700 text-slate-950 font-extrabold py-2.5 px-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01]"
          >
            <Video className="w-4 h-4 text-slate-950" />
            <span>Unirse a la Sala en Vivo</span>
          </button>
        </div>
      )}

      {/* PANEL DE ACTIVIDADES SEMANALES */}
      <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm overflow-hidden">
        
        {/* Encabezado del Widget */}
        <div className="p-4 border-b border-slate-100 dark:border-white/10">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center space-x-2">
              <div className="p-1.5 bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 rounded-lg">
                <ListTodo className="w-4 h-4" />
              </div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Actividades Semanales
              </h3>
            </div>
            <span className="text-[11px] font-bold px-2 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-900/50">
              {activities.filter(a => a.estado === "Por entregar").length} pendientes
            </span>
          </div>

          {/* Filtros rápidos */}
          <div className="flex gap-1.5 mt-3 text-xs">
            <button
              type="button"
              onClick={() => setFilter("pendientes")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === "pendientes"
                  ? "bg-[#1E3A8A] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Por Entregar
            </button>
            <button
              type="button"
              onClick={() => setFilter("completadas")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === "completadas"
                  ? "bg-[#1E3A8A] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Completadas
            </button>
            <button
              type="button"
              onClick={() => setFilter("todas")}
              className={`px-2.5 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                filter === "todas"
                  ? "bg-[#1E3A8A] text-white shadow-2xs"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
              }`}
            >
              Todas
            </button>
          </div>
        </div>

        {/* Lista de Tareas */}
        <div className="divide-y divide-slate-100 dark:divide-white/5 p-2 space-y-1">
          {filteredActivities.length === 0 ? (
            <div className="p-6 text-center text-xs text-slate-400">
              No hay actividades en esta sección.
            </div>
          ) : (
            filteredActivities.map((act) => {
              const isPending = act.estado === "Por entregar";
              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedTask(act)}
                  className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      {act.tipo}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isPending
                          ? "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border-amber-200 dark:border-amber-800/60"
                          : "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                      }`}
                    >
                      {act.estado}
                    </span>
                  </div>

                  <h5 className="text-xs font-bold text-slate-800 dark:text-slate-100 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 leading-snug">
                    {act.titulo}
                  </h5>

                  <p className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 mt-1 uppercase tracking-wider">
                    {act.curso}
                  </p>

                  <div className="flex items-center justify-between mt-2 pt-2 border-t border-slate-100 dark:border-white/5 text-[11px]">
                    <span className="flex items-center gap-1 text-slate-500 dark:text-slate-400 font-mono">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {act.fechaLimite}
                    </span>
                    {act.nota ? (
                      <span className="font-extrabold text-emerald-600 dark:text-emerald-400">
                        {act.nota}
                      </span>
                    ) : (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
                        <span>Ver</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    )}
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* MODAL DETALLES DE TAREA */}
      {selectedTask && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md p-6 space-y-4 animate-scale-up">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
                <span className="text-xs uppercase font-extrabold text-indigo-600 dark:text-indigo-400">
                  {selectedTask.tipo}
                </span>
              </div>
              <span className={`text-xs font-extrabold px-2.5 py-0.5 rounded-full border ${
                selectedTask.estado === "Por entregar"
                  ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300"
              }`}>
                {selectedTask.estado}
              </span>
            </div>

            <div>
              <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                {selectedTask.titulo}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Asignatura: <strong className="text-slate-700 dark:text-slate-200">{selectedTask.curso}</strong>
              </p>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Docente: <strong className="text-slate-700 dark:text-slate-200">{selectedTask.docente}</strong>
              </p>
            </div>

            <div className="p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
              {selectedTask.descripcion}
            </div>

            <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300 py-1">
              <span>Puntaje máximo: <strong className="text-slate-900 dark:text-white">{selectedTask.puntos}</strong></span>
              <span>Límite: <strong className="text-rose-600 dark:text-rose-400">{selectedTask.fechaLimite}</strong></span>
            </div>

            <div className="pt-2 flex gap-2">
              <button
                type="button"
                onClick={() => setSelectedTask(null)}
                className="w-full py-2.5 px-4 rounded-xl border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 font-bold text-xs hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
              >
                Cerrar
              </button>
              {selectedTask.estado === "Por entregar" && (
                <button
                  type="button"
                  onClick={() => handleDeliverTask(selectedTask.id)}
                  className="w-full py-2.5 px-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md cursor-pointer transition-all flex items-center justify-center gap-1.5"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Subir Entrega (PDF)</span>
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
