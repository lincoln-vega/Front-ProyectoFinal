export const initialTeacherIncidents = [
  {
    id: "INC-D01",
    docente: "Prof. Roberto Morales",
    dni: "41235678",
    correo: "r.morales@academia.edu.pe",
    tipo: "Tardanza (+20 min)",
    fechaPresentacion: "Hoy 08:35 AM",
    materia: "Física Fundamental (Meet-02)",
    horario: "08:00 a 09:30 AM (Turno Mañana)",
    motivo: "Inconvenientes con el proveedor de fibra óptica de la zona y caída imprevista del servicio de Internet residencial a las 08:12 AM.",
    archivoNombre: "reporte_tecnico_fibra.pdf",
    estado: "Pendiente" // Pendiente, Aprobado, Rechazado
  },
  {
    id: "INC-D02",
    docente: "Mg. Carmen Rosa Herrera",
    dni: "45678912",
    correo: "c.herrera@academia.edu.pe",
    tipo: "Inasistencia Inesperada",
    fechaPresentacion: "Hoy 07:45 AM",
    materia: "Álgebra y Funciones (Meet-01)",
    horario: "08:00 a 10:00 AM (Turno Mañana)",
    motivo: "Emergencia médica odontológica de urgencia por fuerte infección aguda. Adjunto constancia y receta de atención en EsSalud.",
    archivoNombre: "constancia_medica_essalud.pdf",
    estado: "Pendiente"
  },
  {
    id: "INC-D03",
    docente: "Ing. Carlos Alva",
    dni: "42891234",
    correo: "c.alva@academia.edu.pe",
    tipo: "Tardanza (+15 min)",
    fechaPresentacion: "Ayer 03:10 PM",
    materia: "Geometría y Trigonometría (Meet-C3)",
    horario: "03:00 a 05:00 PM (Turno Tarde)",
    motivo: "Demora en el tráfico vehicular al retornar de la sede central hacia el estudio de transmisión virtual.",
    archivoNombre: "declaracion_jurada_transito.pdf",
    estado: "Pendiente"
  }
];

export const getStoredIncidents = () => {
  const stored = localStorage.getItem("academia_teacher_incidents");
  if (!stored) {
    localStorage.setItem("academia_teacher_incidents", JSON.stringify(initialTeacherIncidents));
    return initialTeacherIncidents;
  }
  try {
    return JSON.parse(stored);
  } catch (error) {
    console.error("Error al leer incidencias de docentes:", error);
    return initialTeacherIncidents;
  }
};

export const saveStoredIncidents = (incidents) => {
  localStorage.setItem("academia_teacher_incidents", JSON.stringify(incidents));
};