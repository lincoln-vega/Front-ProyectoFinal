import React, { useMemo, useState } from 'react';
import CursoDetalleView from './CursoDetallePage';
import { Video } from 'lucide-react';
import { courseService } from '../../services/api';
import { getTeacherAttendances, saveTeacherAttendance } from '../../services/asistencia';

interface Curso {
  id: string;
  asignatura: string;
  codigo?: string;
  docente: string;
  horario: string;
  estado: string;
  meetUrl?: string;
}

const normalizeName = (value: string) => value
  .toLowerCase()
  .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, '')
  .trim();

export default function CursosProfesorPage() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);
  const userId = localStorage.getItem('userId') || '';
  const userName = localStorage.getItem('userName') || '';
  const userEmail = localStorage.getItem('userEmail') || '';
  const [startedCourses, setStartedCourses] = useState<string[]>(() => {
    const today = new Date().toISOString().slice(0, 10);
    return getTeacherAttendances()
      .filter((attendance) => attendance.docenteId === userEmail || attendance.docente === userName)
      .filter((attendance) => attendance.fecha === today)
      .map((attendance) => attendance.cursoId);
  });
  const listaCursos = useMemo(() => courseService.getCourses()
    .filter((course) => course.estado === 'Activo')
    .filter((course) => {
      const assignedTeacher = normalizeName(course.docente || '');
      return course.docenteId === userId || assignedTeacher === normalizeName(userName) || Boolean(userEmail && course.docente?.toLowerCase().includes(userEmail.toLowerCase()));
    }), [userEmail, userId, userName]);

  const handleStartMeet = (curso: Curso) => {
    const now = new Date();
    saveTeacherAttendance({
      id: `TATT-${now.getTime()}`,
      docenteId: userEmail || userName,
      docente: userName,
      cursoId: curso.id,
      curso: curso.asignatura,
      fecha: now.toISOString().slice(0, 10),
      horaIngreso: now.toLocaleTimeString('es-PE'),
      estado: 'Presente',
      meetUrl: curso.meetUrl
    });
    setStartedCourses((current) => current.includes(curso.id) ? current : [...current, curso.id]);
    window.open(curso.meetUrl, '_blank', 'noopener,noreferrer');
  };

  if (cursoSeleccionado) {
    return (
      <CursoDetalleView
        cursoId={cursoSeleccionado.id}
        onVolver={() => setCursoSeleccionado(null)}
      />
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Cabecera */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Gestión de Cursos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Administra los cursos, modalidades y asignaciones docentes de la plataforma.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          + Nuevo Curso
        </button>
      </div>

      {/* Tarjeta de Filtros */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar curso..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            defaultValue=""
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="" disabled>Todos los Estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>
          <select
            defaultValue=""
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="" disabled>Todas las Categorías</option>
          </select>
        </div>
      </div>

      {/* Cuadrícula de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listaCursos.map((curso) => (
          <div
            key={curso.id}
            onClick={() => setCursoSeleccionado(curso)}
            className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                  {curso.asignatura}
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer text-sm"
                >
                  ⋮
                </button>
              </div>

              <div className="my-3 space-y-1.5">
                <p className="text-xs text-slate-400 font-medium">
                  {curso.codigo || 'Sin código'}
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-500">👤</span> Docente asignado: {curso.docente}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                🗓️ <span className="text-slate-200 font-semibold">{curso.horario}</span>
              </span>
              <button
                type="button"
                disabled={!curso.meetUrl}
                onClick={(event) => {
                  event.stopPropagation();
                  handleStartMeet(curso);
                }}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3 py-1.5 text-[11px] font-semibold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                <Video className="h-3.5 w-3.5" />
                {startedCourses.includes(curso.id) ? 'Asistencia registrada' : curso.meetUrl ? 'Iniciar Meet' : 'Sin enlace Meet'}
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}