import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  ArrowLeft,
  BookOpen,
  Calendar,
  Clock,
  Loader2,
  LogIn,
  LogOut,
  Video,
  RefreshCw,
  FileText,
  PlusCircle,
  Trash2,
  Bell,
  Users,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  GraduationCap,
  MessageSquare,
  Sparkles,
  X
} from "lucide-react";
import { courseService } from "../../services/cursosServices";
import { userService } from "../../services/api";
import { getMeetAttendanceHistory, registerMeetEntry, registerMeetExit } from "../../services/asistencia";
import { academicActivitiesService } from "../../services/academicActivitiesService";

const validMeetUrl = (value) => {
  try {
    const url = new URL(value);
    return url.protocol === "https:" && url.hostname.length > 0;
  } catch {
    return false;
  }
};

const getAttendanceState = (record) => {
  if (!record) return "Sin registro";
  const status = String(record.estado || "").toLowerCase();
  if (status.includes("progreso") || status.includes("active") || status.includes("activo")) return "Sesión en progreso";
  if (record.salida || status.includes("final")) return "Sesión finalizada";
  return "Sin registro";
};

const formatDateTime = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("es-PE");
};

export default function DocenteCursosDetalles({ cursoId, onVolver }) {
  const [activeTab, setActiveTab] = useState("clase"); // "clase" | "tareas" | "anuncios" | "alumnos"
  const [curso, setCurso] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Estados para Tareas y Anuncios
  const [tasks, setTasks] = useState([]);
  const [announcements, setAnnouncements] = useState([]);
  const [enrolledStudents, setEnrolledStudents] = useState([]);
  const [isTaskModalOpen, setIsTaskModalOpen] = useState(false);
  const [isAnnModalOpen, setIsAnnModalOpen] = useState(false);

  // Formulario nueva tarea
  const [newTaskData, setNewTaskData] = useState({
    titulo: "",
    tipo: "Tarea Calificada",
    fechaLimite: "Próximo Lunes, 11:59 PM",
    puntos: "20 pts",
    descripcion: ""
  });

  // Formulario nuevo anuncio
  const [newAnnData, setNewAnnData] = useState({
    titulo: "",
    prioridad: "Normal",
    contenido: ""
  });

  const loadAttendance = useCallback(async () => {
    const records = await getMeetAttendanceHistory(cursoId);
    setHistory(records);
  }, [cursoId]);

  const loadCourseData = useCallback(async () => {
    try {
      setLoading(true);
      setError("");
      const [courses, users] = await Promise.all([
        courseService.getCourses(),
        userService.getUsers().catch(() => [])
      ]);

      const foundCourse = courses.find((item) => item.id === cursoId) || null;
      setCurso(foundCourse);

      // Cargar tareas y anuncios de este curso
      setTasks(academicActivitiesService.getTasksByCourse(cursoId));
      setAnnouncements(academicActivitiesService.getAnnouncementsByCourse(cursoId));

      // Filtrar estudiantes matriculados en este curso
      const students = (users || []).filter((u) => {
        const isStudent = String(u.rol || "").toLowerCase() === "estudiante";
        if (!isStudent) return false;
        
        // Verificar si tiene el curso en cursosInscritos
        const inscritos = u.cursosInscritos || [];
        const hasDirectEnrollment = inscritos.some((c) => {
          const id = typeof c === "object" && c !== null ? c.id : c;
          return id === cursoId;
        });

        if (hasDirectEnrollment) return true;

        // O si coincide con el área académica del curso
        if (foundCourse?.area && u.areaAcademica) {
          return foundCourse.area.includes(u.areaAcademica) || u.areaAcademica.includes(foundCourse.area);
        }

        return false;
      });

      // Si no hay específicos, mostrar una lista representativa de estudiantes del ciclo
      if (students.length > 0) {
        setEnrolledStudents(students);
      } else {
        const generalStudents = (users || []).filter(
          (u) => String(u.rol || "").toLowerCase() === "estudiante"
        );
        setEnrolledStudents(generalStudents.slice(0, 8));
      }

      await loadAttendance();
    } catch (err) {
      setError(err.message || "No se pudo cargar el curso y su información.");
    } finally {
      setLoading(false);
    }
  }, [cursoId, loadAttendance]);

  useEffect(() => {
    loadCourseData();
  }, [loadCourseData]);

  const activeSession = useMemo(
    () => history.find((record) => getAttendanceState(record) === "Sesión en progreso") || null,
    [history]
  );
  const latestSession = activeSession || history[0] || null;
  const state = getAttendanceState(latestSession);

  const refreshHistory = async () => {
    setError("");
    try {
      await loadAttendance();
    } catch (err) {
      setError(err.message || "No se pudo actualizar el historial.");
    }
  };

  const handleEntry = async () => {
    if (action || activeSession) return;
    setAction("entry");
    setError("");
    setNotice("");
    try {
      const record = await registerMeetEntry(cursoId);
      await loadAttendance();
      setNotice("Entrada registrada correctamente en Google Meet e InsForge.");
      const meetUrl = record?.meetUrl || curso?.meetUrl;
      if (validMeetUrl(meetUrl)) window.open(meetUrl, "_blank", "noopener,noreferrer");
    } catch (err) {
      setError(err.message);
    } finally {
      setAction("");
    }
  };

  const handleExit = async () => {
    if (action || !activeSession) return;
    if (!window.confirm("¿Confirmas que deseas registrar la salida de esta sesión?")) return;
    setAction("exit");
    setError("");
    setNotice("");
    try {
      await registerMeetExit(cursoId);
      await loadAttendance();
      setNotice("Salida registrada con éxito. Minutos efectivos contabilizados para la nómina.");
    } catch (err) {
      setError(err.message);
    } finally {
      setAction("");
    }
  };

  // Creación de nueva tarea
  const handleCreateTask = (e) => {
    e.preventDefault();
    if (!newTaskData.titulo.trim()) {
      alert("Por favor ingresa el título de la tarea.");
      return;
    }

    const created = academicActivitiesService.createTask({
      cursoId: curso.id,
      curso: curso.asignatura,
      tipo: newTaskData.tipo,
      titulo: newTaskData.titulo.trim(),
      fechaLimite: newTaskData.fechaLimite.trim(),
      puntos: newTaskData.puntos.trim(),
      descripcion: newTaskData.descripcion.trim() || "Desarrollar y subir la resolución en PDF.",
      docente: curso.docente || localStorage.getItem("userName") || "Docente"
    });

    setTasks(academicActivitiesService.getTasksByCourse(cursoId));
    setIsTaskModalOpen(false);
    setNewTaskData({
      titulo: "",
      tipo: "Tarea Calificada",
      fechaLimite: "Próximo Lunes, 11:59 PM",
      puntos: "20 pts",
      descripcion: ""
    });
    setNotice(`Tarea "${created.titulo}" publicada exitosamente para los estudiantes.`);
  };

  const handleDeleteTask = (taskId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta tarea?")) return;
    const updated = academicActivitiesService.deleteTask(taskId);
    setTasks(updated.filter((t) => t.cursoId === cursoId));
    setNotice("Tarea eliminada correctamente.");
  };

  // Creación de nuevo anuncio
  const handleCreateAnnouncement = (e) => {
    e.preventDefault();
    if (!newAnnData.titulo.trim() || !newAnnData.contenido.trim()) {
      alert("Por favor completa el título y el mensaje del anuncio.");
      return;
    }

    const created = academicActivitiesService.createAnnouncement({
      cursoId: curso.id,
      curso: curso.asignatura,
      titulo: newAnnData.titulo.trim(),
      prioridad: newAnnData.prioridad,
      contenido: newAnnData.contenido.trim(),
      docente: curso.docente || localStorage.getItem("userName") || "Docente"
    });

    setAnnouncements(academicActivitiesService.getAnnouncementsByCourse(cursoId));
    setIsAnnModalOpen(false);
    setNewAnnData({
      titulo: "",
      prioridad: "Normal",
      contenido: ""
    });
    setNotice(`Anuncio "${created.titulo}" publicado en el muro del curso.`);
  };

  const handleDeleteAnnouncement = (annId) => {
    if (!window.confirm("¿Estás seguro de eliminar este anuncio?")) return;
    const updated = academicActivitiesService.deleteAnnouncement(annId);
    setAnnouncements(updated.filter((a) => a.cursoId === cursoId));
    setNotice("Anuncio eliminado correctamente.");
  };

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="h-10 w-10 animate-spin text-indigo-600" />
        <p className="text-sm font-semibold text-slate-500">Cargando gestión integral del curso...</p>
      </div>
    );
  }

  if (!curso) {
    return (
      <div className="space-y-6">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline cursor-pointer"
        >
          <ArrowLeft className="h-4 w-4" /> Volver a mis cursos
        </button>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700">
          <BookOpen className="mx-auto mb-4 h-12 w-12" />
          <h3 className="text-xl font-semibold">Curso no encontrado</h3>
          <p className="mt-2">El curso no existe o no se encuentra asignado a tu cuenta docente.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fade-in">
      
      {/* BOTÓN VOLVER Y HEADER DEL CURSO */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer self-start"
        >
          <ArrowLeft className="h-4 w-4" />
          <span>Volver a Mis Cursos</span>
        </button>

        <span className="text-xs font-mono text-slate-500 dark:text-slate-400">
          Código: <strong className="text-indigo-600 dark:text-indigo-400">{curso.id}</strong> • Ciclo Intensivo 2026-I
        </span>
      </div>

      {/* BANNER PRINCIPAL DEL CURSO */}
      <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-indigo-50 dark:bg-indigo-950/60 px-3 py-1 text-xs font-extrabold uppercase text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-800/60">
                {curso.area || "Área General"}
              </span>
              <span className="text-xs font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-800 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                Curso Activo
              </span>
            </div>

            <h1 className="mt-2.5 text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              {curso.asignatura}
            </h1>
            <p className="mt-1 text-xs sm:text-sm text-slate-500 dark:text-slate-400">
              Docente a cargo: <strong className="text-slate-800 dark:text-slate-200">{curso.docente}</strong> • Carrera objetivo: {curso.carrera || "Ingeniería / Ciencias"}
            </p>
          </div>

          {/* Acceso Rápido a Google Meet */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              disabled={Boolean(activeSession || action || !validMeetUrl(curso.meetUrl))}
              onClick={handleEntry}
              className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:cursor-not-allowed disabled:opacity-50"
            >
              {action === "entry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Video className="h-4 w-4" />}
              <span>Iniciar Clase en Google Meet</span>
            </button>
            {activeSession && (
              <button
                type="button"
                disabled={Boolean(action)}
                onClick={handleExit}
                className="inline-flex items-center gap-2 rounded-xl bg-rose-600 hover:bg-rose-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                {action === "exit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
                <span>Registrar Salida</span>
              </button>
            )}
          </div>
        </div>

        {notice && (
          <div role="status" className="mt-4 rounded-xl border border-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 p-3 text-xs font-bold text-emerald-800 dark:text-emerald-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{notice}</span>
            </div>
            <button type="button" onClick={() => setNotice("")} className="cursor-pointer text-emerald-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {error && (
          <div role="alert" className="mt-4 rounded-xl border border-red-300 bg-red-50 dark:bg-red-950/40 p-3 text-xs font-bold text-red-700 dark:text-red-300 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-red-600" />
              <span>{error}</span>
            </div>
            <button type="button" onClick={() => setError("")} className="cursor-pointer text-red-700">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>

      {/* PESTAÑAS DE GESTIÓN DEL CURSO V2.0 */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-200 dark:border-white/10 pb-2">
        <button
          type="button"
          onClick={() => setActiveTab("clase")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "clase"
              ? "bg-[#1E3A8A] text-white shadow-sm dark:bg-blue-600"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Video className="w-4 h-4" />
          <span>Sala Virtual & Asistencia</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("tareas")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "tareas"
              ? "bg-[#1E3A8A] text-white shadow-sm dark:bg-blue-600"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <FileText className="w-4 h-4" />
          <span>Tareas & Evaluaciones ({tasks.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("anuncios")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "anuncios"
              ? "bg-[#1E3A8A] text-white shadow-sm dark:bg-blue-600"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Bell className="w-4 h-4" />
          <span>Tablón de Anuncios ({announcements.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("alumnos")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "alumnos"
              ? "bg-[#1E3A8A] text-white shadow-sm dark:bg-blue-600"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumnos Matriculados ({enrolledStudents.length})</span>
        </button>
      </div>

      {/* CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}

      {/* 1. PESTAÑA: SALA VIRTUAL Y ASISTENCIA */}
      {activeTab === "clase" && (
        <div className="space-y-6">
          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <h3 className="mb-4 text-base font-extrabold flex items-center gap-2">
              <Clock className="w-5 h-5 text-indigo-600" />
              <span>Estado Actual de la Sesión: {state}</span>
            </h3>

            {latestSession && (
              <div className="grid gap-4 text-xs sm:text-sm md:grid-cols-3 bg-slate-50 dark:bg-white/5 p-4 rounded-2xl border border-slate-100 dark:border-white/5">
                <div>
                  <span className="text-slate-400 block text-xs">Entrada Registrada:</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">{formatDateTime(latestSession.entrada)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Salida Registrada:</span>
                  <strong className="text-slate-800 dark:text-slate-100 font-mono">{formatDateTime(latestSession.salida)}</strong>
                </div>
                <div>
                  <span className="text-slate-400 block text-xs">Minutos Efectivos:</span>
                  <strong className="text-emerald-600 dark:text-emerald-400 font-mono text-base">{latestSession.minutosEfectivos ?? "—"} min</strong>
                </div>
              </div>
            )}
          </div>

          <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm">
            <div className="mb-4 flex items-center justify-between">
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                Historial de Clases Dictadas
              </h3>
              <button
                type="button"
                onClick={refreshHistory}
                disabled={Boolean(action)}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 transition-all cursor-pointer disabled:opacity-50"
              >
                <RefreshCw className="h-3.5 w-3.5" />
                <span>Actualizar Historial</span>
              </button>
            </div>

            {history.length === 0 ? (
              <p className="text-sm text-slate-400 py-6 text-center">No hay registros de clases anteriores.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs sm:text-sm">
                  <thead>
                    <tr className="border-b border-slate-200 dark:border-white/10 text-xs uppercase text-slate-400">
                      <th className="p-3">Fecha</th>
                      <th className="p-3">Entrada</th>
                      <th className="p-3">Salida</th>
                      <th className="p-3">Estado</th>
                      <th className="p-3">Minutos Efectivos</th>
                    </tr>
                  </thead>
                  <tbody>
                    {history.map((record, index) => (
                      <tr key={record.id || index} className="border-b border-slate-100 dark:border-white/5 hover:bg-slate-50 dark:hover:bg-white/5">
                        <td className="p-3 font-mono">{formatDateTime(record.fecha || record.created_at)}</td>
                        <td className="p-3 font-mono">{formatDateTime(record.entrada)}</td>
                        <td className="p-3 font-mono">{formatDateTime(record.salida)}</td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300">
                            {getAttendanceState(record)}
                          </span>
                        </td>
                        <td className="p-3 font-bold text-emerald-600 dark:text-emerald-400">
                          {record.minutosEfectivos ?? "—"} min
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {/* 2. PESTAÑA: TAREAS Y EVALUACIONES */}
      {activeTab === "tareas" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Gestión de Tareas y Evaluaciones
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Crea tareas, talleres prácticos o simulacros que se reflejarán dinámicamente en el panel de tus alumnos.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsTaskModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Crear Nueva Tarea</span>
            </button>
          </div>

          {tasks.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center text-slate-400 space-y-2">
              <FileText className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm">No has publicado tareas para este curso todavía.</p>
              <p className="text-xs">Haz clic en "+ Crear Nueva Tarea" para asignar la primera práctica a tus alumnos.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {tasks.map((task) => (
                <div
                  key={task.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between space-y-3"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {task.tipo}
                      </span>
                      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2.5 py-0.5 rounded-full">
                        {task.puntos}
                      </span>
                    </div>

                    <h4 className="text-base font-extrabold text-slate-900 dark:text-white leading-snug">
                      {task.titulo}
                    </h4>
                    <p className="text-xs text-slate-600 dark:text-slate-300 mt-2 line-clamp-2">
                      {task.descripcion}
                    </p>
                  </div>

                  <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                    <span className="text-slate-500 font-mono flex items-center gap-1">
                      <Clock className="w-3.5 h-3.5" />
                      {task.fechaLimite}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleDeleteTask(task.id)}
                      className="p-1.5 text-rose-500 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-lg transition-colors cursor-pointer"
                      title="Eliminar tarea"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 3. PESTAÑA: TABLÓN DE ANUNCIOS */}
      {activeTab === "anuncios" && (
        <div className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Tablón de Comunicados y Avisos
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Publica orientaciones, recordatorios de clase y materiales adicionales para toda la sala.
              </p>
            </div>
            <button
              type="button"
              onClick={() => setIsAnnModalOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md cursor-pointer transition-all self-start sm:self-auto"
            >
              <PlusCircle className="w-4 h-4" />
              <span>+ Publicar Anuncio</span>
            </button>
          </div>

          {announcements.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-slate-200 dark:border-white/10 text-center text-slate-400 space-y-2">
              <Bell className="w-10 h-10 mx-auto text-slate-300 dark:text-slate-600" />
              <p className="font-bold text-sm">No hay anuncios publicados en este curso.</p>
              <p className="text-xs">Usa "+ Publicar Anuncio" para enviar un mensaje formal a tus alumnos.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {announcements.map((ann) => (
                <div
                  key={ann.id}
                  className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-xs space-y-2"
                >
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        ann.prioridad === "Urgente"
                          ? "bg-rose-100 text-rose-700 border border-rose-300"
                          : ann.prioridad === "Importante"
                          ? "bg-amber-100 text-amber-700 border border-amber-300"
                          : "bg-blue-100 text-blue-700 border border-blue-300"
                      }`}>
                        {ann.prioridad}
                      </span>
                      <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                        {ann.titulo}
                      </h4>
                    </div>

                    <button
                      type="button"
                      onClick={() => handleDeleteAnnouncement(ann.id)}
                      className="text-slate-400 hover:text-rose-600 p-1 rounded-lg cursor-pointer transition-colors"
                      title="Eliminar comunicado"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 leading-relaxed">
                    {ann.contenido}
                  </p>

                  <div className="text-[11px] text-slate-400 pt-2 border-t border-slate-100 dark:border-white/5 flex items-center justify-between">
                    <span>Publicado por: <strong className="text-slate-600 dark:text-slate-300">{ann.docente}</strong></span>
                    <span className="font-mono">{new Date(ann.createdAt).toLocaleDateString("es-PE")}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* 4. PESTAÑA: ALUMNOS MATRICULADOS */}
      {activeTab === "alumnos" && (
        <div className="space-y-4">
          <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Lista de Alumnos Matriculados ({enrolledStudents.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estudiantes asignados a esta sección para el ciclo intensivo 2026-I.
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
              {enrolledStudents.length} Alumnos Regulares
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {enrolledStudents.map((student, idx) => (
              <div
                key={student.id || idx}
                className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-xs flex items-center justify-between gap-3 hover:border-indigo-300 transition-all"
              >
                <div className="flex items-center space-x-3 min-w-0">
                  <div className="w-10 h-10 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0 shadow-xs">
                    {(student.nombres || "A").charAt(0)}{(student.apellidos || "E").charAt(0)}
                  </div>
                  <div className="min-w-0">
                    <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                      {student.nombres} {student.apellidos}
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate font-mono">
                      {student.correo}
                    </p>
                    <p className="text-[11px] text-indigo-600 dark:text-indigo-400 font-semibold truncate mt-0.5">
                      Meta: {student.carreraObjetivo || "Ingeniería"} ({student.universidad || "UNI/UNMSM"})
                    </p>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 block mb-1">
                    95% Asist.
                  </span>
                  <a
                    href={`mailto:${student.correo}`}
                    className="text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1 justify-end"
                  >
                    <span>Contactar</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVA TAREA */}
      {isTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <FileText className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Asignar Nueva Tarea o Evaluación
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsTaskModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTask} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Título de la Actividad:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Práctica Calificada N° 5: Matrices y Determinantes"
                  value={newTaskData.titulo}
                  onChange={(e) => setNewTaskData({ ...newTaskData, titulo: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Tipo de Actividad:
                  </label>
                  <select
                    value={newTaskData.tipo}
                    onChange={(e) => setNewTaskData({ ...newTaskData, tipo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  >
                    <option>Tarea Calificada</option>
                    <option>Guía de Ejercicios</option>
                    <option>Taller de Refuerzo</option>
                    <option>Cuestionario Virtual</option>
                    <option>Simulacro Tipo Admisión</option>
                  </select>
                </div>

                <div>
                  <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                    Puntaje Máximo:
                  </label>
                  <input
                    type="text"
                    value={newTaskData.puntos}
                    onChange={(e) => setNewTaskData({ ...newTaskData, puntos: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                  />
                </div>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Fecha y Hora Límite de Entrega:
                </label>
                <input
                  type="text"
                  placeholder="Ej: Lunes, 11:59 PM"
                  value={newTaskData.fechaLimite}
                  onChange={(e) => setNewTaskData({ ...newTaskData, fechaLimite: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Instrucciones para el Alumno:
                </label>
                <textarea
                  rows={3}
                  placeholder="Describe los criterios de resolución o los números de ejercicios a resolver..."
                  value={newTaskData.descripcion}
                  onChange={(e) => setNewTaskData({ ...newTaskData, descripcion: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsTaskModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md cursor-pointer"
                >
                  Publicar Tarea
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL CREAR NUEVO ANUNCIO */}
      {isAnnModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <Bell className="w-5 h-5 text-blue-600" />
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Publicar Anuncio en el Curso
                </h3>
              </div>
              <button
                type="button"
                onClick={() => setIsAnnModalOpen(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAnnouncement} className="space-y-3.5 text-xs">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Asunto / Título del Aviso:
                </label>
                <input
                  type="text"
                  required
                  placeholder="Ej: Material de clase disponible en biblioteca"
                  value={newAnnData.titulo}
                  onChange={(e) => setNewAnnData({ ...newAnnData, titulo: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Nivel de Importancia / Prioridad:
                </label>
                <select
                  value={newAnnData.prioridad}
                  onChange={(e) => setNewAnnData({ ...newAnnData, prioridad: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs"
                >
                  <option value="Normal">Normal (Informativo general)</option>
                  <option value="Importante">Importante (Práctica o cambio de tema)</option>
                  <option value="Urgente">Urgente (Aviso inmediato)</option>
                </select>
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Contenido del Mensaje:
                </label>
                <textarea
                  rows={4}
                  required
                  placeholder="Estimados alumnos, se les recuerda que..."
                  value={newAnnData.contenido}
                  onChange={(e) => setNewAnnData({ ...newAnnData, contenido: e.target.value })}
                  className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-900 dark:text-white text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  onClick={() => setIsAnnModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md cursor-pointer"
                >
                  Publicar Anuncio
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
