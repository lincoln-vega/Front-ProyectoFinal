import React, { useState, useEffect, useMemo } from "react";
import {
  Calendar as CalendarIcon,
  Clock,
  Video,
  User,
  BookOpen,
  Search,
  ExternalLink,
  MapPin,
  Sparkles,
  Layers,
  GraduationCap
} from "lucide-react";
import { courseService } from "../../services/cursosServices";
import { userService } from "../../services/api";

const DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const START_HOUR = 7;
const END_HOUR = 20;
const HOUR_HEIGHT = 68;

const DAY_ALIASES = {
  lunes: "Lunes", lun: "Lunes",
  martes: "Martes", mar: "Martes",
  miércoles: "Miércoles", miercoles: "Miércoles", mié: "Miércoles", mie: "Miércoles",
  jueves: "Jueves", jue: "Jueves",
  viernes: "Viernes", vie: "Viernes",
  sábado: "Sábado", sabado: "Sábado", sáb: "Sábado", sab: "Sábado"
};

function parseTime(value, period = "") {
  if (!value) return 0;
  const [hours, minutes] = value.split(":").map(Number);
  let hour = hours || 0;
  if (period.toUpperCase() === "PM" && hour !== 12) hour += 12;
  if (period.toUpperCase() === "AM" && hour === 12) hour = 0;
  return hour + (minutes || 0) / 60;
}

function expandCourseSchedule(course) {
  if (Array.isArray(course.dias) && course.dias.length > 0 && course.horaInicio && course.horaFin) {
    const start = parseTime(course.horaInicio);
    const end = parseTime(course.horaFin);
    const validDays = course.dias
      .map((day) => DAY_ALIASES[String(day).trim().toLowerCase()] || day)
      .filter((d) => DAYS.includes(d));
    return validDays.map((day) => ({
      ...course,
      horario: course.horario || `${course.horaInicio} - ${course.horaFin}`,
      day,
      start,
      end
    }));
  }

  const match = (course.horario || "").match(/^(.*?)\s+(\d{1,2}:\d{2})\s*-\s*(\d{1,2}:\d{2})(?:\s*(AM|PM))?(?:\s*hrs?\.?)?$/i);
  if (!match) return [];
  const [, dayText, startValue, endValue, period] = match;
  const start = parseTime(startValue, period);
  const end = parseTime(endValue, period);
  const days = dayText.split(/\s+y\s+|,\s*|\s*\/\s*/i).map((day) => DAY_ALIASES[day.trim().toLowerCase()]).filter((d) => DAYS.includes(d));
  return days.map((day) => ({ ...course, day, start, end }));
}

