import React, { useState, useEffect, useMemo } from "react";
import { courseService } from "../../services/cursosServices";
import { userService } from "../../services/api";

import {
  Video,
  Clock,
  User,
  Sparkles,
  ExternalLink,
  BookOpen,
  Loader2
} from "lucide-react";

export default function StudentDashboardPage() {
  const [activeMeetModal, setActiveMeetModal] = useState(null);
  const [listaCursosGlobal, setListaCursosGlobal] = useState([]);
  const [estudianteActivo, setEstudianteActivo] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function cargarDatosEstudiante() {
      try {
        setLoading(true);
        setError("");

        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) throw new Error("No se encontró el correo de la sesión.");

        const [cursos, perfil] = await Promise.all([
          courseService.getCourses(),
          userService.getUserByEmail(userEmail)
        ]);

        if (cancelled) return;

        setListaCursosGlobal(cursos || []);
        if (!perfil) throw new Error("No se encontró el perfil del estudiante en InsForge.");
        setEstudianteActivo(perfil);
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar datos del estudiante:", err);
          setError(err.message || "Error al cargar los cursos del estudiante.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    cargarDatosEstudiante();
    return () => { cancelled = true; };
  }, []);

  // Construcción limpia del nombre completo
  const studentName = estudianteActivo
    ? `${estudianteActivo.nombres || ''} ${estudianteActivo.apellidos || ''}`.trim()
    : "Estudiante";

  const carreraObjetivo = estudianteActivo?.carreraObjetivo || "Ingeniería de Sistemas";
  const universidadObjetivo = estudianteActivo?.universidad || "UNI";

  // Cruce de cursosInscritos de la sesión con la lista global del backend
  const misCursosInscritos = useMemo(() => {
    if (!estudianteActivo) return [];

    const inscritos = estudianteActivo.cursosInscritos;
    if (Array.isArray(inscritos) && inscritos.length > 0) {
      const idsInscritos = new Set(
        inscritos.map((c) => (typeof c === "object" && c !== null ? c.id : c))
      );
      const encontrados = (listaCursosGlobal || []).filter(
        (curso) => idsInscritos.has(curso.id) && curso.estado === "Activo"
      );
      if (encontrados.length > 0) return encontrados;
    }

    // Fallback inteligente: Filtrar según su área académica si no hay lista explícita
    if (estudianteActivo.areaAcademica) {
      const porArea = (listaCursosGlobal || []).filter(
        (curso) => curso.estado === "Activo" && (curso.area || "").includes(estudianteActivo.areaAcademica)
      );
      if (porArea.length > 0) return porArea;
    }

    // Si no tiene área académica definida, mostrar catálogo activo
    return (listaCursosGlobal || []).filter((curso) => curso.estado === "Activo");
  }, [estudianteActivo, listaCursosGlobal]);

  const handleJoinMeet = (course) => {
    setActiveMeetModal(course);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {/* BANNER DE BIENVENIDA */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Panel del Estudiante • Sincronizado</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ¡Hola, {studentName}! 🚀
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Bienvenido a tu plataforma de preparación preuniversitaria. Visualiza tus asignaturas y conéctate a tus clases virtuales en vivo.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <span className="text-blue-200 block">Ciclo Académico:</span>
              <strong className="text-white text-sm">{estudianteActivo?.cicloVirtual || estudianteActivo?.ciclovirtual || "Semestral"}</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <span className="text-blue-200 block">Meta Universitaria:</span>
              <strong className="text-white text-sm">{carreraObjetivo} ({universidadObjetivo})</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <span className="text-blue-200 block">Puntualidad General:</span>
              <strong className="text-emerald-300 text-sm">95.0% de Asistencia</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN: MIS CURSOS MATRICULADOS */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Mis Cursos Matriculados
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Accede directamente a tus clases virtuales en vivo con docentes especializados.
            </p>
          </div>
          <span className="text-sm font-semibold px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg self-start sm:self-auto border border-slate-200 dark:border-white/10">
            {misCursosInscritos.length} Materias Asignadas
          </span>
        </div>

        {misCursosInscritos.length === 0 ? (
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center text-slate-500">
            No tienes cursos matriculados o activos en tu perfil.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {misCursosInscritos.map((course) => (
              <div
                key={course.id}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-blue-300"
              >
                <div className="p-5 space-y-3.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md border border-blue-100 dark:border-blue-900/50 uppercase tracking-wide">
                      {course.carrera || carreraObjetivo}
                    </span>
                    <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Activo
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors leading-snug">
                    {course.asignatura}
                  </h3>

                  <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200 pt-1">
                    <div className="flex items-center space-x-2.5">
                      <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <span><strong className="text-slate-900 dark:text-white">Docente:</strong> {course.docente || 'Por asignar'}</span>
                    </div>
                    <div className="flex items-center space-x-2.5">
                      <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                      <span>
                        <strong className="text-slate-900 dark:text-white">Horario:</strong>{' '}
                        {Array.isArray(course.dias) ? course.dias.join(', ') : (course.dias || 'Lunes')} ({course.horaInicio || '08:00'} - {course.horaFin || '10:00'})
                      </span>
                    </div>
                  </div>
                </div>

                <div className="p-5 pt-0">
                  <button
                    type="button"
                    onClick={() => handleJoinMeet(course)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-emerald-600/30 transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer group-hover:scale-[1.01]"
                  >
                    <Video className="w-5 h-5 shrink-0 animate-bounce" />
                    <span className="tracking-wide text-base font-bold">
                      Unirse a Sala Virtual (Meet)
                    </span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* MODAL DE CONEXIÓN VIRTUAL */}
      {activeMeetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-white/10 overflow-hidden text-center p-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
              <Video className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Conectando a Sala Virtual
              </h3>
              <p className="text-base font-bold text-[#1E3A8A] dark:text-blue-400 mt-1">
                {activeMeetModal.asignatura}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Docente a cargo: <strong className="text-slate-900 dark:text-white">{activeMeetModal.docente}</strong>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span className="truncate pr-2">{activeMeetModal.meetUrl || 'https://meet.google.com/'}</span>
              <span className="text-xs bg-emerald-600 text-white font-sans px-2.5 py-1 rounded-md font-bold shrink-0">
                Activa
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => setActiveMeetModal(null)}
                className="w-full py-3 px-4 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
              >
                Regresar
              </button>
              <a
                href={activeMeetModal.meetUrl || 'https://meet.google.com/'}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveMeetModal(null)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <span>Abrir Google Meet</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}