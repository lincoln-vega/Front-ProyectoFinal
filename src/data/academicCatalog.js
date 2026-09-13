export const UNIVERSITY_CAREERS = {
  UNMSM: [
    "A: Cie"
  ],
};

export const AREA_CAREERS = [
    "A: Ciencias de la Salud",
    "B: Ciencias Básicas",
    "C: Ingenierías",
    "D: Ciencias Económicas y de la Gestión",
    "E: Humanidades y Ciencias Jurídicas y Sociales",
];


export const UNIVERSITIES = Object.keys(UNIVERSITY_CAREERS);

export const getUniversityFromCareer = (career = "") => {
  const match = career.match(/\(([^)]+)\)$/);
  return match?.[1] || "";
};

export const getCareerName = (career = "") => career.replace(/\s*\([^)]*\)$/, "").trim();