export default function StudentHorariosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [listaCursosGlobal, setListaCursosGlobal] = useState([]);
  const [estudianteActivo, setEstudianteActivo] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedMobileDay, setSelectedMobileDay] = useState("Lunes");

  useEffect(() => {
    let cancelled = false;

    async function cargarHorarioEstudiante() {
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
          console.error("Error al cargar horario del estudiante:", err);
          setError(err.message || "Error al cargar el horario escolar.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    cargarHorarioEstudiante();
    return () => { cancelled = true; };
  }, []);

  // Extraer cursos inscritos del estudiante
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

    if (estudianteActivo.areaAcademica) {
      const porArea = (listaCursosGlobal || []).filter(
        (curso) => curso.estado === "Activo" && (curso.area || "").includes(estudianteActivo.areaAcademica)
      );
      if (porArea.length > 0) return porArea;
    }

    return (listaCursosGlobal || []).filter((curso) => curso.estado === "Activo");
  }, [estudianteActivo, listaCursosGlobal]);

  // Expandir a bloques de horario
  const scheduleItems = useMemo(() => {
    return misCursosInscritos
      .filter((curso) => {
        const term = searchTerm.toLowerCase();
        return !term || `${curso.asignatura || ""} ${curso.docente || ""} ${curso.aula || ""}`.toLowerCase().includes(term);
      })
      .flatMap(expandCourseSchedule);
  }, [misCursosInscritos, searchTerm]);

  // Cálculo de horas semanales totales
  const totalHorasSemanales = useMemo(() => {
    return scheduleItems.reduce((acc, item) => acc + Math.max(0, item.end - item.start), 0);
  }, [scheduleItems]);

  const hours = Array.from({ length: END_HOUR - START_HOUR }, (_, index) => START_HOUR + index);
  const formatHour = (hour) => `${String(hour % 12 || 12).padStart(2, "0")}:00 ${hour >= 12 ? "PM" : "AM"}`;

  const studentName = estudianteActivo
    ? `${estudianteActivo.nombres || ""} ${estudianteActivo.apellidos || ""}`.trim()
    : "Estudiante";

  const cicloVirtual = estudianteActivo?.cicloVirtual || estudianteActivo?.ciclovirtual || "Semestral";

  const handleOpenRoom = (course) => {
    if (course.meetUrl) {
      window.open(course.meetUrl, "_blank", "noopener,noreferrer");
    } else {
      setError(`No hay enlace de sala virtual configurado para la materia "${course.asignatura}".`); setTimeout(() => setError(""), 4000);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* BANNER SUPERIOR CON MÉTRICAS */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Mi Horario Semanal • Campus Virtual</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Horario de Clases de {studentName}
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Revisa tus asignaturas programadas por día y conéctate directamente a tus sesiones en vivo.
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[100px]">
                <span className="text-blue-200 text-[10px] uppercase font-bold block">Materias</span>
                <strong className="text-white text-base">{misCursosInscritos.length}</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[100px]">
                <span className="text-blue-200 text-[10px] uppercase font-bold block">Bloques / Sem</span>
                <strong className="text-white text-base">{scheduleItems.length}</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[100px]">
                <span className="text-blue-200 text-[10px] uppercase font-bold block">Horas / Sem</span>
                <strong className="text-emerald-300 text-base">{totalHorasSemanales} hrs</strong>
              </div>
              <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15 text-center min-w-[100px]">
                <span className="text-blue-200 text-[10px] uppercase font-bold block">Ciclo</span>
                <strong className="text-white text-xs">{cicloVirtual}</strong>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* BARRA DE BÚSQUEDA Y FILTROS */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Buscar por materia, docente o aula..."
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
          />
        </div>

        {/* Selector de días en vista móvil */}
        <div className="flex sm:hidden overflow-x-auto pb-1 gap-1 text-xs">
          {DAYS.map((day) => (
            <button
              key={day}
              type="button"
              onClick={() => setSelectedMobileDay(day)}
              className={`px-3 py-1.5 rounded-lg font-semibold shrink-0 transition-colors ${
                selectedMobileDay === day
                  ? "bg-[#1E3A8A] text-white"
                  : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300"
              }`}
            >
              {day}
            </button>
          ))}
        </div>

        <span className="text-xs text-slate-500 dark:text-slate-400 hidden sm:inline-block font-medium">
          Haz clic en cualquier clase para unirte a la sala sincrónica
        </span>
      </div>

      {/* VISTA MÓVIL (TARJETAS POR DÍA SELECCIONADO) */}
      <div className="sm:hidden space-y-3">
        {scheduleItems.filter((i) => i.day === selectedMobileDay).length === 0 ? (
          <div className="p-8 text-center bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 font-medium">
            No tienes clases programadas para el {selectedMobileDay}.
          </div>
        ) : (
          scheduleItems
            .filter((i) => i.day === selectedMobileDay)
            .map((item, idx) => (
              <div
                key={`${item.id}-${idx}`}
                className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                    {item.codigo || item.id}
                  </span>
                  {item.aula && (
                    <span className="text-xs font-semibold text-slate-600 dark:text-slate-300 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {item.aula}
                    </span>
                  )}
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900 dark:text-white">{item.asignatura}</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-300 mt-0.5">{item.docente}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-white/10">
                  <span className="text-xs font-mono text-slate-500 dark:text-slate-400 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {item.horario}
                  </span>
                  <button
                    type="button"
                    onClick={() => handleOpenRoom(item)}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-lg text-xs font-bold transition-colors cursor-pointer shadow-xs"
                  >
                    <Video className="w-3.5 h-3.5" />
                    <span>Unirme a Sala</span>
                  </button>
                </div>
              </div>
            ))
        )}
      </div>

      {/* VISTA ESCRITORIO (CUADRÍCULA COMPLETA SEMANAL) */}
      <div className="hidden sm:block bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-x-auto">
        <div className="min-w-[1000px]">
          {/* Cabecera de días */}
          <div className="grid grid-cols-[88px_repeat(6,minmax(140px,1fr))] border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5">
            <div className="p-3 text-xs font-bold uppercase tracking-wide text-slate-500 dark:text-slate-400 text-center">
              Hora
            </div>
            {DAYS.map((day) => (
              <div key={day} className="p-3 text-center text-xs font-bold text-slate-700 dark:text-slate-200 border-l border-slate-200 dark:border-white/10">
                {day}
              </div>
            ))}
          </div>

          {/* Cuadrícula de horas y clases */}
          <div className="grid grid-cols-[88px_repeat(6,minmax(140px,1fr))]">
            {/* Columna de horas */}
            <div className="relative" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
              {hours.map((hour) => (
                <div key={hour} className="h-[68px] border-b border-slate-100 dark:border-white/5 px-3 pt-2 text-xs font-semibold text-slate-500 dark:text-slate-400 font-mono text-center">
                  {formatHour(hour)}
                </div>
              ))}
            </div>

            {/* Columnas de cada día */}
            {DAYS.map((day) => {
              const dayItems = scheduleItems.filter((item) => item.day === day);
              return (
                <div key={day} className="relative border-l border-slate-200 dark:border-white/10" style={{ height: `${hours.length * HOUR_HEIGHT}px` }}>
                  {hours.map((hour) => (
                    <div key={hour} className="h-[68px] border-b border-slate-100 dark:border-white/5" />
                  ))}

                  {dayItems.map((item, index) => {
                    const top = (item.start - START_HOUR) * HOUR_HEIGHT;
                    const height = Math.max((item.end - item.start) * HOUR_HEIGHT - 6, 48);
                    const cleanHorario = item.horario ? item.horario.replace(/^.*?\s(?=\d)/, "") : `${item.horaInicio || ""} - ${item.horaFin || ""}`;
                    
                    return (
                      <div
                        key={`${item.id}-${day}-${index}`}
                        onClick={() => handleOpenRoom(item)}
                        title={`Clic para ingresar a la sala de ${item.asignatura}`}
                        className="absolute left-1.5 right-1.5 rounded-xl border-l-4 border-emerald-600 dark:border-emerald-400 bg-gradient-to-br from-emerald-50/95 to-blue-50/90 dark:from-emerald-950/60 dark:to-blue-950/60 p-2.5 shadow-xs border border-emerald-200/70 dark:border-emerald-900/50 overflow-hidden cursor-pointer hover:shadow-md hover:scale-[1.01] transition-all z-10 flex flex-col justify-between"
                        style={{ top: `${top + 3}px`, height: `${height}px` }}
                      >
                        <div>
                          <div className="flex items-center justify-between gap-1">
                            <span className="truncate text-xs font-extrabold text-slate-900 dark:text-white leading-tight">
                              {item.asignatura}
                            </span>
                            {item.aula && (
                              <span className="text-[10px] font-bold px-1.5 py-0.2 rounded bg-white/80 dark:bg-white/10 text-emerald-800 dark:text-emerald-300 shrink-0 border border-emerald-200 dark:border-emerald-800">
                                {item.aula}
                              </span>
                            )}
                          </div>
                          <p className="truncate text-[11px] font-semibold text-slate-700 dark:text-slate-300 mt-0.5">
                            {item.docente}
                          </p>
                        </div>

                        <div className="flex items-center justify-between mt-1 pt-1 border-t border-emerald-200/50 dark:border-emerald-800/40 text-[10px] font-mono text-emerald-800 dark:text-emerald-300">
                          <span className="flex items-center gap-1 truncate">
                            <Clock className="w-3 h-3 shrink-0" />
                            {cleanHorario}
                          </span>
                          <span className="inline-flex items-center gap-0.5 font-bold uppercase tracking-wide bg-emerald-600 text-white px-1.5 py-0.5 rounded text-[9px] shrink-0">
                            <Video className="w-2.5 h-2.5" /> Entrar
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {!scheduleItems.length && !loading && (
        <div className="p-12 text-center bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400 font-medium">
          No tienes asignaturas programadas que coincidan con la búsqueda.
        </div>
      )}
    </div>
  );
}
