import React, { useState, useEffect, useRef } from "react";
import { Coffee, Play, Clock, CheckCircle2, RotateCcw } from "lucide-react";

interface BreakRecord {
  id: number;
  inicio: string;
  fin: string;
  segundos: number;
}

interface ControlRecesoProps {
  courseId: string;
  courseTitle?: string;
  onBreakChange?: (enReceso: boolean, totalMinutos: number) => void;
}

export default function ControlReceso({
  courseId,
  courseTitle = "Curso",
  onBreakChange,
}: ControlRecesoProps) {
  const [enReceso, setEnReceso] = useState(false);
  const [segundosActuales, setSegundosActuales] = useState(0);
  const [historial, setHistorial] = useState<BreakRecord[]>([]);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const storageKeyHistory = `receso_historial_${courseId}`;
  const storageKeyActive = `receso_activo_${courseId}`;

  // Cargar estado inicial desde localStorage
  useEffect(() => {
    try {
      const savedHistory = localStorage.getItem(storageKeyHistory);
      if (savedHistory) {
        setHistorial(JSON.parse(savedHistory));
      }

      const activeBreak = localStorage.getItem(storageKeyActive);
      if (activeBreak) {
        const parsed = JSON.parse(activeBreak);
        const elapsed = Math.floor((Date.now() - parsed.inicioTimestamp) / 1000);
        setSegundosActuales(elapsed > 0 ? elapsed : 0);
        setEnReceso(true);
      }
    } catch (e) {
      console.warn("[ControlReceso] Error al leer estado local:", e);
    }
  }, [courseId]);

  // Manejo del temporizador activo
  useEffect(() => {
    if (enReceso) {
      intervalRef.current = setInterval(() => {
        setSegundosActuales((prev) => prev + 1);
      }, 1000);
    } else {
      if (intervalRef.current) clearInterval(intervalRef.current);
    }

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [enReceso]);

  // Total acumulado en minutos
  const totalSegundosAcumulados = historial.reduce((acc, curr) => acc + curr.segundos, 0);
  const totalMinutosAcumulados = Math.round((totalSegundosAcumulados / 60) * 10) / 10;

  // Formato mm:ss
  const formatTime = (totalSec: number) => {
    const mins = Math.floor(totalSec / 60);
    const secs = totalSec % 60;
    return `${String(mins).padStart(2, "0")}:${String(secs).padStart(2, "0")}`;
  };

  const iniciarReceso = () => {
    const now = new Date();
    setSegundosActuales(0);
    setEnReceso(true);

    localStorage.setItem(
      storageKeyActive,
      JSON.stringify({
        inicioTimestamp: now.getTime(),
        horaInicio: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" }),
      })
    );

    if (onBreakChange) onBreakChange(true, totalMinutosAcumulados);
  };

  const reanudarClase = () => {
    const now = new Date();
    setEnReceso(false);

    let horaInicioStr = now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
    try {
      const activeData = localStorage.getItem(storageKeyActive);
      if (activeData) {
        horaInicioStr = JSON.parse(activeData).horaInicio || horaInicioStr;
      }
    } catch {}

    const nuevoRegistro: BreakRecord = {
      id: Date.now(),
      inicio: horaInicioStr,
      fin: now.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      segundos: segundosActuales,
    };

    const nuevoHistorial = [nuevoRegistro, ...historial];
    setHistorial(nuevoHistorial);
    localStorage.setItem(storageKeyHistory, JSON.stringify(nuevoHistorial));
    localStorage.removeItem(storageKeyActive);

    const nuevoTotalSegundos = nuevoHistorial.reduce((acc, curr) => acc + curr.segundos, 0);
    const nuevoTotalMin = Math.round((nuevoTotalSegundos / 60) * 10) / 10;
    if (onBreakChange) onBreakChange(false, nuevoTotalMin);
  };

  const resetearHistorial = () => {
    if (window.confirm("¿Deseas reiniciar los registros de receso de esta sesión?")) {
      setHistorial([]);
      setSegundosActuales(0);
      setEnReceso(false);
      localStorage.removeItem(storageKeyHistory);
      localStorage.removeItem(storageKeyActive);
      if (onBreakChange) onBreakChange(false, 0);
    }
  };

  return (
    <div className={`p-4 rounded-xl border transition-all ${
      enReceso
        ? "bg-amber-950/30 border-amber-500/50 shadow-md shadow-amber-950/30"
        : "bg-slate-900 border-slate-800"
    }`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        {/* Estado y Cronómetro */}
        <div className="flex items-center space-x-3">
          <div className={`p-2.5 rounded-lg border ${
            enReceso
              ? "bg-amber-500/20 text-amber-400 border-amber-500/30"
              : "bg-indigo-500/10 text-indigo-400 border-indigo-500/20"
          }`}>
            <Coffee className={`w-5 h-5 ${enReceso ? "animate-bounce" : ""}`} />
          </div>

          <div>
            <div className="flex items-center space-x-2">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-bold border ${
                enReceso
                  ? "bg-amber-950/70 text-amber-300 border-amber-700/60"
                  : "bg-emerald-950/70 text-emerald-300 border-emerald-800/60"
              }`}>
                <span className={`w-2 h-2 rounded-full mr-1.5 ${
                  enReceso ? "bg-amber-400 animate-ping" : "bg-emerald-400"
                }`} />
                {enReceso ? "En Receso / Pausa" : "Sesión en Vivo"}
              </span>

              {totalMinutosAcumulados > 0 && !enReceso && (
                <span className="text-xs text-slate-400 flex items-center gap-1 font-mono">
                  <Clock className="w-3.5 h-3.5 text-slate-400" />
                  Descanso acumulado: <strong className="text-white">{totalMinutosAcumulados} min</strong>
                </span>
              )}
            </div>

            {enReceso ? (
              <div className="flex items-baseline space-x-2 mt-1">
                <span className="text-2xl font-black font-mono text-amber-300 tracking-wider">
                  {formatTime(segundosActuales)}
                </span>
                <span className="text-xs text-amber-400/80">minutos de receso en curso</span>
              </div>
            ) : (
              <p className="text-xs text-slate-400 mt-0.5">
                Pausa la sesión activa para contabilizar con precisión los minutos de descanso del docente.
              </p>
            )}
          </div>
        </div>

        {/* Acciones */}
        <div className="flex items-center gap-2 self-start sm:self-auto">
          {enReceso ? (
            <button
              type="button"
              onClick={reanudarClase}
              className="inline-flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-bold transition-all shadow-md shadow-emerald-900/30 cursor-pointer"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>Reanudar Clase</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={iniciarReceso}
              className="inline-flex items-center space-x-1.5 px-3.5 py-2 bg-amber-500/15 hover:bg-amber-500/25 text-amber-300 border border-amber-500/40 rounded-lg text-xs font-semibold transition-all cursor-pointer"
            >
              <Coffee className="w-3.5 h-3.5" />
              <span>Tomar Receso (Pausa)</span>
            </button>
          )}

          {historial.length > 0 && !enReceso && (
            <button
              type="button"
              onClick={resetearHistorial}
              title="Reiniciar contador de recesos de hoy"
              className="p-2 text-slate-500 hover:text-slate-300 rounded-lg border border-slate-800 hover:bg-slate-800 transition-colors cursor-pointer text-xs"
            >
              <RotateCcw className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Historial de descansos si existen */}
      {historial.length > 0 && (
        <div className="mt-3 pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2 text-xs text-slate-400">
          <span className="font-semibold text-slate-300 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Pausas registradas ({historial.length}):
          </span>
          {historial.slice(0, 3).map((item) => (
            <span
              key={item.id}
              className="bg-slate-950/70 border border-slate-800 px-2 py-0.5 rounded text-xs text-slate-300 font-mono"
            >
              {item.inicio} - {item.fin} ({Math.round(item.segundos / 60)} min)
            </span>
          ))}
          {historial.length > 3 && (
            <span className="text-xs text-slate-500">+{historial.length - 3} más</span>
          )}
        </div>
      )}
    </div>
  );
}
