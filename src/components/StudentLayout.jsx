import React, { useState, useEffect, useRef } from "react";
import { Outlet, NavLink, Link, useNavigate, useLocation } from "react-router-dom";
import {
  GraduationCap,
  LogOut,
  School,
  Calendar,
  Sparkles,
  BookOpen,
  Clock,
  CreditCard,
  Menu,
  X,
  ChevronRight,
  Bell,
  MessageSquare,
  HelpCircle,
  Settings,
  Library,
  ExternalLink,
  CheckCircle2,
  FileText,
  AlertCircle,
  Video
} from "lucide-react";
import ThemeToggle from "./ThemeToggle";
import { signOutFromApp } from "../services/session";
import { academicActivitiesService } from "../services/academicActivitiesService";
import { chatAcademicService } from "../services/chatAcademicService";
import { userService } from "../services/api";
import { courseService } from "../services/cursosServices";
import StudentTaskModal from "./student/StudentTaskModal";
import StudentAnnouncementModal from "./student/StudentAnnouncementModal";
import SearchableSelect from "./shared/SearchableSelect";
import { StudentCycleProvider, useStudentCycle } from "../context/StudentCycleContext";
import { clasesVivoService } from "../services/clasesVivoService";

export default function StudentLayout() {
  return (
    <StudentCycleProvider>
      <StudentLayoutInner />
    </StudentCycleProvider>
  );
}

