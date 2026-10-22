export const AREA_CAREERS = {
  "Ciencias de la Salud": ["Medicina Humana", "Enfermería"],
  "Ciencias Básicas": ["Matemáticas", "Física"],
  "Ingenierías":  ["Ingeniería de Sistemas", "Ingeniería Civil"],
  "Ciencias Económicas y de la Gestión": ["Derecho", "Comunicación"],
  "Humanidades y Ciencias Jurídicas y Sociales": ["Derecho","Educación","Psicología"]
};

export const ACADEMIC_AREAS = Object.keys(AREA_CAREERS);
export const CAREERS = [...new Set(Object.values(AREA_CAREERS).flat())];
export const getCareersByArea = (area = "") => AREA_CAREERS[area] || [];
