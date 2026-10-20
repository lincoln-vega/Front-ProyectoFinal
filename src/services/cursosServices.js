import { insforge } from "../lib/insforge";

const COURSE_COLUMNS = "id, asignatura, area, carrera, docenteId, docente, dias, horaInicio, horaFin, meetUrl, repositorio, estado, created_at";

const throwIfError = (error, operation) => {
  if (error) {
    console.error(`[InsForge] ${operation}:`, error);
    throw new Error(error.message || `No se pudo completar: ${operation}`);
  }
};

const parseSchedule = (schedule = "") => {
  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado", "Domingo"]
    .filter((day) => new RegExp(`\\b${day}\\b`, "i").test(schedule));
  const times = schedule.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?\s*[-–]\s*(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (!times) return { days, start: "", end: "" };

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
    days,
    start: to24Hour(times[1], times[2], startMeridiem),
    end: to24Hour(times[4], times[5], endMeridiem)
  };
};

const normalizeCourse = (course) => {
  const { aula, codigo, horario, tipoSala, created_at, ...storedCourse } = course;
  const parsed = parseSchedule(horario);
  return {
  ...storedCourse,
  dias: Array.isArray(storedCourse.dias) ? storedCourse.dias : parsed.days,
  horaInicio: storedCourse.horaInicio || parsed.start,
  horaFin: storedCourse.horaFin || parsed.end,
  docenteId: storedCourse.docenteId || "",
  meetUrl: storedCourse.meetUrl || ""
  };
};

export const courseService = {
  async getCourses() {
    const { data, error } = await insforge.database
      .from("courses")
      .select(COURSE_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(500);
    throwIfError(error, "cargar cursos");
    return (data || []).map(normalizeCourse);
  },

  async fetchCourses() {
    return courseService.getCourses();
  },

  async saveCourses(courses) {
    if (courses.length === 0) return [];
    const rows = courses.map((course) => {
      const normalized = normalizeCourse(course);
      const { created_at, ...row } = normalized;
      return row;
    });
    const { data, error } = await insforge.database
      .from("courses")
      .upsert(rows)
      .select(COURSE_COLUMNS);
    throwIfError(error, "guardar cursos");
    return (data || []).map(normalizeCourse);
  },

  async deleteCourse(id) {
    const { error } = await insforge.database
      .from("courses")
      .delete()
      .eq("id", id);
    throwIfError(error, "eliminar curso");
  },

  async countStudentsForTeacher(courseIds) {
    if (courseIds.length === 0) return 0;
    const { data, error } = await insforge.database.rpc("get_teacher_student_count", {
      course_ids: courseIds
    });
    throwIfError(error, "contar estudiantes matriculados");
    return Number(data || 0);
  },

  async validarCruce(nuevoCurso) {
    const courses = await courseService.getCourses();
    const newDays = Array.isArray(nuevoCurso.dias) ? nuevoCurso.dias : [];
    const collision = courses.find((course) => {
      if (course.id === nuevoCurso.id) return false;
      const sameDay = course.dias.some((day) => newDays.includes(day));
      const overlaps = nuevoCurso.horaInicio < course.horaFin &&
        nuevoCurso.horaFin > course.horaInicio;
      return sameDay && overlaps;
    });
    return { cruce: Boolean(collision), curso: collision || null };
  }
};
