import { insforge } from "../lib/insforge";

// Obtener todas las asistencias guardadas (con sincronización background)
export function getStoredAttendances() {
  const data = localStorage.getItem("db_studentAttendance_extra");
  
  // Sincronizar sesiones en InsForge
  insforge.database.from("attendance_sessions").select("*").then(({ data: sessions, error }) => {
    if (!error && sessions) {
      localStorage.setItem("db_attendanceSessions_cloud", JSON.stringify(sessions));
    }
  }).catch(console.warn);

  return data ? JSON.parse(data) : [];
}

// Guardar una nueva asistencia de estudiante (llama a Edge Function de marcación inteligente)
export async function saveAttendanceRecord(record) {
  const attendances = getStoredAttendances();
  attendances.unshift(record);
  localStorage.setItem("db_studentAttendance_extra", JSON.stringify(attendances));

  try {
    // Si viene con sesion_id, ejecutamos la regla de negocio de tolerancia automática en el Edge
    if (record.cursoId || record.sesion_id) {
      await insforge.functions.invoke("marcar-asistencia", {
        body: {
          sesion_id: record.sesion_id || "ATT-SES-001",
          estudianteId: record.estudianteId || record.id || "USR-005",
          estudiante: record.estudiante || record.nombre || "Estudiante",
          horaRegistro: record.horaRegistro || record.hora || new Date().toTimeString().slice(0, 5)
        }
      });
    }
  } catch (err) {
    console.error("[InsForge] Error al marcar asistencia en Edge Function:", err);
  }

  return attendances;
}

export function getTeacherAttendances() {
  const data = localStorage.getItem("db_teacherAttendance");
  return data ? JSON.parse(data) : [];
}

export function saveTeacherAttendance(record) {
  const attendances = getTeacherAttendances();
  const sameSession = attendances.find((item) =>
    item.docenteId === record.docenteId && item.cursoId === record.cursoId && item.fecha === record.fecha
  );

  if (sameSession) return attendances;
  attendances.unshift(record);
  localStorage.setItem("db_teacherAttendance", JSON.stringify(attendances));
  return attendances;
}