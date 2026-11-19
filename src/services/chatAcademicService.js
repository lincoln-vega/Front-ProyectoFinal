// Servicio de mensajería académica bidireccional entre Docente y Estudiante (V2.0)
// Integra persistencia en Backend FastAPI y PostgreSQL con fallback en localStorage
import { courseService } from "./cursosServices";
import { userService } from "./api";
import { getApiBaseUrl } from "../lib/apiUrl";
import { getApiAccessToken } from "../lib/insforge";

const CHAT_STORAGE_KEY = "academia_chat_messages_v2";

const getBackendUrls = () => {
  const urls = [];
  try {
    const primary = getApiBaseUrl();
    if (primary) urls.push(primary.replace(/\/+$/, ""));
  } catch {}
  const fallbackEnv = import.meta.env.VITE_BACKEND_URL;
  if (fallbackEnv && !urls.includes(fallbackEnv.replace(/\/+$/, ""))) {
    urls.push(fallbackEnv.replace(/\/+$/, ""));
  }
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

async function requestMensajes(path, options = {}) {
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
      // Intentar con siguiente URL
    }
  }
  return null;
}

const DEFAULT_MESSAGES = [
  {
    id: "MSG-001",
    estudianteId: "USR-005",
    estudianteNombre: "Juan Carlos Flores Mendoza",
    estudianteCorreo: "estudiante@gmail.com",
    estudianteCarrera: "Ingeniería de Sistemas (UNI)",
    docenteId: "USR-107",
    docenteNombre: "Pedro Martlon Chavez Quispe",
    cursoId: "CRS-002",
    curso: "Física Fundamental",
    mensaje: "Profesor Chavez, buenas tardes. Tengo una consulta sobre dinámica lineal y el cálculo de la fuerza resultante en el plano inclinado del taller N° 3.",
    fecha: "Hoy, 10:15 AM",
    estado: "Respondido",
    respuesta: "Estimado Juan Carlos, recuerda descomponer el peso en los ejes tangencial y normal; la normal equilibra a P*cos(theta). En la próxima clase resolveremos el ejercicio 4.",
    fechaRespuesta: "Hoy, 10:45 AM"
  },
  {
    id: "MSG-002",
    estudianteId: "USR-108",
    estudianteNombre: "Esteban Torres",
    estudianteCorreo: "esteban@gmail.com",
    estudianteCarrera: "Medicina Humana (UNMSM)",
    docenteId: "USR-002",
    docenteNombre: "Carmen Rosa Herrera Villanueva",
    cursoId: "CRS-003",
    curso: "Biología y Anatomía",
    mensaje: "Doctora Herrera, buenas tardes. En el ciclo de Krebs y la cadena de transporte de electrones, ¿cuántos ATP netos se consideran para el prospecto de admisión de San Marcos?",
    fecha: "Hoy, 09:20 AM",
    estado: "Respondido",
    respuesta: "Hola Esteban. Para el prospecto UNMSM se consideran 36 a 38 ATPs según la lanzadera activa (malato-aspartato vs glicerol-3-fosfato). Te lo detallo en la separata.",
    fechaRespuesta: "Hoy, 09:55 AM"
  },
  {
    id: "MSG-003",
    estudianteId: "USR-3066",
    estudianteNombre: "Ana Paula Vargas Chavez",
    estudianteCorreo: "anapaula@gmail.com",
    estudianteCarrera: "Derecho y Ciencias Políticas (UNMSM)",
    docenteId: "USR-109",
    docenteNombre: "Victoria Angelis Raggi Ruiz",
    cursoId: "CRS-008",
    curso: "Historia Universal",
    mensaje: "Profesora Victoria, buenas tardes. ¿El tema del periodo de entreguerras y el ascenso de los totalitarismos entrará en el simulacro de este domingo?",
    fecha: "Hoy, 08:45 AM",
    estado: "Pendiente",
    respuesta: null,
    fechaRespuesta: null
  },
  {
    id: "MSG-004",
    estudianteId: "USR-108",
    estudianteNombre: "Esteban Torres",
    estudianteCorreo: "esteban@gmail.com",
    estudianteCarrera: "Medicina Humana (UNMSM)",
    docenteId: "USR-002",
    docenteNombre: "Carmen Rosa Herrera Villanueva",
    cursoId: "CRS-006",
    curso: "Química General",
    mensaje: "Doctora Herrera, en el taller de estequiometría: ¿en las reacciones redox debemos balancear por ion-electrón en medio ácido?",
    fecha: "Ayer, 04:15 PM",
    estado: "Pendiente",
    respuesta: null,
    fechaRespuesta: null
  }
];

