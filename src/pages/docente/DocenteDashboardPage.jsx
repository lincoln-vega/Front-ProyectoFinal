import React, { useEffect, useState, useMemo } from "react";
import { BookOpen, Users, AlertCircle, Loader2, ArrowRightLeft, Video, ExternalLink, Calendar, CheckCircle2, X } from "lucide-react";
import { Link } from "react-router-dom";
import { courseService } from "../../services/cursosServices";
import { userService } from "../../services/api";
import { registerMeetEntry } from "../../services/asistencia";
import SolicitudPermutaModal from "../../components/docente/SolicitudPermutaModal";

// Función de normalización para asegurar la coincidencia exacta del docente
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

        // 2. Consultar datos de perfil desde InsForge
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
    
    // 1. Apertura directa en nueva pestaña (evita bloqueador)
    window.open(course.meetUrl, "_blank", "noopener,noreferrer");
    setFeedbackNotice(`¡Clase iniciada! Conectando a ${course.asignatura}. Sala de Google Meet abierta.`);

    // 2. Registrar sesión en InsForge en segundo plano
    try {
      await registerMeetEntry(course.id);
    } catch (err) {
      console.warn("[DocenteDashboard] Registro de entrada en segundo plano:", err);
    } finally {
      setStartingCourseId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6 animate-fade-in">
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {feedbackNotice && (
        <div role="status" className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/30 rounded-2xl p-4 flex items-start justify-between gap-4 shadow-md">
          <div className="flex items-start space-x-3">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-emerald-950 dark:text-emerald-200">
                Operación Exitosa
              </h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-0.5">
                {feedbackNotice}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setFeedbackNotice("")}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-900 p-1 rounded-lg"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* BANNER PRINCIPAL CON ACCIÓN RÁPIDA DE PERMUTA */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">¡Bienvenido(a), {userName}!</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Este es tu panel de control principal. Aquí podrás ver un resumen de tus clases, nómina e incidencias.
          </p>
        </div>
        <button
          type="button"
          onClick={() => setIsPermutaOpen(true)}
          className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 text-white text-sm font-bold rounded-xl shadow-md transition-all self-start md:self-auto cursor-pointer"
        >
          <ArrowRightLeft className="w-4 h-4" />
          <span>+ Solicitar Permuta / Reemplazo</span>
        </button>
      </div>

      {/* TARJETAS MÉTRICAS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Tarjeta de Cursos Asignados (Dinámico) */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <BookOpen className="w-6 h-6"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cursos Asignados</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{cursosAsignados.length}</p>
          </div>
        </div>

        {/* Tarjeta de Total Estudiantes Matriculados (Dinámico) */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Estudiantes</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalEstudiantes}</p>
          </div>
        </div>

        {/* Tarjeta de Incidencias */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Incidencias</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
          </div>
        </div>
      </div>

      {/* SECCIÓN ACCESO RÁPIDO A CLASES Y GOOGLE MEET */}
      <section className="space-y-4">
        <div className="flex items-center justify-between border-b border-slate-200 dark:border-white/10 pb-3">
          <div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <Video className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <span>Mis Clases Asignadas • Iniciar Sala Virtual</span>
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Haz clic en Iniciar Clase para abrir tu sala de Meet y comenzar el registro de asistencia.
            </p>
          </div>
          <Link
            to="/docente/cursos"
            className="text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
          >
            <span>Ver todos los cursos</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </Link>
        </div>

        {cursosAsignados.length === 0 ? (
          <div className="bg-white/60 dark:bg-white/5 p-6 rounded-2xl border border-slate-200 dark:border-white/10 text-center text-slate-500 text-sm">
            No tienes cursos activos asignados actualmente.
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {cursosAsignados.map((course) => (
              <div
                key={course.id}
                className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl border border-slate-200 dark:border-white/10 p-5 flex flex-col justify-between shadow-xs hover:shadow-md transition-all"
              >
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-md bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                      {course.area || "General"}
                    </span>
                    <span className="text-xs font-semibold text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                      Activo
                    </span>
                  </div>
                  <h4 className="text-base font-bold text-slate-900 dark:text-white leading-snug">
                    {course.asignatura}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                    Horario: {Array.isArray(course.dias) ? course.dias.join(", ") : course.dias} ({course.horaInicio} - {course.horaFin})
                  </p>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => handleStartClass(course)}
                    disabled={startingCourseId === course.id}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl shadow-sm text-xs flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
                  >
                    {startingCourseId === course.id ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Video className="w-4 h-4" />
                    )}
                    <span>Iniciar Clase en Google Meet</span>
                  </button>
                  <Link
                    to="/docente/cursos"
                    className="w-full text-center text-xs font-bold py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-100/70 dark:bg-white/5 hover:bg-indigo-50 dark:hover:bg-indigo-950/40 text-slate-700 dark:text-slate-200 hover:text-indigo-600 dark:hover:text-indigo-400 hover:border-indigo-300 dark:hover:border-indigo-700 transition-all flex items-center justify-center gap-1.5 shadow-2xs"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                    <span>Gestionar Asistencia e Historial</span>
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* INFORMACIÓN DE NÓMINA */}
      {docenteData && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Información de Nómina e Incidencias</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Especialidad</span>
              <span className="font-semibold dark:text-slate-200">{docenteData.especialidad}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Nómina Base (S/)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">S/ {docenteData.salario.toFixed(2)}</span>
            </div>
            <div className="py-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium mb-2 block">Historial de Incidencias:</span>
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No tienes incidencias registradas.</p>
            </div>
          </div>
        </div>
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
