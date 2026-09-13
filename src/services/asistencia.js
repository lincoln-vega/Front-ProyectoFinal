// Obtener todas las asistencias guardadas
export function getStoredAttendances() {
  const data = localStorage.getItem("db_studentAttendance_extra");
  return data ? JSON.parse(data) : [];
}

// Guardar una nueva asistencia
export function saveAttendanceRecord(record) {
  const attendances = getStoredAttendances();
  attendances.unshift(record); // Lo agrega al principio
  localStorage.setItem("db_studentAttendance_extra", JSON.stringify(attendances));
  return attendances;
}