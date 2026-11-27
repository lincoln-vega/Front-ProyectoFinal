import { getApiAccessToken } from "../lib/supabase";
import { getApiBaseUrl } from "../lib/apiUrl";

const authHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getApiAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
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
    cicloId: storedCourse.cicloId || storedCourse.ciclo_id || null,
    docenteId: storedCourse.docenteId || "USR-107",
    docente: storedCourse.docente || "",
    aula: course.aula || `Aula ${storedCourse.id ? String(storedCourse.id).replace("CRS-", "V-") : "Virtual"}`,
    horario: horarioTexto,
    dias,
    horaInicio,
    horaFin,
    meetUrl,
    repositorio: storedCourse.repositorio || "https://drive.google.com",
    tipoSala,
    estado: storedCourse.estado || "Activo",
    cicloVirtual: storedCourse.cicloVirtual || storedCourse.ciclovirtual || "Semestral",
    ciclovirtual: storedCourse.ciclovirtual || storedCourse.cicloVirtual || "Semestral"
  };
};

export const courseService = {
  async getCourses() {
    const res = await fetch(`${getApiBaseUrl()}/horarios/cursos`, {
      headers: authHeaders()
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail || `No se pudieron cargar los cursos (HTTP ${res.status}).`);
    }
    const data = await res.json();
    return (Array.isArray(data) ? data : []).map(normalizeCourse);
  },

  async fetchCourses() {
    return courseService.getCourses();
  },

  async validarCursoConBackend(curso) {
    try {
      const res = await fetch(`${getApiBaseUrl()}/monitoreo/validar-curso`, {
        method: "POST",
        headers: authHeaders(),
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
          if (curso.id && curso.asignatura && detail.includes(curso.asignatura)) {
            const localCheck = await courseService.validarCruce(curso);
            if (!localCheck.cruce) {
              return { valido: true, mensaje: "Horario disponible. Sin cruces para el docente." };
            }
          }
          return { valido: false, mensaje: detail };
        }
      } else {
        return await res.json().catch(() => ({ valido: true }));
      }
    } catch (err) {
      console.warn("[Backend] Validación remota no disponible, usando validación local:", err.message);
    }
    return courseService.validarCruce(curso);
  },

  async saveCourse(course) {
    const normalized = normalizeCourse(course);
    const payload = {
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

    const existing = await courseService.getCourses().catch(() => []);
    const exists = existing.some((c) => String(c.id) === String(payload.id));
    const url = exists
      ? `${getApiBaseUrl()}/horarios/cursos/${encodeURIComponent(payload.id)}`
      : `${getApiBaseUrl()}/horarios/cursos`;
    const method = exists ? "PUT" : "POST";

    const res = await fetch(url, {
      method,
      headers: authHeaders(),
      body: JSON.stringify(payload)
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(body?.detail || `No se pudo guardar el curso (HTTP ${res.status}).`);
    }
    return normalizeCourse(body?.curso || payload);
  },

  async saveCourses(courses) {
    if (!Array.isArray(courses) || courses.length === 0) return [];
    const saved = [];
    for (const c of courses) {
      saved.push(await courseService.saveCourse(c));
    }
    return saved;
  },

  async deleteCourse(id) {
    const res = await fetch(`${getApiBaseUrl()}/horarios/cursos/${encodeURIComponent(id)}`, {
      method: "DELETE",
      headers: authHeaders()
    });
    if (!res.ok) {
      const body = await res.json().catch(() => ({}));
      throw new Error(body?.detail || `No se pudo eliminar el curso "${id}".`);
    }
  },

  async countStudentsForTeacher(courseIds) {
    if (!courseIds || courseIds.length === 0) return 0;
    try {
      const res = await fetch(`${getApiBaseUrl()}/usuarios/`, {
        headers: authHeaders()
      });
      if (!res.ok) return 0;
      const users = await res.json();
      if (!Array.isArray(users)) return 0;

      const stringIds = new Set(courseIds.map(String));
      return users.filter((u) => {
        if (String(u.rol || "").toLowerCase() !== "estudiante") return false;
        if (String(u.estado || "").toLowerCase() !== "activo") return false;
        const raw = u.cursosInscritos || u.cursos_inscritos || [];
        const sCourses = Array.isArray(raw) ? raw.map(String) : [];
        return sCourses.some((cid) => stringIds.has(cid));
      }).length;
    } catch {
      return 0;
    }
  },

  async validarCruce(nuevoCurso, existingCourses = null) {
    const courses = existingCourses || (await courseService.getCourses().catch(() => []));
    const newDays = Array.isArray(nuevoCurso.dias) ? nuevoCurso.dias : [];
    const newStart = String(nuevoCurso.horaInicio || "").trim();
    const newEnd = String(nuevoCurso.horaFin || "").trim();

    if (!newStart || !newEnd || newDays.length === 0) {
      return { cruce: false, valido: true, mensaje: null, curso: null };
    }

    const cleanName = (val) =>
      String(val || "")
        .toLowerCase()
        .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, "")
        .trim();

    const targetDocName = cleanName(nuevoCurso.docente);
    const targetDocId = nuevoCurso.docenteId ? String(nuevoCurso.docenteId).trim() : "";
    const cleanCurrentId = nuevoCurso.id ? String(nuevoCurso.id).trim() : "";
    const cleanCurrentCodigo = nuevoCurso.codigo ? String(nuevoCurso.codigo).trim() : "";

    const collision = (courses || []).find((course) => {
      const courseId = course.id ? String(course.id).trim() : "";
      const courseCodigo = course.codigo ? String(course.codigo).trim() : "";
      if (cleanCurrentId && courseId && cleanCurrentId === courseId) return false;
      if (cleanCurrentCodigo && courseCodigo && cleanCurrentCodigo === courseCodigo) return false;
      if (course.estado && String(course.estado).toLowerCase() !== "activo") return false;

      const courseDocId = course.docenteId ? String(course.docenteId).trim() : "";
      const courseDocName = cleanName(course.docente);
      const isSameTeacher =
        (targetDocId && courseDocId && targetDocId === courseDocId) ||
        (targetDocName &&
          courseDocName &&
          (targetDocName === courseDocName ||
            targetDocName.startsWith(courseDocName) ||
            courseDocName.startsWith(targetDocName)));

      if (!isSameTeacher) return false;

      const courseDays = Array.isArray(course.dias) ? course.dias : [];
      const commonDays = courseDays.filter((d) => newDays.includes(d));
      if (commonDays.length === 0) return false;

      const cStart = String(course.horaInicio || "").trim();
      const cEnd = String(course.horaFin || "").trim();
      if (!cStart || !cEnd) return false;

      if (newStart < cEnd && newEnd > cStart) {
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
        mensaje: `Conflicto de horario: El docente ${docNombre} ya tiene asignado el curso "${collision.asignatura}" (${diasCoincidentes} de ${collision.horaInicio} a ${collision.horaFin}).`,
        curso: collision
      };
    }

    return { cruce: false, valido: true, mensaje: null, curso: null };
  }
};
