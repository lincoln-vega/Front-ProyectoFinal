import { insforge, getApiAccessToken } from "../lib/insforge";
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
      const token = getApiAccessToken();
      const headers = { "Content-Type": "application/json" };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(`${getApiBaseUrl()}/monitoreo/validar-curso`, {
        method: "POST",
        headers,
        signal: AbortSignal.timeout(4000),
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
      const { data: students } = await insforge.database
        .from("users")
        .select("id, cursosInscritos, rol, areaAcademica")
        .eq("estado", "Activo");

      if (Array.isArray(students)) {
        const studentList = students.filter((u) =>
          String(u.rol || "").toLowerCase() === "estudiante"
        );
        const stringIds = courseIds.map(String);
        const courses = await this.getCourses();
        const teacherCourses = (courses || []).filter((c) => stringIds.includes(String(c.id)));
        const teacherAreas = teacherCourses
          .map((c) => (c.area || "").toLowerCase().trim())
          .filter(Boolean);

        const enrolled = studentList.filter((s) => {
          const sCourses = Array.isArray(s.cursosInscritos) ? s.cursosInscritos : [];
          // 1. Inscripción directa
          const hasDirect = sCourses.some((c) => {
            const cid = typeof c === "object" && c !== null ? c.id : c;
            return stringIds.includes(String(cid));
          });
          if (hasDirect) return true;

          // 2. Si no tiene cursos explícitos pero su área o carrera coincide
          if (sCourses.length === 0) {
            if (s.areaAcademica) {
              const sArea = s.areaAcademica.toLowerCase().trim();
              if (teacherAreas.some((tArea) => tArea.includes(sArea) || sArea.includes(tArea))) {
                return true;
              }
            }
            if (s.carreraObjetivo) {
              const sCarrera = s.carreraObjetivo.toLowerCase().trim();
              const teacherCarreras = teacherCourses
                .map((c) => (c.carrera || "").toLowerCase().trim())
                .filter(Boolean);
              if (teacherCarreras.some((tC) => tC.includes(sCarrera) || sCarrera.includes(tC))) {
                return true;
              }
            }
          }

          return false;
        });
        return enrolled.length;
      }
    } catch (e) {
      console.warn("Fallback count students error:", e);
    }
    return 0;
  },

  async validarCruce(nuevoCurso, existingCourses = null) {
    const courses = existingCourses || await courseService.getCourses();
    const newDays = Array.isArray(nuevoCurso.dias) ? nuevoCurso.dias : [];
    const newStart = String(nuevoCurso.horaInicio || "").trim();
    const newEnd = String(nuevoCurso.horaFin || "").trim();

    if (!newStart || !newEnd || newDays.length === 0) {
      return { cruce: false, valido: true, mensaje: null, curso: null };
    }

    const cleanName = (val) => String(val || "")
      .toLowerCase()
      .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, "")
      .trim();

    const targetDocName = cleanName(nuevoCurso.docente);
    const targetDocId = nuevoCurso.docenteId ? String(nuevoCurso.docenteId).trim() : "";
    const cleanCurrentId = nuevoCurso.id ? String(nuevoCurso.id).trim() : "";
    const cleanCurrentCodigo = nuevoCurso.codigo ? String(nuevoCurso.codigo).trim() : "";

    const collision = (courses || []).find((course) => {
      // Ignorar el mismo curso cuando estamos editando
      const courseId = course.id ? String(course.id).trim() : "";
      const courseCodigo = course.codigo ? String(course.codigo).trim() : "";
      if (cleanCurrentId && courseId && cleanCurrentId === courseId) return false;
      if (cleanCurrentCodigo && courseCodigo && cleanCurrentCodigo === courseCodigo) return false;

      // Solo comparar con cursos con estado Activo
      if (course.estado && String(course.estado).toLowerCase() !== "activo") {
        return false;
      }

      // 1. ¿Es el mismo docente? (por docenteId o por nombre completo)
      const courseDocId = course.docenteId ? String(course.docenteId).trim() : "";
      const courseDocName = cleanName(course.docente);

      const isSameTeacher =
        (targetDocId && courseDocId && targetDocId === courseDocId) ||
        (targetDocName && courseDocName && (
          targetDocName === courseDocName ||
          targetDocName.startsWith(courseDocName) ||
          courseDocName.startsWith(targetDocName)
        ));

      if (!isSameTeacher) return false;

      // 2. ¿Coincide al menos un día de clase en la semana?
      const courseDays = Array.isArray(course.dias) ? course.dias : [];
      const commonDays = courseDays.filter((d) => newDays.includes(d));
      if (commonDays.length === 0) return false;

      // 3. ¿Existe solapamiento en el rango de horas?
      const cStart = String(course.horaInicio || "").trim();
      const cEnd = String(course.horaFin || "").trim();
      if (!cStart || !cEnd) return false;

      // Dos intervalos [A, B] y [C, D] se solapan si A < D && B > C
      const overlaps = newStart < cEnd && newEnd > cStart;
      if (overlaps) {
        course._commonDays = commonDays;
        return true;
      }
      return false;
    });

    if (collision) {
      const diasCoincidentes = (collision._commonDays || []).join(", ");
      const docNombre = collision.docente || nuevoCurso.docente || "seleccionado";
      return {
        cruce: true,
        valido: false,
        mensaje: `Conflicto de horario: El docente ${docNombre} ya tiene asignado el curso "${collision.asignatura}" (${diasCoincidentes} de ${collision.horaInicio} a ${collision.horaFin}). Un docente no puede dictar 2 cursos al mismo tiempo.`,
        curso: collision
      };
    }

    return {
      cruce: false,
      valido: true,
      mensaje: null,
      curso: null
    };
  }
};
