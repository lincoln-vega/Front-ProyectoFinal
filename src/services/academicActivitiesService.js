// Servicio de gestión de tareas, evaluaciones y anuncios académicos (V2.0)
// Integra persistencia bidireccional en Backend FastAPI y PostgreSQL con fallback en localStorage
import { getApiBaseUrl } from "../lib/apiUrl";
import { getApiAccessToken } from "../lib/insforge";

const getBackendUrls = () => {
  const urls = [];
  try {
    const primary = getApiBaseUrl();
    if (primary) urls.push(primary.replace(/\/+$/, ""));
  } catch {
    // Ignore
  }
  const fallbackEnv = import.meta.env.VITE_BACKEND_URL;
  if (fallbackEnv && !urls.includes(fallbackEnv.replace(/\/+$/, ""))) {
    urls.push(fallbackEnv.replace(/\/+$/, ""));
  }

  // Local fallback directo para pruebas de integración continua
  if (!urls.some((u) => u.includes("localhost:8000") || u.includes("127.0.0.1:8000"))) {
    urls.push("http://localhost:8000");
  }
  return urls;
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
  const urls = getBackendUrls();
  const headers = getHeaders();
  const opts = {
    ...options,
    headers: {
      ...headers,
      ...(options.headers || {})
    }
  };

  for (const base of urls) {
    try {
      const fullUrl = `${base}${path}`;
      const res = await fetch(fullUrl, opts);
      if (res.ok) {
        return await res.json();
      }
    } catch {
      // Intentar con siguiente URL disponible
    }
  }
  return null;
}

const TASKS_STORAGE_KEY = "academia_pre_tareas_v2";
const ANNOUNCEMENTS_STORAGE_KEY = "academia_pre_anuncios_v2";

const DEFAULT_TASKS = [
  {
    id: "TSK-001",
    cursoId: "CRS-001",
    curso: "Álgebra y Funciones",
    tipo: "Tarea Calificada",
    titulo: "Práctica N° 4: Funciones Cuadráticas y Polinomios",
    estado: "Por entregar",
    fechaLimite: "Mañana, 11:59 PM",
    puntos: "20 pts",
    descripcion: "Desarrollar los 10 ejercicios pares de la separata teórica N° 4 en formato PDF manuscrito o digital.",
    docente: "Prof. Carmen Rosa Herrera",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "TSK-002",
    cursoId: "CRS-002",
    curso: "Física Fundamental",
    tipo: "Guía de Ejercicios",
    titulo: "Taller N° 3: Cinemática y Leyes de Newton",
    estado: "Por entregar",
    fechaLimite: "Viernes, 11:59 PM",
    puntos: "20 pts",
    descripcion: "Completar la resolución de los problemas de dinámica lineal con sus diagramas de cuerpo libre.",
    docente: "Prof. Pedro Chavez",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 172800000).toISOString()
  },
  {
    id: "TSK-004",
    cursoId: "CRS-004",
    curso: "Trigonometría",
    tipo: "Tarea Calificada",
    titulo: "Práctica Calificada: Identidades Trigonométricas",
    estado: "Por entregar",
    fechaLimite: "Lunes, 11:59 PM",
    puntos: "20 pts",
    descripcion: "Demostrar las 5 identidades auxiliares de ángulos compuestos detallando el procedimiento paso a paso.",
    docente: "Prof. Pedro Chavez",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "TSK-003",
    cursoId: "CRS-003",
    curso: "Biología y Anatomía",
    tipo: "Cuestionario Virtual",
    titulo: "Autoevaluación: Genética y Sistema Nervioso",
    estado: "Entregado",
    fechaLimite: "Entregado ayer",
    nota: "18.5 / 20",
    puntos: "20 pts",
    descripcion: "Cuestionario de 20 preguntas con retroalimentación inmediata sobre bases celulares y herencia genética.",
    docente: "Dra. Elena Sofía Torres",
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: "TSK-SIM",
    cursoId: "SIM-01",
    curso: "Academia Pre (General)",
    tipo: "Simulacro Tipo Admisión",
    titulo: "Simulacro General de Ciencias y Humanidades",
    estado: "Por entregar",
    fechaLimite: "Domingo, 02:00 PM",
    puntos: "100 preguntas",
    descripcion: "Evaluación cronometrada de 3 horas simulando el examen de admisión oficial con ranking en vivo.",
    docente: "Coordinación Académica",
    createdAt: new Date().toISOString()
  }
];

