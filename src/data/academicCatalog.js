export const AREA_CAREERS = {
  "Ciencias Exactas e Ingenierías": ["Ingeniería de Sistemas", "Ingeniería Industrial", "Matemáticas", "Física", "Ingeniería Civil"],
  "Ciencias Médicas y de la Salud": ["Medicina Humana", "Enfermería", "Odontología", "Biología"],
  "Gestión Institucional y Empresarial": ["Administración", "Economía", "Contabilidad", "Dirección de Empresas"],
  "Humanidades y Ciencias Sociales": ["Derecho y Ciencias Políticas", "Educación", "Psicología", "Literatura"],
  // Nombres previos para compatibilidad
  "Ciencias de la Salud": ["Medicina Humana", "Enfermería", "Odontología"],
  "Ciencias Básicas": ["Matemáticas", "Física"],
  "Ingenierías": ["Ingeniería de Sistemas", "Ingeniería Industrial", "Ingeniería Civil"],
  "Ciencias Económicas y de la Gestión": ["Administración", "Economía", "Contabilidad"],
  "Humanidades y Ciencias Jurídicas y Sociales": ["Derecho y Ciencias Políticas", "Educación", "Psicología"]
};

export const ACADEMIC_AREAS = [
  "Ciencias Exactas e Ingenierías",
  "Ciencias Médicas y de la Salud",
  "Gestión Institucional y Empresarial",
  "Humanidades y Ciencias Sociales"
];

export const CAREERS = [...new Set(Object.values(AREA_CAREERS).flat())];

export const getCareersByArea = (area = "") => {
  if (!area) return CAREERS;
  if (AREA_CAREERS[area]) return AREA_CAREERS[area];
  const found = Object.keys(AREA_CAREERS).find((k) =>
    k.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(k.toLowerCase())
  );
  return found ? AREA_CAREERS[found] : CAREERS;
};
