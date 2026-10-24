import { insforge } from "../lib/insforge";

const FUNCTION_NAMES = {
  entry: "meet-entrada",
  exit: "meet-salida",
  audit: "meet-auditoria"
};

const getErrorMessage = (error) => {
  const message = String(error?.message || error || "").toLowerCase();
  if (message.includes("expired") || message.includes("sesión") || message.includes("session")) {
    return "La sesión expiró. Inicia sesión nuevamente.";
  }
  if (message.includes("permission") || message.includes("permiso") || message.includes("unauthorized")) {
    return "No tienes permisos para registrar asistencia en este curso.";
  }
  if (message.includes("active session") || message.includes("sesión activa")) {
    return "Ya existe una sesión activa para este curso.";
  }
  if (message.includes("not found") || message.includes("no existe") || message.includes("curso")) {
    return "El curso no existe o no pertenece al docente.";
  }
  if (message.includes("meet") || message.includes("enlace")) {
    return "El curso no tiene un enlace de Google Meet válido.";
  }
  if (message.includes("entrada")) {
    return "No existe una entrada para finalizar.";
  }
  return error?.message || "No se pudo completar la operación de asistencia.";
};

const throwFunctionError = (error, operation) => {
  if (!error) return;
  console.error(`[InsForge] ${operation}:`, error);
  throw new Error(getErrorMessage(error));
};

const invokeMeetFunction = async (name, cursoId) => {
  const { data, error } = await insforge.functions.invoke(name, {
    body: {
      curso_id: cursoId,
      cursoId
    }
  });
  throwFunctionError(error, name);
  return data;
};

const unwrapResponse = (data) => {
  if (Array.isArray(data)) return data[0] || null;
  return data?.data || data?.result || data?.asistencia || data?.session || data || null;
};

const normalizeAttendance = (record) => {
  if (!record) return null;
  return {
    ...record,
    id: record.id || record.attendance_id,
    cursoId: record.cursoId || record.curso_id || record.course_id,
    entrada: record.entrada || record.horaEntrada || record.hora_entrada || record.started_at,
    salida: record.salida || record.horaSalida || record.hora_salida || record.ended_at,
    meetUrl: record.meetUrl || record.meet_url || record.url,
    estado: record.estado || record.status,
    minutosEfectivos: record.minutosEfectivos ?? record.minutos_efectivos ?? record.effective_minutes
  };
};

export async function registerMeetEntry(cursoId) {
  return normalizeAttendance(unwrapResponse(await invokeMeetFunction(FUNCTION_NAMES.entry, cursoId)));
}

export async function registerMeetExit(cursoId) {
  return normalizeAttendance(unwrapResponse(await invokeMeetFunction(FUNCTION_NAMES.exit, cursoId)));
}

export async function getMeetAttendanceHistory(cursoId) {
  const data = await invokeMeetFunction(FUNCTION_NAMES.audit, cursoId);
  const records = data?.historial || data?.history || data?.rows || data?.items || data?.data || data;
  return (Array.isArray(records) ? records : [records].filter(Boolean)).map(normalizeAttendance);
}

const ATTENDANCE_COLUMNS = "id, cursoId, asignatura, docenteId, docente, fecha, horaApertura, modalidad, asistentesPuntuales, tardanzas, ausentes, created_at";

const throwIfError = (error, operation) => {
  if (error) {
    console.error(`[InsForge] ${operation}:`, error);
    throw new Error(error.message || `No se pudo completar: ${operation}`);
  }
};

export async function getStoredAttendances() {
  const { data, error } = await insforge.database
    .from("attendance_sessions")
    .select(ATTENDANCE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(500);
  throwIfError(error, "cargar asistencias");
  return data || [];
}

export async function saveAttendanceRecord(record) {
  try {
    const { data, error } = await insforge.functions.invoke("marcar-asistencia", {
      body: {
        sesion_id: record.sesion_id || record.sesionId || "ATT-SES-001",
        estudianteId: record.estudianteId || record.id || "USR-005",
        estudiante: record.estudiante || record.nombre || "Estudiante",
        horaRegistro: record.horaRegistro || record.hora || new Date().toTimeString().slice(0, 5)
      }
    });
    if (!error) return data || record;
  } catch (err) {
    console.warn("[InsForge] Fallback a tabla attendance_sessions:", err);
  }

  const cursoId = record.cursoId || record.curso_id || "CRS-001";
  const sessionDate = new Date().toISOString().split("T")[0];
  const alumnoData = {
    id: record.estudianteId || record.id || "USR-005",
    nombre: record.estudiante || record.nombre || "Estudiante",
    hora: record.horaRegistro || new Date().toTimeString().slice(0, 5)
  };

  const { data: activeSessions } = await insforge.database
    .from("attendance_sessions")
    .select(ATTENDANCE_COLUMNS)
    .eq("cursoId", cursoId)
    .order("created_at", { ascending: false })
    .limit(1);

  if (activeSessions && activeSessions.length > 0) {
    const currentSession = activeSessions[0];
    const puntuales = Array.isArray(currentSession.asistentesPuntuales) ? [...currentSession.asistentesPuntuales] : [];
    if (!puntuales.some((p) => p.id === alumnoData.id)) {
      puntuales.push(alumnoData);
      await insforge.database
        .from("attendance_sessions")
        .update({ asistentesPuntuales: puntuales })
        .eq("id", currentSession.id);
    }
    return currentSession;
  } else {
    const nuevaSesion = {
      id: `ATT-${cursoId}-${Date.now().toString().slice(-6)}`,
      cursoId,
      asignatura: record.curso || record.asignatura || "Clase Virtual",
      docenteId: record.docenteId || "USR-002",
      docente: record.docente || "Docente a cargo",
      fecha: sessionDate,
      horaApertura: new Date().toTimeString().slice(0, 5),
      modalidad: "Virtual",
      asistentesPuntuales: [alumnoData],
      tardanzas: [],
      ausentes: []
    };
    await insforge.database.from("attendance_sessions").insert([nuevaSesion]);
    return nuevaSesion;
  }
}

export async function getTeacherAttendances(docenteId, fecha) {
  let query = insforge.database
    .from("attendance_sessions")
    .select(ATTENDANCE_COLUMNS)
    .order("created_at", { ascending: false })
    .limit(500);
  if (docenteId) query = query.eq("docenteId", docenteId);
  if (fecha) query = query.eq("fecha", fecha);
  const { data, error } = await query;
  throwIfError(error, "cargar sesiones del docente");
  return data || [];
}

export async function saveTeacherAttendance(record) {
  const session = {
    id: `TATT-${record.cursoId}-${record.fecha}`,
    cursoId: record.cursoId,
    asignatura: record.curso,
    docenteId: record.docenteId,
    docente: record.docente,
    fecha: record.fecha,
    horaApertura: record.horaIngreso,
    modalidad: "Virtual",
    asistentesPuntuales: [],
    tardanzas: [],
    ausentes: []
  };
  const { data, error } = await insforge.database
    .from("attendance_sessions")
    .upsert([session])
    .select(ATTENDANCE_COLUMNS);
  throwIfError(error, "guardar sesión de clase");
  return data?.[0] || session;
}
