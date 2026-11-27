// Servicio de tareas, entregas individuales por alumno y anuncios académicos
// Conectado 100% al Backend FastAPI + Supabase PostgreSQL + Supabase Realtime Broadcast
import { getApiBaseUrl } from "../lib/apiUrl";
import { getApiAccessToken } from "../lib/supabase";
import { clasesVivoService } from "./clasesVivoService";

const TASKS_STORAGE_KEY = "academia_pre_tareas_cache";
const ANNOUNCEMENTS_STORAGE_KEY = "academia_pre_anuncios_cache";

const getUserSubmissionsKey = () => {
  if (typeof localStorage === "undefined") return "academia_pre_mis_entregas_anon";
  const email = (localStorage.getItem("userEmail") || localStorage.getItem("userId") || "anon")
    .trim()
    .toLowerCase();
  return `academia_pre_mis_entregas_${email}`;
};

const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getApiAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

async function requestActivities(path, options = {}) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(8000),
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.detail || `Error HTTP ${res.status} en ${path}`);
  }
  return res.json();
}

function normalizeTask(t) {
  return {
    ...t,
    cursoId: t.cursoId || t.curso_id,
    cicloId: t.cicloId || t.ciclo_id || null,
    fechaLimite: t.fechaLimite || t.fecha_limite,
    docenteId: t.docenteId || t.docente_id,
    archivoUrl: t.archivoUrl || t.archivo_url || null,
    archivoPath: t.archivoPath || t.archivo_path || null,
    archivoNombre: t.archivoNombre || t.archivo_nombre || null,
    entregasCount: Number(t.entregasCount ?? t.entregas_count ?? 0),
    calificadasCount: Number(t.calificadasCount ?? t.calificadas_count ?? 0),
    pendientesCalificarCount: Number(t.pendientesCalificarCount ?? t.pendientes_calificar_count ?? 0)
  };
}

