import React, { useState, useEffect, useMemo } from 'react';
import { courseService } from '../../services/cursosServices';
import { Clock, Video, Calendar, Sparkles, BookOpen } from 'lucide-react';
import { registerMeetEntry } from '../../services/asistencia';

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

const HORAS_DIA = Array.from({ length: 16 }, (_, i) => {
  const horaNum = i + 7; // Desde las 07:00 hasta las 22:00
  const horaStr = horaNum.toString().padStart(2, '0');
  return `${horaStr}:00`;
});

// Función de normalización idéntica a la de DocenteCursosPage
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

export default function HorariosView() {
  const [listaCursos, setListaCursos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedMobileDay, setSelectedMobileDay] = useState("Lunes");

  // Credenciales de la sesión activa
  const userId = localStorage.getItem('userId') || '';
  const userName = localStorage.getItem('userName') || 'Docente';
  const userEmail = localStorage.getItem('userEmail') || '';

  useEffect(() => {
    let cancelled = false;

    async function cargarCursos() {
      try {
        setLoading(true);
        setError("");
        const data = await courseService.getCourses();
        if (!cancelled) {
          setListaCursos(data || []);
        }
      } catch (err) {
        if (!cancelled) {
          console.error('Error al cargar cursos para el horario:', err);
          setError(err.message || "Error al cargar los cursos desde InsForge.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    cargarCursos();
    return () => { cancelled = true; };
  }, []);

  const cursosFiltrados = useMemo(() => {
    return listaCursos.filter((course) => {
      if (course.estado !== 'Activo') return false;
      return (
        course.docenteId === userId || 
        matchesTeacherName(course.docente, userName) ||
        Boolean(userEmail && course.docente?.toLowerCase().includes(userEmail.toLowerCase()))
      );
    });
  }, [listaCursos, userId, userName, userEmail]);

  const handleStartClass = async (curso) => {
    if (!curso?.meetUrl) {
      alert("Este curso no tiene un enlace de Google Meet asignado.");
      return;
    }
    window.open(curso.meetUrl, '_blank', 'noopener,noreferrer');
    try {
      await registerMeetEntry(curso.id);
    } catch (e) {
      console.warn("Registro de entrada en segundo plano:", e);
    }
  };

  const getCoursesForDay = (dia) => {
    return cursosFiltrados.filter((curso) => {
      const diasCurso = Array.isArray(curso.dias) ? curso.dias : [curso.dias];
      return diasCurso.includes(dia);
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        Cargando horario de clases...
      </div>
    );
  }

  const mobileCourses = getCoursesForDay(selectedMobileDay);

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-800 dark:text-white">Horarios Semanales</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Programación académica de tus asignaturas activas y acceso directo a cada sala de Meet.
          </p>
        </div>
        <span className="text-xs font-bold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-900/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 self-start sm:self-auto">
          {cursosFiltrados.length} Cursos Asignados
        </span>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      {/* VISTA MÓVIL (TARJETAS CON SELECTOR DE DÍAS - EVITA DESBORDES) */}
      <div className="sm:hidden space-y-4">
        {/* Selector de Días con scroll horizontal */}
        <div className="flex overflow-x-auto pb-2 gap-1.5 text-xs no-scrollbar">
          {DIAS_SEMANA.map((dia) => {
            const count = getCoursesForDay(dia).length;
            const isSelected = selectedMobileDay === dia;
            return (
              <button
                key={dia}
                type="button"
                onClick={() => setSelectedMobileDay(dia)}
                className={`px-3.5 py-2 rounded-xl font-bold shrink-0 transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs ${
                  isSelected
                    ? "bg-[#1E3A8A] text-white shadow-sm ring-2 ring-blue-400/40"
                    : "bg-white dark:bg-white/5 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:bg-slate-50"
                }`}
              >
                <span>{dia}</span>
                {count > 0 && (
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] ${
                    isSelected ? "bg-amber-400 text-slate-900 font-extrabold" : "bg-blue-100 dark:bg-blue-900/60 text-blue-700 dark:text-blue-300 font-bold"
                  }`}>
                    {count}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        {/* Tarjetas de Clases para el Día Seleccionado */}
        {mobileCourses.length === 0 ? (
          <div className="p-8 text-center bg-white/60 dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-dashed border-slate-200 dark:border-white/10 text-xs text-slate-500 dark:text-slate-400">
            No tienes clases programadas para el {selectedMobileDay}.
          </div>
        ) : (
          <div className="space-y-3">
            {mobileCourses.map((curso) => (
              <div
                key={`${curso.id}-${selectedMobileDay}`}
                className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl p-4 rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-300 border border-indigo-100 dark:border-indigo-900/40">
                    {curso.id}
                  </span>
                  <span className="text-xs font-mono font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                    {curso.horaInicio} - {curso.horaFin}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-bold text-slate-900 dark:text-white leading-snug">
                    {curso.asignatura}
                  </h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Carrera: {curso.carrera || "General"}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100 dark:border-white/5">
                  <button
                    type="button"
                    onClick={() => handleStartClass(curso)}
                    className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-2.5 px-3 rounded-xl shadow-xs text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <Video className="w-4 h-4" />
                    <span>Iniciar Clase en Google Meet</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* VISTA ESCRITORIO (CUADRÍCULA COMPLETA CON SCROLL HORIZONTAL PROTEGIDO) */}
      <div className="hidden sm:block bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-slate-800 shadow-xl overflow-x-auto">
        <div className="min-w-[850px] flex flex-col h-[650px]">
          
          {/* Cabecera de Días */}
          <div className="grid grid-cols-8 border-b border-slate-200 dark:border-slate-800 bg-slate-50/80 dark:bg-slate-950/50 text-xs font-bold text-slate-600 dark:text-slate-300 text-center sticky top-0 z-10">
            <div className="p-3 border-r border-slate-200 dark:border-slate-800 flex items-center justify-center">
              <Clock className="w-4 h-4 text-indigo-500" />
            </div>
            {DIAS_SEMANA.map((dia) => (
              <div key={dia} className="p-3 border-r border-slate-200 dark:border-slate-800 last:border-none">
                {dia}
              </div>
            ))}
          </div>

          {/* Cuerpo del Horario */}
          <div className="overflow-y-auto flex-1 divide-y divide-slate-100 dark:divide-slate-800/40 relative">
            {HORAS_DIA.map((hora) => (
              <div key={hora} className="grid grid-cols-8 min-h-[50px] relative">
                
                <div className="p-2 border-r border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-center bg-slate-50/30 dark:bg-slate-950/20">
                  {hora}
                </div>

                {DIAS_SEMANA.map((dia) => {
                  const cursosEnEstaHora = cursosFiltrados.filter((curso) => {
                    const diasCurso = Array.isArray(curso.dias) ? curso.dias : [curso.dias];
                    const coincideDia = diasCurso.includes(dia);
                    
                    if (!coincideDia || !curso.horaInicio) return false;
                    
                    const horaInicioCurso = curso.horaInicio.split(':')[0] + ':00';
                    return horaInicioCurso === hora;
                  });

                  return (
                    <div key={dia} className="border-r border-slate-200 dark:border-slate-800 last:border-none p-1 relative">
                      {cursosEnEstaHora.map((curso) => (
                        <div
                          key={`${curso.id}-${dia}`}
                          onClick={() => handleStartClass(curso)}
                          title={`Clic para iniciar clase en Google Meet (${curso.asignatura})`}
                          className="absolute inset-x-1 top-1 bg-indigo-600/95 dark:bg-indigo-600/90 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-md border border-indigo-400/30 transition-all flex flex-col justify-between overflow-hidden z-20 backdrop-blur-sm cursor-pointer hover:scale-[1.02] group"
                          style={{ minHeight: '48px' }}
                        >
                          <div>
                            <span className="text-[9px] font-bold uppercase tracking-wider bg-white/20 px-1.5 py-0.5 rounded text-indigo-100">
                              {curso.id}
                            </span>
                            <h4 className="text-xs font-bold leading-snug mt-1 truncate">
                              {curso.asignatura}
                            </h4>
                          </div>
                          
                          <div className="mt-1 text-[10px] text-indigo-100 flex items-center justify-between">
                            <span className="font-mono">
                              {curso.horaInicio} - {curso.horaFin}
                            </span>
                            <span className="inline-flex items-center gap-0.5 font-bold uppercase text-[9px] bg-emerald-500 px-1.5 py-0.2 rounded text-white shadow-2xs group-hover:scale-105">
                              <Video className="w-2.5 h-2.5" /> Meet
                            </span>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })}

              </div>
            ))}
          </div>

        </div>
      </div>
    </div>
  );
}
