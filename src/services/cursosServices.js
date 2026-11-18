import { insforge } from "../lib/insforge";
import { getApiBaseUrl } from "../lib/apiUrl";
const COURSE_COLUMNS = "id, asignatura, area, carrera, docenteId, docente, dias, horaInicio, horaFin, meetUrl, repositorio, estado, created_at, ciclovirtual";

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

export const normalizeCourse = (course) => {
  if (!course) return course;
  const { created_at, ...storedCourse } = course;
  const parsed = parseSchedule(course.horario);
  const dias = Array.isArray(storedCourse.dias) && storedCourse.dias.length
    ? storedCourse.dias
    : (parsed.days.length ? parsed.days : ["Lunes", "Miércoles"]);
  const horaInicio = storedCourse.horaInicio || parsed.start || "08:00";
  const horaFin = storedCourse.horaFin || parsed.end || "10:00";
  const horarioTexto = course.horario || `${dias.join(" y ")} ${horaInicio} - ${horaFin}`;
  const meetUrl = storedCourse.meetUrl || "";
  const tipoSala = meetUrl.toLowerCase().includes("zoom") ? "zoom" : "meet";

  return {
    ...storedCourse,
    id: storedCourse.id || storedCourse.codigo || `CRS-${Date.now().toString().slice(-4)}`,
    codigo: course.codigo || storedCourse.id,
    asignatura: storedCourse.asignatura || "",
    area: storedCourse.area || "Ciencias Exactas e Ingenierías",
    carrera: storedCourse.carrera || "Ingeniería de Sistemas",
    docenteId: storedCourse.docenteId || "USR-002",
    docente: storedCourse.docente || "",
    aula: course.aula || `Aula ${storedCourse.id ? String(storedCourse.id).replace('CRS-', 'V-') : 'Virtual'}`,
    horario: horarioTexto,
    dias,
    horaInicio,
    horaFin,
    meetUrl,
    repositorio: storedCourse.repositorio || "drive.google.com",
    tipoSala,
    estado: storedCourse.estado || "Activo",
    cicloVirtual: storedCourse.cicloVirtual || storedCourse.ciclovirtual || "Semestral",
    ciclovirtual: storedCourse.ciclovirtual || storedCourse.cicloVirtual || "Semestral"
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

  /**
   * Valida un nuevo curso contra el backend FastAPI (/monitoreo/validar-curso)
   */
  async validarCursoConBackend(curso) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/monitoreo/validar-curso`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: curso.id,
          asignatura: curso.asignatura,
          area: curso.area,
          carrera: curso.carrera,
          docenteId: curso.docenteId,
          docente: curso.docente,
          dias: curso.dias,
          horaInicio: curso.horaInicio,
          horaFin: curso.horaFin,
          meetUrl: curso.meetUrl,
          repositorio: curso.repositorio,
          estado: curso.estado || "Activo"
        })
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data?.detail) {
          const detail = typeof data.detail === "string" ? data.detail : JSON.stringify(data.detail);
          console.warn("[Backend] Alerta de monitoreo de curso:", detail);
          return { valido: false, mensaje: detail };
        }
      } else {
        const data = await res.json().catch(() => ({ valido: true }));
        return data;
      }
    } catch (err) {
      console.warn("[Backend] Validación remota de cruces no disponible, usando validación local:", err.message);
    }

    // Fallback a validación local si backend no responde
    return courseService.validarCruce(curso);
  },

  async saveCourses(courses) {
    if (courses.length === 0) return [];
    const rows = courses.map((course) => {
      const normalized = normalizeCourse(course);
      return {
        id: normalized.id,
        asignatura: normalized.asignatura,
        area: normalized.area,
        carrera: normalized.carrera,
        docenteId: normalized.docenteId,
        docente: normalized.docente,
        dias: Array.isArray(normalized.dias) ? normalized.dias : [],
        horaInicio: normalized.horaInicio,
        horaFin: normalized.horaFin,
        meetUrl: normalized.meetUrl,
        repositorio: normalized.repositorio,
        estado: normalized.estado || "Activo",
        ciclovirtual: normalized.cicloVirtual || normalized.ciclovirtual || "Semestral"
      };
    });
    const { data, error } = await insforge.database
      .from("courses")
      .upsert(rows)
      .select(COURSE_COLUMNS);
    throwIfError(error, "guardar cursos");
    return (data || []).map(normalizeCourse);
  },

  async saveCourse(course) {
    const list = await courseService.saveCourses([course]);
    return list[0] || normalizeCourse(course);
  },

  async deleteCourse(id) {
    const { error } = await insforge.database
      .from("courses")
      .delete()
      .eq("id", id);
    throwIfError(error, "eliminar curso");
  },

  async countStudentsForTeacher(courseIds) {
    if (!courseIds || courseIds.length === 0) return 0;
    try {
      const { data, error } = await insforge.database.rpc("get_teacher_student_count", {
        course_ids: courseIds
      });
      if (!error && data !== null && data !== undefined) {
        return Number(data);
      }
    } catch {
      // Fallback a matriculas
    }

    try {
      const { data, error } = await insforge.database
        .from("matriculas")
        .select("id, estado")
        .eq("estado", "Activa");
      if (!error && Array.isArray(data)) {
        return data.length;
      }
    } catch {
      // Fallback silencioso
    }
    return 0;
  },

  async validarCruce(nuevoCurso) {
    const courses = await courseService.getCourses();
    const newDays = Array.isArray(nuevoCurso.dias) ? nuevoCurso.dias : [];
    const collision = courses.find((course) => {
      if (course.id === nuevoCurso.id) return false;
      const sameTeacher = nuevoCurso.docenteId && course.docenteId && nuevoCurso.docenteId === course.docenteId;
      const sameDay = course.dias.some((day) => newDays.includes(day));
      const overlaps = nuevoCurso.horaInicio < course.horaFin &&
        nuevoCurso.horaFin > course.horaInicio;
      return (sameTeacher || sameDay) && overlaps;
    });
    return {
      cruce: Boolean(collision),
      valido: !collision,
      mensaje: collision ? `Existe cruce con el curso ${collision.asignatura} (${collision.horario || collision.dias?.join(', ')})` : null,
      curso: collision || null
    };
  }
};