export const academicActivitiesService = {
  getTasks() {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed.map(normalizeTask);
      }
    } catch {}
    return [];
  },

  getTasksByCourse(cursoId) {
    const all = this.getTasks();
    if (!cursoId) return all;
    return all.filter((t) => String(t.cursoId || t.curso_id) === String(cursoId));
  },

  getMySubmissions() {
    try {
      const stored = localStorage.getItem(getUserSubmissionsKey());
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  mergeTasksWithMySubmissions(tasks = [], mySubmissions = []) {
    const byTaskId = new Map();
    for (const sub of mySubmissions || []) {
      const tid = String(sub?.tareaId || sub?.tarea_id || "");
      if (tid) byTaskId.set(tid, sub);
    }

    return (tasks || []).map((rawTask) => {
      const task = normalizeTask(rawTask);
      const miEntrega = byTaskId.get(String(task.id)) || null;
      const estadoAlumno = miEntrega ? miEntrega.estado || "Entregado" : "Por entregar";
      return {
        ...task,
        miEntrega,
        estadoAlumno,
        // En el portal alumno, estado refleja su entrega individual (nunca un estado compartido)
        estado: estadoAlumno,
        nota: miEntrega?.nota ?? null,
        comentarioDocente: miEntrega?.comentarioDocente || ""
      };
    });
  },

  getStudentMergedTasks() {
    return this.mergeTasksWithMySubmissions(this.getTasks(), this.getMySubmissions());
  },

  async fetchTasks(cursoId = null, cicloId = null) {
    try {
      const params = new URLSearchParams();
      if (cursoId) params.set("curso_id", cursoId);
      if (cicloId) params.set("ciclo_id", cicloId);
      const qs = params.toString();
      const path = qs ? `/tareas/?${qs}` : "/tareas/";
      const data = await requestActivities(path);
      if (Array.isArray(data)) {
        const normalized = data.map(normalizeTask);
        if (!cursoId && !cicloId) {
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch (err) {
      console.warn("[AcademicService] No se pudieron sincronizar tareas desde el backend:", err.message);
    }
    return cursoId ? this.getTasksByCourse(cursoId) : this.getTasks();
  },

  async fetchMySubmissions(cursoId = null, cicloId = null) {
    const token = getApiAccessToken();
    if (!token) return this.getMySubmissions();
    try {
      const params = new URLSearchParams();
      if (cursoId) params.set("curso_id", cursoId);
      if (cicloId) params.set("ciclo_id", cicloId);
      const qs = params.toString();
      const path = qs ? `/tareas/mis-entregas?${qs}` : "/tareas/mis-entregas";
      const data = await requestActivities(path);
      if (Array.isArray(data)) {
        if (!cursoId && !cicloId) {
          localStorage.setItem(getUserSubmissionsKey(), JSON.stringify(data));
        }
        return data;
      }
    } catch (err) {
      console.warn("[AcademicService] No se pudieron sincronizar entregas del alumno:", err.message);
    }
    return this.getMySubmissions();
  },

  async fetchStudentTasksWithSubmissions(cursoId = null, cicloId = null) {
    const [tasks, submissions] = await Promise.all([
      this.fetchTasks(cursoId, cicloId),
      this.fetchMySubmissions(cursoId, cicloId)
    ]);
    return this.mergeTasksWithMySubmissions(tasks, submissions);
  },

  async submitTaskDelivery(taskId, deliveryPayload) {
    const saved = await requestActivities(`/tareas/${encodeURIComponent(taskId)}/entregar`, {
      method: "POST",
      body: JSON.stringify({
        archivoPath: deliveryPayload.archivoPath || null,
        archivoUrl: deliveryPayload.archivoUrl,
        archivoNombre: deliveryPayload.archivoNombre,
        tamanoBytes: deliveryPayload.tamanoBytes || 0,
        comentarioAlumno: deliveryPayload.comentarioAlumno || ""
      })
    });

    const prevSubs = this.getMySubmissions();
    const nextSubs = [
      saved,
      ...prevSubs.filter((s) => String(s.tareaId || s.tarea_id) !== String(taskId))
    ];
    localStorage.setItem(getUserSubmissionsKey(), JSON.stringify(nextSubs));
    window.dispatchEvent(new Event("storage"));
    clasesVivoService.broadcastLiveChange("TASK_SUBMITTED", {
      tareaId: taskId,
      cursoId: saved.cursoId
    });
    return saved;
  },

  async fetchTaskDeliveriesForTeacher(taskId) {
    return requestActivities(`/tareas/${encodeURIComponent(taskId)}/entregas`);
  },

  async gradeStudentDelivery(taskId, estudianteId, { nota, comentarioDocente = "", estado = "Calificado" }) {
    const saved = await requestActivities(
      `/tareas/${encodeURIComponent(taskId)}/calificar/${encodeURIComponent(estudianteId)}`,
      {
        method: "PATCH",
        body: JSON.stringify({
          nota: nota === "" || nota === null || nota === undefined ? null : Number(nota),
          comentarioDocente,
          estado
        })
      }
    );
    clasesVivoService.broadcastLiveChange("TASK_GRADED", {
      tareaId: taskId,
      cursoId: saved.cursoId,
      estudianteId,
      estado: saved.estado,
      nota: saved.nota
    });
    return saved;
  },

  async createTask(newTask) {
    const payload = {
      cursoId: newTask.cursoId || newTask.curso_id,
      cicloId: newTask.cicloId || newTask.ciclo_id || null,
      curso: newTask.curso,
      tipo: newTask.tipo || "Tarea Calificada",
      titulo: newTask.titulo,
      descripcion: newTask.descripcion || "",
      fechaLimite: newTask.fechaLimite || newTask.fecha_limite || "Próximamente",
      puntos: newTask.puntos || "20 pts",
      docenteId: newTask.docenteId || newTask.docente_id || "",
      docente: newTask.docente || "Docente",
      estado: "Por entregar",
      archivoUrl: newTask.archivoUrl || newTask.archivo_url || null,
      archivoPath: newTask.archivoPath || newTask.archivo_path || null,
      archivoNombre: newTask.archivoNombre || newTask.archivo_nombre || null
    };

    const created = await requestActivities("/tareas/", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const normalized = normalizeTask({
      ...created,
      cursoId: created.cursoId || created.curso_id || payload.cursoId,
      fechaLimite: created.fechaLimite || created.fecha_limite || payload.fechaLimite,
      docenteId: created.docenteId || created.docente_id || payload.docenteId
    });

    const all = this.getTasks();
    const updated = [normalized, ...all.filter((t) => t.id !== normalized.id)];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    clasesVivoService.broadcastLiveChange("TASK_CREATED", {
      tareaId: normalized.id,
      cursoId: normalized.cursoId
    });
    return normalized;
  },

  async deleteTask(taskId) {
    await requestActivities(`/tareas/${encodeURIComponent(taskId)}`, {
      method: "DELETE"
    });
    const updated = this.getTasks().filter((t) => t.id !== taskId);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    clasesVivoService.broadcastLiveChange("TASK_DELETED", { tareaId: taskId });
    return updated;
  },

  getAnnouncements() {
    try {
      const stored = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  getAnnouncementsByCourse(cursoId) {
    const all = this.getAnnouncements();
    if (!cursoId) return all;
    return all.filter((a) => String(a.cursoId || a.curso_id) === String(cursoId));
  },

  async fetchAnnouncements(cursoId = null) {
    try {
      const path = cursoId ? `/anuncios/?curso_id=${encodeURIComponent(cursoId)}` : "/anuncios/";
      const data = await requestActivities(path);
      if (Array.isArray(data)) {
        const normalized = data.map((a) => ({
          ...a,
          cursoId: a.cursoId || a.curso_id,
          docenteId: a.docenteId || a.docente_id,
          archivoUrl: a.archivoUrl || a.archivo_url || null,
          archivoPath: a.archivoPath || a.archivo_path || null,
          archivoNombre: a.archivoNombre || a.archivo_nombre || null
        }));
        if (!cursoId) {
          localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch (err) {
      console.warn("[AcademicService] No se pudieron sincronizar anuncios desde el backend:", err.message);
    }
    return cursoId ? this.getAnnouncementsByCourse(cursoId) : this.getAnnouncements();
  },

  async createAnnouncement(newAnn) {
    const payload = {
      cursoId: newAnn.cursoId || newAnn.curso_id,
      curso: newAnn.curso,
      titulo: newAnn.titulo,
      contenido: newAnn.contenido,
      prioridad: newAnn.prioridad || "Normal",
      docenteId: newAnn.docenteId || newAnn.docente_id || "",
      docente: newAnn.docente || "Docente",
      archivoUrl: newAnn.archivoUrl || newAnn.archivo_url || null,
      archivoPath: newAnn.archivoPath || newAnn.archivo_path || null,
      archivoNombre: newAnn.archivoNombre || newAnn.archivo_nombre || null
    };

    const created = await requestActivities("/anuncios/", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const normalized = {
      ...created,
      cursoId: created.cursoId || created.curso_id || payload.cursoId,
      docenteId: created.docenteId || created.docente_id || payload.docenteId
    };

    const all = this.getAnnouncements();
    const updated = [normalized, ...all.filter((a) => a.id !== normalized.id)];
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return normalized;
  },

  async deleteAnnouncement(annId) {
    await requestActivities(`/anuncios/${encodeURIComponent(annId)}`, {
      method: "DELETE"
    });
    const updated = this.getAnnouncements().filter((a) => a.id !== annId);
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  }
};
