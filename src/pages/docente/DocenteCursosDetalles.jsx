import React, { useState, useEffect } from 'react';
import { ArrowLeft, Video, FolderGit2, Calendar, Clock, BookOpen, User } from 'lucide-react';
import { courseService } from '../../services/cursosServices';

export default function DocenteCursosDetalles({ cursoId, onVolver }) {
  // ==========================================
  // ESTADOS DEL COMPONENTE
  // ==========================================
  const [curso, setCurso] = useState(null);
  const [loading, setLoading] = useState(true);

  // ==========================================
  // EFECTO: CARGA DE DATOS DEL CURSO
  // ==========================================
  useEffect(() => {
    try {
      const cursos = courseService.getCourses();
      const cursoEncontrado = cursos.find((c) => c.id === cursoId);
      setCurso(cursoEncontrado || null);
    } catch (error) {
      console.error('Error al cargar el detalle del curso:', error);
    } finally {
      setLoading(false);
    }
  }, [cursoId]);

  // ==========================================
  // VISTA: ESTADO DE CARGA (LOADING)
  // ==========================================
  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px] text-slate-400">
        Cargando detalles del curso...
      </div>
    );
  }

  // ==========================================
  // VISTA: ESTADO DE ERROR (CURSO NO ENCONTRADO)
  // ==========================================
  if (!curso) {
    return (
      <div className="space-y-6 text-slate-800 dark:text-slate-100">
        <button
          type="button"
          onClick={onVolver}
          className="inline-flex items-center gap-2 text-sm text-indigo-600 dark:text-indigo-400 hover:underline cursor-pointer"
        >
          <ArrowLeft className="w-4 h-4" /> Volver a mis cursos
        </button>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[300px]">
          <BookOpen className="w-16 h-16 text-slate-400 mb-4" />
          <h3 className="text-xl font-semibold">Curso no encontrado</h3>
          <p className="text-slate-500 dark:text-slate-400 mt-2">
            No se pudo encontrar la información para el curso ID: {cursoId}
          </p>
        </div>
      </div>
    );
  }

  // ==========================================
  // VISTA PRINCIPAL
  // ==========================================
  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      
      {/* SECCIÓN 1: NAVEGACIÓN Y BOTÓN VOLVER */}
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 text-xs font-semibold transition-colors cursor-pointer"
      >
        <ArrowLeft className="w-4 h-4" /> Volver a Cursos
      </button>

      {/* SECCIÓN 2: CABECERA DEL CURSO */}
      <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* Título y metadatos del curso */}
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">
              {curso.area || 'Sin área'}
            </span>
            <h2 className="text-2xl font-bold text-slate-800 dark:text-white mt-2">
              {curso.asignatura}
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Código ID: <span className="font-mono text-indigo-500">{curso.id}</span> | Carrera: <span className="font-semibold">{curso.carrera || 'No especificada'}</span>
            </p>
          </div>

          {/* Botón único de Google Meet */}
          {curso.meetUrl && (
            <a
              href={curso.meetUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white transition-colors hover:bg-emerald-700 shadow-sm"
            >
              <Video className="w-4 h-4" /> Unirse a Google Meet
            </a>
          )}
        </div>
      </div>

      {/* SECCIÓN 3: DETALLES DE PROGRAMACIÓN Y RECURSOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Tarjeta 3.1: Detalles de Programación */}
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Detalles de Programación
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <User className="w-4 h-4 text-indigo-500" />
              <span>Docente Asignado: <strong className="text-slate-800 dark:text-white">{curso.docente}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>Días: <strong className="text-slate-800 dark:text-white">{Array.isArray(curso.dias) ? curso.dias.join(', ') : curso.dias}</strong></span>
            </div>
            <div className="flex items-center gap-3 text-slate-600 dark:text-slate-300">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>Horario: <strong className="text-slate-800 dark:text-white">{curso.horaInicio} - {curso.horaFin}</strong></span>
            </div>
          </div>
        </div>

        {/* Tarjeta 3.2: Recursos del Curso */}
        <div className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl p-6 rounded-3xl border border-white/40 dark:border-slate-800 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-slate-800 dark:text-white border-b border-slate-200 dark:border-slate-800 pb-3">
            Recursos del Curso
          </h3>
          <div className="space-y-3 text-sm">
            <div className="flex items-center justify-between">
              <span className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
                <FolderGit2 className="w-4 h-4 text-indigo-500" /> Repositorio / Materiales:
              </span>
              {curso.repositorio ? (
                <a
                  href={curso.repositorio.startsWith('http') ? curso.repositorio : `https://${curso.repositorio}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline truncate max-w-[200px]"
                >
                  {curso.repositorio}
                </a>
              ) : (
                <span className="text-xs text-slate-400">No asignado</span>
              )}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}