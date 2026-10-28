import React, { useCallback, useEffect, useMemo, useState } from "react";
import { ArrowLeft, BookOpen, Calendar, Clock, FolderGit2, Loader2, LogIn, LogOut, Video, RefreshCw } from "lucide-react";
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
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100">
      <button type="button" onClick={onVolver} className="inline-flex items-center gap-2 rounded-xl bg-slate-200 hover:bg-slate-300 dark:bg-slate-800 dark:hover:bg-slate-700 px-4 py-2 text-xs font-bold transition-all shadow-2xs cursor-pointer"><ArrowLeft className="h-4 w-4" /> Volver a Cursos</button>
      <div className="rounded-3xl border border-white/40 bg-white/70 p-6 shadow-xl dark:border-slate-800 dark:bg-slate-900/80">
        <div className="flex flex-col justify-between gap-4 md:flex-row md:items-start">
          <div>
            <span className="rounded-full bg-indigo-500/10 px-2.5 py-1 text-[10px] font-semibold uppercase text-indigo-600">{curso.area || "Sin área"}</span>
            <h2 className="mt-2 text-2xl font-bold dark:text-white">{curso.asignatura}</h2>
            <p className="mt-1 text-xs text-slate-500">Código: {curso.id} · Carrera: {curso.carrera || "No especificada"}</p>
          </div>
          <div className="flex flex-wrap gap-2">
            <button type="button" disabled={Boolean(activeSession || action || !validMeetUrl(curso.meetUrl))} onClick={handleEntry} className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 px-4 py-2.5 text-xs font-bold text-white shadow-md transition-all disabled:cursor-not-allowed disabled:opacity-50">
              {action === "entry" ? <Loader2 className="h-4 w-4 animate-spin" /> : <LogIn className="h-4 w-4" />} Iniciar Clase en Google Meet
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
        <div className="mb-4 flex items-center justify-between"><h3 className="text-base font-bold">Historial del curso</h3><button type="button" onClick={refreshHistory} disabled={Boolean(action)} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-indigo-200 dark:border-indigo-900/60 bg-indigo-50 dark:bg-indigo-950/40 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:bg-indigo-100 dark:hover:bg-indigo-900/40 transition-all cursor-pointer shadow-2xs disabled:opacity-50"><RefreshCw className="h-3.5 w-3.5" /><span>Actualizar Historial</span></button></div>
        {history.length === 0 ? <p className="text-sm text-slate-500">Sin registro</p> : <div className="overflow-x-auto"><table className="w-full text-left text-sm"><thead><tr className="border-b text-xs uppercase text-slate-500"><th className="p-2">Fecha</th><th className="p-2">Entrada</th><th className="p-2">Salida</th><th className="p-2">Estado</th><th className="p-2">Minutos</th></tr></thead><tbody>{history.map((record, index) => <tr key={record.id || index} className="border-b last:border-0"><td className="p-2">{formatDateTime(record.fecha || record.created_at)}</td><td className="p-2">{formatDateTime(record.entrada)}</td><td className="p-2">{formatDateTime(record.salida)}</td><td className="p-2">{getAttendanceState(record)}</td><td className="p-2">{record.minutosEfectivos ?? "—"}</td></tr>)}</tbody></table></div>}
      </div>
    </div>
  );
}
