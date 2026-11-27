/**
 * Servicio centralizado de Clases en Vivo por Google Meet y Asistencia Híbrida (Fase 3).
 * Gestiona:
 *  - Sesiones persistentes en servidor (PostgreSQL) inmunes a F5 o cambio de equipo.
 *  - Sincronización instantánea en tiempo real (<100 ms sin F5) entre Docente y Estudiantes
 *    mediante Supabase Realtime Broadcast (WebSockets multi-navegador/PC) + BroadcastChannel local.
 *  - Referencias en memoria a pestañas abiertas de Google Meet (`WindowProxy`) para detectar
 *    cierre de ventana (`meetWin.closed`).
 */
import { getApiBaseUrl } from "../lib/apiUrl";
import { getApiAccessToken, supabase } from "../lib/supabase";

// Mapa en memoria de referencias a pestañas de Google Meet por cursoId
const meetWindowsByCourse = new Map();

// Promesas de inicio en vuelo y sesiones recientes para transición optimista en 0 ms a la Cabina
const pendingStartsByCourse = new Map();
const recentSessionsByCourse = new Map();

// Estado reactivo para el rastreador silencioso en 2.º plano del estudiante
let studentTrackerState = null;
const studentListeners = new Set();

// Suscriptores a eventos en vivo (inicio/fin de clase, ingresos de alumnos, materiales publicados)
const liveChangeListeners = new Set();
let broadcastChannel = null;
let realtimeChannel = null;
let realtimeReady = false;

function notifyStudentListeners() {
  for (const listener of studentListeners) {
    try {
      listener(studentTrackerState);
    } catch {}
  }
}

function dispatchLocalLiveChange(eventPayload) {
  for (const listener of liveChangeListeners) {
    try {
      listener(eventPayload);
    } catch {}
  }
}

function initRealtimeSync() {
  if (typeof window === "undefined") return;

  // 1. Sincronización instantánea 0 ms entre pestañas del mismo navegador
  if (!broadcastChannel && typeof BroadcastChannel !== "undefined") {
    try {
      broadcastChannel = new BroadcastChannel("academia_clases_vivo_sync");
      broadcastChannel.onmessage = (ev) => {
        if (ev?.data) {
          dispatchLocalLiveChange(ev.data);
        }
      };
    } catch {}
  }

  // 2. Sincronización instantánea ~50 ms entre distintos navegadores / cuentas / PCs vía Supabase WebSocket
  if (!realtimeChannel && supabase) {
    try {
      realtimeChannel = supabase
        .channel("academia-clases-vivo-global", {
          config: { broadcast: { self: false } },
        })
        .on("broadcast", { event: "live_sync" }, ({ payload }) => {
          if (payload) {
            dispatchLocalLiveChange(payload);
          }
        })
        .subscribe((status) => {
          realtimeReady = status === "SUBSCRIBED";
        });
    } catch {}
  }
}

initRealtimeSync();

async function requestClasesVivo(path, options = {}) {
  const headers = { "Content-Type": "application/json", ...(options.headers || {}) };
  const token = getApiAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers,
  });

  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg =
      typeof body?.detail === "string"
        ? body.detail
        : body?.message || `Error HTTP ${res.status}`;
    const err = new Error(msg);
    err.status = res.status;
    throw err;
  }
  return body;
}

export function formatDurationHMS(totalSeconds) {
  const safe = Math.max(0, Math.floor(Number(totalSeconds) || 0));
  const h = Math.floor(safe / 3600);
  const m = Math.floor((safe % 3600) / 60);
  const s = safe % 60;
  return [h, m, s].map((v) => String(v).padStart(2, "0")).join(":");
}