export const chatAcademicService = {
  getMessages() {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn("[ChatAcademicService] Error leyendo mensajes locales:", e);
    }
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(DEFAULT_MESSAGES));
    return DEFAULT_MESSAGES;
  },

  async fetchMessages() {
    try {
      const data = await requestMensajes("/mensajes/");
      if (Array.isArray(data) && data.length > 0) {
        const normalized = data.map((m) => ({
          id: m.id,
          estudianteId: m.estudianteId || m.estudiante_id,
          estudianteNombre: m.estudianteNombre || m.estudiante_nombre,
          estudianteCorreo: m.estudianteCorreo || m.estudiante_correo,
          estudianteCarrera: m.estudianteCarrera || m.estudiante_carrera,
          docenteId: m.docenteId || m.docente_id,
          docenteNombre: m.docenteNombre || m.docente_nombre,
          cursoId: m.cursoId || m.curso_id,
          curso: m.curso,
          mensaje: m.mensaje,
          fecha: m.fecha,
          estado: m.estado || "Pendiente",
          respuesta: m.respuesta,
          fechaRespuesta: m.fechaRespuesta || m.fecha_respuesta
        }));

        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new Event("storage"));
        return normalized;
      }
    } catch (err) {
      console.warn("[ChatAcademicService] Fallback a mensajes locales:", err);
    }
    return this.getMessages();
  },

  getMessagesForTeacher(docenteId, docenteNombre = "", docenteEmail = "") {
    const all = this.getMessages();
    const cleanTokens = (str) =>
      String(str || "")
        .toLowerCase()
        .replace(/^(prof\.|profesor\.|profesor|dra\.|dra|doctora\.|doctora|dr\.|dr|ing\.|lic\.)\s*/i, "")
        .split(/\s+/)
        .filter((t) => t.length > 2);

    const searchTokens = cleanTokens(docenteNombre);
    const normEmail = String(docenteEmail || "").toLowerCase().trim();

    return all.filter((m) => {
      // 1. Coincidencia por ID de docente o destinatario
      if (docenteId && (
        (m.docenteId && String(m.docenteId).trim() === String(docenteId).trim()) ||
        (m.destinatarioId && String(m.destinatarioId).trim() === String(docenteId).trim())
      )) {
        return true;
      }

      // 2. Coincidencia por correo electrónico si está disponible
      if (normEmail && (
        (m.docenteCorreo && String(m.docenteCorreo).toLowerCase().trim() === normEmail) ||
        (m.destinatarioCorreo && String(m.destinatarioCorreo).toLowerCase().trim() === normEmail)
      )) {
        return true;
      }

      // 3. Coincidencia por tokens de nombre
      const targetName = m.destinatarioNombre || m.docenteNombre;
      const msgTokens = cleanTokens(targetName);
      if (searchTokens.length > 0 && msgTokens.length > 0) {
        const hasTokenOverlap = searchTokens.some((st) =>
          msgTokens.some((mt) => st.includes(mt) || mt.includes(st))
        );
        if (hasTokenOverlap) return true;
      }

      return false;
    });
  },

  getMessagesForStudent(studentEmail, studentId = "") {
    const all = this.getMessages();
    const normEmail = (studentEmail || "").toLowerCase().trim();
    const cleanId = String(studentId || "").trim();
    return all.filter((m) => {
      if ((m.estudianteCorreo || "").toLowerCase().trim() === normEmail) return true;
      if ((m.destinatarioCorreo || "").toLowerCase().trim() === normEmail) return true;
      if (cleanId && (
        String(m.estudianteId || "").trim() === cleanId ||
        String(m.destinatarioId || "").trim() === cleanId
      )) {
        return true;
      }
      return false;
    });
  },

  /**
   * Obtiene la agenda de contactos disponibles estrictamente para el estudiante:
   * - Docentes Titulares: profesores de los cursos que el alumno efectivamente cursa.
   * - Compañeros de Curso: alumnos que comparten los mismos cursos o misma carrera/área.
   */
  getContactsForStudent(studentProfile, allCourses = [], allUsers = []) {
    if (!studentProfile) {
      return { teachers: [], classmates: [], studentCourses: [] };
    }

    const inscritos = Array.isArray(studentProfile.cursosInscritos)
      ? studentProfile.cursosInscritos
      : [];
    const directIds = new Set(
      inscritos.map((c) => (typeof c === "object" && c !== null ? String(c.id) : String(c)))
    );

    const activeCourses = (allCourses || []).filter((c) => c.estado === "Activo");
    const studentArea = String(studentProfile.areaAcademica || "").toLowerCase().trim();
    const studentCarrera = String(studentProfile.carreraObjetivo || "").toLowerCase().trim();

    // 1. Cursos que corresponden estrictamente al estudiante según matrícula o carrera/área
    const studentCourses = activeCourses.filter((course) => {
      if (directIds.has(String(course.id))) return true;
      if (directIds.size === 0) {
        const cArea = String(course.area || "").toLowerCase().trim();
        const cCarrera = String(course.carrera || "").toLowerCase().trim();
        if (studentArea && (cArea.includes(studentArea) || studentArea.includes(cArea))) return true;
        if (studentCarrera && (cCarrera.includes(studentCarrera) || studentCarrera.includes(cCarrera))) return true;
      }
      return false;
    });

    const studentCourseIds = new Set(studentCourses.map((c) => String(c.id)));

    // 2. Docentes titulares de esos cursos
    const teachersMap = new Map();
    studentCourses.forEach((c) => {
      const key = `${c.docenteId || c.docente}-${c.id}`;
      if (!teachersMap.has(key)) {
        teachersMap.set(key, {
          tipo: "docente",
          id: c.docenteId || "DOC-TITULAR",
          nombre: c.docente || "Docente Titular",
          correo: c.docenteCorreo || "",
          cursoId: c.id,
          cursoNombre: c.asignatura,
          area: c.area || "Área General"
        });
      }
    });
    const teachers = Array.from(teachersMap.values());

    // 3. Compañeros de curso (estudiantes que comparten cursos o misma carrera/área)
    const classmates = (allUsers || []).filter((u) => {
      if (String(u.rol || "").toLowerCase() !== "estudiante") return false;
      if (String(u.id) === String(studentProfile.id)) return false;
      if (String(u.correo || "").toLowerCase() === String(studentProfile.correo || "").toLowerCase()) return false;
      if (String(u.estado || "").toLowerCase() !== "activo") return false;

      const peerInscritos = Array.isArray(u.cursosInscritos) ? u.cursosInscritos : [];
      const peerCourseIds = new Set(
        peerInscritos.map((c) => (typeof c === "object" && c !== null ? String(c.id) : String(c)))
      );

      // Si comparte algún curso con el alumno
      const sharesCourse = Array.from(studentCourseIds).some((cid) => peerCourseIds.has(cid));
      if (sharesCourse) return true;

      // Si alguno no tiene lista explícita, ver si comparten carrera o área académica
      if (peerCourseIds.size === 0 || directIds.size === 0) {
        const peerArea = String(u.areaAcademica || "").toLowerCase().trim();
        const peerCarrera = String(u.carreraObjetivo || "").toLowerCase().trim();
        if (studentArea && peerArea && (studentArea.includes(peerArea) || peerArea.includes(studentArea))) {
          return true;
        }
        if (studentCarrera && peerCarrera && (studentCarrera.includes(peerCarrera) || peerCarrera.includes(studentCarrera))) {
          return true;
        }
      }

      return false;
    }).map((peer) => ({
      tipo: "companero",
      id: peer.id,
      nombre: `${peer.nombres || ""} ${peer.apellidos || ""}`.trim() || peer.correo,
      correo: peer.correo,
      carrera: peer.carreraObjetivo || peer.areaAcademica || "Estudiante",
      cursoId: studentCourses[0]?.id || "CRS-GEN",
      cursoNombre: studentCourses[0]?.asignatura || "Materia Compartida"
    }));

    return { teachers, classmates, studentCourses };
  },

  async getTeachersForStudent(cursosInscritosIds = []) {
    try {
      const courses = await courseService.getCourses();
      const activeCourses = (courses || []).filter((c) => c.estado === "Activo");

      let relevantCourses = activeCourses;
      if (Array.isArray(cursosInscritosIds) && cursosInscritosIds.length > 0) {
        const idSet = new Set(cursosInscritosIds.map(String));
        const filtered = activeCourses.filter((c) => idSet.has(String(c.id)));
        if (filtered.length > 0) relevantCourses = filtered;
      }

      return relevantCourses.map((c) => ({
        docenteId: c.docenteId || "DOC-TITULAR",
        docenteNombre: c.docente || "Docente Titular",
        cursoId: c.id,
        cursoNombre: c.asignatura,
        area: c.area || "General"
      }));
    } catch (err) {
      console.warn("[ChatAcademicService] Fallback de docentes:", err);
      return [];
    }
  },

  async sendMessage({
    estudianteId,
    estudianteNombre,
    estudianteCorreo,
    estudianteCarrera,
    docenteId,
    docenteNombre,
    cursoId,
    curso,
    mensaje,
    destinatarioTipo = "docente",
    destinatarioId = null,
    destinatarioNombre = null,
    destinatarioCorreo = null
  }) {
    const newMessage = {
      id: `MSG-${Date.now()}`,
      estudianteId: estudianteId || "USR-ESTUDIANTE",
      estudianteNombre: estudianteNombre || "Estudiante",
      estudianteCorreo: estudianteCorreo || "",
      estudianteCarrera: estudianteCarrera || "",
      docenteId: docenteId || destinatarioId || "DOC-TITULAR",
      docenteNombre: docenteNombre || destinatarioNombre || "Docente Titular",
      cursoId: cursoId || "CRS-GEN",
      curso: curso || "Asignatura General",
      mensaje: mensaje.trim(),
      fecha: "Hoy, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      estado: "Pendiente",
      respuesta: null,
      fechaRespuesta: null,
      destinatarioTipo: destinatarioTipo || "docente",
      destinatarioId: destinatarioId || docenteId || "",
      destinatarioNombre: destinatarioNombre || docenteNombre || "",
      destinatarioCorreo: destinatarioCorreo || ""
    };

    // 1. Guardar localmente de inmediato para reactividad instantánea
    const all = this.getMessages();
    const updated = [newMessage, ...all.filter((m) => m.id !== newMessage.id)];
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));

    // 2. Persistir en el Backend FastAPI y PostgreSQL
    try {
      const saved = await requestMensajes("/mensajes/", {
        method: "POST",
        body: JSON.stringify(newMessage)
      });
      if (saved && saved.id) {
        return { ...newMessage, ...saved };
      }
    } catch (e) {
      console.warn("[ChatAcademicService] No se pudo persistir en backend, usando local:", e);
    }

    return newMessage;
  },

  async replyMessage(messageId, respuestaTexto, docenteNombre = "Pedro Martlon Chavez Quispe") {
    // 1. Actualizar localmente de inmediato
    const all = this.getMessages();
    const updated = all.map((m) => {
      if (m.id === messageId) {
        return {
          ...m,
          estado: "Respondido",
          respuesta: respuestaTexto.trim(),
          fechaRespuesta: "Hoy, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
          docenteNombre: docenteNombre || m.docenteNombre
        };
      }
      return m;
    });

    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));

    // 2. Persistir respuesta en Backend FastAPI
    try {
      await requestMensajes(`/mensajes/${encodeURIComponent(messageId)}/respuesta`, {
        method: "PATCH",
        body: JSON.stringify({
          respuesta: respuestaTexto.trim(),
          docenteNombre: docenteNombre
        })
      });
    } catch (e) {
      console.warn("[ChatAcademicService] Error actualizando respuesta en backend:", e);
    }

    return updated;
  }
};
