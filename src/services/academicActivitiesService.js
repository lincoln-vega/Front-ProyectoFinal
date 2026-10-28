// Servicio de gestión de tareas, evaluaciones y anuncios académicos (V2.0)
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
    docente: "Prof. Miguel Ángel Paredes",
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
    docente: "Dra. Elena Sofía Torres",
    createdAt: new Date(Date.now() - 259200000).toISOString()
  },
  {
    id: "TSK-004",
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
    docente: "Prof. Miguel Ángel Paredes",
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString()
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
      console.warn("Error leyendo tareas:", e);
    }
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(DEFAULT_TASKS));
    return DEFAULT_TASKS;
  },

  getTasksByCourse(cursoId) {
    const all = this.getTasks();
    if (!cursoId) return all;
    return all.filter((t) => t.cursoId === cursoId || t.cursoId === String(cursoId));
  },

  createTask(newTask) {
    const all = this.getTasks();
    const task = {
      id: `TSK-${Date.now().toString().slice(-4)}`,
      estado: "Por entregar",
      createdAt: new Date().toISOString(),
      ...newTask
    };
    const updated = [task, ...all];
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return task;
  },

  deleteTask(taskId) {
    const all = this.getTasks();
    const updated = all.filter((t) => t.id !== taskId);
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  },

  toggleTaskStatus(taskId) {
    const all = this.getTasks();
    const updated = all.map((t) => {
      if (t.id === taskId) {
        const nextState = t.estado === "Por entregar" ? "Entregado" : "Por entregar";
        return { ...t, estado: nextState, nota: nextState === "Entregado" ? "20 / 20" : null };
      }
      return t;
    });
    localStorage.setItem(TASKS_STORAGE_KEY, JSON.stringify(updated));
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
      console.warn("Error leyendo anuncios:", e);
    }
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(DEFAULT_ANNOUNCEMENTS));
    return DEFAULT_ANNOUNCEMENTS;
  },

  getAnnouncementsByCourse(cursoId) {
    const all = this.getAnnouncements();
    if (!cursoId) return all;
    return all.filter((a) => a.cursoId === cursoId || a.cursoId === String(cursoId));
  },

  createAnnouncement(newAnn) {
    const all = this.getAnnouncements();
    const ann = {
      id: `ANN-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
      ...newAnn
    };
    const updated = [ann, ...all];
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
    return ann;
  },

  deleteAnnouncement(annId) {
    const all = this.getAnnouncements();
    const updated = all.filter((a) => a.id !== annId);
    localStorage.setItem(ANNOUNCEMENTS_STORAGE_KEY, JSON.stringify(updated));
    return updated;
  }
};