export const clasesVivoService = {
  /**
   * Emite un evento de sincronización inmediata a la pestaña actual, a otras pestañas locales
   * y a todos los navegadores conectados (Docente <-> Alumnos) por WebSocket.
   */
  broadcastLiveChange(type, extra = {}) {
    initRealtimeSync();
    const payload = { type, ...extra, ts: Date.now() };
    dispatchLocalLiveChange(payload);
    if (broadcastChannel) {
      try {
        broadcastChannel.postMessage(payload);
      } catch {}
    }
    if (realtimeChannel) {
      const sendFn = () => {
        try {
          realtimeChannel.send({
            type: "broadcast",
            event: "live_sync",
            payload,
          });
        } catch {}
      };
      if (realtimeReady) {
        sendFn();
      } else {
        setTimeout(sendFn, 350);
      }
    }
  },

  subscribeLiveChanges(listener) {
    initRealtimeSync();
    liveChangeListeners.add(listener);
    return () => liveChangeListeners.delete(listener);
  },

  openOrFocusMeetWindow(cursoId, meetUrl) {
    if (!meetUrl) return null;
    const key = String(cursoId || "default");
    const existing = meetWindowsByCourse.get(key);
    if (existing && !existing.closed) {
      try {
        existing.focus();
        return existing;
      } catch {}
    }
    const win = window.open(meetUrl, `academia_meet_${key}`);
    if (win) {
      meetWindowsByCourse.set(key, win);
    }
    return win;
  },

  getMeetWindow(cursoId) {
    const win = meetWindowsByCourse.get(String(cursoId || ""));
    return win || null;
  },

  isMeetWindowOpen(cursoId) {
    const win = meetWindowsByCourse.get(String(cursoId || ""));
    return Boolean(win && !win.closed);
  },

  clearMeetWindow(cursoId) {
    meetWindowsByCourse.delete(String(cursoId || ""));
  },

  // --- Endpoints Docente / General ---

  async iniciarClase(cursoId) {
    const key = String(cursoId || "");
    if (pendingStartsByCourse.has(key)) {
      return pendingStartsByCourse.get(key);
    }
    const promise = requestClasesVivo("/clases-vivo/iniciar", {
      method: "POST",
      body: JSON.stringify({ cursoId }),
    })
      .then((sesion) => {
        if (sesion?.id) {
          recentSessionsByCourse.set(key, { sesion, ts: Date.now() });
        }
        this.broadcastLiveChange("CLASS_STARTED", { cursoId, sesionId: sesion?.id });
        return sesion;
      })
      .finally(() => {
        pendingStartsByCourse.delete(key);
      });

    pendingStartsByCourse.set(key, promise);
    return promise;
  },

  /**
   * Abre Google Meet al instante y dispara /clases-vivo/iniciar en segundo plano
   * para permitir navegar a la Cabina en 0 ms sin bloquear la pantalla.
   */
  launchClassOptimistically(course) {
    if (!course?.id) return null;
    if (course.meetUrl) {
      this.openOrFocusMeetWindow(course.id, course.meetUrl);
    }
    const p = this.iniciarClase(course.id);
    p.catch(() => {});
    return p;
  },

  getPendingOrRecentStart(cursoId) {
    const key = String(cursoId || "");
    if (pendingStartsByCourse.has(key)) {
      return { promise: pendingStartsByCourse.get(key), cachedSesion: null };
    }
    const rec = recentSessionsByCourse.get(key);
    if (rec && Date.now() - rec.ts < 15000) {
      return { promise: null, cachedSesion: rec.sesion };
    }
    return { promise: null, cachedSesion: null };
  },

  async obtenerClaseActiva(cursoId = null) {
    const qs = cursoId ? `?curso_id=${encodeURIComponent(cursoId)}` : "";
    return requestClasesVivo(`/clases-vivo/activa${qs}`);
  },

  async listarClasesActivas(cicloId = null) {
    const qs = cicloId ? `?ciclo_id=${encodeURIComponent(cicloId)}` : "";
    return requestClasesVivo(`/clases-vivo/activas${qs}`);
  },

  async obtenerPaseLista(sesionId) {
    return requestClasesVivo(`/clases-vivo/${encodeURIComponent(sesionId)}/lista`);
  },

  async actualizarEstadoAlumno(sesionId, estudianteId, estado, observacion = "") {
    const res = await requestClasesVivo(
      `/clases-vivo/${encodeURIComponent(sesionId)}/lista/${encodeURIComponent(estudianteId)}`,
      {
        method: "PUT",
        body: JSON.stringify({ estado, observacion }),
      }
    );
    this.broadcastLiveChange("ATTENDANCE_UPDATED", { sesionId, estudianteId, estado });
    return res;
  },

  async finalizarClase(sesionId, cursoId = null) {
    if (cursoId) {
      recentSessionsByCourse.delete(String(cursoId));
    }
    const res = await requestClasesVivo(
      `/clases-vivo/${encodeURIComponent(sesionId)}/finalizar`,
      { method: "POST" }
    );
    if (res?.cursoId) {
      recentSessionsByCourse.delete(String(res.cursoId));
    }
    this.broadcastLiveChange("CLASS_ENDED", {
      sesionId,
      cursoId: cursoId || res?.cursoId || null,
    });
    return res;
  },

  notifyMaterialPublished(cursoId) {
    this.broadcastLiveChange("MATERIAL_PUBLISHED", { cursoId });
  },

  // --- Endpoints Estudiante y Rastreador Silencioso en 2.º Plano ---

  async unirseAClase(sesion, asignaturaFallback = "Clase en Vivo") {
    if (!sesion?.id) {
      throw new Error("El docente aún no ha iniciado la sesión en vivo de este curso.");
    }
    const meetUrl = sesion.meetUrl;
    if (meetUrl) {
      this.openOrFocusMeetWindow(sesion.cursoId, meetUrl);
    }
    const reg = await requestClasesVivo(
      `/clases-vivo/${encodeURIComponent(sesion.id)}/unirse`,
      { method: "POST" }
    );
    studentTrackerState = {
      sesionId: sesion.id,
      cursoId: sesion.cursoId,
      asignatura: sesion.asignatura || asignaturaFallback,
      docenteNombre: sesion.docenteNombre || "Docente",
      meetUrl: reg.meetUrl || meetUrl || "",
      estado: reg.estado || "Presente",
      horaRegistro: reg.horaRegistro,
      minutosPermanencia: reg.minutosPermanencia || 1,
      ventanaAbierta: true,
    };
    notifyStudentListeners();
    this.broadcastLiveChange("ATTENDANCE_UPDATED", {
      sesionId: sesion.id,
      cursoId: sesion.cursoId,
    });
    return studentTrackerState;
  },

  async enviarLatido(sesionId, ventanaAbierta) {
    const data = await requestClasesVivo(
      `/clases-vivo/${encodeURIComponent(sesionId)}/latido`,
      {
        method: "POST",
        body: JSON.stringify({ ventanaAbierta }),
      }
    );
    if (studentTrackerState && studentTrackerState.sesionId === sesionId) {
      studentTrackerState = {
        ...studentTrackerState,
        estado: data.estado || studentTrackerState.estado,
        minutosPermanencia: data.minutosPermanencia ?? studentTrackerState.minutosPermanencia,
        ventanaAbierta: Boolean(data.ventanaAbierta),
      };
      notifyStudentListeners();
    }
    this.broadcastLiveChange("ATTENDANCE_UPDATED", { sesionId, ventanaAbierta });
    return data;
  },

  async obtenerResumenAsistencia(cicloId = null) {
    const qs = cicloId ? `?ciclo_id=${encodeURIComponent(cicloId)}` : "";
    return requestClasesVivo(`/clases-vivo/resumen-asistencia${qs}`);
  },

  getStudentTrackerState() {
    return studentTrackerState;
  },

  setStudentTrackerState(nextState) {
    studentTrackerState = nextState;
    notifyStudentListeners();
  },

  subscribeStudentTracker(listener) {
    studentListeners.add(listener);
    listener(studentTrackerState);
    return () => studentListeners.delete(listener);
  },
};
