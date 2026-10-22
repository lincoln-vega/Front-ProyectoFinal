import React, { useState, useEffect, useMemo } from 'react';
import { courseService } from '../../services/cursosServices';
import { Clock } from 'lucide-react';

const DIAS_SEMANA = [
  'Lunes',
  'Martes',
  'Miércoles',
  'Jueves',
  'Viernes',
  'Sábado',
  'Domingo'
];

const HORAS_DIA = Array.from({ length: 24 }, (_, i) => {
  const horaStr = i.toString().padStart(2, '0');
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

  // Obtener las credenciales exactamente igual que DocenteCursosPage
  const userId = localStorage.getItem('userId') || 'USR-002';
  const userName = localStorage.getItem('userName') || 'Prof. Carmen Rosa Herrera';
  const userEmail = localStorage.getItem('userEmail') || 'carmen.herrera@universidad.edu';

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

  // Lógica de filtrado 100% idéntica a DocenteCursosPage
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

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64 text-slate-400">
        Cargando horario de clases...
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <div>
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Horarios</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Visualización semanal de clases programadas (Formato 24 horas)
        </p>
      </div>

      {error && (
        <div role="alert" className="rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-500">
          {error}
        </div>
      )}

      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl rounded-3xl border border-white/40 dark:border-slate-800 shadow-xl overflow-hidden flex flex-col h-[650px]">
        
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
                    {cursosEnEstaHora.map((curso) => {
                      return (
                        <div
                          key={`${curso.id}-${dia}`}
                          className="absolute inset-x-1 top-1 bg-indigo-600/90 dark:bg-indigo-600/80 hover:bg-indigo-500 text-white p-2 rounded-xl shadow-md border border-indigo-400/30 transition-all flex flex-col justify-between overflow-hidden z-20 backdrop-blur-sm"
                          style={{
                            minHeight: '48px'
                          }}
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
                          </div>
                        </div>
                      );
                    })}
                  </div>
                );
              })}

            </div>
          ))}
        </div>

      </div>
    </div>
  );
}