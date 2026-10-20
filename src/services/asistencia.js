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
