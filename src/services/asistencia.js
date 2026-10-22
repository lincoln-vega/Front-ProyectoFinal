import { insforge } from "../lib/insforge";

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
  const { error } = await insforge.functions.invoke("marcar-asistencia", {
    body: {
      sesion_id: record.sesion_id || "ATT-SES-001",
      estudianteId: record.estudianteId || record.id || "USR-005",
      estudiante: record.estudiante || record.nombre || "Estudiante",
      horaRegistro: record.horaRegistro || record.hora || new Date().toTimeString().slice(0, 5)
    }
  });
  throwIfError(error, "marcar asistencia con InsForge");
  return record;
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
