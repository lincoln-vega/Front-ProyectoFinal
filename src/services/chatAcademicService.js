// Servicio de mensajería académica bidireccional (conectado al Backend FastAPI + Supabase PostgreSQL)
import { courseService } from "./cursosServices";
import { parseCourseList } from "./api";
import { getApiBaseUrl } from "../lib/apiUrl";
import { getApiAccessToken } from "../lib/supabase";

const CHAT_STORAGE_KEY = "academia_chat_messages_cache";

const getHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getApiAccessToken();
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

async function requestMensajes(path, options = {}) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    signal: options.signal || AbortSignal.timeout(6000),
    headers: {
      ...getHeaders(),
      ...(options.headers || {})
    }
  });
  if (!res.ok) {
    const errBody = await res.json().catch(() => ({}));
    throw new Error(errBody?.detail || `Error HTTP ${res.status} en ${path}`);
  }
  return res.json();
}

export const chatAcademicService = {
  getMessages() {
    try {
      const stored = localStorage.getItem(CHAT_STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed)) return parsed;
      }
    } catch {}
    return [];
  },

  async fetchMessages() {
    try {
      const data = await requestMensajes("/mensajes/");
      if (Array.isArray(data)) {
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
          fechaRespuesta: m.fechaRespuesta || m.fecha_respuesta,
          destinatarioTipo: m.destinatarioTipo || m.destinatario_tipo,
          destinatarioId: m.destinatarioId || m.destinatario_id,
          destinatarioNombre: m.destinatarioNombre || m.destinatario_nombre,
          destinatarioCorreo: m.destinatarioCorreo || m.destinatario_correo
        }));

        localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(normalized));
        window.dispatchEvent(new Event("storage"));
        return normalized;
      }
    } catch (err) {
      console.warn("[ChatAcademicService] No se pudieron sincronizar mensajes desde el backend:", err.message);
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
      if (
        docenteId &&
        ((m.docenteId && String(m.docenteId).trim() === String(docenteId).trim()) ||
          (m.destinatarioId && String(m.destinatarioId).trim() === String(docenteId).trim()))
      ) {
        return true;
      }
      if (
        normEmail &&
        ((m.docenteCorreo && String(m.docenteCorreo).toLowerCase().trim() === normEmail) ||
          (m.destinatarioCorreo && String(m.destinatarioCorreo).toLowerCase().trim() === normEmail))
      ) {
        return true;
      }
      const targetName = m.destinatarioNombre || m.docenteNombre;
      const msgTokens = cleanTokens(targetName);
      if (searchTokens.length > 0 && msgTokens.length > 0) {
        return searchTokens.some((st) => msgTokens.some((mt) => st.includes(mt) || mt.includes(st)));
      }
      return false;
    });
  },

  getMessagesForStudent(studentEmail, studentId = "") {
    const all = this.getMessages();
    const normEmail = (studentEmail || "").toLowerCase().trim();
    const cleanId = String(studentId || "").trim();
    return all.filter((m) => {
      if (normEmail && (m.estudianteCorreo || "").toLowerCase().trim() === normEmail) return true;
      if (normEmail && (m.destinatarioCorreo || "").toLowerCase().trim() === normEmail) return true;
      if (
        cleanId &&
        (String(m.estudianteId || "").trim() === cleanId ||
          String(m.destinatarioId || "").trim() === cleanId)
      ) {
        return true;
      }
      return false;
    });
  },

  getContactsForStudent(studentProfile, allCourses = [], allUsers = []) {
    if (!studentProfile) {
      return { teachers: [], classmates: [], studentCourses: [] };
    }

    const inscritos = parseCourseList(
      studentProfile.cursosInscritos || studentProfile.cursos_inscritos || studentProfile.CursosInscritos
    );
    const directIds = new Set(
      inscritos.map((c) => (typeof c === "object" && c !== null ? String(c.id).trim() : String(c).trim()))
    );

    if (directIds.size === 0) {
      return { teachers: [], classmates: [], studentCourses: [] };
    }

    const activeCourses = (allCourses || []).filter((c) => c.estado === "Activo");
    const studentCourses = activeCourses.filter((course) => directIds.has(String(course.id).trim()));
    const studentCourseIds = new Set(studentCourses.map((c) => String(c.id).trim()));

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

    const classmates = (allUsers || [])
      .filter((u) => {
        if (String(u.rol || "").toLowerCase() !== "estudiante") return false;
        if (String(u.id) === String(studentProfile.id)) return false;
        if (String(u.correo || "").toLowerCase() === String(studentProfile.correo || "").toLowerCase()) return false;
        if (String(u.estado || "").toLowerCase() !== "activo") return false;

        const peerInscritos = parseCourseList(
          u.cursosInscritos || u.cursos_inscritos || u.CursosInscritos
        );
        const peerCourseIds = new Set(
          peerInscritos.map((c) => (typeof c === "object" && c !== null ? String(c.id).trim() : String(c).trim()))
        );
        return Array.from(studentCourseIds).some((cid) => peerCourseIds.has(cid));
      })
      .map((peer) => ({
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
    } catch {
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

    const saved = await requestMensajes("/mensajes/", {
      method: "POST",
      body: JSON.stringify(newMessage)
    });

    const finalMsg = { ...newMessage, ...(saved || {}) };
    const all = this.getMessages();
    const updated = [finalMsg, ...all.filter((m) => m.id !== finalMsg.id)];
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return finalMsg;
  },

  async replyMessage(messageId, respuestaTexto, docenteNombre = "Docente") {
    await requestMensajes(`/mensajes/${encodeURIComponent(messageId)}/respuesta`, {
      method: "PATCH",
      body: JSON.stringify({
        respuesta: respuestaTexto.trim(),
        docenteNombre
      })
    });

    const updated = this.getMessages().map((m) =>
      m.id === messageId
        ? {
            ...m,
            estado: "Respondido",
            respuesta: respuestaTexto.trim(),
            fechaRespuesta: "Hoy, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            docenteNombre: docenteNombre || m.docenteNombre
          }
        : m
    );
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return updated;
  }
};
