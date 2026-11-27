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
  X,
  Download,
  Award,
  UploadCloud,
  FileCheck,
  Eye
} from "lucide-react";
import { courseService } from "../../services/cursosServices";
import { userService, parseCourseList } from "../../services/api";
import { getMeetAttendanceHistory, registerMeetEntry, registerMeetExit } from "../../services/asistencia";
import { clasesVivoService } from "../../services/clasesVivoService";
import { academicActivitiesService } from "../../services/academicActivitiesService";
import { chatAcademicService } from "../../services/chatAcademicService";
import { uploadFileToStorage } from "../../lib/supabase";
import ReportViewerModal from "../../components/shared/ReportViewerModal";
import FilePreviewModal from "../../components/shared/FilePreviewModal";
import { useNavigate } from "react-router-dom";

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

export default function DocenteCursosDetalles({ cursoId, initialTab = "clase", onVolver }) {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState(initialTab || "clase"); // "clase" | "tareas" | "anuncios" | "alumnos" | "consultas"

  useEffect(() => {
    if (initialTab) {
      setActiveTab(initialTab);
    }
  }, [initialTab]);
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

  // Estados para Consultas de Estudiantes del curso
  const [courseMessages, setCourseMessages] = useState([]);
  const [replyTexts, setReplyTexts] = useState({});

  useEffect(() => {
    if (!cursoId) return;
    const syncCourseMsgs = () => {
      const all = chatAcademicService.getMessages();
      const filtered = all.filter(
        (m) => m.cursoId === cursoId || (curso && m.curso === curso.asignatura)
      );
      setCourseMessages(filtered);
    };

    syncCourseMsgs();
    window.addEventListener("storage", syncCourseMsgs);
    return () => window.removeEventListener("storage", syncCourseMsgs);
  }, [cursoId, curso]);

  const handleReplyInCourse = (messageId) => {
    const text = replyTexts[messageId];
    if (!text || !text.trim()) {
      alert("Por favor escribe una respuesta.");
      return;
    }
    chatAcademicService.replyMessage(messageId, text, curso?.docente || "Prof. Pedro Chavez");
    setReplyTexts((prev) => ({ ...prev, [messageId]: "" }));
    setNotice("Respuesta enviada al estudiante con éxito.");
  };

  // Formulario nueva tarea
  const [newTaskData, setNewTaskData] = useState({
    titulo: "",
    tipo: "Tarea Calificada",
    fechaLimite: "Próximo Lunes, 11:59 PM",
    puntos: "20 pts",
    descripcion: ""
  });
  const [taskGuideFile, setTaskGuideFile] = useState(null);
  const [isCreatingTask, setIsCreatingTask] = useState(false);

  // Bandeja de revisión y calificación de entregas individuales por tarea
  const [gradingModalTask, setGradingModalTask] = useState(null);
  const [gradingLoading, setGradingLoading] = useState(false);
  const [gradingData, setGradingData] = useState(null);
  const [gradingFilter, setGradingFilter] = useState("todos");
  const [gradeInputs, setGradeInputs] = useState({});
  const [courseReportModal, setCourseReportModal] = useState(null);

  // Formulario nuevo anuncio
  const [newAnnData, setNewAnnData] = useState({
    titulo: "",
    prioridad: "Normal",
    contenido: ""
  });
  const [annFile, setAnnFile] = useState(null);
  const [isCreatingAnn, setIsCreatingAnn] = useState(false);
  const [filePreviewTarget, setFilePreviewTarget] = useState(null);

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

      // Cargar tareas y anuncios de este curso sincronizando con backend
      const [courseTasks, courseAnnouncements] = await Promise.all([
        academicActivitiesService.fetchTasks(cursoId),
        academicActivitiesService.fetchAnnouncements(cursoId)
      ]);
      setTasks(courseTasks);
      setAnnouncements(courseAnnouncements);

      // Filtrar estrictamente los estudiantes matriculados en este curso (solo por cursosInscritos real en la BD)
      const students = (users || []).filter((u) => {
        const isStudent = String(u.rol || "").toLowerCase() === "estudiante";
        if (!isStudent) return false;

        const inscritos = parseCourseList(u.cursosInscritos || u.cursos_inscritos || u.CursosInscritos);
        return inscritos.some((c) => {
          const id = typeof c === "object" && c !== null ? c.id : c;
          return String(id).trim() === String(cursoId).trim();
        });
      });

      setEnrolledStudents(students);

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

  const handleEntry = () => {
    if (action) return;
    setError("");
    setNotice("");
    clasesVivoService.launchClassOptimistically(curso || { id: cursoId, meetUrl: curso?.meetUrl });
    registerMeetEntry(cursoId).catch(() => {});
    navigate(`/docente/aula-vivo/${cursoId}`, { state: { coursePreview: curso } });
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

  // Creación de nueva tarea (con guía opcional subida a Supabase Storage)
  const handleCreateTask = async (e) => {
    e.preventDefault();
    if (!newTaskData.titulo.trim() || isCreatingTask) {
      if (!newTaskData.titulo.trim()) alert("Por favor ingresa el título de la tarea.");
      return;
    }

    setIsCreatingTask(true);
    setError("");
    try {
      let uploadedGuide = null;
      if (taskGuideFile) {
        uploadedGuide = await uploadFileToStorage("materiales-clase", taskGuideFile, curso.id);
      }

      const created = await academicActivitiesService.createTask({
        cursoId: curso.id,
        cicloId: curso.cicloId || curso.ciclo_id || null,
        curso: curso.asignatura,
        tipo: newTaskData.tipo,
        titulo: newTaskData.titulo.trim(),
        fechaLimite: newTaskData.fechaLimite.trim(),
        puntos: newTaskData.puntos.trim(),
        descripcion: newTaskData.descripcion.trim() || "Desarrollar y subir la resolución en PDF.",
        docente: curso.docente || localStorage.getItem("userName") || "Docente",
        archivoUrl: uploadedGuide?.url || null,
        archivoPath: uploadedGuide?.path || null,
        archivoNombre: uploadedGuide?.fileName || taskGuideFile?.name || null
      });

      const updated = await academicActivitiesService.fetchTasks(cursoId);
      setTasks(updated);
      setIsTaskModalOpen(false);
      setTaskGuideFile(null);
      setNewTaskData({
        titulo: "",
        tipo: "Tarea Calificada",
        fechaLimite: "Próximo Lunes, 11:59 PM",
        puntos: "20 pts",
        descripcion: ""
      });
      setNotice(`Tarea "${created.titulo}" publicada y disponible en tiempo real para tus alumnos.`);
    } catch (err) {
      setError("No se pudo publicar la tarea: " + err.message);
    } finally {
      setIsCreatingTask(false);
    }
  };

  // Carga las entregas individuales de los alumnos matriculados para una tarea
  const loadGradingDeliveries = useCallback(async (taskObj, silent = false) => {
    if (!taskObj?.id) return;
    if (!silent) setGradingLoading(true);
    try {
      const data = await academicActivitiesService.fetchTaskDeliveriesForTeacher(taskObj.id);
      setGradingData(data);
      setGradeInputs((prev) => {
        const next = { ...prev };
        for (const est of data?.estudiantes || []) {
          const existingDraft = next[est.estudianteId];
          if (!existingDraft || !existingDraft.dirty) {
            next[est.estudianteId] = {
              nota: est.nota !== null && est.nota !== undefined ? String(est.nota) : "",
              comentarioDocente: est.comentarioDocente || "",
              saving: false,
              savedFlash: false,
              dirty: false
            };
          }
        }
        return next;
      });
    } catch (err) {
      setError("No se pudieron cargar las entregas de la tarea: " + err.message);
    } finally {
      if (!silent) setGradingLoading(false);
    }
  }, []);

  const openGradingModal = (taskObj) => {
    setGradingModalTask(taskObj);
    setGradingFilter("todos");
    setGradeInputs({});
    loadGradingDeliveries(taskObj, false);
  };

  const handleGradeChange = (estudianteId, field, value) => {
    setGradeInputs((prev) => ({
      ...prev,
      [estudianteId]: {
        ...(prev[estudianteId] || { nota: "", comentarioDocente: "", saving: false, savedFlash: false }),
        [field]: value,
        dirty: true,
        savedFlash: false
      }
    }));
  };

  const handleSaveStudentGrade = async (estudianteId, targetEstado = "Calificado") => {
    if (!gradingModalTask?.id) return;
    const draft = gradeInputs[estudianteId] || { nota: "", comentarioDocente: "" };

    if (targetEstado === "Calificado") {
      const n = Number(draft.nota);
      if (draft.nota === "" || Number.isNaN(n) || n < 0 || n > 20) {
        alert("Ingresa una nota válida en escala vigesimal (entre 0 y 20).");
        return;
      }
    }

    setGradeInputs((prev) => ({
      ...prev,
      [estudianteId]: { ...draft, saving: true, savedFlash: false }
    }));

    try {
      const saved = await academicActivitiesService.gradeStudentDelivery(
        gradingModalTask.id,
        estudianteId,
        {
          nota: targetEstado === "Calificado" ? Number(draft.nota) : (draft.nota === "" ? null : Number(draft.nota)),
          comentarioDocente: draft.comentarioDocente || "",
          estado: targetEstado
        }
      );

      setGradeInputs((prev) => ({
        ...prev,
        [estudianteId]: {
          nota: saved.nota !== null && saved.nota !== undefined ? String(saved.nota) : "",
          comentarioDocente: saved.comentarioDocente || "",
          saving: false,
          dirty: false,
          savedFlash: true
        }
      }));

      await Promise.all([
        loadGradingDeliveries(gradingModalTask, true),
        academicActivitiesService.fetchTasks(cursoId).then((updated) => setTasks(updated))
      ]);
    } catch (err) {
      setGradeInputs((prev) => ({
        ...prev,
        [estudianteId]: { ...draft, saving: false }
      }));
      alert("Error al guardar calificación: " + err.message);
    }
  };

  // Sincronización en vivo cuando un alumno sube su tarea desde otro navegador
  useEffect(() => {
    if (!cursoId) return;
    const unsub = clasesVivoService.subscribeLiveChanges((evt) => {
      if (evt?.type === "TASK_SUBMITTED" || evt?.type === "TASK_GRADED") {
        academicActivitiesService.fetchTasks(cursoId).then((updated) => {
          if (updated) setTasks(updated);
        });
        if (gradingModalTask?.id && (!evt.tareaId || evt.tareaId === gradingModalTask.id)) {
          loadGradingDeliveries(gradingModalTask, true);
        }
      }
    });
    return unsub;
  }, [cursoId, gradingModalTask, loadGradingDeliveries]);

  const handleDeleteTask = async (taskId) => {
    if (!window.confirm("¿Estás seguro de eliminar esta tarea?")) return;
    try {
      await academicActivitiesService.deleteTask(taskId);
      const updated = await academicActivitiesService.fetchTasks(cursoId);
      setTasks(updated);
      setNotice("Tarea eliminada correctamente.");
    } catch (err) {
      setError("Error al eliminar tarea: " + err.message);
    }
  };

  // Creación de nuevo anuncio (con adjunto opcional en Supabase Storage)
  const handleCreateAnnouncement = async (e) => {
    e.preventDefault();
    if (!newAnnData.titulo.trim() || !newAnnData.contenido.trim() || isCreatingAnn) {
      if (!newAnnData.titulo.trim() || !newAnnData.contenido.trim()) {
        alert("Por favor completa el título y el mensaje del anuncio.");
      }
      return;
    }

    setIsCreatingAnn(true);
    setError("");
    try {
      let uploadedMat = null;
      if (annFile) {
        uploadedMat = await uploadFileToStorage("materiales-clase", annFile, curso.id);
      }

      const created = await academicActivitiesService.createAnnouncement({
        cursoId: curso.id,
        curso: curso.asignatura,
        titulo: newAnnData.titulo.trim(),
        prioridad: newAnnData.prioridad,
        contenido: newAnnData.contenido.trim(),
        docente: curso.docente || localStorage.getItem("userName") || "Docente",
        archivoUrl: uploadedMat?.url || null,
        archivoPath: uploadedMat?.path || null,
        archivoNombre: uploadedMat?.fileName || annFile?.name || null
      });

      const updated = await academicActivitiesService.fetchAnnouncements(cursoId);
      setAnnouncements(updated);
      setIsAnnModalOpen(false);
      setAnnFile(null);
      setNewAnnData({
        titulo: "",
        prioridad: "Normal",
        contenido: ""
      });
      if (uploadedMat) {
        clasesVivoService.notifyMaterialPublished(curso.id);
      }
      setNotice(`Anuncio "${created.titulo}" publicado en el muro del curso.`);
    } catch (err) {
      setError("No se pudo publicar el anuncio: " + err.message);
    } finally {
      setIsCreatingAnn(false);
    }
  };

  const handleDeleteAnnouncement = async (annId) => {
    if (!window.confirm("¿Estás seguro de eliminar este anuncio?")) return;
    try {
      await academicActivitiesService.deleteAnnouncement(annId);
      const updated = await academicActivitiesService.fetchAnnouncements(cursoId);
      setAnnouncements(updated);
      setNotice("Anuncio eliminado correctamente.");
    } catch (err) {
      setError("Error al eliminar anuncio: " + err.message);
    }
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

          {/* Acceso Rápido a Google Meet y Emisión de Actas PDF de la Sección */}
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() =>
                setCourseReportModal({
                  title: `Acta Oficial de Evaluaciones y Notas — ${curso.asignatura}`,
                  subtitle: `Cátedra: ${curso.docente}`,
                  endpointPath: "/reportes/notas",
                  params: { curso_id: curso.id },
                  csvFilename: `acta_notas_${curso.id}`
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 dark:border-indigo-800 bg-indigo-50 dark:bg-indigo-950/50 hover:bg-indigo-100 px-3.5 py-2.5 text-xs font-extrabold text-indigo-700 dark:text-indigo-300 transition-colors cursor-pointer"
            >
              <FileText className="h-4 w-4" />
              <span>Acta de Notas PDF</span>
            </button>

            <button
              type="button"
              onClick={() =>
                setCourseReportModal({
                  title: `Acta de Asistencia y Permanencia — ${curso.asignatura}`,
                  subtitle: `Cátedra: ${curso.docente}`,
                  endpointPath: "/reportes/asistencia",
                  params: { curso_id: curso.id },
                  csvFilename: `acta_asistencia_${curso.id}`
                })
              }
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 px-3.5 py-2.5 text-xs font-extrabold text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
            >
              <Award className="h-4 w-4 text-amber-500" />
              <span>Acta Asistencia PDF</span>
            </button>

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
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
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
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
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
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
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
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>Alumnos Matriculados ({enrolledStudents.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("consultas")}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
            activeTab === "consultas"
              ? "bg-blue-600 text-white shadow-md shadow-blue-600/30"
              : "bg-white dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10"
          }`}
        >
          <MessageSquare className="w-4 h-4" />
          <span>Consultas de Alumnos ({courseMessages.length})</span>
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
              {tasks.map((task) => {
                const entregasCount = Number(task.entregasCount || 0);
                const pendientesCalificar = Number(task.pendientesCalificarCount || 0);
                const calificadasCount = Number(task.calificadasCount || 0);
                const totalEsperado = enrolledStudents.length;

                return (
                  <div
                    key={task.id}
                    className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-xs flex flex-col justify-between space-y-3.5"
                  >
                    <div className="space-y-2.5">
                      <div className="flex flex-wrap items-center justify-between gap-2">
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
                      <p className="text-xs text-slate-600 dark:text-slate-300 line-clamp-2">
                        {task.descripcion}
                      </p>

                      {(task.archivoUrl || task.archivoPath) && (
                        <button
                          type="button"
                          onClick={() =>
                            setFilePreviewTarget({
                              title: `Guía de Tarea — ${task.titulo}`,
                              subtitle: `${curso.asignatura} • ${task.docente}`,
                              fileName: task.archivoNombre || "guia_tarea.pdf",
                              bucket: "materiales-clase",
                              path: task.archivoPath,
                              fallbackUrl: task.archivoUrl
                            })
                          }
                          className="inline-flex items-center gap-1.5 text-[11px] font-bold text-blue-600 dark:text-blue-400 hover:underline cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span className="truncate">Previsualizar guía: {task.archivoNombre || "Ver archivo"}</span>
                        </button>
                      )}

                      {/* Resumen real de entregas por tarea */}
                      <div className="flex flex-wrap items-center gap-2 pt-1">
                        <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 text-slate-700 dark:text-slate-200">
                          📥 Entregas: {entregasCount}{totalEsperado > 0 ? ` / ${totalEsperado}` : ""}
                        </span>
                        {pendientesCalificar > 0 && (
                          <span className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
                            🔔 {pendientesCalificar} por calificar
                          </span>
                        )}
                        {calificadasCount > 0 && (
                          <span className="text-[11px] font-bold px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-300">
                            ✓ {calificadasCount} calificada{calificadasCount === 1 ? "" : "s"}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between gap-2 text-xs">
                      <span className="text-slate-500 font-mono flex items-center gap-1 truncate">
                        <Clock className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{task.fechaLimite}</span>
                      </span>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={() => openGradingModal(task)}
                          className="px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-extrabold shadow-2xs transition-colors cursor-pointer inline-flex items-center gap-1.5"
                        >
                          <Award className="w-3.5 h-3.5" />
                          <span>Revisar y Calificar</span>
                        </button>
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
                  </div>
                );
              })}
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

                  {(ann.archivoUrl || ann.archivoPath) && (
                    <button
                      type="button"
                      onClick={() =>
                        setFilePreviewTarget({
                          title: ann.titulo,
                          subtitle: `${curso.asignatura} • Material publicado`,
                          fileName: ann.archivoNombre || "material_clase.pdf",
                          bucket: "materiales-clase",
                          path: ann.archivoPath,
                          fallbackUrl: ann.archivoUrl
                        })
                      }
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-xs font-bold text-blue-700 dark:text-blue-300 hover:bg-blue-100 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Previsualizar adjunto: {ann.archivoNombre || "Ver archivo"}</span>
                    </button>
                  )}

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
          <div className="border-b border-slate-200 dark:border-white/10 pb-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Lista de Alumnos Matriculados ({enrolledStudents.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Estudiantes asignados a esta sección para el ciclo intensivo 2026-I.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  setActiveTab("tareas");
                  setIsTaskModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-3.5 h-3.5" />
                <span>+ Crear Tarea</span>
              </button>
              <button
                type="button"
                onClick={() => {
                  setActiveTab("anuncios");
                  setIsAnnModalOpen(true);
                }}
                className="px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-white/10 dark:hover:bg-white/15 text-slate-700 dark:text-slate-200 text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer transition-colors"
              >
                <Bell className="w-3.5 h-3.5" />
                <span>+ Anuncio</span>
              </button>
              <span className="text-xs font-bold px-3 py-1 bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300 rounded-xl border border-emerald-200 dark:border-emerald-800">
                {enrolledStudents.length} Alumnos
              </span>
            </div>
          </div>

          {enrolledStudents.length === 0 ? (
            <div className="p-12 text-center rounded-2xl border border-dashed border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-extrabold text-slate-800 dark:text-white">
                No hay alumnos matriculados en esta materia todavía
              </h4>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                Los estudiantes aparecerán aquí cuando se matriculen en esta asignatura o pertenezcan al área de {curso?.area || "esta materia"}.
              </p>
            </div>
          ) : (
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

                  <div className="text-right shrink-0 space-y-1.5">
                    <button
                      type="button"
                      onClick={() =>
                        setCourseReportModal({
                          title: `Kardex Académico — ${student.nombres} ${student.apellidos}`,
                          subtitle: `Rendimiento y asistencia en tus asignaturas`,
                          endpointPath: `/reportes/kardex-alumno/${encodeURIComponent(student.id)}`,
                          params: {},
                          csvFilename: `kardex_${student.id}`
                        })
                      }
                      className="text-[11px] font-extrabold px-2.5 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 hover:bg-indigo-100 inline-flex items-center gap-1 cursor-pointer"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Kardex PDF</span>
                    </button>
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
          )}
        </div>
      )}

      {/* 5. PESTAÑA: CONSULTAS Y TUTORÍA DEL CURSO */}
      {activeTab === "consultas" && (
        <div className="rounded-3xl border border-slate-200/90 dark:border-white/10 bg-white dark:bg-slate-900 p-6 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-white/10">
            <div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-blue-600" />
                <span>Consultas de Alumnos en {curso.asignatura}</span>
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Preguntas académicas formuladas por estudiantes matriculados en esta materia
              </p>
            </div>
            <span className="text-xs font-bold px-3 py-1 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
              {courseMessages.length} consultas registradas
            </span>
          </div>

          <div className="space-y-3">
            {courseMessages.length === 0 ? (
              <div className="p-10 text-center text-slate-400 text-xs">
                No hay consultas registradas para este curso actualmente.
              </div>
            ) : (
              courseMessages.map((msg) => (
                <div
                  key={msg.id}
                  className="p-4 rounded-2xl border border-slate-200/80 dark:border-white/10 bg-slate-50/60 dark:bg-white/5 space-y-3"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-2.5">
                      <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center">
                        {msg.estudianteNombre.split(" ").slice(0, 2).map((w) => w[0].toUpperCase()).join("")}
                      </div>
                      <div>
                        <h4 className="text-xs font-extrabold text-slate-900 dark:text-white">
                          {msg.estudianteNombre}
                        </h4>
                        <span className="text-[11px] text-indigo-600 dark:text-indigo-400 font-bold block">
                          {msg.estudianteCarrera}
                        </span>
                      </div>
                    </div>
                    <span className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border ${
                      msg.estado === "Pendiente"
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                    }`}>
                      {msg.estado}
                    </span>
                  </div>

                  <p className="text-xs text-slate-700 dark:text-slate-300 bg-white dark:bg-slate-800 p-3 rounded-xl border border-slate-200/50 dark:border-white/5 leading-relaxed">
                    {msg.mensaje}
                  </p>

                  {msg.respuesta ? (
                    <div className="p-2.5 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/40 text-xs space-y-1">
                      <span className="font-bold text-blue-700 dark:text-blue-300 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Tu respuesta ({msg.fechaRespuesta}):
                      </span>
                      <p className="text-slate-800 dark:text-slate-200">{msg.respuesta}</p>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <textarea
                        rows={2}
                        value={replyTexts[msg.id] || ""}
                        onChange={(e) => setReplyTexts({ ...replyTexts, [msg.id]: e.target.value })}
                        placeholder="Escribe la respuesta al estudiante..."
                        className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                      />
                      <div className="flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleReplyInCourse(msg.id)}
                          className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                        >
                          Responder al Alumno
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
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

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Adjuntar Guía o Práctica en PDF / Imagen (opcional, máx. 15 MB):
                </label>
                <label className="flex items-center justify-between gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/70 dark:bg-white/5 hover:border-indigo-500 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f && f.size > 15 * 1024 * 1024) {
                        alert("La guía supera el límite máximo de 15 MB.");
                        e.target.value = "";
                        return;
                      }
                      setTaskGuideFile(f);
                    }}
                  />
                  <span className="flex items-center gap-2 truncate text-slate-600 dark:text-slate-300">
                    {taskGuideFile ? (
                      <>
                        <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
                          {taskGuideFile.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-indigo-500 shrink-0" />
                        <span>Seleccionar PDF o guía de ejercicios para el alumno...</span>
                      </>
                    )}
                  </span>
                  {taskGuideFile && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setFilePreviewTarget({
                            title: `Vista Previa — ${taskGuideFile.name}`,
                            subtitle: "Revisión de guía antes de publicar la tarea",
                            fileName: taskGuideFile.name,
                            localFile: taskGuideFile
                          });
                        }}
                        className="text-[11px] font-extrabold text-indigo-600 dark:text-indigo-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Previsualizar
                      </button>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setTaskGuideFile(null);
                        }}
                        className="text-[11px] font-bold text-rose-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  disabled={isCreatingTask}
                  onClick={() => {
                    setIsTaskModalOpen(false);
                    setTaskGuideFile(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingTask}
                  className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold shadow-md cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isCreatingTask && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isCreatingTask ? "Publicando..." : "Publicar Tarea"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL BANDEJA DE REVISIÓN Y CALIFICACIÓN INDIVIDUAL DE ENTREGAS */}
      {gradingModalTask && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 backdrop-blur-xs p-4 animate-fade-in overscroll-contain"
          onClick={(e) => {
            if (e.target === e.currentTarget) setGradingModalTask(null);
          }}
        >
          <div className="bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden overscroll-contain">
            {/* Cabecera del modal de calificación */}
            <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-start justify-between gap-3 bg-slate-50/70 dark:bg-white/5 shrink-0">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300">
                    Bandeja de Calificación Vigesimal (0 - 20)
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">
                    Límite: {gradingModalTask.fechaLimite}
                  </span>
                </div>
                <h3 className="text-base sm:text-lg font-extrabold text-slate-900 dark:text-white mt-1">
                  {gradingModalTask.titulo}
                </h3>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <button
                  type="button"
                  onClick={() => loadGradingDeliveries(gradingModalTask, false)}
                  className="p-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
                  title="Actualizar entregas"
                >
                  <RefreshCw className={`w-4 h-4 ${gradingLoading ? "animate-spin" : ""}`} />
                </button>
                <button
                  type="button"
                  onClick={() => setGradingModalTask(null)}
                  className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Resumen estadístico y filtros rápidos */}
            <div className="px-5 py-3.5 border-b border-slate-100 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="px-2.5 py-1 rounded-lg bg-slate-100 dark:bg-white/5 font-bold text-slate-700 dark:text-slate-200">
                  👥 Matriculados: {gradingData?.resumen?.matriculados ?? 0}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/40 font-bold text-blue-700 dark:text-blue-300">
                  📥 Entregaron: {gradingData?.resumen?.entregados ?? 0}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-amber-50 dark:bg-amber-950/40 font-extrabold text-amber-800 dark:text-amber-300">
                  🔔 Por Calificar: {gradingData?.resumen?.pendientesCalificar ?? 0}
                </span>
                <span className="px-2.5 py-1 rounded-lg bg-emerald-50 dark:bg-emerald-950/40 font-bold text-emerald-700 dark:text-emerald-300">
                  ✓ Calificados: {gradingData?.resumen?.calificados ?? 0}
                </span>
              </div>

              <div className="flex flex-wrap gap-1.5 text-[11px]">
                {[
                  { key: "todos", label: "Todos" },
                  { key: "por_calificar", label: "Por Calificar" },
                  { key: "calificados", label: "Calificados" },
                  { key: "sin_entregar", label: "Sin Entregar" }
                ].map((tab) => (
                  <button
                    key={tab.key}
                    type="button"
                    onClick={() => setGradingFilter(tab.key)}
                    className={`px-2.5 py-1 rounded-lg font-bold cursor-pointer transition-colors ${
                      gradingFilter === tab.key
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Lista de estudiantes y entregas */}
            <div className="p-5 overflow-y-auto flex-1 space-y-3 overscroll-contain">
              {gradingLoading ? (
                <div className="py-14 flex flex-col items-center justify-center text-slate-500 space-y-2">
                  <Loader2 className="w-8 h-8 animate-spin text-indigo-600" />
                  <p className="text-xs font-bold">Consultando entregas reales en Supabase...</p>
                </div>
              ) : (
                (() => {
                  const allRows = gradingData?.estudiantes || [];
                  const filteredRows = allRows.filter((row) => {
                    if (gradingFilter === "por_calificar") {
                      return row.entregado && (row.estado === "Entregado" || row.estado === "Observado");
                    }
                    if (gradingFilter === "calificados") return row.estado === "Calificado";
                    if (gradingFilter === "sin_entregar") return !row.entregado && row.estado !== "Calificado";
                    return true;
                  });

                  if (filteredRows.length === 0) {
                    return (
                      <div className="py-12 text-center text-xs text-slate-400">
                        No hay estudiantes en este filtro para la tarea seleccionada.
                      </div>
                    );
                  }

                  return filteredRows.map((est) => {
                    const draft = gradeInputs[est.estudianteId] || {
                      nota: est.nota !== null && est.nota !== undefined ? String(est.nota) : "",
                      comentarioDocente: est.comentarioDocente || "",
                      saving: false,
                      savedFlash: false
                    };
                    const isCal = est.estado === "Calificado";
                    const isObs = est.estado === "Observado";
                    const isEnt = est.estado === "Entregado";

                    return (
                      <div
                        key={est.estudianteId}
                        className="rounded-2xl border border-slate-200 dark:border-white/10 bg-slate-50/50 dark:bg-white/[0.03] p-4 space-y-3"
                      >
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                          <div className="flex items-center gap-3 min-w-0">
                            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-indigo-600 to-blue-600 text-white font-extrabold text-xs flex items-center justify-center shrink-0">
                              {(est.estudianteNombre || "A")
                                .split(" ")
                                .slice(0, 2)
                                .map((p) => p[0]?.toUpperCase())
                                .join("")}
                            </div>
                            <div className="min-w-0">
                              <p className="text-sm font-extrabold text-slate-900 dark:text-white truncate">
                                {est.estudianteNombre}
                              </p>
                              <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400 truncate">
                                {est.estudianteCorreo}
                                {est.entregadoEn ? ` • Enviado: ${formatDateTime(est.entregadoEn)}` : ""}
                              </p>
                            </div>
                          </div>

                          <div className="flex flex-wrap items-center gap-2 shrink-0">
                            <span
                              className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${
                                isCal
                                  ? "bg-indigo-100 dark:bg-indigo-950/60 text-indigo-800 dark:text-indigo-300 border-indigo-300 dark:border-indigo-800"
                                  : isEnt
                                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800"
                                  : isObs
                                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-800 dark:text-rose-300 border-rose-300 dark:border-rose-800"
                                  : "bg-slate-200/80 dark:bg-white/10 text-slate-600 dark:text-slate-400 border-slate-300 dark:border-white/10"
                              }`}
                            >
                              {isCal && est.nota !== null ? `Calificado (${est.nota}/20)` : est.estado}
                            </span>

                            {(est.archivoUrl || est.archivoPath) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setFilePreviewTarget({
                                    title: `Entrega de ${est.estudianteNombre}`,
                                    subtitle: `${gradingModalTask.titulo} • ${est.estudianteCorreo}`,
                                    fileName: est.archivoNombre || "entrega_alumno.pdf",
                                    bucket: "tareas-entregas",
                                    path: est.archivoPath,
                                    fallbackUrl: est.archivoUrl
                                  })
                                }
                                className="px-3 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold inline-flex items-center gap-1.5 shadow-2xs cursor-pointer"
                              >
                                <Eye className="w-3.5 h-3.5" />
                                <span className="max-w-[160px] truncate">
                                  {est.archivoNombre || "Previsualizar entrega"}
                                </span>
                              </button>
                            )}
                          </div>
                        </div>

                        {est.comentarioAlumno && (
                          <div className="text-xs bg-white dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/10 rounded-xl p-2.5 text-slate-700 dark:text-slate-300">
                            <strong className="text-slate-900 dark:text-white">Comentario del alumno:</strong>{" "}
                            “{est.comentarioAlumno}”
                          </div>
                        )}

                        {/* Controles rápidos de calificación (0-20) y retroalimentación */}
                        <div className="grid grid-cols-1 sm:grid-cols-12 gap-2.5 items-center pt-1">
                          <div className="sm:col-span-2">
                            <input
                              type="number"
                              min="0"
                              max="20"
                              step="0.5"
                              placeholder="Nota 0-20"
                              value={draft.nota}
                              onChange={(e) => handleGradeChange(est.estudianteId, "nota", e.target.value)}
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-xs font-extrabold text-center text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-6">
                            <input
                              type="text"
                              placeholder="Retroalimentación u observación académica para el alumno..."
                              value={draft.comentarioDocente}
                              onChange={(e) =>
                                handleGradeChange(est.estudianteId, "comentarioDocente", e.target.value)
                              }
                              className="w-full p-2 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-800 text-xs text-slate-900 dark:text-white focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="sm:col-span-4 flex items-center justify-end gap-1.5">
                            {est.entregado && (
                              <button
                                type="button"
                                disabled={draft.saving}
                                onClick={() => handleSaveStudentGrade(est.estudianteId, "Observado")}
                                className="px-2.5 py-2 rounded-xl border border-rose-300 dark:border-rose-800 text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-950/40 text-[11px] font-bold cursor-pointer disabled:opacity-50"
                                title="Solicitar al alumno que corrija y vuelva a subir su archivo"
                              >
                                Observar
                              </button>
                            )}
                            <button
                              type="button"
                              disabled={draft.saving}
                              onClick={() => handleSaveStudentGrade(est.estudianteId, "Calificado")}
                              className="px-3.5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-2xs cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-50"
                            >
                              {draft.saving ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <CheckCircle2 className="w-3.5 h-3.5" />
                              )}
                              <span>{draft.savedFlash ? "¡Guardado!" : "Guardar Nota"}</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()
              )}
            </div>
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

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-200 block mb-1">
                  Adjuntar Separata / PDF o Imagen (opcional, máx. 15 MB):
                </label>
                <label className="flex items-center justify-between gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50/70 dark:bg-white/5 hover:border-blue-500 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f && f.size > 15 * 1024 * 1024) {
                        alert("El archivo supera el límite máximo de 15 MB.");
                        e.target.value = "";
                        return;
                      }
                      setAnnFile(f);
                    }}
                  />
                  <span className="flex items-center gap-2 truncate text-slate-600 dark:text-slate-300">
                    {annFile ? (
                      <>
                        <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
                          {annFile.name}
                        </span>
                      </>
                    ) : (
                      <>
                        <UploadCloud className="w-4 h-4 text-blue-500 shrink-0" />
                        <span>Seleccionar PDF o material para adjuntar al comunicado...</span>
                      </>
                    )}
                  </span>
                  {annFile && (
                    <div className="flex items-center gap-2 shrink-0">
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setFilePreviewTarget({
                            title: `Vista Previa — ${annFile.name}`,
                            subtitle: "Revisión de material antes de publicar el anuncio",
                            fileName: annFile.name,
                            localFile: annFile
                          });
                        }}
                        className="text-[11px] font-extrabold text-blue-600 dark:text-blue-400 hover:underline inline-flex items-center gap-1"
                      >
                        <Eye className="w-3.5 h-3.5" /> Previsualizar
                      </button>
                      <button
                        type="button"
                        onClick={(ev) => {
                          ev.preventDefault();
                          setAnnFile(null);
                        }}
                        className="text-[11px] font-bold text-rose-500 hover:underline"
                      >
                        Quitar
                      </button>
                    </div>
                  )}
                </label>
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 dark:border-white/10">
                <button
                  type="button"
                  disabled={isCreatingAnn}
                  onClick={() => {
                    setIsAnnModalOpen(false);
                    setAnnFile(null);
                  }}
                  className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 font-bold cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isCreatingAnn}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-extrabold shadow-md cursor-pointer inline-flex items-center gap-1.5 disabled:opacity-60"
                >
                  {isCreatingAnn && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>{isCreatingAnn ? "Publicando..." : "Publicar Anuncio"}</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* VISOR PDF OFICIAL DE ACTAS Y KARDEX DE LA SECCIÓN */}
      <ReportViewerModal
        isOpen={Boolean(courseReportModal)}
        onClose={() => setCourseReportModal(null)}
        title={courseReportModal?.title}
        subtitle={courseReportModal?.subtitle}
        endpointPath={courseReportModal?.endpointPath}
        params={courseReportModal?.params}
        csvFilename={courseReportModal?.csvFilename}
      />

      {/* VISOR UNIVERSAL DE ARCHIVOS ADJUNTOS Y ENTREGAS DE ALUMNOS */}
      <FilePreviewModal
        isOpen={Boolean(filePreviewTarget)}
        onClose={() => setFilePreviewTarget(null)}
        title={filePreviewTarget?.title}
        subtitle={filePreviewTarget?.subtitle}
        fileName={filePreviewTarget?.fileName}
        localFile={filePreviewTarget?.localFile}
        bucket={filePreviewTarget?.bucket}
        path={filePreviewTarget?.path}
        fallbackUrl={filePreviewTarget?.fallbackUrl}
      />
    </div>
  );
}
