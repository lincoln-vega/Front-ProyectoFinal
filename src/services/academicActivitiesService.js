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

  // Local fallback solo en desarrollo local
  if (typeof window !== "undefined" && (window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1")) {
    if (!urls.some((u) => u.includes("localhost:8000") || u.includes("127.0.0.1:8000"))) {
      urls.push("http://localhost:8000");
    }
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
    signal: options.signal || AbortSignal.timeout(3500),
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
    id: "TSK-002",
    cursoId: "CRS-002",
    curso: "Física Fundamental",
    tipo: "Guía de Ejercicios",
    titulo: "Taller N° 3: Cinemática y Leyes de Newton",
    estado: "Por entregar",
    fechaLimite: "Viernes, 11:59 PM",
    puntos: "20 pts",
    descripcion: "Completar la resolución de los problemas de dinámica lineal con sus diagramas de cuerpo libre.",
    docente: "Prof. Pedro Martlon Chavez Quispe",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 172800000).toISOString()
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
    docente: "Dra. Carmen Rosa Herrera Villanueva",
    docenteId: "USR-002",
    createdAt: new Date(Date.now() - 259200000).toISOString()
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
    docente: "Prof. Pedro Martlon Chavez Quispe",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "TSK-006",
    cursoId: "CRS-006",
    curso: "Química General",
    tipo: "Taller Grupal",
    titulo: "Taller N° 2: Estequiometría y Enlaces Químicos",
    estado: "Por entregar",
    fechaLimite: "Sábado, 06:00 PM",
    puntos: "20 pts",
    descripcion: "Balancear las ecuaciones redox y calcular el reactivo limitante para las reacciones planteadas.",
    docente: "Dra. Carmen Rosa Herrera Villanueva",
    docenteId: "USR-002",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "TSK-007",
    cursoId: "CRS-007",
    curso: "Historia del Perú",
    tipo: "Ensayo Crítico",
    titulo: "Ensayo: Reformas Borbónicas y Crisis Virreinal",
    estado: "Por entregar",
    fechaLimite: "Próximo Martes, 11:59 PM",
    puntos: "20 pts",
    descripcion: "Analizar el impacto económico y social de las reformas borbónicas en las comunidades indígenas del siglo XVIII.",
    docente: "Prof. Victoria Angelis Raggi Ruiz",
    docenteId: "USR-109",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "TSK-008",
    cursoId: "CRS-008",
    curso: "Historia Universal",
    tipo: "Análisis Documental",
    titulo: "Análisis: Primera Guerra Mundial y Tratado de Versalles",
    estado: "Por entregar",
    fechaLimite: "Jueves, 11:59 PM",
    puntos: "20 pts",
    descripcion: "Identificar las causas geopolíticas y las consecuencias territoriales en el mapa europeo de entreguerras.",
    docente: "Prof. Victoria Angelis Raggi Ruiz",
    docenteId: "USR-109",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "TSK-009",
    cursoId: "CRS-009",
    curso: "Geografía y Ecología",
    tipo: "Taller Práctico",
    titulo: "Taller Cartográfico: Ocho Regiones Naturales del Perú",
    estado: "Por entregar",
    fechaLimite: "Viernes, 08:00 PM",
    puntos: "20 pts",
    descripcion: "Elaborar el corte altitudinal y caracterizar pisos ecológicos según la tesis de Javier Pulgar Vidal.",
    docente: "Prof. Victoria Angelis Raggi Ruiz",
    docenteId: "USR-109",
    createdAt: new Date().toISOString()
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
    id: "ANN-002",
    cursoId: "CRS-002",
    curso: "Física Fundamental",
    titulo: "Sesión de Repaso de Estática y Dinámica",
    contenido: "Este jueves a las 06:00 PM tendremos una sesión voluntaria de resolución de dudas en Google Meet antes de la práctica calificada.",
    prioridad: "Normal",
    docente: "Prof. Pedro Martlon Chavez Quispe",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: "ANN-003",
    cursoId: "CRS-003",
    curso: "Biología y Anatomía",
    titulo: "Banco de Preguntas UNMSM: Sistema Circulatorio",
    contenido: "Alumnos del bloque de Biomédicas, he cargado 40 preguntas tipo DECO con claves justificadas para el examen de admisión.",
    prioridad: "Alta",
    docente: "Dra. Carmen Rosa Herrera Villanueva",
    docenteId: "USR-002",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "ANN-004",
    cursoId: "CRS-004",
    curso: "Trigonometría",
    titulo: "Formulario oficial de Identidades Auxiliares",
    contenido: "Alumnos, pueden descargar el formulario de identidades trigonométricas auxiliares de la biblioteca virtual del curso.",
    prioridad: "Importante",
    docente: "Prof. Pedro Martlon Chavez Quispe",
    docenteId: "USR-107",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "ANN-006",
    cursoId: "CRS-006",
    curso: "Química General",
    titulo: "Tabla Periódica Interactiva y Ejercicios Resueltos",
    contenido: "Se habilitó el módulo con las masas atómicas y números de oxidación actualizados para la unidad de estequiometría.",
    prioridad: "Normal",
    docente: "Dra. Carmen Rosa Herrera Villanueva",
    docenteId: "USR-002",
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: "ANN-007",
    cursoId: "CRS-007",
    curso: "Historia del Perú",
    titulo: "Lectura obligatoria: Rebeliones Indígenas del Siglo XVIII",
    contenido: "Revisar los textos seleccionados de Scarlett O'Phelan sobre la rebelión de Túpac Amaru II para el debate de la sesión 8.",
    prioridad: "Importante",
    docente: "Prof. Victoria Angelis Raggi Ruiz",
    docenteId: "USR-109",
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: "ANN-008",
    cursoId: "CRS-008",
    curso: "Historia Universal",
    titulo: "Seminario dominical: Periodo de Entreguerras",
    contenido: "Este domingo a las 10:00 AM analizaremos fuentes históricas sobre el Tratado de Versalles y el surgimiento del fascismo.",
    prioridad: "Alta",
    docente: "Prof. Victoria Angelis Raggi Ruiz",
    docenteId: "USR-109",
    createdAt: new Date().toISOString()
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
