// Servicio de tareas, evaluaciones y anuncios académicos (conectado 100% al Backend FastAPI + Supabase PostgreSQL)
import { getApiBaseUrl } from "../lib/apiUrl";
import { getApiAccessToken } from "../lib/supabase";

const TASKS_STORAGE_KEY = "academia_pre_tareas_cache";
const ANNOUNCEMENTS_STORAGE_KEY = "academia_pre_anuncios_cache";

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
    signal: options.signal || AbortSignal.timeout(6000),
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

export const academicActivitiesService = {
  getTasks() {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  getTasksByCourse(cursoId) {
    const all = this.getTasks();
    if (!cursoId) return all;
    return all.filter((t) => String(t.cursoId || t.curso_id) === String(cursoId));
  },

  async fetchTasks(cursoId = null) {
    try {
      const path = cursoId ? `/tareas/?curso_id=${encodeURIComponent(cursoId)}` : "/tareas/";
      const data = await requestActivities(path);
      if (Array.isArray(data)) {
        const normalized = data.map((t) => ({
          ...t,
          cursoId: t.cursoId || t.curso_id,
          fechaLimite: t.fechaLimite || t.fecha_limite,
          docenteId: t.docenteId || t.docente_id
        }));
        if (!cursoId) {
          localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch (err) {
      console.warn("[AcademicService] No se pudieron sincronizar tareas desde el backend:", err.message);
    }
    return cursoId ? this.getTasksByCourse(cursoId) : this.getTasks();
  },

  async createTask(newTask) {
    const payload = {
      cursoId: newTask.cursoId || newTask.curso_id,
      curso: newTask.curso,
      tipo: newTask.tipo || "Tarea Calificada",
      titulo: newTask.titulo,
      descripcion: newTask.descripcion || "",
      fechaLimite: newTask.fechaLimite || newTask.fecha_limite || "Próximamente",
      puntos: newTask.puntos || "20 pts",
      docenteId: newTask.docenteId || newTask.docente_id || "",
      docente: newTask.docente || "Docente",
      estado: "Por entregar"
    };

    const created = await requestActivities("/tareas/", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    const normalized = {
      ...created,
      cursoId: created.cursoId || created.curso_id || payload.cursoId,
      fechaLimite: created.fechaLimite || created.fecha_limite || payload.fechaLimite,
      docenteId: created.docenteId || created.docente_id || payload.docenteId
    };

    const all = this.getTasks();
    const updated = [normalized, ...all.filter((t) => t.id !== normalized.id)];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return normalized;
  },

  async deleteTask(taskId) {
    await requestActivities(`/tareas/${encodeURIComponent(taskId)}`, {
      method: "DELETE"
    });
    const updated = this.getTasks().filter((t) => t.id !== taskId);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  },

  async toggleTaskStatus(taskId) {
    const all = this.getTasks();
    const currentTask = all.find((t) => t.id === taskId);
    const nextState = currentTask?.estado === "Por entregar" ? "Entregado" : "Por entregar";

    await requestActivities(`/tareas/${encodeURIComponent(taskId)}`, {
      method: "PATCH",
      body: JSON.stringify({ estado: nextState })
    });

    const updated = all.map((t) => (t.id === taskId ? { ...t, estado: nextState } : t));
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
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
