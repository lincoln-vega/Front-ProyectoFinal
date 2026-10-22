import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Calendar, Clock, FolderGit2, Loader2, LogIn, LogOut, Video } from "lucide-react";
import { courseService } from "../../services/cursosServices";
import { getMeetAttendanceHistory, registerMeetEntry, registerMeetExit } from "../../services/asistencia";

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
  const [curso, setCurso] = useState(null);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);
  const [action, setAction] = useState("");
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAttendance = useCallback(async () => {
    const records = await getMeetAttendanceHistory(cursoId);
    setHistory(records);
  }, [cursoId]);

  useEffect(() => {
    let cancelled = false;
    async function load() {
      try {
        setLoading(true);
        setError("");
        const [courses] = await Promise.all([courseService.getCourses(), loadAttendance()]);
        if (!cancelled) setCurso(courses.find((item) => item.id === cursoId) || null);
      } catch (err) {
        if (!cancelled) setError(err.message || "No se pudo cargar el curso y su asistencia.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    load();
    return () => { cancelled = true; };
  }, [cursoId, loadAttendance]);

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
      setNotice("Entrada registrada correctamente.");
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
      setNotice("Salida registrada. Los minutos efectivos fueron calculados por InsForge.");
    } catch (err) {
      setError(err.message);
    } finally {
      setAction("");
    }
  };

  if (loading) {
    return <div className="flex min-h-[400px] items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-indigo-500" /></div>;
  }

  if (!curso) {
    return (
      <div className="space-y-6">
        <button type="button" onClick={onVolver} className="inline-flex items-center gap-2 text-sm text-indigo-600 hover:underline"><ArrowLeft className="h-4 w-4" /> Volver a mis cursos</button>
        <div className="rounded-3xl border border-red-200 bg-red-50 p-8 text-center text-red-700"><BookOpen className="mx-auto mb-4 h-12 w-12" /><h3 className="text-xl font-semibold">Curso no encontrado</h3><p className="mt-2">El curso no existe o no pertenece al docente.</p></div>
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
    async function loadCourse() {
      try {
        const cursos = await courseService.getCourses();
        const cursoEncontrado = cursos.find((c) => c.id === cursoId);
        setCurso(cursoEncontrado || null);
      } catch (error) {
        console.error('Error al cargar el detalle del curso:', error);
      } finally {
        setLoading(false);
      }
    }
    loadCourse();
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

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <button type="button" onClick={onVolver} className="inline-flex items-center gap-2 rounded-xl bg-slate-200 px-4 py-2 text-xs font-semibold dark:bg-slate-800"><ArrowLeft className="h-4 w-4" /> Volver a Cursos</button>
      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-indigo-600">{curso.area || "Sin área"}</span>
            <h2 className="mt-2 text-2xl font-bold dark:text-white">{curso.asignatura}</h2>
            <p className="mt-1 text-xs text-slate-500">Código: {curso.id} · Carrera: {curso.carrera || "No especificada"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={Boolean(activeSession || action || !validMeetUrl(curso.meetUrl))} onClick={handleEntry} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2.5 text-xs font-bold text-white disabled:cursor-not-allowed disabled:opacity-50">
              {action === "entry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Registrar entrada
            </button>
            {activeSession && <button type="button" disabled={Boolean(action)} onClick={handleExit} className="inline-flex items-center gap-2 rounded-xl bg-rose-600 px-4 py-2.5 text-xs font-bold text-white disabled:opacity-50">
              {action === "exit" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />} Registrar salida
            </button>}
          </div>
        </div>
        {!validMeetUrl(curso.meetUrl) && <p className="mt-4 text-sm text-amber-600">Este curso no tiene un enlace Meet válido; Registrar entrada está deshabilitado.</p>}
        {error && <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
        {notice && <p className="mt-4 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <h3 className="mb-4 text-base font-bold">Estado de asistencia: {state}</h3>
        {latestSession && <div className="grid gap-3 text-sm md:grid-cols-3">
          <span>Entrada: <strong>{formatDateTime(latestSession.entrada)}</strong></span>
          <span>Salida: <strong>{formatDateTime(latestSession.salida)}</strong></span>
          <span>Minutos efectivos: <strong>{latestSession.minutosEfectivos ?? "—"}</strong></span>
        </div>}
      </div>

      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-bold">Historial del curso</h3><button type="button" onClick={refreshHistory} disabled={Boolean(action)} className="text-xs font-semibold text-indigo-600 disabled:opacity-50">Actualizar</button></div>
        {history.length === 0 ? <p className="text-sm text-slate-500">Sin registro</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-2">Fecha</th><th className="p-2">Entrada</th><th className="p-2">Salida</th><th className="p-2">Estado</th><th className="p-2">Minutos</th></tr></thead><tbody>{history.map((record, index) => <tr key={record.id || index} className="border-b last:border-0"><td className="p-2">{formatDateTime(record.fecha || record.created_at)}</td><td className="p-2">{formatDateTime(record.entrada)}</td><td className="p-2">{formatDateTime(record.salida)}</td><td className="p-2">{getAttendanceState(record)}</td><td className="p-2">{record.minutosEfectivos ?? "—"}</td></tr>)}</tbody></table></div>}
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
