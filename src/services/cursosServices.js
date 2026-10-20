// src/services/cursosServices.js

const API_URL = import.meta.env.VITE_BACKEND_URL || '';
const COURSES_KEY = "academia_courses";

const removeClassroomField = (courses) => (courses || []).map(({ aula, ...course }) => course);

// Helper para sincronizar en segundo plano con FastAPI
const bgSyncFastAPI = (key, callback) => {
  const token = localStorage.getItem('token') || '';
  fetch(`${API_URL}/horarios/cursos`, {
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    }
  })
    .then((res) => {
      if (!res.ok) throw new Error('Error al sincronizar con FastAPI');
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
      removeClassroomField(data).map((course) => ({
        ...course,
        docenteId: course.docenteId || "",
        meetUrl: course.meetUrl || ""
      }))
    );

    const courses = saved ? JSON.parse(saved) : [];
    const normalizedCourses = removeClassroomField(courses).map((course) => ({
      ...course,
      docenteId: course.docenteId || "",
      meetUrl: course.meetUrl || ""
    }));
    localStorage.setItem(COURSES_KEY, JSON.stringify(normalizedCourses));
    return normalizedCourses;
  },

  fetchCourses: async () => {
    try {
      const token = localStorage.getItem('token') || '';
      const response = await fetch(`${API_URL}/horarios/cursos`, {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        const cleaned = removeClassroomField(data).map((course) => ({
          ...course,
          docenteId: course.docenteId || "",
          meetUrl: course.meetUrl || ""
        }));
        localStorage.setItem(COURSES_KEY, JSON.stringify(cleaned));
        return cleaned;
      }
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