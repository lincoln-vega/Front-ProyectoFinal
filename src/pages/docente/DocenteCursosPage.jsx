import React, { useEffect, useMemo, useState } from "react";
import { BookOpen, Loader2, Video } from "lucide-react";
import CursoDetalleView from "./DocenteCursosDetalles";
import { courseService } from "../../services/cursosServices";
import { getCurrentSessionProfile } from "../../services/session";

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

  if (cursoSeleccionado) {
    return <CursoDetalleView cursoId={cursoSeleccionado.id} onVolver={() => setCursoSeleccionado(null)} />;
  }

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold dark:text-white">Mis Cursos</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">Cursos activos asignados desde InsForge.</p>
      </div>
      {error && <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">{error}</div>}
      {!error && cursosFiltrados.length === 0 ? (
        <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border border-white/40 bg-white/60 p-8 shadow-2xl dark:border-white/10 dark:bg-white/5">
          <BookOpen className="mb-4 h-16 w-16 text-slate-400" />
          <h3 className="text-xl font-semibold">No hay cursos asignados</h3>
          <p className="mt-2 text-center text-slate-500">No se encontraron cursos activos asignados a tu sesión.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cursosFiltrados.map((curso) => (
            <button key={curso.id} type="button" onClick={() => setCursoSeleccionado(curso)} className="flex flex-col justify-between rounded-3xl border border-white/40 bg-white/70 p-5 text-left shadow-xl transition-all hover:border-indigo-500/50 dark:border-slate-800 dark:bg-slate-900/80">
              <div>
                <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-indigo-600">{curso.area || "Sin área"}</span>
                <h3 className="mt-3 text-base font-bold dark:text-white">{curso.asignatura}</h3>
                <p className="mt-3 text-sm text-slate-600 dark:text-slate-300">Docente: <strong>{curso.docente}</strong></p>
              </div>
              <div className="mt-5 flex items-center justify-between border-t border-slate-200 pt-4 text-xs dark:border-slate-800">
                <span className="text-slate-500">{Array.isArray(curso.dias) ? curso.dias.join(", ") : curso.dias} · {curso.horaInicio} - {curso.horaFin}</span>
                <span className="inline-flex items-center gap-1 rounded-xl bg-emerald-600 px-3.5 py-2 font-bold text-white shadow-sm group-hover:bg-emerald-700 transition-colors"><Video className="h-4 w-4" /> Iniciar Clase / Asistencia</span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
