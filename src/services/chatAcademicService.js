// Servicio de mensajería académica bidireccional entre Docente y Estudiante (V2.0)
import { courseService } from "./cursosServices";
import { userService } from "./api";

const CHAT_STORAGE_KEY = "academia_chat_messages_v2";

const DEFAULT_MESSAGES = [
  {
    id: "MSG-001",
    estudianteId: "USR-005",
    estudianteNombre: "Juan Carlos Flores Mendoza",
    estudianteCorreo: "estudiante@gmail.com",
    estudianteCarrera: "Ingeniería de Sistemas (UNI)",
    docenteId: "USR-107",
    docenteNombre: "Prof. Pedro Chavez",
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
    docenteNombre: "Dra. Carmen Rosa Herrera",
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
    docenteNombre: "Prof. Victoria Raggi",
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
    docenteNombre: "Dra. Carmen Rosa Herrera",
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

  getMessagesForTeacher(docenteId, docenteNombre = "") {
    const all = this.getMessages();
    const normName = (docenteNombre || "").toLowerCase().trim();
    return all.filter((m) => {
      if (docenteId && m.docenteId && m.docenteId === docenteId) return true;
      if (normName && m.docenteNombre && (
        m.docenteNombre.toLowerCase().includes(normName) ||
        normName.includes(m.docenteNombre.toLowerCase())
      )) {
        return true;
      }
      // Si el docente consultado es Chavez o no especifica y es USR-107
      if ((docenteId === "USR-107" || normName.includes("chavez")) &&
          (m.docenteId === "USR-107" || (m.docenteNombre || "").toLowerCase().includes("chavez"))) {
        return true;
      }
      return false;
    });
  },

  getMessagesForStudent(studentEmail) {
    const all = this.getMessages();
    const normEmail = (studentEmail || "").toLowerCase().trim();
    return all.filter(
      (m) => (m.estudianteCorreo || "").toLowerCase().trim() === normEmail
    );
  },

  async getTeachersForStudent(cursosInscritosIds = []) {
    try {
      const courses = await courseService.getCourses();
      const activeCourses = (courses || []).filter((c) => c.estado === "Activo");

      // Filtrar cursos que lleva el alumno si se pasan IDs
      let relevantCourses = activeCourses;
      if (Array.isArray(cursosInscritosIds) && cursosInscritosIds.length > 0) {
        const idSet = new Set(cursosInscritosIds.map(String));
        const filtered = activeCourses.filter((c) => idSet.has(String(c.id)));
        if (filtered.length > 0) relevantCourses = filtered;
      }

      const teachers = relevantCourses.map((c) => ({
        docenteId: c.docenteId || "USR-107",
        docenteNombre: c.docente || "Prof. Pedro Chavez",
        cursoId: c.id,
        cursoNombre: c.asignatura,
        area: c.area || "General"
      }));

      // Siempre incluir como primer contacto al docente titular del sistema
      if (!teachers.some((t) => (t.docenteNombre || "").toLowerCase().includes("chavez"))) {
        teachers.unshift({
          docenteId: "USR-107",
          docenteNombre: "Prof. Pedro Chavez",
          cursoId: "CRS-002",
          cursoNombre: "Física Fundamental",
          area: "Ciencias Exactas"
        });
      }

      return teachers;
    } catch (err) {
      console.warn("[ChatAcademicService] Fallback de docentes:", err);
      return [
        {
          docenteId: "USR-107",
          docenteNombre: "Prof. Pedro Chavez",
          cursoId: "CRS-002",
          cursoNombre: "Física Fundamental",
          area: "Ciencias Exactas e Ingenierías"
        },
        {
          docenteId: "USR-002",
          docenteNombre: "Dra. Carmen Rosa Herrera",
          cursoId: "CRS-003",
          cursoNombre: "Biología y Anatomía",
          area: "Ciencias Médicas y de la Salud"
        },
        {
          docenteId: "USR-109",
          docenteNombre: "Prof. Victoria Raggi",
          cursoId: "CRS-007",
          cursoNombre: "Historia del Perú",
          area: "Humanidades y Ciencias Sociales"
        }
      ];
    }
  },

  sendMessage({
    estudianteId,
    estudianteNombre,
    estudianteCorreo,
    estudianteCarrera,
    docenteId,
    docenteNombre,
    cursoId,
    curso,
    mensaje
  }) {
    const newMessage = {
      id: `MSG-${Date.now()}`,
      estudianteId: estudianteId || "USR-108",
      estudianteNombre: estudianteNombre || "Esteban Torres",
      estudianteCorreo: estudianteCorreo || "esteban@gmail.com",
      estudianteCarrera: estudianteCarrera || "Medicina Humana (UNMSM)",
      docenteId: docenteId || "USR-107",
      docenteNombre: docenteNombre || "Prof. Pedro Chavez",
      cursoId: cursoId || "CRS-002",
      curso: curso || "Física Fundamental",
      mensaje: mensaje.trim(),
      fecha: "Hoy, " + new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
      estado: "Pendiente",
      respuesta: null,
      fechaRespuesta: null
    };

    const all = this.getMessages();
    const updated = [newMessage, ...all];
    localStorage.setItem(CHAT_STORAGE_KEY, JSON.stringify(updated));
    window.dispatchEvent(new Event("storage"));
    return newMessage;
  },

  replyMessage(messageId, respuestaTexto, docenteNombre = "Prof. Pedro Chavez") {
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
    return updated;
  }
};
