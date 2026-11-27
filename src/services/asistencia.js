import { getApiAccessToken } from "../lib/supabase";
import { getApiBaseUrl } from "../lib/apiUrl";

const authHeaders = () => {
  const headers = { "Content-Type": "application/json" };
  const token = getApiAccessToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  return headers;
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
    estado: record.estado || record.estado_sesion || record.status,
    minutosEfectivos: record.minutosEfectivos ?? record.minutos_efectivos ?? record.effective_minutes
  };
};

async function requestAsistencia(path, options = {}) {
  const res = await fetch(`${getApiBaseUrl()}${path}`, {
    ...options,
    headers: {
      ...authHeaders(),
      ...(options.headers || {})
    }
  });
  const body = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(body?.detail || "No se pudo completar la operación de asistencia.");
  }
  return body;
}

export async function registerMeetEntry(cursoId) {
  const row = await requestAsistencia("/asistencia/meet/entrada", {
    method: "POST",
    body: JSON.stringify({ cursoId })
  });
  return normalizeAttendance(row);
}

export async function registerMeetExit(cursoId) {
  const row = await requestAsistencia("/asistencia/meet/salida", {
    method: "POST",
    body: JSON.stringify({ cursoId })
  });
  return normalizeAttendance(row);
}

export async function getMeetAttendanceHistory(cursoId) {
  const rows = await requestAsistencia(`/asistencia/meet/historial/${encodeURIComponent(cursoId)}`);
  return Array.isArray(rows) ? rows.map(normalizeAttendance) : [];
}

export async function getStoredAttendances() {
  const rows = await requestAsistencia("/asistencia/sesiones");
  return Array.isArray(rows) ? rows : [];
}

export async function saveAttendanceRecord(record) {
  const sesionId = record.sesion_id || record.sesionId;
  if (sesionId) {
    return requestAsistencia(`/asistencia/sesiones/${encodeURIComponent(sesionId)}/marcar`, {
      method: "POST",
      body: JSON.stringify({
        estudianteId: record.estudianteId || record.id || "",
        estudiante: record.estudiante || record.nombre || "Estudiante",
        horaRegistro: record.horaRegistro || record.hora || new Date().toTimeString().slice(0, 5)
      })
    });
  }

  const cursoId = record.cursoId || record.curso_id || "CRS-001";
  const nuevaSesion = {
    id: `ATT-${cursoId}-${Date.now().toString().slice(-6)}`,
    cursoId,
    asignatura: record.curso || record.asignatura || "Clase Virtual",
    docenteId: record.docenteId || "USR-107",
    docente: record.docente || "Docente a cargo",
    fecha: new Date().toISOString().split("T")[0],
    horaApertura: new Date().toTimeString().slice(0, 5),
    modalidad: "Virtual en vivo",
    asistentesPuntuales: [
      {
        estudianteId: record.estudianteId || record.id || "",
        estudiante: record.estudiante || record.nombre || "Estudiante",
        horaRegistro: record.horaRegistro || new Date().toTimeString().slice(0, 5)
      }
    ],
    tardanzas: [],
    ausentes: []
  };
  await requestAsistencia("/asistencia/sesiones", {
    method: "POST",
    body: JSON.stringify(nuevaSesion)
  });
  return nuevaSesion;
}

export async function getTeacherAttendances(docenteId, fecha) {
  const all = await getStoredAttendances();
  return all.filter((s) => {
    if (docenteId && s.docenteId !== docenteId) return false;
    if (fecha && s.fecha !== fecha) return false;
    return true;
  });
}

export async function saveTeacherAttendance(record) {
  const session = {
    id: `TATT-${record.cursoId}-${record.fecha}-${Date.now().toString().slice(-4)}`,
    cursoId: record.cursoId,
    asignatura: record.curso || record.asignatura || "Clase Virtual",
    docenteId: record.docenteId,
    docente: record.docente,
    fecha: record.fecha,
    horaApertura: record.horaIngreso || new Date().toTimeString().slice(0, 5),
    modalidad: "Virtual en vivo",
    asistentesPuntuales: [],
    tardanzas: [],
    ausentes: []
  };
  await requestAsistencia("/asistencia/sesiones", {
    method: "POST",
    body: JSON.stringify(session)
  });
  return session;
}
