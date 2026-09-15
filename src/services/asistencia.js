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