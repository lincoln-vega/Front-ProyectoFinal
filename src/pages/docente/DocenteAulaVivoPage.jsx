/**
 * Cabina Dedicada de Clase en Vivo para el Docente (`/docente/aula-vivo/:cursoId`).
 * Optimizada a 60 FPS:
 *  - El cronómetro de 1s vive aislado en `LiveBottomClockSlot` (`React.memo`) para evitar
 *    re-renderizar inputs, tarjetas y la lista de alumnos en cada segundo.
 *  - Cada fila de estudiante está memorizada (`StudentAttendanceRow`) y la sincronización
 *    usa 1 sola petición unificada (`/lista`) + eventos WebSocket con debounce y pausa en 2.º plano.
 */
import React, { memo, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useLocation, useNavigate, useParams } from "react-router-dom";
import {
  AlertTriangle,
  ArrowLeft,
  CheckCircle2,
  Clock,
  ExternalLink,
  FileUp,
  Loader2,
  PictureInPicture2,
  RefreshCw,
  School,
  Search,
  Send,
  Square,
  Users,
  Video,
  X,
} from "lucide-react";
import ThemeToggle from "../../components/ThemeToggle";
import { uploadFileToStorage } from "../../lib/supabase";
import { academicActivitiesService } from "../../services/academicActivitiesService";
import { clasesVivoService, formatDurationHMS } from "../../services/clasesVivoService";

const STATUS_OPTIONS = [
  { val: "Presente", label: "Presente", activeCls: "bg-emerald-600 text-white border-emerald-500" },
  { val: "Tardanza", label: "Tardanza", activeCls: "bg-amber-500 text-slate-950 border-amber-400" },
  { val: "Ausente", label: "Ausente", activeCls: "bg-red-600 text-white border-red-500" },
  { val: "Justificado", label: "Justif.", activeCls: "bg-indigo-600 text-white border-indigo-500" },
];

/**
 * Subcomponente aislado: es el ÚNICO nodo del DOM que se actualiza cada 1 segundo.
 */