function StudentLayoutInner() {
  const {
    selectedCycle,
    availableStudentCycles,
    selectedCycleId,
    setSelectedCycleId,
    selectActiveCycle,
    isReadOnlyHistory
  } = useStudentCycle();
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [chatModalOpen, setChatModalOpen] = useState(false);
  const [libraryModalOpen, setLibraryModalOpen] = useState(false);
  const [helpModalOpen, setHelpModalOpen] = useState(false);
  const [selectedTaskModal, setSelectedTaskModal] = useState(null);
  const [liveTracker, setLiveTracker] = useState(() => clasesVivoService.getStudentTrackerState());

  // Suscripción reactiva y vigilancia silenciosa en 2.º plano de la pestaña de Google Meet
  useEffect(() => {
    const unsub = clasesVivoService.subscribeStudentTracker(setLiveTracker);
    return unsub;
  }, []);

  // Restaurar y sincronizar al instante el estado de clases activas (sin necesidad de F5)
  useEffect(() => {
    let cancelled = false;
    const syncTrackerFromServer = () => {
      clasesVivoService
        .listarClasesActivas(selectedCycleId)
        .then((res) => {
          if (cancelled) return;
          const sesiones = Array.isArray(res?.sesiones) ? res.sesiones : [];
          const current = clasesVivoService.getStudentTrackerState();
          if (current && !sesiones.some((s) => s.id === current.sesionId)) {
            clasesVivoService.setStudentTrackerState(null);
            return;
          }
          const yaUnida = sesiones.find((s) => Boolean(s.miAsistencia));
          if (yaUnida) {
            clasesVivoService.setStudentTrackerState({
              sesionId: yaUnida.id,
              cursoId: yaUnida.cursoId,
              asignatura: yaUnida.asignatura,
              docenteNombre: yaUnida.docenteNombre,
              meetUrl: yaUnida.meetUrl,
              estado: yaUnida.miAsistencia.estado,
              horaRegistro: yaUnida.miAsistencia.horaRegistro,
              minutosPermanencia: yaUnida.miAsistencia.minutosPermanencia || 1,
              ventanaAbierta: clasesVivoService.isMeetWindowOpen(yaUnida.cursoId),
            });
          }
        })
        .catch(() => {});
    };

    syncTrackerFromServer();
    const poll = setInterval(() => {
      if (!document.hidden) syncTrackerFromServer();
    }, 30000);
    const unsub = clasesVivoService.subscribeLiveChanges((evt) => {
      if (evt?.type === "CLASS_ENDED") {
        const current = clasesVivoService.getStudentTrackerState();
        if (
          current &&
          (current.sesionId === evt.sesionId || current.cursoId === evt.cursoId)
        ) {
          clasesVivoService.setStudentTrackerState(null);
        }
        return;
      }
      syncTrackerFromServer();
    });
    const onVis = () => {
      if (!document.hidden) syncTrackerFromServer();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(poll);
      unsub();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [selectedCycleId, location.pathname]);

  // Pulso cada 60s mientras `!meetWin.closed` y aviso inmediato si cerró la pestaña
  useEffect(() => {
    if (!liveTracker?.sesionId) return;
    let closedReported = false;

    const watchClose = setInterval(() => {
      const win = clasesVivoService.getMeetWindow(liveTracker.cursoId);
      if (win && win.closed && !closedReported) {
        closedReported = true;
        clasesVivoService.enviarLatido(liveTracker.sesionId, false).catch(() => {});
      } else if (win && !win.closed) {
        closedReported = false;
      }
    }, 3000);

    const heartbeat = setInterval(() => {
      const isOpen = clasesVivoService.isMeetWindowOpen(liveTracker.cursoId);
      if (isOpen) {
        clasesVivoService.enviarLatido(liveTracker.sesionId, true).catch(() => {});
      }
    }, 60000);

    return () => {
      clearInterval(watchClose);
      clearInterval(heartbeat);
    };
  }, [liveTracker?.sesionId, liveTracker?.cursoId]);
  const [selectedAnnouncementModal, setSelectedAnnouncementModal] = useState(null);
  const notifRef = useRef(null);

  const studentName = localStorage.getItem("userName") || "Lincoln Jhoel";
  const studentEmail = localStorage.getItem("userEmail") || "estudiante@academia.edu.pe";

  const initials = studentName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0].toUpperCase())
    .join("") || "LJ";

  // Cerrar notificaciones al hacer clic fuera
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setNotificationsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Estado y perfil del estudiante
  const [studentProfile, setStudentProfile] = useState(null);
  const [availableCourses, setAvailableCourses] = useState([]);
  const [contacts, setContacts] = useState({ teachers: [], classmates: [], studentCourses: [] });
  const [selectedContactKey, setSelectedContactKey] = useState("");
  const [newQuestionText, setNewQuestionText] = useState("");
  const [studentMessages, setStudentMessages] = useState([]);
  const [isSubmittingQuestion, setIsSubmittingQuestion] = useState(false);

  // Notificaciones interactivas para el estudiante sincronizadas con Backend/Local
  const [notifications, setNotifications] = useState([]);

  // 1. Cargar perfil, asignaturas y contactos reales estrictamente de los cursos del estudiante
  useEffect(() => {
    let cancelled = false;

    async function loadStudentData() {
      try {
        const [profile, courses, users] = await Promise.all([
          userService.getUserByEmail(studentEmail),
          courseService.getCourses().catch(() => []),
          userService.getUsers().catch(() => [])
        ]);
        if (!cancelled) {
          if (profile) setStudentProfile(profile);
          if (courses) setAvailableCourses(courses);
          const studentContacts = chatAcademicService.getContactsForStudent(
            profile,
            courses || [],
            users || []
          );
          setContacts(studentContacts);

          // Preseleccionar el primer contacto relevante
          if (studentContacts.teachers.length > 0) {
            setSelectedContactKey("teacher-0");
          } else if (studentContacts.classmates.length > 0) {
            setSelectedContactKey("classmate-0");
          }
        }
      } catch (err) {
        console.warn("[StudentLayout] Error cargando perfil de estudiante:", err);
      }

      if (!cancelled) {
        await chatAcademicService.fetchMessages();
        setStudentMessages(chatAcademicService.getMessagesForStudent(studentEmail));
      }
    }

    loadStudentData();

    const handleStorageUpdate = () => {
      setStudentMessages(chatAcademicService.getMessagesForStudent(studentEmail));
    };

    window.addEventListener("storage", handleStorageUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("storage", handleStorageUpdate);
    };
  }, [studentEmail]);

  // 2. Sincronizar notificaciones acotadas a los cursos del estudiante
  useEffect(() => {
    let cancelled = false;

    const syncNotifications = () => {
      const rawInscritos =
        studentProfile?.cursosInscritos ||
        studentProfile?.cursos_inscritos ||
        studentProfile?.CursosInscritos ||
        [];
      const enrolledIds = new Set(
        (Array.isArray(rawInscritos) ? rawInscritos : []).map((id) =>
          typeof id === "object" && id !== null ? String(id.id).trim() : String(id).trim()
        )
      );

      let enrolledNames = [];

      if (enrolledIds.size > 0 && availableCourses.length > 0) {
        enrolledNames = availableCourses
          .filter((c) => enrolledIds.has(String(c.id).trim()))
          .map((c) => (c.asignatura || c.nombre || "").toLowerCase().trim());
      }

      // Si el alumno no tiene cursos matriculados, solo ve simulacros generales ("SIM...")
      const mergedTasks = academicActivitiesService.getStudentMergedTasks();
      const studentTasksInCourses = mergedTasks.filter((t) => {
        const cid = String(t.cursoId || t.curso_id || "");
        if (cid.startsWith("SIM")) return true;
        if (enrolledIds.size === 0) return false;
        if (enrolledIds.has(cid)) return true;
        const taskCourseName = (t.curso || "").toLowerCase().trim();
        if (taskCourseName && enrolledNames.some((name) => taskCourseName.includes(name) || name.includes(taskCourseName))) {
          return true;
        }
        return false;
      });
      const filteredTasks = studentTasksInCourses.filter(
        (t) => t.estadoAlumno === "Por entregar" || t.estadoAlumno === "Observado"
      );
      const gradedTasks = studentTasksInCourses.filter(
        (t) => t.estadoAlumno === "Calificado" && t.nota !== null && t.nota !== undefined
      );

      const allAnns = academicActivitiesService.getAnnouncements();
      const filteredAnns = allAnns.filter((a) => {
        const cid = String(a.cursoId || a.curso_id || "");
        if (cid.startsWith("SIM")) return true;
        if (enrolledIds.size === 0) return false;
        if (enrolledIds.has(cid)) return true;
        const annCourseName = (a.curso || "").toLowerCase().trim();
        if (annCourseName && enrolledNames.some((name) => annCourseName.includes(name) || name.includes(annCourseName))) {
          return true;
        }
        return false;
      });

      // Consultas / Mensajes recibidos con respuesta o nuevos
      const studentMsgs = chatAcademicService.getMessagesForStudent(studentEmail, studentProfile?.id);
      const msgNotifs = studentMsgs
        .filter((m) => m.estado === "Respondido")
        .slice(0, 3)
        .map((m) => ({
          id: `msg-${m.id}`,
          title: `Respuesta de Docente: ${m.docenteNombre || "Profesor"}`,
          course: `${m.curso} • ${m.respuesta?.slice(0, 40) || "Tu consulta ha sido atendida"}...`,
          time: m.fechaRespuesta || "Reciente",
          type: "message",
          unread: true,
          data: m
        }));

      // Obtener IDs de notificaciones previamente leídas del almacenamiento local
      let readSet = new Set();
      try {
        const stored = JSON.parse(localStorage.getItem(`read_notifs_${studentEmail}`) || "[]");
        readSet = new Set(stored);
      } catch {}

      const combined = [
        ...gradedTasks.map((t) => {
          const notifId = `task-graded-${t.id}-${t.nota}`;
          return {
            id: notifId,
            title: `Nota Publicada: ${t.titulo}`,
            course: `${t.curso} • Obtuviste ${t.nota}/20`,
            time: "Calificado",
            type: "task",
            unread: !readSet.has(notifId),
            data: t
          };
        }),
        ...filteredTasks.map((t) => {
          const isObs = t.estadoAlumno === "Observado";
          const notifId = isObs ? `task-obs-${t.id}` : `task-${t.id}`;
          return {
            id: notifId,
            title: isObs ? `Corregir Entrega: ${t.titulo}` : `Nueva Tarea: ${t.titulo}`,
            course: `${t.curso} • Límite: ${t.fechaLimite}`,
            time: t.fechaLimite,
            type: "task",
            unread: !readSet.has(notifId),
            data: t
          };
        }),
        ...filteredAnns.map((a) => {
          const notifId = `ann-${a.id}`;
          return {
            id: notifId,
            title: `Aviso: ${a.titulo}`,
            course: `${a.curso} (${a.docente})`,
            time: a.prioridad || "Importante",
            type: "announcement",
            unread: !readSet.has(notifId),
            data: a
          };
        }),
        ...msgNotifs.map((m) => ({
          ...m,
          unread: !readSet.has(m.id)
        }))
      ];

      if (!cancelled) {
        setNotifications(
          combined.length > 0
            ? combined
            : [
                {
                  id: "def-1",
                  title: "Campus Virtual Activo",
                  course: "Estás al día con tus actividades",
                  time: "Hoy",
                  type: "class",
                  unread: false
                }
              ]
        );
      }
    };

    syncNotifications();
    academicActivitiesService.fetchStudentTasksWithSubmissions().then(syncNotifications);
    academicActivitiesService.fetchAnnouncements().then(syncNotifications);

    const unsubLive = clasesVivoService.subscribeLiveChanges((evt) => {
      if (
        evt?.type === "TASK_CREATED" ||
        evt?.type === "TASK_DELETED" ||
        evt?.type === "TASK_SUBMITTED" ||
        evt?.type === "TASK_GRADED" ||
        evt?.type === "MATERIAL_PUBLISHED"
      ) {
        academicActivitiesService.fetchStudentTasksWithSubmissions().then(syncNotifications);
        academicActivitiesService.fetchAnnouncements().then(syncNotifications);
      }
    });

    window.addEventListener("storage", syncNotifications);
    return () => {
      cancelled = true;
      unsubLive();
      window.removeEventListener("storage", syncNotifications);
    };
  }, [studentProfile, availableCourses]);

  const handleSubmitQuestion = () => {
    if (!newQuestionText.trim()) {
      alert("Por favor redacta tu mensaje o consulta antes de enviar.");
      return;
    }

    let target = null;
    let targetType = "docente";

    if (selectedContactKey.startsWith("teacher-")) {
      const idx = parseInt(selectedContactKey.replace("teacher-", ""), 10);
      target = contacts.teachers[idx];
      targetType = "docente";
    } else if (selectedContactKey.startsWith("classmate-")) {
      const idx = parseInt(selectedContactKey.replace("classmate-", ""), 10);
      target = contacts.classmates[idx];
      targetType = "companero";
    }

    if (!target) {
      if (contacts.teachers.length > 0) {
        target = contacts.teachers[0];
        targetType = "docente";
      } else if (contacts.classmates.length > 0) {
        target = contacts.classmates[0];
        targetType = "companero";
      } else {
        alert("No tienes docentes o compañeros asignados a tus cursos actualmente.");
        return;
      }
    }

    setIsSubmittingQuestion(true);
    try {
      chatAcademicService.sendMessage({
        estudianteId: studentProfile?.id || "USR-ESTUDIANTE",
        estudianteNombre: studentName,
        estudianteCorreo: studentEmail,
        estudianteCarrera: studentProfile?.carreraObjetivo || "Estudiante",
        destinatarioTipo: targetType,
        docenteId: target.id,
        docenteNombre: target.nombre,
        destinatarioId: target.id,
        destinatarioNombre: target.nombre,
        destinatarioCorreo: target.correo || "",
        cursoId: target.cursoId || "CRS-GEN",
        curso: target.cursoNombre || "Materia",
        mensaje: newQuestionText
      });

      setNewQuestionText("");
      setStudentMessages(chatAcademicService.getMessagesForStudent(studentEmail, studentProfile?.id));
      alert(
        targetType === "docente"
          ? `¡Consulta enviada exitosamente a tu docente ${target.nombre}! Podrá verla y responderte desde su panel.`
          : `¡Mensaje enviado exitosamente a tu compañero(a) ${target.nombre}!`
      );
    } catch (err) {
      alert("Error al enviar el mensaje: " + err.message);
    } finally {
      setIsSubmittingQuestion(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOutFromApp();
      navigate("/login");
    } catch (error) {
      window.alert(error.message);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0a0a0e] text-slate-900 dark:text-slate-100 flex flex-col font-sans transition-colors duration-500 overflow-x-hidden">
      
      {/* 1. BARRA VERTICAL LATERAL (SLIM SIDEBAR DESKTOP) - ANCLADA A 100DVH CON SALIR SIEMPRE VISIBLE */}
      <aside className="hidden md:flex flex-col fixed inset-y-0 left-0 h-dvh w-20 bg-[#0A1128] dark:bg-[#060814] border-r border-slate-800/80 z-40 text-white shadow-xl overflow-hidden transition-all">
        {/* Brand Icon Superior en Sidebar */}
        <Link
          to="/estudiante/panel"
          className="h-16 flex items-center justify-center border-b border-white/10 hover:bg-white/5 transition-colors group cursor-pointer shrink-0"
          title="Ir a Mis Cursos"
        >
          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-md group-hover:scale-105 transition-transform">
            <School className="w-5 h-5 text-amber-300" />
          </div>
        </Link>

        {/* Enlaces Principales de Navegación Vertical */}
        <nav className="flex-1 min-h-0 overflow-y-auto overflow-x-hidden py-3 flex flex-col items-center space-y-2">
          {/* Cursos */}
          <NavLink
            to="/estudiante/panel"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mis Cursos"
          >
            <BookOpen className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Cursos</span>
          </NavLink>

          {/* Chat / Consultas */}
          <button
            type="button"
            onClick={() => setChatModalOpen(true)}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
            title="Chat y Consultas con Docentes"
          >
            <MessageSquare className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Chat</span>
          </button>

          {/* Horario */}
          <NavLink
            to="/estudiante/horarios"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mi Horario de Clases"
          >
            <Calendar className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Horario</span>
          </NavLink>

          {/* Pagos / Boletas */}
          <NavLink
            to="/estudiante/pagos"
            className={({ isActive }) =>
              `w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold transition-all group cursor-pointer ${
                isActive
                  ? "bg-blue-600 text-white shadow-lg shadow-blue-600/30 ring-2 ring-blue-400/50"
                  : "text-slate-400 hover:text-white hover:bg-white/5"
              }`
            }
            title="Mis Pagos y Boletas"
          >
            <CreditCard className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Pagos</span>
          </NavLink>

          {/* Biblioteca Virtual */}
          <button
            type="button"
            onClick={() => setLibraryModalOpen(true)}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
            title="Biblioteca Virtual y Banco de Ejercicios"
          >
            <Library className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Biblioteca</span>
          </button>

          {/* Ayuda y Soporte */}
          <button
            type="button"
            onClick={() => setHelpModalOpen(true)}
            className="w-16 h-16 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-slate-400 hover:text-white hover:bg-white/5 transition-all group cursor-pointer"
            title="Centro de Ayuda y Tutoría"
          >
            <HelpCircle className="w-5 h-5 mb-1 group-hover:scale-110 transition-transform" />
            <span>Ayuda</span>
          </button>
        </nav>

        {/* Botón Salir Inferior (siempre visible al pie del viewport) */}
        <div className="p-3 border-t border-white/10 flex flex-col items-center shrink-0 mt-auto bg-[#0A1128] dark:bg-[#060814]">
          <button
            type="button"
            onClick={handleLogout}
            className="w-14 h-14 rounded-xl flex flex-col items-center justify-center text-[10px] font-bold text-rose-400 hover:bg-rose-500/20 hover:text-rose-300 transition-all cursor-pointer"
            title="Cerrar Sesión"
          >
            <LogOut className="w-5 h-5 mb-1" />
            <span>Salir</span>
          </button>
        </div>
      </aside>

      {/* 2. HEADER SUPERIOR MODERNO (DESKTOP + MOBILE) */}
      <header className="bg-white dark:bg-slate-900/90 dark:backdrop-blur-xl border-b border-slate-200 dark:border-white/10 sticky top-0 z-30 shadow-xs md:pl-20 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-3">
          
          {/* Logo y Nombre de Marca */}
          <Link
            to="/estudiante/panel"
            className="flex items-center space-x-2.5 sm:space-x-3 shrink-0 hover:opacity-90 transition-opacity cursor-pointer group"
            title="Ir al inicio del campus estudiantil"
          >
            <div className="md:hidden w-9 h-9 rounded-xl bg-[#1E3A8A] dark:bg-blue-600 flex items-center justify-center text-white shadow-xs">
              <School className="w-5 h-5 text-amber-300" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5 sm:space-x-2">
                <span className="font-extrabold text-sm sm:text-base text-slate-900 dark:text-white tracking-tight">
                  Academia Pre
                </span>
                <span className="px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs font-bold bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-800">
                  Campus Virtual
                </span>
              </div>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 hidden sm:block">
                Preparación Preuniversitaria de Alto Rendimiento
              </p>
            </div>
          </Link>

          {/* Controles de la Derecha: Campana, Modo Oscuro, Avatar Estudiante */}
          <div className="flex items-center space-x-2 sm:space-x-3 shrink-0">
            
            {/* Campana de Notificaciones con Badge */}
            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setNotificationsOpen(!notificationsOpen)}
                className="relative p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 border border-slate-200 dark:border-white/10 transition-colors cursor-pointer"
                title="Notificaciones y avisos académicos"
                aria-label="Ver notificaciones"
              >
                <Bell className="w-5 h-5" />
                {notifications.filter((n) => n.unread).length > 0 && (
                  <span className="absolute -top-1 -right-1 px-1.5 py-0.2 bg-amber-500 text-slate-950 text-[10px] font-black rounded-full shadow-sm animate-pulse">
                    {notifications.filter((n) => n.unread).length}
                  </span>
                )}
              </button>

              {/* Menú Desplegable de Notificaciones */}
              {notificationsOpen && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 py-3 z-50 animate-scale-up">
                  <div className="px-4 pb-2 border-b border-slate-100 dark:border-white/10 flex items-center justify-between">
                    <span className="text-xs font-extrabold text-slate-800 dark:text-white">
                      Notificaciones Académicas
                    </span>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          const allIds = notifications.map((n) => n.id);
                          try {
                            localStorage.setItem(`read_notifs_${studentEmail}`, JSON.stringify(allIds));
                          } catch {}
                          setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
                        }}
                        className="text-[10px] text-blue-600 dark:text-blue-400 hover:underline font-semibold cursor-pointer"
                      >
                        Marcar leídas
                      </button>
                      <span className="text-[10px] bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 font-bold px-2 py-0.5 rounded-full">
                        {notifications.filter((n) => n.unread).length} activas
                      </span>
                    </div>
                  </div>

                  <div className="divide-y divide-slate-100 dark:divide-white/5 max-h-72 overflow-y-auto">
                    {notifications.map((notif) => (
                      <div
                        key={notif.id}
                        className="p-3.5 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors cursor-pointer group"
                        onClick={() => {
                          setNotificationsOpen(false);
                          
                          // 1. Guardar de forma persistente que esta notificación fue leída
                          try {
                            const stored = JSON.parse(localStorage.getItem(`read_notifs_${studentEmail}`) || "[]");
                            if (!stored.includes(notif.id)) {
                              stored.push(notif.id);
                              localStorage.setItem(`read_notifs_${studentEmail}`, JSON.stringify(stored));
                            }
                          } catch {}

                          // 2. Desmarcar en el estado en tiempo real
                          setNotifications((prev) =>
                            prev.map((n) => (n.id === notif.id ? { ...n, unread: false } : n))
                          );

                          // 3. Acción interactiva según tipo
                          if (notif.type === "task" && notif.data) {
                            setSelectedTaskModal(notif.data);
                          } else if (notif.type === "announcement" && notif.data) {
                            setSelectedAnnouncementModal(notif.data);
                          } else if (notif.type === "message" && notif.data) {
                            // Preseleccionar el docente o remitente en el selector de chat
                            const senderName = (notif.data.docenteNombre || "").toLowerCase();
                            const targetIdx = contacts.teachers.findIndex((t) =>
                              (t.nombre || "").toLowerCase().includes(senderName) ||
                              senderName.includes((t.nombre || "").toLowerCase())
                            );
                            if (targetIdx !== -1) {
                              setSelectedContactKey(`teacher-${targetIdx}`);
                            }
                            setChatModalOpen(true);
                          } else if (notif.type === "class") {
                            navigate("/estudiante/horarios");
                          }
                        }}
                      >
                        <div className="flex items-start gap-2.5">
                          <div className="p-1.5 rounded-lg bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 mt-0.5 shrink-0">
                            {notif.type === "task" && <FileText className="w-4 h-4 text-amber-500" />}
                            {notif.type === "announcement" && <AlertCircle className="w-4 h-4 text-blue-500" />}
                            {notif.type === "message" && <MessageSquare className="w-4 h-4 text-indigo-500" />}
                            {notif.type === "class" && <Video className="w-4 h-4 text-emerald-500" />}
                            {notif.type === "exam" && <Sparkles className="w-4 h-4 text-indigo-500" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                              {notif.title}
                            </p>
                            <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                              {notif.course}
                            </p>
                            <span className="text-[10px] text-slate-400 font-mono mt-0.5 block">
                              {notif.time}
                            </span>
                          </div>
                          {notif.unread && (
                            <span className="w-2 h-2 rounded-full bg-blue-600 shrink-0 mt-1" />
                          )}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="px-4 pt-2 border-t border-slate-100 dark:border-white/10 text-center">
                    <button
                      type="button"
                      onClick={() => setNotificationsOpen(false)}
                      className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Cerrar panel
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Alternador de Tema Claro / Oscuro */}
            <ThemeToggle />

            {/* Perfil del Alumno (Avatar + Saludo) */}
            <div className="flex items-center space-x-2.5 pl-1 sm:pl-2">
              <div className="hidden sm:block text-right">
                <div className="text-xs sm:text-sm font-extrabold text-slate-900 dark:text-white leading-tight">
                  Hola, {studentName}
                </div>
                <div className="text-[11px] font-semibold text-emerald-600 dark:text-emerald-400 leading-tight flex items-center justify-end gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                  <span>Estudiante</span>
                </div>
              </div>

              <div
                className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-gradient-to-tr from-blue-700 to-indigo-600 text-white flex items-center justify-center font-extrabold text-xs sm:text-sm shadow-sm ring-2 ring-blue-300 dark:ring-blue-800 cursor-pointer"
                title={`${studentName} (${studentEmail})`}
              >
                {initials}
              </div>
            </div>

            {/* Botón Menú Móvil */}
            <button
              type="button"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label="Abrir menú de navegación"
              className="md:hidden p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl border border-slate-200 dark:border-white/10 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* MENÚ MÓVIL DESPLEGABLE */}
        {mobileMenuOpen && (
          <div className="md:hidden bg-white/95 dark:bg-[#0a0a0e]/95 backdrop-blur-2xl border-b border-slate-200 dark:border-white/10 p-4 shadow-xl animate-fade-in max-h-[calc(100dvh-64px)] flex flex-col overflow-hidden">
            <div className="pb-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0">
              <div>
                <div className="text-sm font-extrabold text-slate-900 dark:text-white">{studentName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400">{studentEmail}</div>
              </div>
              <span className="px-2 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300">
                Estudiante
              </span>
            </div>

            <nav className="flex-1 min-h-0 overflow-y-auto py-2.5 space-y-1">
              <NavLink
                to="/estudiante/panel"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <BookOpen className="w-4 h-4" />
                  <span>Mis Cursos Matriculados</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>

              <NavLink
                to="/estudiante/horarios"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <Calendar className="w-4 h-4" />
                  <span>Mi Horario de Clases</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>

              <NavLink
                to="/estudiante/pagos"
                onClick={() => setMobileMenuOpen(false)}
                className={({ isActive }) => `flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  isActive
                    ? "bg-[#1E3A8A] text-white shadow-xs dark:bg-white/15 dark:text-white"
                    : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                <div className="flex items-center space-x-2.5">
                  <CreditCard className="w-4 h-4" />
                  <span>Estado de Cuenta y Boletas</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </NavLink>

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setLibraryModalOpen(true); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <Library className="w-4 h-4" />
                  <span>Biblioteca y Materiales</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>

              <button
                type="button"
                onClick={() => { setMobileMenuOpen(false); setHelpModalOpen(true); }}
                className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs sm:text-sm font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                <div className="flex items-center space-x-2.5">
                  <HelpCircle className="w-4 h-4" />
                  <span>Centro de Ayuda y Tutoría</span>
                </div>
                <ChevronRight className="w-4 h-4 opacity-50" />
              </button>
            </nav>

            <div className="pt-3 border-t border-slate-100 dark:border-white/10 shrink-0 mt-auto">
              <button
                type="button"
                onClick={handleLogout}
                className="w-full flex items-center justify-center space-x-2 px-3.5 py-2.5 rounded-xl bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-300 text-xs sm:text-sm font-bold hover:bg-rose-100 dark:hover:bg-rose-900/50 border border-rose-200 dark:border-rose-800 transition-colors cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Cerrar Sesión</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* 3. ÁREA DE CONTENIDO PRINCIPAL */}
      <main className="flex-1 md:pl-20 w-full transition-all">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-5">
          {liveTracker && !isReadOnlyHistory && (
            <div
              role="status"
              className="rounded-2xl border border-emerald-400/70 bg-gradient-to-r from-emerald-950/90 via-slate-900 to-slate-900 text-white px-4 py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-md"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-emerald-600/30 border border-emerald-400/50 flex items-center justify-center text-emerald-300 shrink-0">
                  <CheckCircle2 className="w-4.5 h-4.5" />
                </div>
                <div className="text-xs">
                  <div className="font-extrabold text-sm">
                    Conectado a{" "}
                    <span className="text-emerald-300">{liveTracker.asignatura}</span> • Asistencia
                    en validación automática (2.º plano)
                  </div>
                  <div className="text-emerald-200/85 mt-0.5">
                    Estado inicial: <strong>{liveTracker.estado}</strong>
                    {liveTracker.horaRegistro
                      ? ` (${new Date(liveTracker.horaRegistro).toLocaleTimeString("es-PE", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })})`
                      : ""}{" "}
                    • Permanencia validada:{" "}
                    <strong>{liveTracker.minutosPermanencia || 1} min acumulados</strong>{" "}
                    {clasesVivoService.isMeetWindowOpen(liveTracker.cursoId)
                      ? "(Ventana Meet abierta)"
                      : "(Reabre Meet para continuar acumulando permanencia)"}
                  </div>
                </div>
              </div>

              {liveTracker.meetUrl && (
                <button
                  type="button"
                  onClick={() => {
                    clasesVivoService.openOrFocusMeetWindow(
                      liveTracker.cursoId,
                      liveTracker.meetUrl
                    );
                    clasesVivoService.enviarLatido(liveTracker.sesionId, true).catch(() => {});
                  }}
                  className="inline-flex items-center justify-center gap-1.5 bg-emerald-600 hover:bg-emerald-500 text-white font-extrabold text-xs px-3.5 py-2 rounded-xl cursor-pointer transition-colors shrink-0"
                >
                  <span>Enfocar / Reabrir Google Meet</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          )}
          {isReadOnlyHistory && selectedCycle && (
            <div
              role="status"
              className="rounded-2xl border border-amber-300 dark:border-amber-700/60 bg-amber-50/90 dark:bg-amber-950/40 px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs animate-fade-in"
            >
              <div className="flex items-start sm:items-center gap-3">
                <div className="p-2 rounded-xl bg-amber-500/20 text-amber-700 dark:text-amber-300 shrink-0">
                  <Clock className="w-4 h-4" />
                </div>
                <div className="text-xs">
                  <p className="font-extrabold text-amber-950 dark:text-amber-200">
                    Modo Historial (Solo Lectura) — {selectedCycle.nombre}
                  </p>
                  <p className="text-amber-800 dark:text-amber-300/90 mt-0.5">
                    Estás consultando un ciclo académico finalizado. Puedes revisar asignaturas, separatas, boletas y notas históricas, pero las salas en vivo y entregas están cerradas.
                  </p>
                </div>
              </div>
              {availableStudentCycles.some((c) => !c.isReadOnly) && (
                <button
                  type="button"
                  onClick={selectActiveCycle}
                  className="shrink-0 px-3.5 py-2 rounded-xl bg-amber-600 hover:bg-amber-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                >
                  Volver a mi ciclo actual
                </button>
              )}
            </div>
          )}
          <Outlet />
        </div>
      </main>

      {/* 4. FOOTER */}
      <footer className="md:pl-20 bg-white dark:bg-slate-900/90 border-t border-slate-200 dark:border-white/10 py-4 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <p>© 2026 Academia Preuniversitaria • Plataforma Virtual de Alto Rendimiento</p>
      </footer>

      {/* MODAL: CHAT Y CONSULTAS */}
      {chatModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-blue-100 dark:bg-blue-950/60 text-blue-600 rounded-xl">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Canal de Consultas y Chat Académico
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Comunícate con tus docentes y tutores de preparación
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 rounded-xl p-4 text-xs space-y-2 border border-slate-200/80 dark:border-white/10">
              <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 font-bold">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Docentes en línea listos para resolver dudas</span>
              </div>
              <p className="text-slate-600 dark:text-slate-300">
                Puedes formular preguntas sobre las tareas de la semana, problemas de álgebra, leyes de física o temas del simulacro.
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Selecciona el destinatario (docente o compañero de tu curso):
              </label>
              <SearchableSelect
                value={selectedContactKey}
                onChange={setSelectedContactKey}
                disabled={contacts.teachers.length === 0 && contacts.classmates.length === 0}
                placeholder={
                  contacts.teachers.length === 0 && contacts.classmates.length === 0
                    ? "No hay contactos vinculados a tus asignaturas"
                    : "Escribe nombre de tu docente, compañero o materia..."
                }
                options={[
                  ...contacts.teachers.map((t, idx) => ({
                    value: `teacher-${idx}`,
                    label: t.nombre,
                    sublabel: `${t.cursoNombre} (${t.area || "Cátedra"})`,
                    searchText: `${t.correo || ""} ${t.cursoNombre || ""}`,
                    group: "👨‍🏫 Mis Docentes Titulares"
                  })),
                  ...contacts.classmates.map((c, idx) => ({
                    value: `classmate-${idx}`,
                    label: c.nombre,
                    sublabel: `${c.carrera || "Postulante"} • ${c.cursoNombre}`,
                    searchText: `${c.correo || ""} ${c.carrera || ""} ${c.cursoNombre || ""}`,
                    group: "👥 Mis Compañeros de Curso"
                  }))
                ]}
              />
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-bold text-slate-700 dark:text-slate-200 block">
                Escribe tu mensaje o consulta:
              </label>
              <textarea
                rows={3}
                value={newQuestionText}
                onChange={(e) => setNewQuestionText(e.target.value)}
                placeholder="Hola, tengo una consulta sobre las actividades o temas de clase..."
                className="w-full p-3 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                type="button"
                onClick={() => setChatModalOpen(false)}
                className="px-4 py-2 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
              >
                Cerrar
              </button>
              {isReadOnlyHistory ? (
                <span className="px-4 py-2 rounded-xl bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 text-xs font-bold">
                  Ciclo Finalizado (Solo lectura)
                </span>
              ) : (
                <button
                  type="button"
                  disabled={isSubmittingQuestion}
                  onClick={handleSubmitQuestion}
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md cursor-pointer disabled:opacity-50"
                >
                  {isSubmittingQuestion
                    ? "Enviando..."
                    : selectedContactKey.startsWith("classmate-")
                    ? "Enviar a Compañero"
                    : "Enviar Consulta al Docente"}
                </button>
              )}
            </div>

            {/* HISTORIAL DE CONSULTAS Y RESPUESTAS DEL DOCENTE */}
            {studentMessages.length > 0 && (
              <div className="pt-3 border-t border-slate-100 dark:border-white/10 space-y-2.5 max-h-56 overflow-y-auto">
                <span className="text-[11px] font-extrabold uppercase text-slate-500 tracking-wider block">
                  Tus Consultas Enviadas ({studentMessages.length})
                </span>
                {studentMessages.map((msg) => (
                  <div
                    key={msg.id}
                    className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/70 dark:border-white/5 space-y-2 text-xs"
                  >
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="font-extrabold text-slate-800 dark:text-white truncate">
                        Para: {msg.docenteNombre} ({msg.curso})
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold ${
                        msg.estado === "Pendiente"
                          ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300"
                          : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300"
                      }`}>
                        {msg.estado}
                      </span>
                    </div>

                    <p className="text-slate-600 dark:text-slate-300 text-xs">
                      {msg.mensaje}
                    </p>

                    {msg.respuesta && (
                      <div className="p-2.5 bg-blue-50 dark:bg-blue-950/40 rounded-lg border border-blue-200/60 dark:border-blue-900/40 text-xs space-y-1">
                        <div className="flex items-center justify-between font-bold text-blue-700 dark:text-blue-300 text-[10px]">
                          <span className="flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                            Respuesta del Docente:
                          </span>
                          <span className="font-mono text-slate-400">{msg.fechaRespuesta}</span>
                        </div>
                        <p className="text-slate-800 dark:text-slate-200 text-xs font-medium">
                          {msg.respuesta}
                        </p>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* MODAL: BIBLIOTECA VIRTUAL Y SEPARATAS */}
      {libraryModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-indigo-100 dark:bg-indigo-950/60 text-indigo-600 rounded-xl">
                  <Library className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Biblioteca Digital y Separatas
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Materiales de clase, bancos de preguntas y exámenes
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setLibraryModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-2.5 max-h-64 overflow-y-auto pr-1">
              {[
                { title: "Separata Teórico-Práctica N° 4: Álgebra", size: "2.4 MB", type: "PDF", tag: "Semana Actual" },
                { title: "Guía de Problemas Resueltos: Cinemática y Dinámica", size: "3.8 MB", type: "PDF", tag: "Física" },
                { title: "Compendio de Biología Celular y Genética", size: "5.1 MB", type: "PDF", tag: "Biología" },
                { title: "Banco de 500 Preguntas Tipo Admisión San Marcos / UNI", size: "8.2 MB", type: "PDF", tag: "Exámenes" }
              ].map((doc, idx) => (
                <div
                  key={idx}
                  className="p-3 rounded-xl border border-slate-200/80 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex items-center justify-between hover:border-blue-300 transition-all"
                >
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <FileText className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-100 truncate">
                        {doc.title}
                      </p>
                      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-mono">
                        {doc.type} • {doc.size} • <span className="text-indigo-600 dark:text-indigo-400 font-bold">{doc.tag}</span>
                      </span>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() => alert(`Descargando material: ${doc.title}`)}
                    className="p-1.5 rounded-lg bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 hover:bg-blue-200 text-xs font-bold shrink-0 ml-2 cursor-pointer"
                    title="Descargar material"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setLibraryModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-200 cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CENTRO DE AYUDA Y TUTORÍA */}
      {helpModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-md w-full p-6 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-white/10">
              <div className="flex items-center space-x-2">
                <div className="p-2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 rounded-xl">
                  <HelpCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                    Centro de Ayuda Estudiantil
                  </h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">
                    Soporte técnico y coordinación académica
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs text-slate-600 dark:text-slate-300">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                <strong className="text-slate-900 dark:text-white block">WhatsApp de Coordinación Pre:</strong>
                <p className="font-mono text-emerald-600 dark:text-emerald-400 font-bold">+51 987 654 321</p>
                <p className="text-[11px] text-slate-400">Horario de atención: Lunes a Sábado de 07:30 a 19:30 hrs.</p>
              </div>

              <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-200/80 dark:border-white/10 space-y-1">
                <strong className="text-slate-900 dark:text-white block">Soporte Técnico de Plataforma:</strong>
                <p className="font-mono text-blue-600 dark:text-blue-400 font-bold">soporte@academiapre.edu.pe</p>
                <p className="text-[11px] text-slate-400">Para problemas con Google Meet, acceso a salas o restablecimiento de contraseña.</p>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="button"
                onClick={() => setHelpModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold hover:bg-blue-700 cursor-pointer"
              >
                Entendido
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL: ENTREGA INTERACTIVA DE TAREA */}
      <StudentTaskModal
        task={selectedTaskModal}
        isOpen={Boolean(selectedTaskModal)}
        isReadOnly={isReadOnlyHistory}
        onClose={() => setSelectedTaskModal(null)}
        onDeliver={async (taskId) => {
          setNotifications((prev) =>
            prev.map((n) =>
              n.id === `task-${taskId}` || n.id === `task-obs-${taskId}`
                ? { ...n, unread: false }
                : n
            )
          );
        }}
      />

      {/* MODAL: DETALLE DE AVISO / COMUNICADO ACADÉMICO */}
      <StudentAnnouncementModal
        announcement={selectedAnnouncementModal}
        isOpen={Boolean(selectedAnnouncementModal)}
        onClose={() => setSelectedAnnouncementModal(null)}
      />
    </div>
  );
}
