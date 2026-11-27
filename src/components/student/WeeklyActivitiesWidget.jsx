// Widget de Actividades Semanales del Estudiante (conectado a entregas individuales y calificaciones reales)
import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  ListTodo,
  Clock,
  ChevronRight,
  Video,
  Award
} from "lucide-react";
import { academicActivitiesService } from "../../services/academicActivitiesService";
import { clasesVivoService } from "../../services/clasesVivoService";
import StudentTaskModal from "./StudentTaskModal";
import FilePreviewModal from "../shared/FilePreviewModal";

export default function WeeklyActivitiesWidget({
  activeCourses = [],
  liveSessionsByCourse = {},
  onJoinMeet,
  isReadOnly = false
}) {
  const [filter, setFilter] = useState("pendientes");
  const [selectedTaskId, setSelectedTaskId] = useState(null);
  const [previewMaterial, setPreviewMaterial] = useState(null);
  const [activities, setActivities] = useState(() =>
    academicActivitiesService.getStudentMergedTasks()
  );
  const [announcements, setAnnouncements] = useState(() =>
    academicActivitiesService.getAnnouncements()
  );

  const syncAll = useCallback(() => {
    academicActivitiesService.fetchStudentTasksWithSubmissions().then((merged) => {
      if (merged) setActivities(merged);
    });
    academicActivitiesService.fetchAnnouncements().then((anns) => {
      if (anns) setAnnouncements(anns);
    });
  }, []);

  useEffect(() => {
    let isMounted = true;
    const safeSync = () => {
      if (!isMounted) return;
      academicActivitiesService.fetchStudentTasksWithSubmissions().then((merged) => {
        if (isMounted && merged) setActivities(merged);
      });
      academicActivitiesService.fetchAnnouncements().then((anns) => {
        if (isMounted && anns) setAnnouncements(anns);
      });
    };

    safeSync();
    const id = setInterval(() => {
      if (!document.hidden) safeSync();
    }, 35000);

    const unsub = clasesVivoService.subscribeLiveChanges((evt) => {
      if (
        evt?.type === "MATERIAL_PUBLISHED" ||
        evt?.type === "TASK_CREATED" ||
        evt?.type === "TASK_DELETED" ||
        evt?.type === "TASK_SUBMITTED" ||
        evt?.type === "TASK_GRADED"
      ) {
        safeSync();
      }
    });

    const refreshFromStorage = () => {
      if (!isMounted) return;
      setActivities(academicActivitiesService.getStudentMergedTasks());
      setAnnouncements(academicActivitiesService.getAnnouncements());
    };
    window.addEventListener("storage", refreshFromStorage);

    return () => {
      isMounted = false;
      clearInterval(id);
      unsub();
      window.removeEventListener("storage", refreshFromStorage);
    };
  }, []);

  // Filtrar estrictamente las actividades según los cursos en los que el estudiante está matriculado
  const relevantActivities = useMemo(() => {
    if (!activeCourses || activeCourses.length === 0) {
      return activities.filter((act) => String(act.cursoId || act.curso_id || "").startsWith("SIM"));
    }

    const enrolledIds = new Set(
      activeCourses
        .map((c) => String(c.id || c.cursoId || ""))
        .filter(Boolean)
    );

    const enrolledNames = activeCourses
      .map((c) => (c.asignatura || c.nombre || "").toLowerCase().trim())
      .filter(Boolean);

    return activities.filter((act) => {
      const cid = String(act.cursoId || act.curso_id || "");
      if (cid.startsWith("SIM")) return true;
      if (enrolledIds.has(cid)) return true;

      const cName = (act.curso || "").toLowerCase().trim();
      if (cName && enrolledNames.some((name) => cName.includes(name) || name.includes(cName))) {
        return true;
      }
      return false;
    });
  }, [activities, activeCourses]);

  const pendingCount = useMemo(
    () =>
      relevantActivities.filter(
        (a) => a.estadoAlumno === "Por entregar" || a.estadoAlumno === "Observado"
      ).length,
    [relevantActivities]
  );

  const filteredActivities = useMemo(
    () =>
      relevantActivities.filter((act) => {
        const st = act.estadoAlumno || act.estado || "Por entregar";
        if (filter === "pendientes") return st === "Por entregar" || st === "Observado";
        if (filter === "completadas") return st === "Entregado" || st === "Calificado";
        return true;
      }),
    [relevantActivities, filter]
  );

  const selectedTask = useMemo(
    () => relevantActivities.find((a) => String(a.id) === String(selectedTaskId)) || null,
    [relevantActivities, selectedTaskId]
  );

  // Priorizar cualquier curso que esté EN VIVO ahora mismo; si no, el primer curso activo
  const liveCourseNow = activeCourses.find((c) => Boolean(liveSessionsByCourse?.[c.id]));
  const nextClass = liveCourseNow || (activeCourses.length > 0 ? activeCourses[0] : null);
  const isNextClassLive = Boolean(nextClass && liveSessionsByCourse?.[nextClass.id]);

  // Materiales recientes subidos por los docentes en los cursos inscritos
  const recentMaterials = useMemo(() => {
    const enrolledIds = new Set(activeCourses.map((c) => String(c.id || "")));
    return (announcements || [])
      .filter((a) => (a.archivoUrl || a.archivoPath) && enrolledIds.has(String(a.cursoId || a.curso_id || "")))
      .slice(0, 3);
  }, [announcements, activeCourses]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* TARJETA CLASE EN VIVO / PRÓXIMA CLASE (Solo en ciclos activos) */}
      {nextClass && !isReadOnly && (
        <div className="bg-gradient-to-br from-indigo-900 via-blue-900 to-[#1E3A8A] text-white rounded-2xl p-5 shadow-lg border border-indigo-700/40 relative overflow-hidden">
          <div className="absolute right-0 bottom-0 translate-x-4 translate-y-4 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />

          <div className="flex items-center justify-between gap-2 mb-3">
            <span
              className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wide border ${
                isNextClassLive
                  ? "bg-red-500/25 text-red-200 border-red-400/50"
                  : "bg-emerald-500/20 text-emerald-300 border-emerald-400/30"
              }`}
            >
              <span
                className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                  isNextClassLive ? "bg-red-400" : "bg-emerald-400"
                }`}
              />
              {isNextClassLive ? "En Vivo Ahora" : "Próxima Clase"}
            </span>
            <span className="text-xs font-mono text-blue-200">
              {nextClass.horaInicio || "08:00"} - {nextClass.horaFin || "10:00"}
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
            disabled={!isNextClassLive}
            onClick={() => isNextClassLive && onJoinMeet && onJoinMeet(nextClass)}
            className={`w-full mt-4 font-extrabold py-2.5 px-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 transition-all ${
              isNextClassLive
                ? "bg-emerald-500 hover:bg-emerald-600 text-slate-950 cursor-pointer hover:scale-[1.01]"
                : "bg-white/10 text-blue-200 border border-white/15 cursor-not-allowed"
            }`}
          >
            <Video className="w-4 h-4 shrink-0" />
            <span>
              {isNextClassLive
                ? "Unirse a la Sala Google Meet"
                : "Esperando inicio del docente"}
            </span>
          </button>
        </div>
      )}

      {/* TARJETA DE MATERIALES PUBLICADOS EN CLASE */}
      {recentMaterials.length > 0 && (
        <div className="bg-white/85 dark:bg-slate-900/85 rounded-2xl border border-blue-200 dark:border-blue-500/30 p-4 space-y-2.5 shadow-xs">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-black uppercase tracking-wider text-blue-700 dark:text-blue-300">
              📎 Materiales Recientes de Clase
            </h3>
            <span className="text-[10px] font-bold text-blue-600 dark:text-blue-400">
              En tiempo real
            </span>
          </div>
          <div className="space-y-2">
            {recentMaterials.map((mat) => (
              <button
                key={mat.id}
                type="button"
                onClick={() => setPreviewMaterial(mat)}
                className="w-full text-left block rounded-xl bg-blue-50/70 dark:bg-blue-950/35 border border-blue-200/80 dark:border-blue-800/50 p-3 hover:border-blue-400 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between text-[10px] font-extrabold text-blue-600 dark:text-blue-300">
                  <span>{mat.curso}</span>
                  <span>👁 Previsualizar</span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-0.5 line-clamp-1">
                  {mat.titulo}
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate mt-0.5">
                  📄 {mat.archivoNombre || "Archivo adjunto"}
                </p>
              </button>
            ))}
          </div>
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
              {pendingCount} pendientes
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
              Entregadas
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
              {filter === "pendientes"
                ? "¡Estás al día! No tienes tareas pendientes de entrega en tus cursos."
                : "No tienes actividades registradas en esta sección."}
            </div>
          ) : (
            filteredActivities.map((act) => {
              const st = act.estadoAlumno || act.estado || "Por entregar";
              const isCalificado = st === "Calificado";
              const isObservado = st === "Observado";
              const isEntregado = st === "Entregado";
              const notaNum = act.nota !== null && act.nota !== undefined ? Number(act.nota) : null;

              return (
                <div
                  key={act.id}
                  onClick={() => setSelectedTaskId(act.id)}
                  className="p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-white/5 transition-all cursor-pointer group"
                >
                  <div className="flex items-center justify-between gap-1 mb-1.5">
                    <span className="text-[10px] font-mono text-slate-400 uppercase font-semibold">
                      {act.tipo}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full border ${
                        isCalificado
                          ? "bg-indigo-50 dark:bg-indigo-950/40 text-indigo-800 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/60"
                          : isEntregado
                          ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800/60"
                          : isObservado
                          ? "bg-rose-50 dark:bg-rose-950/40 text-rose-800 dark:text-rose-300 border border-rose-200 dark:border-rose-800/60"
                          : "bg-amber-50 dark:bg-amber-950/40 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/60"
                      }`}
                    >
                      {isCalificado
                        ? "Calificado"
                        : isEntregado
                        ? "Entregado"
                        : isObservado
                        ? "Observado"
                        : "Por entregar"}
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
                    {notaNum !== null ? (
                      <span
                        className={`inline-flex items-center gap-1 font-extrabold px-2 py-0.5 rounded-lg ${
                          notaNum >= 11
                            ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400"
                            : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400"
                        }`}
                      >
                        <Award className="w-3 h-3" />
                        <span>{notaNum.toFixed(notaNum % 1 === 0 ? 0 : 1)} / 20</span>
                      </span>
                    ) : (
                      <span className="font-bold text-indigo-600 dark:text-indigo-400 group-hover:underline flex items-center gap-0.5">
                        <span>{isEntregado ? "Ver entrega" : isObservado ? "Corregir" : "Entregar"}</span>
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

      {/* MODAL UNIFICADO DE DETALLE, SUBIDA REAL Y CALIFICACIÓN */}
      <StudentTaskModal
        task={selectedTask}
        isOpen={Boolean(selectedTask)}
        isReadOnly={isReadOnly}
        onClose={() => setSelectedTaskId(null)}
        onDeliver={async () => {
          syncAll();
        }}
      />

      <FilePreviewModal
        isOpen={Boolean(previewMaterial)}
        onClose={() => setPreviewMaterial(null)}
        title={previewMaterial?.titulo || "Material de Clase"}
        subtitle={`${previewMaterial?.curso || ""} • ${previewMaterial?.docente || ""}`}
        fileName={previewMaterial?.archivoNombre || "material_clase.pdf"}
        bucket="materiales-clase"
        path={previewMaterial?.archivoPath}
        fallbackUrl={previewMaterial?.archivoUrl}
      />
    </div>
  );
}