const LiveBottomClockSlot = memo(function LiveBottomClockSlot({
  horaRealInicio,
  estado,
  bloqueSegundos,
  serverOffsetMsRef,
  pipTimerElRef,
  elapsedSecondsRef,
}) {
  const [secs, setSecs] = useState(0);

  useEffect(() => {
    if (!horaRealInicio || estado === "FINALIZADA") return;
    const startMs = new Date(horaRealInicio).getTime();

    const tick = () => {
      const nowSynced = Date.now() + (serverOffsetMsRef.current || 0);
      const nextSecs = Math.max(0, Math.floor((nowSynced - startMs) / 1000));
      elapsedSecondsRef.current = nextSecs;
      if (pipTimerElRef.current) {
        pipTimerElRef.current.textContent = formatDurationHMS(nextSecs);
      }
      // Si la pestaña está oculta (docente mirando Google Meet), no forzar re-render visual innecesario
      if (!document.hidden) {
        setSecs(nextSecs);
      }
    };

    tick();
    const id = setInterval(tick, 1000);
    const onVis = () => {
      if (!document.hidden) tick();
    };
    document.addEventListener("visibilitychange", onVis);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", onVis);
    };
  }, [horaRealInicio, estado, serverOffsetMsRef, pipTimerElRef, elapsedSecondsRef]);

  const enTiempoExtra = secs > bloqueSegundos;

  return (
    <div className="md:col-span-5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-4 py-2.5 flex items-center justify-between gap-3">
      <div className="flex items-center gap-3">
        <span
          className={`w-3 h-3 rounded-full shrink-0 ${
            enTiempoExtra ? "bg-amber-500" : "bg-red-500"
          }`}
        />
        <div>
          <span className="text-[10px] font-black uppercase tracking-wider text-red-600 dark:text-red-400 block">
            {enTiempoExtra
              ? "HORARIO CUMPLIDO (EXTRA NO SUMA PAGO)"
              : "SESIÓN EN VIVO (SINCRONIZADA EN SERVIDOR)"}
          </span>
          <div className="text-xl font-black tabular-nums">
            {formatDurationHMS(secs)}{" "}
            <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
              / Bloque {formatDurationHMS(bloqueSegundos)}
            </span>
          </div>
        </div>
      </div>
      <span
        className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold ${
          enTiempoExtra
            ? "bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300"
            : "bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300"
        }`}
      >
        {enTiempoExtra ? "TIEMPO EXTRA" : "EN CLASE"}
      </span>
    </div>
  );
});

/**
 * KPI de minutos dictados: solo se actualiza cada 15s (solo muestra minutos enteros).
 */
const LiveMinutesTile = memo(function LiveMinutesTile({
  horaRealInicio,
  estado,
  minutosBloque,
  serverOffsetMsRef,
}) {
  const [mins, setMins] = useState(0);

  useEffect(() => {
    if (!horaRealInicio || estado === "FINALIZADA") return;
    const startMs = new Date(horaRealInicio).getTime();
    const updateMins = () => {
      if (document.hidden) return;
      const nowSynced = Date.now() + (serverOffsetMsRef.current || 0);
      setMins(Math.max(0, Math.floor((nowSynced - startMs) / 60000)));
    };
    updateMins();
    const id = setInterval(updateMins, 15000);
    document.addEventListener("visibilitychange", updateMins);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", updateMins);
    };
  }, [horaRealInicio, estado, serverOffsetMsRef]);

  return (
    <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5 p-3">
      <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
        Tiempo Dictado
      </span>
      <strong className="text-base font-black block mt-0.5 tabular-nums">{mins} min</strong>
      <span className="text-[10px] text-slate-500 dark:text-slate-400 font-semibold">
        Tope pago: {minutosBloque} min
      </span>
    </div>
  );
});

/**
 * Fila individual de alumno memorizada: evita recalcular las demás filas al pasar lista.
 */
const StudentAttendanceRow = memo(function StudentAttendanceRow({
  est,
  isUpdating,
  onChangeStatus,
}) {
  const horaIng = useMemo(() => {
    if (!est.horaRegistro) return null;
    return new Date(est.horaRegistro).toLocaleTimeString("es-PE", {
      hour: "2-digit",
      minute: "2-digit",
    });
  }, [est.horaRegistro]);

  return (
    <div
      className={`rounded-xl border px-3.5 py-2.5 flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 ${
        est.alertaAbandono
          ? "bg-amber-50/90 dark:bg-amber-950/30 border-amber-400 dark:border-amber-600/70"
          : "bg-slate-50/70 dark:bg-slate-800/45 border-slate-200/80 dark:border-white/5"
      }`}
    >
      <div className="min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs sm:text-[13px] font-extrabold truncate">{est.nombre}</span>
          {est.alertaAbandono && (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-500 text-slate-950">
              <AlertTriangle className="w-3 h-3" />
              ALERTA ABANDONO
            </span>
          )}
        </div>

        <div className="text-[11px] mt-0.5">
          {est.alertaAbandono ? (
            <span className="text-amber-800 dark:text-amber-300 font-semibold">
              Abrió link {horaIng || ""} pero cerró la pestaña de Meet temprano (
              {est.minutosPermanencia} min &lt; 15 min mínimos)
            </span>
          ) : est.origen === "PASE_LISTA" ? (
            <span className="text-indigo-600 dark:text-indigo-300 font-semibold">
              ✏️ PASE_LISTA · {est.observacion || "Validado por Docente"}
            </span>
          ) : est.ventanaAbierta ? (
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">
              🟢 En Meet ahora ({est.minutosPermanencia} min validados en 2.º plano)
              {horaIng ? ` · Entró ${horaIng}` : ""}
            </span>
          ) : horaIng ? (
            <span className="text-slate-600 dark:text-slate-300">
              ⚡ AUTO_MEET · Ingresó {horaIng} ({est.minutosPermanencia} min acumulados)
            </span>
          ) : (
            <span className="text-rose-600 dark:text-rose-400">
              Sin clic de ingreso registrado hoy
            </span>
          )}
        </div>
      </div>

      <div className="flex items-center gap-1 shrink-0">
        {STATUS_OPTIONS.map((opt) => {
          const isSelected = est.estado === opt.val;
          return (
            <button
              key={opt.val}
              type="button"
              disabled={isUpdating}
              onClick={() => onChangeStatus(est.estudianteId, opt.val)}
              className={`px-2.5 py-1 rounded-lg text-[11px] font-extrabold border cursor-pointer transition-colors ${
                isSelected
                  ? opt.activeCls
                  : "bg-white dark:bg-slate-950 text-slate-500 dark:text-slate-400 border-slate-200 dark:border-slate-800 hover:border-slate-400"
              }`}
            >
              {isSelected ? `✓ ${opt.label}` : opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
});

export default function DocenteAulaVivoPage() {
  const { cursoId } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const coursePreview = location.state?.coursePreview || null;

  const userName = localStorage.getItem("userName") || "Docente";
  const initials = useMemo(
    () =>
      userName
        .split(" ")
        .filter(Boolean)
        .slice(0, 2)
        .map((w) => w[0].toUpperCase())
        .join("") || "DC",
    [userName]
  );

  const [sesion, setSesion] = useState(() =>
    coursePreview
      ? {
          id: null,
          cursoId: coursePreview.id || cursoId,
          cicloNombre: coursePreview.cicloVirtual || coursePreview.ciclovirtual || "Ciclo Vigente",
          asignatura: coursePreview.asignatura || "Asignatura",
          seccion: coursePreview.seccion || "101",
          docenteNombre: coursePreview.docente || userName,
          horaProgramadaInicio: coursePreview.horaInicio || "08:00",
          horaProgramadaFin: coursePreview.horaFin || "10:00",
          horaRealInicio: new Date().toISOString(),
          minutosBloqueProgramado: 120,
          minutosTardanzaDocente: 0,
          estado: "EN_CLASE",
          meetUrl: coursePreview.meetUrl || "",
        }
      : null
  );
  const [resumen, setResumen] = useState({
    totalMatriculados: 0,
    presentes: 0,
    tardanzas: 0,
    justificados: 0,
    ausentes: 0,
    alertasAbandono: 0,
    enLlamadaAhora: 0,
  });
  const [estudiantes, setEstudiantes] = useState([]);
  const [loading, setLoading] = useState(() => !coursePreview);
  const [syncingRoster, setSyncingRoster] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Referencias sin estado para evitar re-renders innecesarios
  const serverOffsetMsRef = useRef(0);
  const elapsedSecondsRef = useRef(0);
  const sesionIdRef = useRef(null);
  const inFlightRef = useRef(false);
  const isEndedRef = useRef(false);
  const hadActiveSessionRef = useRef(false);

  // Estado de ventana Google Meet
  const [meetWindowAlive, setMeetWindowAlive] = useState(() =>
    clasesVivoService.isMeetWindowOpen(cursoId)
  );
  const prevMeetAliveRef = useRef(clasesVivoService.isMeetWindowOpen(cursoId));
  const [showMeetClosedPrompt, setShowMeetClosedPrompt] = useState(false);
  const [finalizing, setFinalizing] = useState(false);
  const [closedSummary, setClosedSummary] = useState(null);
  const [noActiveSession, setNoActiveSession] = useState(false);

  // Ventana PiP
  const pipWindowRef = useRef(null);
  const pipTimerElRef = useRef(null);

  // Filtros de Pase de Lista
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("todos");
  const [updatingStudentId, setUpdatingStudentId] = useState("");

  // Publicador rápido de material/separata
  const [matTitulo, setMatTitulo] = useState("");
  const [matContenido, setMatContenido] = useState("");
  const [matFile, setMatFile] = useState(null);
  const [publishingMat, setPublishingMat] = useState(false);

  const cargarCabina = useCallback(
    async (silent = false) => {
      if (isEndedRef.current || inFlightRef.current) return;
      inFlightRef.current = true;
      try {
        if (!silent && !coursePreview) setLoading(true);
        setError("");

        let targetSesionId = sesionIdRef.current;

        // Aprovechar promesa en vuelo o sesión recién creada desde el clic optimista (ahorra llamar /activa)
        if (!targetSesionId) {
          const { promise, cachedSesion } = clasesVivoService.getPendingOrRecentStart(cursoId);
          let sesActiva = cachedSesion;
          if (!sesActiva && promise) {
            sesActiva = await promise;
          }
          if (!sesActiva) {
            const actResp = await clasesVivoService.obtenerClaseActiva(cursoId);
            sesActiva = actResp?.activa || null;
          }
          if (isEndedRef.current) return;
          if (!sesActiva) {
            setNoActiveSession(true);
            return;
          }
          targetSesionId = sesActiva.id;
          sesionIdRef.current = targetSesionId;
          hadActiveSessionRef.current = true;
          setNoActiveSession(false);
          if (sesActiva.serverNow) {
            serverOffsetMsRef.current = new Date(sesActiva.serverNow).getTime() - Date.now();
          }
          setSesion(sesActiva);
        }

        const listaData = await clasesVivoService.obtenerPaseLista(targetSesionId);
        if (isEndedRef.current) return;

        const sesActual = listaData?.sesion;
        if (sesActual?.serverNow) {
          serverOffsetMsRef.current = new Date(sesActual.serverNow).getTime() - Date.now();
        }
        if (sesActual?.estado === "FINALIZADA") {
          isEndedRef.current = true;
          sesionIdRef.current = null;
          setSesion(sesActual);
          setNoActiveSession(true);
          return;
        }

        if (sesActual) setSesion(sesActual);
        if (listaData?.resumen) setResumen(listaData.resumen);
        if (Array.isArray(listaData?.estudiantes)) setEstudiantes(listaData.estudiantes);
      } catch (err) {
        if (!isEndedRef.current) {
          setError(err.message || "No se pudo sincronizar la Cabina de Clase en Vivo.");
        }
      } finally {
        inFlightRef.current = false;
        setSyncingRoster(false);
        if (!silent) setLoading(false);
      }
    },
    [cursoId, coursePreview]
  );

  useEffect(() => {
    isEndedRef.current = false;
    sesionIdRef.current = null;
    cargarCabina(false);

    let debounceTimer = null;
    const scheduleRefresh = () => {
      if (isEndedRef.current) return;
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => cargarCabina(true), 250);
    };

    // Respaldo calmado cada 20s SOLO si la pestaña está visible
    const poll = setInterval(() => {
      if (!isEndedRef.current && !document.hidden) {
        cargarCabina(true);
      }
    }, 20000);

    const onVis = () => {
      if (!document.hidden && !isEndedRef.current) {
        cargarCabina(true);
      }
    };
    document.addEventListener("visibilitychange", onVis);

    const unsub = clasesVivoService.subscribeLiveChanges((evt) => {
      if (evt?.type === "CLASS_ENDED" && (!evt.cursoId || evt.cursoId === cursoId)) {
        isEndedRef.current = true;
        return;
      }
      scheduleRefresh();
    });

    return () => {
      clearTimeout(debounceTimer);
      clearInterval(poll);
      document.removeEventListener("visibilitychange", onVis);
      unsub();
    };
  }, [cargarCabina, cursoId]);

  // Vigilancia ligera (en memoria local, 0 red) de cierre de la ventana de Google Meet
  useEffect(() => {
    if (!cursoId || sesion?.estado === "FINALIZADA") return;
    const checkWindow = () => {
      const alive = clasesVivoService.isMeetWindowOpen(cursoId);
      setMeetWindowAlive((prev) => (prev === alive ? prev : alive));
      if (prevMeetAliveRef.current && !alive) {
        setShowMeetClosedPrompt(true);
      }
      prevMeetAliveRef.current = alive;
    };
    checkWindow();
    const id = setInterval(checkWindow, 2000);
    return () => clearInterval(id);
  }, [cursoId, sesion?.estado]);

  useEffect(() => {
    return () => {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        try {
          pipWindowRef.current.close();
        } catch {}
      }
    };
  }, []);

  const handleOpenOrFocusMeet = useCallback(() => {
    const url = sesion?.meetUrl;
    if (!url) {
      setError("Este curso aún no tiene un enlace de Google Meet asignado.");
      return;
    }
    const win = clasesVivoService.openOrFocusMeetWindow(cursoId, url);
    if (win) {
      prevMeetAliveRef.current = true;
      setMeetWindowAlive(true);
      setShowMeetClosedPrompt(false);
    }
  }, [cursoId, sesion?.meetUrl]);

  const handleFinalizarClase = useCallback(async () => {
    if (!sesion?.id || finalizing) return;
    isEndedRef.current = true;
    setFinalizing(true);
    setError("");
    try {
      const finalizada = await clasesVivoService.finalizarClase(sesion.id, cursoId);
      sesionIdRef.current = null;
      clasesVivoService.clearMeetWindow(cursoId);
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        try {
          pipWindowRef.current.close();
        } catch {}
      }
      setSesion(finalizada);
      setShowMeetClosedPrompt(false);
      setClosedSummary(finalizada);
    } catch (err) {
      isEndedRef.current = false;
      setError(err.message || "No se pudo finalizar la sesión.");
    } finally {
      setFinalizing(false);
    }
  }, [sesion?.id, finalizing, cursoId]);

  const handleLaunchPiP = useCallback(async () => {
    if (!("documentPictureInPicture" in window)) {
      setNotice(
        "Tu navegador actual no soporta ventanas Document Picture-in-Picture (disponible en Chrome, Brave y Edge). Tus controles siguen activos en esta Cabina."
      );
      return;
    }
    try {
      if (pipWindowRef.current && !pipWindowRef.current.closed) {
        pipWindowRef.current.focus();
        return;
      }
      const pipWin = await window.documentPictureInPicture.requestWindow({
        width: 580,
        height: 112,
      });
      pipWindowRef.current = pipWin;
      const doc = pipWin.document;
      doc.body.style.cssText =
        "margin:0;padding:12px 16px;background:#0f172a;color:#f8fafc;font-family:system-ui,sans-serif;display:flex;align-items:center;justify-content:space-between;gap:12px;height:100vh;box-sizing:border-box;border-top:3px solid #ef4444;";

      const left = doc.createElement("div");
      left.innerHTML = `<div style="font-size:10px;font-weight:800;color:#fca5a5;letter-spacing:0.05em;">● EN CLASE · ${(
        sesion?.asignatura || "Pre-U"
      ).slice(0, 26)}</div>`;
      const timerSpan = doc.createElement("div");
      timerSpan.style.cssText =
        "font-size:22px;font-weight:900;font-variant-numeric:tabular-nums;margin-top:2px;";
      timerSpan.textContent = formatDurationHMS(elapsedSecondsRef.current);
      pipTimerElRef.current = timerSpan;
      left.appendChild(timerSpan);

      const actions = doc.createElement("div");
      actions.style.cssText = "display:flex;gap:8px;align-items:center;";

      const btnCabina = doc.createElement("button");
      btnCabina.textContent = "📋 Ver Lista / Cabina";
      btnCabina.style.cssText =
        "background:#334155;color:#fff;border:1px solid #475569;border-radius:10px;padding:9px 12px;font-weight:700;font-size:12px;cursor:pointer;";
      btnCabina.onclick = () => window.focus();

      const btnEnd = doc.createElement("button");
      btnEnd.textContent = "⏹ Finalizar Clase";
      btnEnd.style.cssText =
        "background:#dc2626;color:#fff;border:none;border-radius:10px;padding:9px 14px;font-weight:800;font-size:12px;cursor:pointer;";
      btnEnd.onclick = () => {
        window.focus();
        handleFinalizarClase();
      };

      actions.appendChild(btnCabina);
      actions.appendChild(btnEnd);
      doc.body.appendChild(left);
      doc.body.appendChild(actions);
    } catch (err) {
      console.warn("[PiP] No se pudo abrir mini-barra:", err);
    }
  }, [sesion?.asignatura, handleFinalizarClase]);

  const handleCambiarEstadoAlumno = useCallback(
    async (estudianteId, nuevoEstado) => {
      const sid = sesionIdRef.current;
      if (!sid) return;
      setUpdatingStudentId(estudianteId);
      // Actualización optimista inmediata en pantalla
      setEstudiantes((prev) =>
        prev.map((e) =>
          e.estudianteId === estudianteId
            ? { ...e, estado: nuevoEstado, origen: "PASE_LISTA", alertaAbandono: false }
            : e
        )
      );
      try {
        await clasesVivoService.actualizarEstadoAlumno(
          sid,
          estudianteId,
          nuevoEstado,
          `Validado en clase por ${userName}`
        );
      } catch (err) {
        setError(err.message || "No se pudo actualizar la asistencia del alumno.");
        cargarCabina(true);
      } finally {
        setUpdatingStudentId("");
      }
    },
    [userName, cargarCabina]
  );

  const handlePublicarMaterial = async (e) => {
    e.preventDefault();
    if (!sesion?.cursoId) return;
    if (!matTitulo.trim()) {
      setError("Escribe un título para el material o aviso rápido.");
      return;
    }
    setPublishingMat(true);
    setError("");
    setNotice("");
    try {
      let uploaded = null;
      if (matFile) {
        uploaded = await uploadFileToStorage(
          "materiales-clase",
          matFile,
          `curso-${sesion.cursoId}`
        );
      }

      await academicActivitiesService.createAnnouncement({
        cursoId: sesion.cursoId,
        curso: sesion.asignatura,
        titulo: matTitulo.trim(),
        contenido:
          matContenido.trim() ||
          (uploaded
            ? `Material de clase compartido en vivo: ${uploaded.fileName || matFile.name}`
            : "Aviso publicado durante la sesión en vivo."),
        prioridad: "Alta",
        docenteId: sesion.docenteId,
        docente: sesion.docenteNombre || userName,
        archivoUrl: uploaded?.url || null,
        archivoPath: uploaded?.path || null,
        archivoNombre: uploaded?.fileName || matFile?.name || null,
      });

      setMatTitulo("");
      setMatContenido("");
      setMatFile(null);
      clasesVivoService.notifyMaterialPublished(sesion.cursoId);
      setNotice("Material / aviso publicado en tiempo real para todos los alumnos del curso.");
    } catch (err) {
      setError(err.message || "No se pudo publicar el material.");
    } finally {
      setPublishingMat(false);
    }
  };

  const estudiantesFiltrados = useMemo(() => {
    const q = searchTerm.trim().toLowerCase();
    return estudiantes.filter((e) => {
      if (
        q &&
        !`${e.nombre || ""} ${e.correo || ""} ${e.estudianteId || ""}`
          .toLowerCase()
          .includes(q)
      ) {
        return false;
      }
      if (statusFilter === "presentes") return e.estado === "Presente" || e.estado === "Justificado";
      if (statusFilter === "tardanzas") return e.estado === "Tardanza";
      if (statusFilter === "alertas") return Boolean(e.alertaAbandono);
      if (statusFilter === "ausentes") return e.estado === "Ausente";
      return true;
    });
  }, [estudiantes, searchTerm, statusFilter]);

  const horaAperturaFmt = useMemo(
    () =>
      sesion?.horaRealInicio
        ? new Date(sesion.horaRealInicio).toLocaleTimeString("es-PE", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "--:--",
    [sesion?.horaRealInicio]
  );

  const bloqueSegundos = (sesion?.minutosBloqueProgramado || 120) * 60;

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center gap-3 text-slate-700 dark:text-slate-200">
        <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
        <p className="text-sm font-extrabold">Cargando Cabina de Clase en Vivo...</p>
      </div>
    );
  }

  if (noActiveSession && !closedSummary) {
    return (
      <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-6">
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 text-center space-y-4 shadow-xl">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center mx-auto text-slate-500">
            <Video className="w-6 h-6" />
          </div>
          <h2 className="text-base font-black">Esta sesión en vivo ya concluyó o no ha sido iniciada</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Para evitar abrir sesiones por accidente al recargar, las clases solo se inician cuando lo confirmas explícitamente.
          </p>
          <div className="flex flex-col sm:flex-row gap-2 pt-2">
            <button
              type="button"
              onClick={async () => {
                isEndedRef.current = false;
                sesionIdRef.current = null;
                setLoading(true);
                try {
                  const nueva = await clasesVivoService.iniciarClase(cursoId);
                  if (nueva?.id) sesionIdRef.current = nueva.id;
                  if (nueva?.meetUrl) {
                    clasesVivoService.openOrFocusMeetWindow(cursoId, nueva.meetUrl);
                  }
                  await cargarCabina(false);
                } catch (err) {
                  setError(err.message || "No se pudo iniciar la clase.");
                  setLoading(false);
                }
              }}
              className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
            >
              Iniciar Nueva Clase
            </button>
            <button
              type="button"
              onClick={() => navigate("/docente/cursos")}
              className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
            >
              Volver al Portal
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col">
      {/* 1. HEADER DEDICADO DE PANTALLA COMPLETA (SIN BARRA LATERAL) */}
      <header className="h-15 bg-white dark:bg-slate-900 border-b border-slate-200 dark:border-white/10 px-4 sm:px-7 flex items-center justify-between gap-3 sticky top-0 z-30">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-9 h-9 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-sm shrink-0">
            <School className="w-5 h-5 text-amber-300" />
          </div>
          <span className="font-black text-sm sm:text-base tracking-tight shrink-0">
            Academia Pre
          </span>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold bg-red-100 dark:bg-red-950 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-800/70">
            <span className="w-2 h-2 rounded-full bg-red-500" />
            CABINA DE CLASE EN VIVO
          </span>
          <span className="hidden lg:inline text-xs text-slate-500 dark:text-slate-400 truncate">
            • Persistencia en servidor activa (resiste recargas F5 o cambio de equipo)
          </span>
        </div>

        <div className="flex items-center gap-3 shrink-0">
          <ThemeToggle />
          <span className="hidden sm:inline text-xs font-bold text-slate-700 dark:text-slate-200">
            {userName}
          </span>
          <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-extrabold flex items-center justify-center">
            {initials}
          </div>
        </div>
      </header>

      {/* CONTENIDO PRINCIPAL DE LA CABINA */}
      <main className="flex-1 max-w-[1600px] w-full mx-auto px-4 sm:px-7 py-4 flex flex-col gap-4">
        {error && (
          <div
            role="alert"
            className="rounded-2xl border border-red-300 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-xs font-bold text-red-700 dark:text-red-200 flex items-center justify-between gap-3"
          >
            <span>{error}</span>
            <button type="button" onClick={() => setError("")} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {notice && (
          <div
            role="status"
            className="rounded-2xl border border-emerald-300 dark:border-emerald-800 bg-emerald-50 dark:bg-emerald-950/50 px-4 py-3 text-xs font-bold text-emerald-800 dark:text-emerald-200 flex items-center justify-between gap-3"
          >
            <span className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 shrink-0" />
              {notice}
            </span>
            <button type="button" onClick={() => setNotice("")} className="cursor-pointer">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* BANNER DEL CURSO Y BLOQUE HORARIO */}
        <section className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 px-5 py-3.5 flex flex-col md:flex-row md:items-center justify-between gap-3 shadow-xs">
          <div>
            <div className="flex flex-wrap items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-[11px] font-extrabold uppercase bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800/60">
                {sesion?.cicloNombre || "Ciclo Vigente"}
              </span>
              <h1 className="text-lg sm:text-xl font-black tracking-tight">
                {sesion?.asignatura || "Asignatura"} • Sección {sesion?.seccion || "101"}
              </h1>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Horario del bloque:{" "}
              <strong className="text-slate-800 dark:text-slate-200">
                {sesion?.horaProgramadaInicio} – {sesion?.horaProgramadaFin} (
                {sesion?.minutosBloqueProgramado || 120} min máx. computables)
              </strong>{" "}
              • Los minutos extra tras el fin del bloque no inflan planilla (auto-cierre +20 min).
            </p>
          </div>

          <Link
            to="/docente/cursos"
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-white/10 transition-colors self-start md:self-auto"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Volver a Mis Cursos (La sesión sigue activa)</span>
          </Link>
        </section>

        {/* WORKSPACE DE 2 COLUMNAS */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 items-stretch">
          {/* COLUMNA IZQUIERDA (5 COLS) */}
          <div className="lg:col-span-5 flex flex-col gap-4">
            <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 space-y-3 shadow-xs">
              <div
                className={`rounded-xl p-3.5 border space-y-2.5 ${
                  meetWindowAlive
                    ? "bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-300 dark:border-emerald-700/60"
                    : "bg-amber-50/70 dark:bg-amber-950/25 border-amber-300 dark:border-amber-700/60"
                }`}
              >
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <span
                    className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-extrabold ${
                      meetWindowAlive
                        ? "bg-emerald-600 text-white"
                        : "bg-amber-500 text-slate-950"
                    }`}
                  >
                    <Video className="w-3.5 h-3.5" />
                    {meetWindowAlive
                      ? "PESTAÑA GOOGLE MEET ACTIVA Y VIGILADA"
                      : "VENTANA MEET NO DETECTADA EN ESTA PESTAÑA"}
                  </span>
                  {sesion?.meetUrl && (
                    <span className="text-[11px] font-mono text-slate-600 dark:text-slate-300 truncate max-w-[220px]">
                      {sesion.meetUrl.replace(/^https?:\/\//, "")}
                    </span>
                  )}
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                  {meetWindowAlive
                    ? "Vigilamos en segundo plano si cierras la pestaña de Google Meet para ofrecerte cerrar el acta al instante."
                    : "Pulsa 'Abrir / Enfocar Google Meet' para vincular y vigilar la ventana de tu videollamada desde esta Cabina."}
                </p>

                <div className="flex flex-wrap gap-2 pt-1">
                  <button
                    type="button"
                    onClick={handleLaunchPiP}
                    className="flex-1 min-w-[180px] bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <PictureInPicture2 className="w-4 h-4 shrink-0" />
                    <span>Flotar mini-barra sobre Meet (PiP)</span>
                  </button>
                  <button
                    type="button"
                    onClick={handleOpenOrFocusMeet}
                    className="bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3.5 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
                  >
                    <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    <span>{meetWindowAlive ? "Ir a Meet" : "Abrir Meet"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-2.5">
                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5 p-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                    Ingreso Docente
                  </span>
                  <strong className="text-base font-black text-emerald-600 dark:text-emerald-400 block mt-0.5">
                    {horaAperturaFmt}
                  </strong>
                  <span
                    className={`text-[10px] font-bold ${
                      (sesion?.minutosTardanzaDocente || 0) > 0
                        ? "text-amber-600 dark:text-amber-400"
                        : "text-emerald-600 dark:text-emerald-400"
                    }`}
                  >
                    {(sesion?.minutosTardanzaDocente || 0) > 0
                      ? `Tardanza (${sesion.minutosTardanzaDocente}m)`
                      : "Puntual (≤ 10 min)"}
                  </span>
                </div>

                <LiveMinutesTile
                  horaRealInicio={sesion?.horaRealInicio}
                  estado={sesion?.estado}
                  minutosBloque={sesion?.minutosBloqueProgramado || 120}
                  serverOffsetMsRef={serverOffsetMsRef}
                />

                <div className="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/70 dark:border-white/5 p-3">
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-semibold">
                    En Llamada Ahora
                  </span>
                  <strong className="text-base font-black text-blue-600 dark:text-blue-400 block mt-0.5">
                    {resumen.enLlamadaAhora} / {resumen.totalMatriculados}
                  </strong>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                    {resumen.alertasAbandono > 0
                      ? `${resumen.alertasAbandono} alerta(s) cierre`
                      : "Sin alertas"}
                  </span>
                </div>
              </div>
            </div>

            {/* Publicador Rápido de Separata / Material PDF */}
            <form
              onSubmit={handlePublicarMaterial}
              className="flex-1 bg-white dark:bg-slate-900 rounded-2xl border border-blue-200/80 dark:border-blue-500/30 p-4 flex flex-col justify-between gap-3 shadow-xs"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <h2 className="text-sm font-black flex items-center gap-1.5">
                      <FileUp className="w-4 h-4 text-blue-500" />
                      <span>Compartir Material o Aviso Rápido al Salón</span>
                    </h2>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400">
                      Sube la separata PDF, pizarra o indicación del momento sin salir de tu clase.
                    </p>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-extrabold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300">
                    Supabase Storage
                  </span>
                </div>

                <input
                  type="text"
                  value={matTitulo}
                  onChange={(e) => setMatTitulo(e.target.value)}
                  placeholder="Ej: Separata Semana 04 — Polinomios Especiales y Resto"
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs font-semibold focus:outline-none focus:ring-2 focus:ring-blue-500"
                />

                <textarea
                  rows={2}
                  value={matContenido}
                  onChange={(e) => setMatContenido(e.target.value)}
                  placeholder="Indicación breve opcional (ej. resolver ejercicios impares en clase)..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 px-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
                />

                <label className="flex items-center justify-between gap-2 rounded-xl border border-dashed border-blue-400/70 bg-blue-50/50 dark:bg-blue-950/20 px-3 py-2.5 text-xs text-blue-700 dark:text-blue-300 cursor-pointer hover:bg-blue-50 dark:hover:bg-blue-950/40 transition-colors">
                  <span className="truncate font-semibold">
                    {matFile
                      ? `📄 ${matFile.name} (${(matFile.size / (1024 * 1024)).toFixed(2)} MB)`
                      : "📎 Adjuntar PDF, PPTX, DOCX o imagen (máx. 15 MB)"}
                  </span>
                  <span className="font-extrabold underline shrink-0">
                    {matFile ? "Cambiar" : "Elegir archivo"}
                  </span>
                  <input
                    type="file"
                    accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.webp"
                    className="hidden"
                    onChange={(e) => setMatFile(e.target.files?.[0] || null)}
                  />
                </label>
              </div>

              <button
                type="submit"
                disabled={publishingMat}
                className="w-full bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl flex items-center justify-center gap-2 cursor-pointer transition-colors"
              >
                {publishingMat ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-3.5 h-3.5" />
                )}
                <span>Publicar ahora para todos los alumnos del curso</span>
              </button>
            </form>
          </div>

          {/* COLUMNA DERECHA (7 COLS): ASISTENCIA HÍBRIDA EN TIEMPO REAL */}
          <div className="lg:col-span-7 bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 flex flex-col gap-3 shadow-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h2 className="text-base font-black flex items-center gap-2">
                  <Users className="w-4.5 h-4.5 text-indigo-500" />
                  <span>Asistencia Híbrida del Salón (Tiempo Real)</span>
                </h2>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  Valida en 2.º plano que el alumno mantenga abierto Meet; puedes subsanar cualquier caso con 1 clic.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-1.5 text-[11px] font-extrabold">
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300">
                  {resumen.presentes + resumen.justificados} Presentes
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300">
                  {resumen.tardanzas} Tardanzas
                </span>
                <span className="px-2.5 py-0.5 rounded-full bg-red-100 dark:bg-red-950/70 text-red-800 dark:text-red-300">
                  {resumen.ausentes} Ausentes
                </span>
                <button
                  type="button"
                  onClick={() => cargarCabina(true)}
                  className="p-1.5 rounded-lg border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/5 cursor-pointer"
                  title="Refrescar lista ahora"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar estudiante por nombre o correo..."
                  className="w-full rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-white/10 pl-8 pr-3 py-2 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500"
                />
              </div>
              <div className="flex gap-1 overflow-x-auto text-[11px] font-bold">
                {[
                  { id: "todos", label: `Todos (${estudiantes.length})` },
                  { id: "presentes", label: "Presentes" },
                  { id: "tardanzas", label: "Tardanzas" },
                  { id: "alertas", label: `Alertas (${resumen.alertasAbandono})` },
                  { id: "ausentes", label: "Ausentes" },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setStatusFilter(tab.id)}
                    className={`px-2.5 py-1.5 rounded-xl whitespace-nowrap cursor-pointer transition-colors ${
                      statusFilter === tab.id
                        ? "bg-indigo-600 text-white"
                        : "bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="flex-1 max-h-[430px] overflow-y-auto space-y-2 pr-1">
              {syncingRoster && estudiantes.length === 0 ? (
                <div className="py-12 flex flex-col items-center justify-center gap-2 text-xs text-slate-400">
                  <Loader2 className="w-5 h-5 animate-spin text-indigo-500" />
                  <span>Sincronizando nómina de matriculados...</span>
                </div>
              ) : estudiantesFiltrados.length === 0 ? (
                <div className="py-12 text-center text-xs text-slate-400">
                  No se encontraron estudiantes para el filtro seleccionado.
                </div>
              ) : (
                estudiantesFiltrados.map((est) => (
                  <StudentAttendanceRow
                    key={est.estudianteId}
                    est={est}
                    isUpdating={updatingStudentId === est.estudianteId}
                    onChangeStatus={handleCambiarEstadoAlumno}
                  />
                ))
              )}
            </div>
          </div>
        </div>

        {/* BARRA INFERIOR DE 3 BLOQUES LIMPIOS */}
        <footer className="bg-white dark:bg-slate-900 border-2 border-slate-300 dark:border-slate-700 rounded-2xl p-3 grid grid-cols-1 md:grid-cols-12 gap-3 items-center shadow-lg">
          <LiveBottomClockSlot
            horaRealInicio={sesion?.horaRealInicio}
            estado={sesion?.estado}
            bloqueSegundos={bloqueSegundos}
            serverOffsetMsRef={serverOffsetMsRef}
            pipTimerElRef={pipTimerElRef}
            elapsedSecondsRef={elapsedSecondsRef}
          />

          <div className="md:col-span-4 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl px-3 py-2.5 flex items-center justify-center gap-2">
            <button
              type="button"
              onClick={handleLaunchPiP}
              className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white font-extrabold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <PictureInPicture2 className="w-4 h-4 shrink-0" />
              <span>Flotar Barra (PiP)</span>
            </button>
            <button
              type="button"
              onClick={handleOpenOrFocusMeet}
              className="flex-1 bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs py-2.5 px-3 rounded-xl flex items-center justify-center gap-1.5 cursor-pointer transition-colors"
            >
              <ExternalLink className="w-3.5 h-3.5 shrink-0" />
              <span>Enfocar Meet</span>
            </button>
          </div>

          <div className="md:col-span-3">
            <button
              type="button"
              disabled={finalizing || sesion?.estado === "FINALIZADA"}
              onClick={handleFinalizarClase}
              className="w-full bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white font-black text-xs sm:text-sm py-3.5 px-4 rounded-xl shadow-md flex items-center justify-center gap-2 cursor-pointer transition-colors"
            >
              {finalizing ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Square className="w-4 h-4 fill-current" />
              )}
              <span>Finalizar Clase y Guardar Horas</span>
            </button>
          </div>
        </footer>
      </main>

      {/* MODAL AUTOMÁTICO AL CERRAR GOOGLE MEET */}
      {showMeetClosedPrompt && sesion?.estado === "EN_CLASE" && (
        <div className="fixed inset-0 z-50 bg-slate-950/75 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-amber-100 dark:bg-amber-950/70 text-amber-600 dark:text-amber-300">
                <Clock className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">
                  Detectamos que cerraste la ventana de Google Meet
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Tiempo transcurrido: {formatDurationHMS(elapsedSecondsRef.current)}
                </p>
              </div>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              ¿Ya concluyó tu sesión de <strong>{sesion?.asignatura}</strong>? Si finalizas ahora,
              se consolidará el acta de asistencia y se registrarán tus minutos efectivos dictados.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 pt-2">
              <button
                type="button"
                onClick={handleFinalizarClase}
                disabled={finalizing}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                ⏹ Sí, Finalizar Clase Ahora
              </button>
              <button
                type="button"
                onClick={() => setShowMeetClosedPrompt(false)}
                className="flex-1 bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 font-bold text-xs py-2.5 px-4 rounded-xl cursor-pointer"
              >
                Seguir en Cabina
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL DE RESUMEN AL FINALIZAR CLASE */}
      {closedSummary && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-900 border border-emerald-500/40 rounded-2xl max-w-md w-full p-6 space-y-4 shadow-2xl">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-100 dark:bg-emerald-950 text-emerald-600 dark:text-emerald-400">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-base font-black">¡Clase Finalizada y Acta Guardada!</h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {closedSummary.asignatura} • {closedSummary.fecha}
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 text-xs">
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/70">
                <span className="text-slate-500 block">Tiempo Real en Sala</span>
                <strong className="text-base font-black">
                  {closedSummary.minutosRealesBrutos} min
                </strong>
              </div>
              <div className="p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/50">
                <span className="text-emerald-700 dark:text-emerald-300 block">
                  Computable Planilla
                </span>
                <strong className="text-base font-black text-emerald-700 dark:text-emerald-300">
                  {closedSummary.minutosEfectivosDictados} min
                </strong>
              </div>
            </div>

            <button
              type="button"
              onClick={() => navigate("/docente/cursos")}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-extrabold text-xs py-3 rounded-xl cursor-pointer"
            >
              Volver al Portal Docente
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
