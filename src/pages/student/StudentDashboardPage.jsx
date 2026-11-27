import React, { useState, useEffect, useMemo } from "react";
import { saveAttendanceRecord } from "../../services/asistencia";
import { clasesVivoService } from "../../services/clasesVivoService";
import { academicActivitiesService } from "../../services/academicActivitiesService";
import WeeklyActivitiesWidget from "../../components/student/WeeklyActivitiesWidget";
import { useStudentCycle } from "../../context/StudentCycleContext";

import {
  Video,
  Clock,
  User,
  Sparkles,
  ExternalLink,
  BookOpen,
  Loader2,
  CheckCircle2,
  X,
  Play,
  Pause,
  ChevronLeft,
  ChevronRight,
  Filter,
  GraduationCap,
  Calendar,
  Layers,
  Award,
  ChevronDown
} from "lucide-react";

export default function StudentDashboardPage() {
  const {
    loadingCycle: loading,
    errorCycle: error,
    studentProfile: estudianteActivo,
    availableStudentCycles,
    selectedCycle,
    selectedCycleId,
    setSelectedCycleId,
    isReadOnlyHistory,
    cycleCourses: misCursosInscritos
  } = useStudentCycle();

  const [activeMeetModal, setActiveMeetModal] = useState(null);
  const [attendanceNotice, setAttendanceNotice] = useState(null);
  const [liveSessionsByCourse, setLiveSessionsByCourse] = useState({});
  const [resumenAsistencia, setResumenAsistencia] = useState({});
  const [courseMaterials, setCourseMaterials] = useState([]);
  const [liveTracker, setLiveTracker] = useState(() => clasesVivoService.getStudentTrackerState());

  useEffect(() => {
    const unsub = clasesVivoService.subscribeStudentTracker(setLiveTracker);
    return unsub;
  }, []);

  useEffect(() => {
    let cancelled = false;
    const syncLiveData = async () => {
      try {
        const [activasRes, resumenRes, anns] = await Promise.all([
          clasesVivoService.listarClasesActivas(selectedCycleId).catch(() => ({ sesiones: [] })),
          clasesVivoService.obtenerResumenAsistencia(selectedCycleId).catch(() => ({ cursos: {} })),
          academicActivitiesService.fetchAnnouncements().catch(() => []),
        ]);
        if (cancelled) return;

        const map = {};
        for (const s of activasRes?.sesiones || []) {
          if (s.cursoId) map[s.cursoId] = s;
        }
        setLiveSessionsByCourse(map);
        setResumenAsistencia(resumenRes?.cursos || {});
        setCourseMaterials(Array.isArray(anns) ? anns.filter((a) => Boolean(a.archivoUrl)) : []);
      } catch {}
    };

    syncLiveData();
    const id = setInterval(() => {
      if (!document.hidden) syncLiveData();
    }, 30000);
    const unsub = clasesVivoService.subscribeLiveChanges((evt) => {
      if (evt?.type === "CLASS_ENDED" && evt.cursoId) {
        setLiveSessionsByCourse((prev) => {
          const next = { ...prev };
          delete next[evt.cursoId];
          return next;
        });
        setAttendanceNotice(null);
      }
      syncLiveData();
    });
    const onVis = () => {
      if (!document.hidden) syncLiveData();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      cancelled = true;
      clearInterval(id);
      unsub();
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [selectedCycleId]);

  const latestMaterialByCourse = useMemo(() => {
    const map = {};
    for (const mat of courseMaterials) {
      const cid = String(mat.cursoId || mat.curso_id || "");
      if (cid && !map[cid]) map[cid] = mat;
    }
    return map;
  }, [courseMaterials]);

  // Estado para el carrusel de banners académicos
  const [activeSlide, setActiveSlide] = useState(0);
  const [isCarouselPlaying, setIsCarouselPlaying] = useState(true);

  const slides = [
    {
      id: 1,
      badge: `${selectedCycle?.nombre || "Ciclo Preuniversitario"} • Preparación Integral`,
      title: "Talleres y Tutorías de Refuerzo Académico",
      subtitle: "Conoce la programación de la semana y consolida tu preparación con docentes de alto rendimiento.",
      items: [
        "Los talleres son sesiones grupales para practicar ejercicios tipo examen de admisión.",
        "Las tutorías son espacios individuales donde resolverás todas tus dudas complejas."
      ],
      actionText: "Ver Horarios Aquí",
      accentBg: "from-blue-900 via-indigo-900 to-[#0A1128]",
      badgeColor: "bg-amber-400 text-slate-950"
    },
    {
      id: 2,
      badge: "Simulacros Tipo Examen",
      title: "Simulacro General de Ciencias y Humanidades",
      subtitle: "Mide tu puntaje este domingo con 100 preguntas cronometradas y ranking en tiempo real.",
      items: [
        "3 horas cronometradas simulando la prueba oficial de San Marcos y UNI.",
        "Solucionario en video y retroalimentación personalizada tras finalizar."
      ],
      actionText: "Conocer Detalles",
      accentBg: "from-indigo-950 via-slate-900 to-blue-950",
      badgeColor: "bg-emerald-400 text-slate-950"
    },
    {
      id: 3,
      badge: "Biblioteca Digital 24/7",
      title: "Banco de Separatas Teóricas y Ejercicios",
      subtitle: "Accede al material oficial descargable con solucionarios de exámenes de admisión anteriores.",
      items: [
        "Separatas semanales con teoría resumida y fórmulas esenciales.",
        "Guías didácticas con problemas ordenados de menor a mayor dificultad."
      ],
      actionText: "Explorar Separatas",
      accentBg: "from-[#0A1128] via-blue-950 to-indigo-900",
      badgeColor: "bg-blue-300 text-slate-950"
    }
  ];

  // Auto-avance del carrusel
  useEffect(() => {
    if (!isCarouselPlaying) return;
    const interval = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 6500);
    return () => clearInterval(interval);
  }, [isCarouselPlaying, slides.length]);

  // Construcción limpia del nombre completo
  const studentName = estudianteActivo
    ? `${estudianteActivo.nombres || ""} ${estudianteActivo.apellidos || ""}`.trim()
    : (localStorage.getItem("userName") || "Estudiante");

  const carreraObjetivo = selectedCycle?.programa || estudianteActivo?.carreraObjetivo || "Preparación Preuniversitaria";
  const universidadObjetivo = estudianteActivo?.universidad || "UNMSM / UNI";

  const handleJoinMeet = async (course) => {
    if (isReadOnlyHistory) return;
    const liveSession = liveSessionsByCourse[course.id];
    if (!liveSession) {
      alert("El docente aún no ha iniciado la sesión en vivo de esta asignatura.");
      return;
    }

    try {
      const joined = await clasesVivoService.unirseAClase(liveSession, course.asignatura);
      const horaActual = new Date().toLocaleTimeString("es-PE", {
        hour: "2-digit",
        minute: "2-digit",
      });
      setAttendanceNotice({
        asignatura: course.asignatura,
        docente: course.docente || liveSession.docenteNombre || "Docente a cargo",
        meetUrl: joined.meetUrl || course.meetUrl,
        hora: horaActual,
      });

      saveAttendanceRecord({
        cursoId: course.id,
        curso: course.asignatura,
        docenteId: course.docenteId || "USR-002",
        docente: course.docente || "Docente a cargo",
        estudianteId: estudianteActivo?.id || "USR-005",
        estudiante: studentName,
        horaRegistro: horaActual,
      }).catch(() => {});
    } catch (err) {
      alert(err.message || "No se pudo unir a la sesión en vivo.");
    }
  };

  // Colores o temas decorativos por materia para asemejarse al diseño de tarjetas moderno
  const getCourseTheming = (index) => {
    const themes = [
      { gradient: "from-pink-500/10 via-rose-500/5 to-transparent", badge: "bg-pink-100 text-pink-700 dark:bg-pink-950/60 dark:text-pink-300", border: "border-pink-200 dark:border-pink-900/40", progress: "95%" },
      { gradient: "from-amber-500/10 via-orange-500/5 to-transparent", badge: "bg-amber-100 text-amber-700 dark:bg-amber-950/60 dark:text-amber-300", border: "border-amber-200 dark:border-amber-900/40", progress: "90%" },
      { gradient: "from-blue-500/10 via-indigo-500/5 to-transparent", badge: "bg-blue-100 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300", border: "border-blue-200 dark:border-blue-900/40", progress: "100%" },
      { gradient: "from-emerald-500/10 via-teal-500/5 to-transparent", badge: "bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300", border: "border-emerald-200 dark:border-emerald-900/40", progress: "85%" },
      { gradient: "from-purple-500/10 via-violet-500/5 to-transparent", badge: "bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300", border: "border-purple-200 dark:border-purple-900/40", progress: "92%" }
    ];
    return themes[index % themes.length];
  };

  if (loading) {
    return (
      <div className="flex flex-col justify-center items-center min-h-[400px] space-y-3">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-semibold text-slate-500">Cargando tus asignaturas y actividades...</p>
      </div>
    );
  }

  const currentSlide = slides[activeSlide];

  return (
    <div className="space-y-8 animate-fade-in">
      {error && (
        <p role="alert" className="rounded-xl border border-red-300 bg-red-50 p-4 text-sm font-bold text-red-700 shadow-sm">
          {error}
        </p>
      )}

      {/* 1. CARRUSEL DE BANNERS ACADÉMICOS (INSPIRADO EN EL PORTAL DE REFERENCIA) */}
      <section className="relative rounded-3xl overflow-hidden shadow-xl border border-slate-200/80 dark:border-white/10">
        <div className={`bg-gradient-to-r ${currentSlide.accentBg} p-6 sm:p-8 md:p-10 text-white min-h-[220px] sm:min-h-[250px] flex flex-col justify-between transition-all duration-700`}>
          
          {/* Header del Slide */}
          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div className="max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-black uppercase tracking-wide bg-white/15 backdrop-blur-md border border-white/20 text-white">
                <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                <span>{currentSlide.badge}</span>
              </div>
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight leading-tight">
                {currentSlide.title}
              </h2>
              <p className="text-blue-100 text-xs sm:text-sm md:text-base leading-relaxed">
                {currentSlide.subtitle}
              </p>
            </div>

            {/* Recuadro lateral explicativo tipo el portal de referencia */}
            <div className="hidden lg:block bg-black/35 backdrop-blur-md rounded-2xl p-4 border border-white/15 max-w-xs shrink-0 text-xs space-y-2">
              <div className="font-extrabold text-amber-300 flex items-center gap-1.5 uppercase tracking-wider text-[11px]">
                <GraduationCap className="w-4 h-4" />
                <span>Metodología Preuniversitaria</span>
              </div>
              <ul className="space-y-1.5 text-slate-200 text-[11px] leading-snug">
                {currentSlide.items.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-1.5">
                    <span className="text-amber-400 font-bold">•</span>
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Footer del Slide con Controles de Reproducción y Paginación */}
          <div className="relative z-10 pt-4 flex items-center justify-between border-t border-white/10 mt-4">
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => {
                  const targetElement = document.getElementById("mis-cursos-section");
                  if (targetElement) targetElement.scrollIntoView({ behavior: "smooth" });
                }}
                className="bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs sm:text-sm px-4 py-2 rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95 cursor-pointer"
              >
                {currentSlide.actionText} →
              </button>
            </div>

            {/* Controles de Carrusel */}
            <div className="flex items-center gap-2 bg-black/30 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/10">
              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev - 1 + slides.length) % slides.length)}
                className="p-1 hover:text-amber-300 transition-colors cursor-pointer"
                aria-label="Slide anterior"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-1.5 px-1">
                {slides.map((_, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => setActiveSlide(idx)}
                    className={`h-2 rounded-full transition-all cursor-pointer ${
                      activeSlide === idx ? "w-6 bg-amber-400" : "w-2 bg-white/40 hover:bg-white/70"
                    }`}
                    aria-label={`Ir al slide ${idx + 1}`}
                  />
                ))}
              </div>

              <button
                type="button"
                onClick={() => setActiveSlide((prev) => (prev + 1) % slides.length)}
                className="p-1 hover:text-amber-300 transition-colors cursor-pointer"
                aria-label="Slide siguiente"
              >
                <ChevronRight className="w-4 h-4" />
              </button>

              <div className="w-px h-3 bg-white/20 mx-1" />

              <button
                type="button"
                onClick={() => setIsCarouselPlaying(!isCarouselPlaying)}
                className="p-1 hover:text-amber-300 transition-colors cursor-pointer"
                title={isCarouselPlaying ? "Pausar carrusel" : "Reanudar carrusel"}
                aria-label={isCarouselPlaying ? "Pausar carrusel" : "Reanudar carrusel"}
              >
                {isCarouselPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* 2. ALERTA DE ASISTENCIA REGISTRADA Y APERTURA DE MEET */}
      {attendanceNotice && (
        <div role="status" className="bg-emerald-50 dark:bg-emerald-950/40 border-2 border-emerald-500/40 rounded-2xl p-4 sm:p-5 flex items-start justify-between gap-4 animate-fade-in shadow-md">
          <div className="flex items-start space-x-3.5">
            <div className="p-2 bg-emerald-500 text-white rounded-xl shrink-0 mt-0.5 shadow-xs">
              <CheckCircle2 className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-emerald-950 dark:text-emerald-100">
                ¡Asistencia Registrada Exitosamente!
              </h3>
              <p className="text-sm text-emerald-800 dark:text-emerald-300 mt-0.5">
                Te has conectado a <strong>{attendanceNotice.asignatura}</strong> con el docente <strong>{attendanceNotice.docente}</strong> a las {attendanceNotice.hora}.
              </p>
              <a
                href={attendanceNotice.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1.5 text-xs font-extrabold text-emerald-700 dark:text-emerald-400 hover:underline mt-2 bg-emerald-100/70 dark:bg-emerald-900/50 px-2.5 py-1 rounded-lg"
              >
                <span>Volver a abrir enlace si la ventana se cerró</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setAttendanceNotice(null)}
            className="text-emerald-700 dark:text-emerald-400 hover:text-emerald-950 dark:hover:text-white p-1 rounded-lg cursor-pointer"
            title="Cerrar aviso"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
      )}

      {/* 3. BARRA DE CABECERA: TÍTULO Y FILTRADO REAL POR CICLO / PERÍODO */}
      <div id="mis-cursos-section" className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <span>Mis cursos</span>
            <span className={`text-xs px-2.5 py-0.5 font-bold rounded-full ${
              isReadOnlyHistory
                ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                : "bg-blue-100 dark:bg-blue-900/50 text-blue-800 dark:text-blue-300"
            }`}>
              {misCursosInscritos.length} {isReadOnlyHistory ? "históricos" : "activos"}
            </span>
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            {isReadOnlyHistory
              ? "Consultando el registro histórico de un ciclo concluido (modo solo lectura)."
              : "Selecciona tu asignatura para acceder a la sala de Google Meet o consultar materiales."}
          </p>
        </div>

        {/* Selector Real de Ciclo Académico */}
        <div className="flex items-center gap-2 text-xs">
          <span className="font-bold text-slate-600 dark:text-slate-400 hidden sm:inline">Ciclo / Período:</span>
          <div className="relative">
            <select
              value={selectedCycleId}
              onChange={(e) => setSelectedCycleId(e.target.value)}
              className="appearance-none bg-white dark:bg-slate-900 border border-slate-300 dark:border-white/10 text-slate-800 dark:text-white font-bold py-2 pl-3.5 pr-8 rounded-xl shadow-xs text-xs focus:ring-2 focus:ring-blue-500 focus:outline-none cursor-pointer"
            >
              {availableStudentCycles.map((cic) => (
                <option key={cic.id} value={cic.id}>
                  {cic.nombre} ({cic.isReadOnly ? "Historial • Finalizado" : "En Curso"})
                </option>
              ))}
            </select>
            <ChevronDown className="w-4 h-4 text-slate-400 absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* 4. LAYOUT PRINCIPAL DE 2 COLUMNAS (TARJETAS DE CURSO + WIDGET ACTIVIDADES SEMANALES) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* COLUMNA IZQUIERDA / CENTRAL: CATÁLOGO DE CURSOS (8 COLUMNAS) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Subtítulo Dinámico del Ciclo Académico */}
          <div className="flex items-center justify-between border-b border-slate-200/80 dark:border-white/10 pb-2">
            <div className="text-xs sm:text-sm font-extrabold text-slate-700 dark:text-slate-300 tracking-wide uppercase flex items-center gap-2">
              <span>{selectedCycle?.nombre || "Ciclo Académico"}</span>
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-extrabold ${
                isReadOnlyHistory
                  ? "bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300"
                  : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
              }`}>
                {isReadOnlyHistory ? "Finalizado • Solo Lectura" : "En Curso"}
              </span>
            </div>
            <span className="text-[11px] font-mono text-slate-400">
              {carreraObjetivo}
            </span>
          </div>

          {misCursosInscritos.length === 0 ? (
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-xl p-10 rounded-2xl border border-slate-200 dark:border-white/10 text-center text-slate-500 space-y-2">
              <BookOpen className="w-8 h-8 mx-auto text-slate-400" />
              <p className="font-bold text-sm">No tienes asignaturas activas registradas en este período.</p>
              <p className="text-xs text-slate-400">Comunícate con Coordinación Académica para verificar tu matrícula.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              {misCursosInscritos.map((course, idx) => {
                const theme = getCourseTheming(idx);
                const liveSession = liveSessionsByCourse[course.id];
                const isLiveNow = Boolean(liveSession) && !isReadOnlyHistory;
                const myLiveEntry =
                  (liveTracker?.cursoId === course.id ? liveTracker : null) ||
                  liveSession?.miAsistencia ||
                  null;
                const courseStats = resumenAsistencia[course.id];
                const realPct = courseStats ? `${courseStats.porcentaje}%` : "100%";
                const latestMat = latestMaterialByCourse[course.id];

                return (
                  <div
                    key={course.id}
                    className={`bg-white dark:bg-slate-900 rounded-2xl border shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between overflow-hidden group ${
                      isLiveNow
                        ? "border-emerald-500 ring-2 ring-emerald-500/15"
                        : "border-slate-200/90 dark:border-white/10 hover:border-blue-400/60"
                    }`}
                  >
                    {/* Header temático de la tarjeta */}
                    <div className={`p-4 bg-gradient-to-r ${theme.gradient} border-b border-slate-100 dark:border-white/5 relative`}>
                      <div className="flex items-center justify-between gap-2">
                        <span
                          className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full ${theme.badge}`}
                          title={
                            courseStats
                              ? `${courseStats.asistidas} de ${courseStats.totalSesiones} sesiones asistidas`
                              : "Sin inasistencias registradas"
                          }
                        >
                          {realPct} Asistencia Real
                        </span>
                        {isReadOnlyHistory ? (
                          <span className="text-[10px] font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-800/60">
                            Ciclo Concluido
                          </span>
                        ) : isLiveNow ? (
                          <span className="text-[10px] font-extrabold text-white bg-red-600 px-2.5 py-0.5 rounded-full flex items-center gap-1 shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            EN VIVO AHORA
                          </span>
                        ) : (
                          <span className="text-[10px] font-bold text-slate-600 dark:text-slate-300 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-full border border-slate-200 dark:border-white/10">
                            {course.horaInicio || "08:00"} hrs
                          </span>
                        )}
                      </div>

                      <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-3 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug">
                        {course.asignatura}
                      </h3>

                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono mt-0.5">
                        {course.id} • Sección {course.seccion || "101"}
                      </p>
                    </div>

                    {/* Cuerpo de la tarjeta: Información de Docente, Horario y Material */}
                    <div className="p-4 space-y-2.5 text-xs text-slate-600 dark:text-slate-300">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 rounded-full bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-[10px] shrink-0">
                          {course.docente ? course.docente.charAt(0) : "D"}
                        </div>
                        <span className="truncate">
                          <strong className="text-slate-800 dark:text-slate-100">{course.docente || "Docente a cargo"}</strong>
                        </span>
                      </div>

                      <div className="flex items-center space-x-2 text-[11px]">
                        <Clock className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span className="truncate font-mono">
                          {Array.isArray(course.dias) ? course.dias.join(", ") : (course.dias || "Lunes")} ({course.horaInicio || "08:00"} - {course.horaFin || "10:00"})
                        </span>
                      </div>

                      {latestMat && (
                        <a
                          href={latestMat.archivoUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block rounded-lg bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 px-2.5 py-1.5 text-[11px] font-bold text-blue-700 dark:text-blue-300 truncate hover:underline"
                        >
                          📎 Material disponible: {latestMat.archivoNombre || latestMat.titulo}
                        </a>
                      )}
                    </div>

                    {/* Botones de acción inferiores */}
                    <div className="p-4 pt-0 space-y-2">
                      {isReadOnlyHistory ? (
                        <button
                          type="button"
                          disabled
                          className="w-full bg-slate-200 dark:bg-slate-800 text-slate-500 dark:text-slate-400 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-not-allowed"
                        >
                          <Clock className="w-4 h-4 shrink-0" />
                          <span>Sala Cerrada (Ciclo Finalizado)</span>
                        </button>
                      ) : isLiveNow ? (
                        <button
                          type="button"
                          onClick={() => handleJoinMeet(course)}
                          className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-extrabold py-2.5 px-3 rounded-xl shadow-sm text-xs flex items-center justify-center space-x-1.5 cursor-pointer transition-all hover:scale-[1.01]"
                          title="Se abrirá directamente Google Meet y se validará tu permanencia en 2.º plano"
                        >
                          <Video className="w-4 h-4 shrink-0" />
                          <span>
                            {myLiveEntry
                              ? `En llamada Meet (${myLiveEntry.minutosPermanencia || 1} min validados) · Reabrir`
                              : "Unirse a Sala Google Meet (EN VIVO)"}
                          </span>
                        </button>
                      ) : (
                        <button
                          type="button"
                          disabled
                          className="w-full bg-slate-100 dark:bg-slate-800/80 text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-white/10 font-bold py-2.5 px-3 rounded-xl text-xs flex items-center justify-center space-x-1.5 cursor-not-allowed"
                          title="El botón se habilitará automáticamente apenas tu docente inicie la sesión"
                        >
                          <Clock className="w-3.5 h-3.5 shrink-0" />
                          <span>Sala disponible cuando el docente inicie clase</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => setActiveMeetModal(course)}
                        className="w-full py-2 px-3 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 hover:bg-slate-100 dark:hover:bg-white/10 text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                        title="Ver detalles de la asignatura y materiales"
                      >
                        <ExternalLink className="w-3.5 h-3.5 text-slate-400" />
                        <span>{isReadOnlyHistory ? "Consultar sílabo y materiales" : "Ver detalles y enlace"}</span>
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>

        {/* COLUMNA DERECHA: WIDGET DE ACTIVIDADES SEMANALES (4 COLUMNAS) */}
        <div className="lg:col-span-4">
          <div className="sticky top-24">
            <WeeklyActivitiesWidget
              activeCourses={misCursosInscritos}
              liveSessionsByCourse={liveSessionsByCourse}
              onJoinMeet={handleJoinMeet}
              isReadOnly={isReadOnlyHistory}
            />
          </div>
        </div>

      </div>

      {/* 5. MODAL DE CONEXIÓN Y DETALLES DE SALA */}
      {activeMeetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-white/10 overflow-hidden text-center p-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-950/60 rounded-2xl flex items-center justify-center mx-auto text-emerald-600 dark:text-emerald-400">
              <Video className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-lg font-extrabold text-slate-900 dark:text-white">
                Sala Virtual de Google Meet
              </h3>
              <p className="text-base font-extrabold text-blue-600 dark:text-blue-400 mt-1">
                {activeMeetModal.asignatura}
              </p>
              <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                Docente: <strong className="text-slate-900 dark:text-white">{activeMeetModal.docente}</strong>
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-200 dark:border-white/10 text-xs font-mono text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span className="truncate pr-2">{activeMeetModal.meetUrl || "https://meet.google.com/"}</span>
              <span className="text-[10px] bg-emerald-600 text-white font-sans px-2 py-0.5 rounded-md font-bold shrink-0">
                Enlace Oficial
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-2">
              <button
                type="button"
                onClick={() => setActiveMeetModal(null)}
                className="w-full py-2.5 px-4 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-300 font-bold rounded-xl text-xs hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
              >
                Volver
              </button>
              {!isReadOnlyHistory && liveSessionsByCourse[activeMeetModal.id] && (
                <button
                  type="button"
                  onClick={() => {
                    handleJoinMeet(activeMeetModal);
                    setActiveMeetModal(null);
                  }}
                  className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
                >
                  <span>Entrar a la Sala en Vivo</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
