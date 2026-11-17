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

export const ACADEMIC_CYCLES = [
  "Semestral",
  "Anual",
  "Intensivo",
  "Reforzamiento Escolar",
  "Repaso"
];

export const getCareersByArea = (area = "") => {
  if (!area) return CAREERS;
  if (AREA_CAREERS[area]) return AREA_CAREERS[area];
  const found = Object.keys(AREA_CAREERS).find((k) =>
    k.toLowerCase().includes(area.toLowerCase()) || area.toLowerCase().includes(k.toLowerCase())
  );
  return found ? AREA_CAREERS[found] : CAREERS;
};

export const inferAreaForCareer = (career = "") => {
  if (!career) return ACADEMIC_AREAS[0];
  for (const [area, careers] of Object.entries(AREA_CAREERS)) {
    if (careers.some(c => c.toLowerCase() === career.toLowerCase() || career.toLowerCase().includes(c.toLowerCase()) || c.toLowerCase().includes(career.toLowerCase()))) {
      const matched = ACADEMIC_AREAS.find(a => a.toLowerCase() === area.toLowerCase() || area.toLowerCase().includes(a.toLowerCase()) || a.toLowerCase().includes(area.toLowerCase()));
      if (matched) return matched;
      return area;
    }
  }
  const lower = career.toLowerCase();
  if (lower.includes("med") || lower.includes("salud") || lower.includes("bio") || lower.includes("enf") || lower.includes("odon")) {
    return "Ciencias Médicas y de la Salud";
  }
  if (lower.includes("ing") || lower.includes("sist") || lower.includes("mat") || lower.includes("fis") || lower.includes("quim") || lower.includes("alg")) {
    return "Ciencias Exactas e Ingenierías";
  }
  if (lower.includes("adm") || lower.includes("econ") || lower.includes("cont") || lower.includes("dir") || lower.includes("gest")) {
    return "Gestión Institucional y Empresarial";
  }
  return "Humanidades y Ciencias Sociales";
};
