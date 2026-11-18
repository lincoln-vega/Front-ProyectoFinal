import React, { useEffect, useState, useMemo } from "react";
import {
  BookOpen,
  Users,
  AlertCircle,
  Loader2,
  ArrowRightLeft,
  Video,
  ExternalLink,
  Calendar,
  CheckCircle2,
  X,
  FileText,
  Bell,
  Sparkles,
  Clock,
  GraduationCap,
  ChevronRight,
  ShieldCheck,
  TrendingUp
} from "lucide-react";
import { Link } from "react-router-dom";
import { courseService } from "../../services/cursosServices";
import { userService } from "../../services/api";
import { registerMeetEntry } from "../../services/asistencia";
import SolicitudPermutaModal from "../../components/docente/SolicitudPermutaModal";

// Normalización para concordancia de nombres del docente
const normalizeName = (value) => 
  (value || '')
    .toLowerCase()
    .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, '')
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

export default function DocenteDashboardPage() {
  const userName = localStorage.getItem("userName") || "Docente";
  const userId = localStorage.getItem("userId") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [listaCursos, setListaCursos] = useState([]);
  const [totalEstudiantes, setTotalEstudiantes] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [docenteData, setDocenteData] = useState(null);
  const [isPermutaOpen, setIsPermutaOpen] = useState(false);
  const [feedbackNotice, setFeedbackNotice] = useState("");
  const [startingCourseId, setStartingCourseId] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function cargarDatosDashboard() {
      try {
        setLoading(true);
        setError("");
        
        // 1. Cargar cursos desde el servicio
        const cursos = await courseService.getCourses();
        if (cancelled) return;

        setListaCursos(cursos || []);
        const assigned = (cursos || []).filter((course) =>
          course.estado === "Activo" &&
          (course.docenteId === userId ||
           matchesTeacherName(course.docente, userName) ||
           Boolean(userEmail && (course.docente || "").toLowerCase().includes(userEmail.toLowerCase())))
        );

        let studentCount = 0;
        try {
          if (assigned.length > 0) {
            studentCount = await courseService.countStudentsForTeacher(assigned.map((course) => course.id));
          }
        } catch (rpcErr) {
          console.warn("[DocenteDashboard] Conteo vía RPC no disponible o sin permisos:", rpcErr);
        }

        if (!cancelled) {
          setTotalEstudiantes(studentCount);
        }

        // 2. Consultar perfil detallado desde InsForge
        if (userEmail && !cancelled) {
          try {
            const profile = await userService.getUserByEmail(userEmail);
            if (profile) setDocenteData(profile);
          } catch (profileErr) {
            console.warn("[DocenteDashboard] No se pudo obtener perfil detallado:", profileErr);
          }
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar datos del dashboard:", err);
          setError(err.message || "No se pudieron cargar los datos del panel docente.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    cargarDatosDashboard();
    return () => { cancelled = true; };
  }, [userName, userId, userEmail]);

  // Filtrar los cursos asignados al docente activo con estado 'Activo'
  const cursosAsignados = useMemo(() => {
    return listaCursos.filter((course) => {
      if (course.estado !== 'Activo') return false;
      return (
        course.docenteId === userId || 
        matchesTeacherName(course.docente, userName) ||
        Boolean(userEmail && course.docente?.toLowerCase().includes(userEmail.toLowerCase()))
      );
    });
  }, [listaCursos, userId, userName, userEmail]);

  const handleStartClass = async (course) => {
    if (!course?.meetUrl) {
      alert("Este curso no tiene un enlace de Google Meet asignado.");
      return;
    }
    setStartingCourseId(course.id);
    
    // 1. Apertura directa en nueva pestaña (evita bloqueador del navegador)
    window.open(course.meetUrl, "_blank", "noopener,noreferrer");
    setFeedbackNotice(`¡Clase iniciada! Conectando a ${course.asignatura}. Sala de Google Meet abierta.`);

    // 2. Registrar sesión en backend / InsForge en segundo plano
    try {
      await registerMeetEntry(course.id);
    } catch (err) {
      console.warn("[DocenteDashboard] Registro de auditoría Meet:", err);
    } finally {
      setStartingCourseId(null);
    }
  };

  // Temas decorativos de tarjetas para asemejarse a la vista de estudiante V2
  const getCourseTheming = (index) => {
    const themes = [
      { badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", border: "border-blue-200 dark:border-blue-900/40" },
      { badge: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300", border: "border-pink-200 dark:border-pink-900/40" },
      { badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300", border: "border-amber-200 dark:border-amber-900/40" },
      { badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-900/40" },
      { badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", border: "border-purple-200 dark:border-purple-900/40" }
    ];
    return themes[index % themes.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Cargando asignaturas y nómina docente...</p>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <p role="alert" className="rounded-2xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-xs">
          {error}
        </p>
      )}

      {feedbackNotice && (
        <div role="status" className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-md">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-emerald-950 dark:text-emerald-200">
                Operación Exitosa
              </h3>
              <p className="text-xs text-emerald-800 dark:text-emerald-300 mt-0.5">
                {feedbackNotice}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice("")}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-1 rounded-lg"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. HERO BANNER V2 (ESTILO ESTUDIANTE) */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/10">
        <div className="bg-gradient-to-r from-[#0A1128] via-blue-950 to-indigo-900 p-6 sm:p-8 md:p-10 text-white min-h-[220px] flex flex-col justify-between">
          
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="max-w-2xl space-y-2.5">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-white/15 backdrop-blur-md border border-white/20 text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>Ciclo 2026-I • Portal Docente</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                ¡Bienvenido(a), {userName}!
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm md:text-base leading-relaxed">
                Control de clases virtuales en vivo con Google Meet, nómina de alumnos matriculados, tareas calificadas y solicitudes de permuta.
              </p>
            </div>

            {/* Recuadro lateral resumen para docente */}
            <div className="hidden lg:block bg-black/35 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-xs shrink-0 text-xs space-y-2">
              <div className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <ShieldCheck className="w-4 h-4" />
                <span>Estado Pedagógico</span>
              </div>
              <ul className="space-y-1.5 text-slate-200 text-[11px] leading-snug">
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Asistencia sincronizada en tiempo real con InsForge.</span>
                </li>
                <li className="flex items-start gap-1.5">
                  <span className="text-amber-400 font-bold">•</span>
                  <span>Módulo de permutas conectado con Dirección Académica.</span>
                </li>
              </ul>
            </div>
          </div>

          {/* Footer del Banner con Botones de Acción */}
          <div className="relative z-10 pt-5 flex flex-wrap items-center justify-between gap-3 border-t border-white/10 mt-4">
            <div className="flex flex-wrap items-center gap-2.5">
              <button
                type="button"
                onClick={() => setIsPermutaOpen(true)}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-2.5 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer flex items-center gap-2"
              >
                <ArrowRightLeft className="w-4 h-4" />
                <span>+ Solicitar Permuta / Reemplazo</span>
              </button>

              <Link
                to="/docente/horarios"
                className="bg-white/15 hover:bg-white/25 text-white font-bold text-xs sm:text-sm px-4 py-2.5 rounded-xl border border-white/20 backdrop-blur-md transition-colors flex items-center gap-2"
              >
                <Calendar className="w-4 h-4 text-blue-200" />
                <span>Ver Mi Horario Semanal</span>
              </Link>
            </div>

            <span className="text-[11px] font-mono text-blue-200/80">
              Semana 4 • Clases en Vivo
            </span>
          </div>
        </div>
      </section>

      {/* 2. TARJETAS MÉTRICAS V2 */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Cursos Asignados */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-white/10 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-50 dark:bg-blue-950/60 rounded-xl text-blue-600 dark:text-blue-400">
            <BookOpen className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Cursos Asignados
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {cursosAsignados.length}
            </p>
          </div>
        </div>

        {/* Total Estudiantes Matriculados */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-white/10 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/60 rounded-xl text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Alumnos a Cargo
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {totalEstudiantes}
            </p>
          </div>
        </div>

        {/* Clases con Google Meet */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-white/10 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/60 rounded-xl text-indigo-600 dark:text-indigo-400">
            <Video className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Salas Virtuales
            </p>
            <p className="text-2xl font-black text-slate-900 dark:text-white mt-0.5">
              {cursosAsignados.filter(c => c.meetUrl).length}
            </p>
          </div>
        </div>

        {/* Modalidad de Asistencia */}
        <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-white/10 p-5 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-50 dark:bg-amber-950/60 rounded-xl text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
              Auditoría Meet
            </p>
            <p className="text-sm font-extrabold text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Sincronizada
            </p>
          </div>
        </div>
      </section>

      {/* 3. CATÁLOGO DE CURSOS ASIGNADOS Y ACCESO EN VIVO */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-slate-200 dark:border-white/10">
          <div>
            <h3 className="text-xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
              <BookOpen className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <span>Mis Asignaturas y Clases en Vivo</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Inicia sesión en Google Meet para registrar tu asistencia docente o accede al panel de nómina y tareas.
            </p>
          </div>

          <Link
            to="/docente/cursos"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1 self-start sm:self-auto"
          >
            <span>Ver detalle completo</span>
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>

        {cursosAsignados.length === 0 ? (
          <div className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-white/10 p-10 text-center space-y-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 mx-auto flex items-center justify-center">
              <AlertCircle className="w-6 h-6" />
            </div>
            <h4 className="text-base font-extrabold text-slate-900 dark:text-white">
              No tienes cursos activos asignados
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 max-w-md mx-auto">
              Si crees que esto es un error, por favor comunícate con la Coordinación Académica o verifica tus horarios asignados.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {cursosAsignados.map((course, idx) => {
              const theme = getCourseTheming(idx);
              const diasText = Array.isArray(course.dias) ? course.dias.join(", ") : course.dias;

              return (
                <div
                  key={course.id}
                  className={`bg-white dark:bg-slate-900/90 rounded-2xl border ${theme.border} p-5 shadow-xs hover:shadow-md transition-all flex flex-col justify-between group`}
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${theme.badge}`}>
                        {course.area || "Área General"}
                      </span>
                      <span className="text-[11px] font-mono text-slate-400 font-semibold">
                        {course.id}
                      </span>
                    </div>

                    <div>
                      <h4 className="text-base font-black text-slate-900 dark:text-white leading-snug group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {course.asignatura}
                      </h4>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-center gap-1.5">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{diasText}</span>
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1.5 mt-0.5">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{course.horaInicio} - {course.horaFin}</span>
                      </p>
                    </div>
                  </div>

                  <div className="mt-5 pt-4 border-t border-slate-100 dark:border-white/5 space-y-2">
                    <button
                      type="button"
                      onClick={() => handleStartClass(course)}
                      disabled={startingCourseId === course.id}
                      className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                    >
                      {startingCourseId === course.id ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Video className="w-4 h-4" />
                      )}
                      <span>Iniciar Clase (Google Meet)</span>
                    </button>

                    <Link
                      to={`/docente/cursos`}
                      className="w-full text-center text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/5 text-slate-700 dark:text-slate-200 transition-colors flex items-center justify-center gap-1.5"
                    >
                      <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                      <span>Gestionar Tareas y Nómina</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </section>

      {/* 4. INFORMACIÓN DE PERFIL DOCENTE Y NÓMINA */}
      {docenteData && (
        <section className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-white/10 p-6 shadow-xs">
          <div className="flex items-center space-x-2.5 mb-4 pb-3 border-b border-slate-100 dark:border-white/5">
            <GraduationCap className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
              Ficha del Docente e Incidencias Registradas
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs">
            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Especialidad</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block">
                {docenteData.especialidad || docenteData.carreraObjetivo || "Docencia Preuniversitaria"}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Correo Institucional</span>
              <span className="text-sm font-bold text-slate-900 dark:text-white mt-0.5 block truncate">
                {docenteData.correo || userEmail}
              </span>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
              <span className="text-slate-500 dark:text-slate-400 block font-semibold">Nómina Base Referencial</span>
              <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400 mt-0.5 block">
                S/ {(docenteData.salario || 1800).toFixed(2)}
              </span>
            </div>
          </div>
        </section>
      )}

      {/* MODAL DE SOLICITUD DE PERMUTA */}
      <SolicitudPermutaModal
        isOpen={isPermutaOpen}
        onClose={() => setIsPermutaOpen(false)}
        onSuccess={() => {
          setFeedbackNotice("Tu solicitud de permuta / reemplazo ha sido enviada al área académica satisfactoriamente.");
          setIsPermutaOpen(false);
        }}
        currentTeacherName={userName}
      />
    </div>
  );
}
