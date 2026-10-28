import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Video, Clock, ExternalLink, Calendar, ChevronRight } from "lucide-react";
import CursoDetalleView from "./DocenteCursosDetalles";
import { courseService } from "../../services/cursosServices";
import { getCurrentSessionProfile } from "../../services/session";
import { registerMeetEntry } from "../../services/asistencia";

const normalizeName = (value) => String(value || "")
  .toLowerCase()
  .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, "")
  .trim();

const matchesTeacherName = (courseName, userName) => {
  const assignedTeacher = normalizeName(courseName);
  const loggedInTeacher = normalizeName(userName);
  return assignedTeacher && (
    assignedTeacher === loggedInTeacher ||
    assignedTeacher.startsWith(`${loggedInTeacher} `) ||
    loggedInTeacher.startsWith(`${assignedTeacher} `)
  );
};

export default function DocenteCursosPage() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);
  const [listaCursos, setListaCursos] = useState([]);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [startingCourseId, setStartingCourseId] = useState(null);

  useEffect(() => {
    let cancelled = false;
    async function loadCourses() {
      try {
        setLoading(true);
        setError("");
        const [{ profile: currentProfile }, courses] = await Promise.all([
          getCurrentSessionProfile(),
          courseService.getCourses()
        ]);
        if (!cancelled) {
          setProfile(currentProfile);
          setListaCursos(courses || []);
        }
      } catch (err) {
        if (!cancelled) setError(err.message || "No se pudieron cargar los cursos desde InsForge.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadCourses();
    return () => { cancelled = true; };
  }, []);

  const cursosFiltrados = useMemo(() => {
    if (!profile) return [];
    const fullName = `${profile.nombres || ""} ${profile.apellidos || ""}`.trim();
    return listaCursos.filter((course) => (
      course.estado === "Activo" &&
      (course.docenteId === profile.id || matchesTeacherName(course.docente, fullName))
    ));
  }, [listaCursos, profile]);

  const handleStartMeet = async (curso) => {
    if (!curso?.meetUrl) {
      alert("El curso no tiene un enlace de Google Meet configurado.");
      return;
    }
    setStartingCourseId(curso.id);
    window.open(curso.meetUrl, "_blank", "noopener,noreferrer");
    try {
      await registerMeetEntry(curso.id);
    } catch (err) {
      console.warn("Registro de entrada en segundo plano:", err);
    } finally {
      setStartingCourseId(null);
    }
  };

  if (cursoSeleccionado) {
    return <CursoDetalleView cursoId={cursoSeleccionado.id} onVolver={() => setCursoSeleccionado(null)} />;
  }

  if (loading) {
    return (
      <div className="flex min-h-[400px] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Mis Cursos Asignados</h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Administra tus asignaturas, inicia tus clases virtuales en Google Meet y consulta el historial de asistencia.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 self-start sm:self-auto">
          {cursosFiltrados.length} Cursos Activos
        </span>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {!error && cursosFiltrados.length === 0 ? (
        <div className="flex min-h-[350px] flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/60 p-8 shadow-xl dark:border-white/10 dark:bg-white/5 text-center">
          <BookOpen className="mb-4 h-16 w-16 text-slate-400" />
          <h3 className="text-xl font-bold text-slate-800 dark:text-white">No hay cursos asignados</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-md">
            No se encontraron cursos activos asignados a tu cuenta docente en InsForge.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cursosFiltrados.map((curso) => (
            <div
              key={curso.id}
              className="flex flex-col justify-between rounded-3xl border border-white/50 bg-white/80 p-5 shadow-lg hover:shadow-2xl hover:border-indigo-300 dark:border-white/10 dark:bg-slate-900/80 transition-all duration-200 group"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="rounded-md bg-indigo-500/10 dark:bg-indigo-950/60 px-2.5 py-1 text-[10px] font-extrabold uppercase tracking-wide text-indigo-700 dark:text-indigo-300 border border-indigo-200/50 dark:border-indigo-800/40">
                    {curso.area || "General"}
                  </span>
                  <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    Activo
                  </span>
                </div>

                <h3 className="text-lg font-extrabold text-slate-900 dark:text-white group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors leading-snug">
                  {curso.asignatura}
                </h3>
                
                <p className="mt-2 text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Docente: <strong className="text-slate-700 dark:text-slate-200">{curso.docente}</strong>
                </p>

                <div className="mt-3 flex items-center gap-1.5 text-xs text-slate-600 dark:text-slate-300 bg-slate-50 dark:bg-white/5 p-2.5 rounded-xl border border-slate-100 dark:border-white/5">
                  <Clock className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                  <span className="font-mono text-[11px] truncate">
                    {Array.isArray(curso.dias) ? curso.dias.join(", ") : curso.dias} · {curso.horaInicio} - {curso.horaFin}
                  </span>
                </div>
              </div>

              {/* Botones de Acción Claramente Diferenciados */}
              <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/10 flex flex-col gap-2">
                <button
                  type="button"
                  onClick={() => handleStartMeet(curso)}
                  disabled={startingCourseId === curso.id}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl shadow-md text-xs flex items-center justify-center gap-2 cursor-pointer transition-all hover:scale-[1.01] active:scale-[0.99]"
                >
                  {startingCourseId === curso.id ? (
                    <Loader2 className="w-4 h-4 animate-spin" />
                  ) : (
                    <Video className="w-4 h-4" />
                  )}
                  <span>Iniciar Clase en Google Meet</span>
                </button>

                <button
                  type="button"
                  onClick={() => setCursoSeleccionado(curso)}
                  className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-2xs cursor-pointer"
                >
                  <BookOpen className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500" />
                  <span>Ver Asistencia e Historial</span>
                  <ChevronRight className="w-3.5 h-3.5 ml-auto text-slate-400" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
