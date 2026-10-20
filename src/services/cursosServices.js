// src/services/cursosServices.js

import db from "../data/db.json";

const API_URL = (import.meta.env.VITE_BACKEND_URL || '').replace(/\/+$/, '');
const COURSES_KEY = "academia_courses";

const DIAS_SEMANA = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"];

const removeClassroomField = (courses) => (Array.isArray(courses) ? courses : []).map(({ aula, ...course }) => course);

const parseSchedule = (schedule = "") => {
  const dias = DIAS_SEMANA.filter((dia) => new RegExp(`\\b${dia}\\b`, "i").test(schedule));
  const times = schedule.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);

  if (!times) return { dias, horaInicio: "", horaFin: "" };

  const to24Hour = (hour, minute, meridiem) => {
    let hours = Number(hour);
    if (meridiem) {
      hours %= 12;
      if (meridiem.toUpperCase() === "PM") hours += 12;
    }
    return `${String(hours).padStart(2, "0")}:${minute}`;
  };

  const startMeridiem = times[3] || times[6];
  const endMeridiem = times[6] || times[3];

  return {
    dias,
    horaInicio: to24Hour(times[1], times[2], startMeridiem),
    horaFin: to24Hour(times[4], times[5], endMeridiem)
  };
};

const normalizeCourses = (courses) => removeClassroomField(courses).map((course) => {
  const parsedSchedule = parseSchedule(course.horario);
  return {
    ...course,
    dias: Array.isArray(course.dias) ? course.dias : parsedSchedule.dias,
    horaInicio: course.horaInicio || parsedSchedule.horaInicio,
    horaFin: course.horaFin || parsedSchedule.horaFin,
    docenteId: course.docenteId || "",
    meetUrl: course.meetUrl || ""
  };
});

// Helper para sincronizar en segundo plano con FastAPI
const bgSyncFastAPI = (key, callback) => {
  if (!API_URL) return;

  const token = localStorage.getItem('token') || '';
  fetch(`${API_URL}/horarios/cursos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error('Error al sincronizar con FastAPI');
      if (!res.headers.get("content-type")?.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }
      return res.json();
    })
    .then((data) => {
      if (data && data.length > 0) {
        const processed = callback ? callback(data) : data;
        localStorage.setItem(key, JSON.stringify(processed));
      }
    })
    .catch((err) => console.warn(`[FastAPI Sync] Error syncing ${key}:`, err));
};

export const courseService = {
  getCourses: () => {
    const saved = localStorage.getItem(COURSES_KEY);
    bgSyncFastAPI(COURSES_KEY, (data) =>
      normalizeCourses(data)
    );

    let courses = [];
    if (saved) {
      try {
        const parsedCourses = JSON.parse(saved);
        if (Array.isArray(parsedCourses)) courses = parsedCourses;
      } catch (error) {
        console.warn("[Cursos] No se pudo leer la caché local:", error);
      }
    }
    if (!Array.isArray(courses)) courses = [];
    if (courses.length === 0 && Array.isArray(db.courses) && db.courses.length > 0) {
      courses = db.courses;
    }

    const normalizedCourses = normalizeCourses(courses);
    localStorage.setItem(COURSES_KEY, JSON.stringify(normalizedCourses));
    return normalizedCourses;
  },

  fetchCourses: async () => {
    if (!API_URL) return courseService.getCourses();

    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/horarios/cursos`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (!response.ok) {
        throw new Error(`Error al cargar cursos (HTTP ${response.status})`);
      }
      if (!response.headers.get("content-type")?.includes("application/json")) {
        throw new Error("La respuesta del servidor no es JSON");
      }
      const data = await response.json();
      const cleaned = normalizeCourses(data);
      localStorage.setItem(COURSES_KEY, JSON.stringify(cleaned));
      return cleaned;
    } catch (err) {
      console.warn("[FastAPI] Fallback a caché local:", err);
    }
    return courseService.getCourses();
  },

  saveCourses: async (courses) => {
    const normalized = removeClassroomField(courses);
    localStorage.setItem(COURSES_KEY, JSON.stringify(normalized));
  },

  validarCruce: async (nuevoCurso) => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/horarios/validar-cruce`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(nuevoCurso)
      });
      if (response.ok) {
        return await response.json();
      }
    } catch (error) {
      console.error('Error al validar cruce:', error);
    }
    return { cruce: false };
  }
};