const DEFAULT_ANNOUNCEMENTS = [
  {
    id: "ANN-001",
    cursoId: "CRS-001",
    curso: "Álgebra y Funciones",
    titulo: "Material adicional: Fórmulas de Factorización y Radicación",
    contenido: "Estimados alumnos, he subido a la biblioteca digital el formulario resumido para resolver con mayor rapidez los problemas del simulacro de este fin de semana. ¡Aprovéchenlo!",
    prioridad: "Importante",
    docente: "Prof. Carmen Rosa Herrera",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
  },
  {
    id: "ANN-002",
    cursoId: "CRS-002",
    curso: "Física Fundamental",
    titulo: "Repaso extraordinario de Estática y Rozamiento",
    contenido: "Este jueves a las 06:00 PM tendremos una sesión voluntaria de resolución de dudas en Google Meet antes de la práctica calificada.",
    prioridad: "Normal",
    docente: "Prof. Pedro Chavez",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "ANN-004",
    cursoId: "CRS-004",
    curso: "Trigonometría",
    titulo: "Horario de consultas y asesoría de problemas",
    contenido: "Alumnos, pueden enviar sus dudas del boletín semanal para revisarlas durante los primeros 20 minutos de la próxima clase virtual.",
    prioridad: "Importante",
    docente: "Prof. Pedro Chavez",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  }
];

export const academicActivitiesService = {
  // === TAREAS ===

  getTasks() {
    try {
      const stored = localStorage.getItem(TASKS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[AcademicService] Error leyendo tareas locales:", e);
    }
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  },

  getTasksByCourse(cursoId) {
    const all = this.getTasks();
    if (!cursoId) return all;
    return all.filter((t) => t.cursoId === cursoId || t.curso_id === cursoId || t.cursoId === String(cursoId));
  },

  async fetchTasks(cursoId = null) {
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
      docenteId: newTask.docenteId || newTask.docente_id || "USR-107",
      docente: newTask.docente || "Prof. Pedro Chavez",
      estado: "Por entregar"
    };

    let created = await requestActivities("/tareas/", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!created) {
      created = {
        id: `TSK-${Date.now().toString().slice(-4)}`,
        ...payload,
        createdAt: new Date().toISOString()
      };
    }

    const all = this.getTasks();
    const updated = [created, ...all.filter((t) => t.id !== created.id)];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return created;
  },

  async deleteTask(taskId) {
    await requestActivities(`/tareas/${encodeURIComponent(taskId)}`, {
      method: "DELETE"
    });

    const all = this.getTasks();
    const updated = all.filter((t) => t.id !== taskId);
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

    const updated = all.map((t) => {
      if (t.id === taskId) {
        return { ...t, estado: nextState, nota: nextState === "Entregado" ? "20 / 20" : null };
      }
      return t;
    });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  },

  // === ANUNCIOS ===

  getAnnouncements() {
    try {
      const stored = localStorage.getItem(ANNOUNCEMENTS_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[AcademicService] Error leyendo anuncios locales:", e);
    }
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    return DEFAULT_ANNOUNCEMENTS;
  },

  getAnnouncementsByCourse(cursoId) {
    const all = this.getAnnouncements();
    if (!cursoId) return all;
    return all.filter((a) => a.cursoId === cursoId || a.curso_id === cursoId || a.cursoId === String(cursoId));
  },

  async fetchAnnouncements(cursoId = null) {
    const path = cursoId ? `/anuncios/?curso_id=${encodeURIComponent(cursoId)}` : "/anuncios/";
    const data = await requestActivities(path);
    if (Array.isArray(data)) {
      const normalized = data.map((a) => ({
        ...a,
        cursoId: a.cursoId || a.curso_id,
        docenteId: a.docenteId || a.docente_id
      }));
      if (!cursoId) {
        localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(normalized));
      }
      return normalized;
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
      docenteId: newAnn.docenteId || newAnn.docente_id || "USR-107",
      docente: newAnn.docente || "Prof. Pedro Chavez"
    };

    let created = await requestActivities("/anuncios/", {
      method: "POST",
      body: JSON.stringify(payload)
    });

    if (!created) {
      created = {
        id: `ANN-${Date.now().toString().slice(-4)}`,
        ...payload,
        createdAt: new Date().toISOString()
      };
    }

    const all = this.getAnnouncements();
    const updated = [created, ...all.filter((a) => a.id !== created.id)];
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return created;
  },

  async deleteAnnouncement(annId) {
    await requestActivities(`/anuncios/${encodeURIComponent(annId)}`, {
      method: "DELETE"
    });

    const all = this.getAnnouncements();
    const updated = all.filter((a) => a.id !== annId);
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  }
};
