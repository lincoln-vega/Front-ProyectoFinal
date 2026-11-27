import { getApiAccessToken } from "../lib/supabase";
import { getApiBaseUrl } from "../lib/apiUrl";

export const DEFAULT_AREAS = [
  {
    id: "AREA-EXA",
    codigo: "CIENCIAS-EXACTAS",
    nombre: "Ciencias Exactas e Ingenierías",
    descripcion: "Matemáticas, Física, Química, Computación e ingenierías afines",
    color: "#2563EB",
    estado: "Activo"
  },
  {
    id: "AREA-MED",
    codigo: "CIENCIAS-MEDICAS",
    nombre: "Ciencias Médicas y de la Salud",
    descripcion: "Medicina Humana, Enfermería, Odontología, Biología y afines",
    color: "#DC2626",
    estado: "Activo"
  },
  {
    id: "AREA-GES",
    codigo: "GESTION",
    nombre: "Gestión Institucional y Empresarial",
    descripcion: "Administración, Economía, Contabilidad y Dirección",
    color: "#059669",
    estado: "Activo"
  },
  {
    id: "AREA-HUM",
    codigo: "HUMANIDADES",
    nombre: "Humanidades y Ciencias Sociales",
    descripcion: "Derecho, Literatura, Historia, Filosofía y afines",
    color: "#7C3AED",
    estado: "Activo"
  }
];

export const DEFAULT_CARRERAS = [
  // Área 1: Ciencias Exactas e Ingenierías
  {
    id: "CAR-001",
    codigo: "ING-SIS",
    nombre: "Ingeniería de Sistemas",
    area_id: "AREA-EXA",
    area_nombre: "Ciencias Exactas e Ingenierías",
    descripcion: "Ingeniería orientada al software, cloud y sistemas computacionales.",
    duracion_anios: 5,
    grado_academico: "Ingeniero de Sistemas",
    universidades_objetivo: ["UNI", "UNMSM", "PUCP"],
    estado: "Activo"
  },
  {
    id: "CAR-002",
    codigo: "ING-IND",
    nombre: "Ingeniería Industrial",
    area_id: "AREA-EXA",
    area_nombre: "Ciencias Exactas e Ingenierías",
    descripcion: "Optimización de procesos productivos y dirección de operaciones.",
    duracion_anios: 5,
    grado_academico: "Ingeniero Industrial",
    universidades_objetivo: ["UNI", "UNMSM", "ULIMA"],
    estado: "Activo"
  },
  {
    id: "CAR-003",
    codigo: "ING-CIV",
    nombre: "Ingeniería Civil",
    area_id: "AREA-EXA",
    area_nombre: "Ciencias Exactas e Ingenierías",
    descripcion: "Diseño, cálculo estructural y dirección de obras de infraestructura.",
    duracion_anios: 5,
    grado_academico: "Ingeniero Civil",
    universidades_objetivo: ["UNI", "PUCP", "UNMSM"],
    estado: "Activo"
  },
  {
    id: "CAR-004",
    codigo: "MAT-PUR",
    nombre: "Matemáticas",
    area_id: "AREA-EXA",
    area_nombre: "Ciencias Exactas e Ingenierías",
    descripcion: "Modelado cuantitativo, análisis matemático y computación numérica.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Matemáticas",
    universidades_objetivo: ["UNMSM", "UNI"],
    estado: "Activo"
  },
  {
    id: "CAR-005",
    codigo: "FIS-PUR",
    nombre: "Física",
    area_id: "AREA-EXA",
    area_nombre: "Ciencias Exactas e Ingenierías",
    descripcion: "Leyes físicas, mecánica clásica y cuántica y física de materiales.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Física",
    universidades_objetivo: ["UNI", "UNMSM"],
    estado: "Activo"
  },

  // Área 2: Ciencias Médicas y de la Salud
  {
    id: "CAR-006",
    codigo: "MED-HUM",
    nombre: "Medicina Humana",
    area_id: "AREA-MED",
    area_nombre: "Ciencias Médicas y de la Salud",
    descripcion: "Programa de formación médica y ciencias de la salud.",
    duracion_anios: 7,
    grado_academico: "Médico Cirujano",
    universidades_objetivo: ["UNMSM", "UPCH", "UNFV"],
    estado: "Activo"
  },
  {
    id: "CAR-007",
    codigo: "ENF-SAL",
    nombre: "Enfermería",
    area_id: "AREA-MED",
    area_nombre: "Ciencias Médicas y de la Salud",
    descripcion: "Cuidado clínico, atención hospitalaria y salud pública preventiva.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Enfermería",
    universidades_objetivo: ["UNMSM", "UPCH"],
    estado: "Activo"
  },
  {
    id: "CAR-008",
    codigo: "ODO-SAL",
    nombre: "Odontología",
    area_id: "AREA-MED",
    area_nombre: "Ciencias Médicas y de la Salud",
    descripcion: "Salud bucal, cirugía bucomaxilofacial y rehabilitación oral.",
    duracion_anios: 5,
    grado_academico: "Cirujano Dentista",
    universidades_objetivo: ["UNMSM", "UPCH"],
    estado: "Activo"
  },
  {
    id: "CAR-009",
    codigo: "BIO-SAL",
    nombre: "Biología",
    area_id: "AREA-MED",
    area_nombre: "Ciencias Médicas y de la Salud",
    descripcion: "Biotecnología, genética, microbiología y ciencias moleculares.",
    duracion_anios: 5,
    grado_academico: "Biólogo",
    universidades_objetivo: ["UNMSM", "UPCH"],
    estado: "Activo"
  },

  // Área 3: Gestión Institucional y Empresarial
  {
    id: "CAR-010",
    codigo: "ADM-EMP",
    nombre: "Administración",
    area_id: "AREA-GES",
    area_nombre: "Gestión Institucional y Empresarial",
    descripcion: "Gestión directiva, planeamiento estratégico y desarrollo organizacional.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Administración",
    universidades_objetivo: ["UNMSM", "UP", "ULIMA"],
    estado: "Activo"
  },
  {
    id: "CAR-011",
    codigo: "ECO-GES",
    nombre: "Economía",
    area_id: "AREA-GES",
    area_nombre: "Gestión Institucional y Empresarial",
    descripcion: "Econometría, finanzas corporativas, políticas macroeconómicas.",
    duracion_anios: 5,
    grado_academico: "Economista",
    universidades_objetivo: ["UP", "UNMSM", "PUCP"],
    estado: "Activo"
  },
  {
    id: "CAR-012",
    codigo: "CON-FIN",
    nombre: "Contabilidad",
    area_id: "AREA-GES",
    area_nombre: "Gestión Institucional y Empresarial",
    descripcion: "Auditoría tributaria, finanzas y control contable institucional.",
    duracion_anios: 5,
    grado_academico: "Contador Público",
    universidades_objetivo: ["UNMSM", "PUCP"],
    estado: "Activo"
  },
  {
    id: "CAR-013",
    codigo: "DIR-EMP",
    nombre: "Dirección de Empresas",
    area_id: "AREA-GES",
    area_nombre: "Gestión Institucional y Empresarial",
    descripcion: "Emprendimiento corporativo, finanzas y gestión de negocios.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Dirección de Empresas",
    universidades_objetivo: ["UP", "ULIMA"],
    estado: "Activo"
  },

  // Área 4: Humanidades y Ciencias Sociales
  {
    id: "CAR-014",
    codigo: "DER-POL",
    nombre: "Derecho y Ciencias Políticas",
    area_id: "AREA-HUM",
    area_nombre: "Humanidades y Ciencias Sociales",
    descripcion: "Ciencias jurídicas, legislación pública y litigio civil y penal.",
    duracion_anios: 6,
    grado_academico: "Abogado",
    universidades_objetivo: ["PUCP", "UNMSM"],
    estado: "Activo"
  },
  {
    id: "CAR-015",
    codigo: "EDU-PED",
    nombre: "Educación",
    area_id: "AREA-HUM",
    area_nombre: "Humanidades y Ciencias Sociales",
    descripcion: "Pedagogía contemporánea, docencia y diseño curricular.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Educación",
    universidades_objetivo: ["UNMSM", "PUCP"],
    estado: "Activo"
  },
  {
    id: "CAR-016",
    codigo: "PSI-HUM",
    nombre: "Psicología",
    area_id: "AREA-HUM",
    area_nombre: "Humanidades y Ciencias Sociales",
    descripcion: "Comportamiento humano, psicología clínica y organizacional.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Psicología",
    universidades_objetivo: ["UNMSM", "PUCP", "UPCH"],
    estado: "Activo"
  },
  {
    id: "CAR-017",
    codigo: "LIT-HUM",
    nombre: "Literatura",
    area_id: "AREA-HUM",
    area_nombre: "Humanidades y Ciencias Sociales",
    descripcion: "Estudios literarios, redacción editorial y crítica cultural.",
    duracion_anios: 5,
    grado_academico: "Licenciado en Literatura",
    universidades_objetivo: ["UNMSM", "PUCP"],
    estado: "Activo"
  }
];

export const matchArea = (areaNameOrId, areasList = DEFAULT_AREAS) => {
  if (!areaNameOrId) return areasList[0] || null;
  const clean = String(areaNameOrId).trim().toLowerCase();

  const activeAreas = Array.isArray(areasList) && areasList.length > 0 ? areasList : DEFAULT_AREAS;

  // 1. Coincidencia exacta por nombre, id o código
  let found = activeAreas.find((a) =>
    (a.nombre && a.nombre.toLowerCase().trim() === clean) ||
    (a.id && a.id.toLowerCase() === clean) ||
    (a.codigo && a.codigo.toLowerCase() === clean)
  );
  if (found) return found;

  // 2. Coincidencia por alias conocidos en la base de datos
  if (clean.includes("exact") || clean.includes("ing") || clean.includes("basica")) {
    found = activeAreas.find((a) =>
      (a.codigo || "").includes("EXACT") || (a.nombre || "").toLowerCase().includes("exact")
    );
  } else if (clean.includes("med") || clean.includes("salud")) {
    found = activeAreas.find((a) =>
      (a.codigo || "").includes("MED") || (a.nombre || "").toLowerCase().includes("salud")
    );
  } else if (clean.includes("gest") || clean.includes("econ") || clean.includes("empresa") || clean.includes("admin")) {
    found = activeAreas.find((a) =>
      (a.codigo || "").includes("GES") || (a.nombre || "").toLowerCase().includes("gest")
    );
  } else if (clean.includes("hum") || clean.includes("social") || clean.includes("letra") || clean.includes("jurid")) {
    found = activeAreas.find((a) =>
      (a.codigo || "").includes("HUM") || (a.nombre || "").toLowerCase().includes("hum")
    );
  }
  return found || activeAreas[0] || null;
};

export const getCareersForArea = (areaNameOrId, dbCarreras = [], dbAreas = DEFAULT_AREAS) => {
  const matchedArea = matchArea(areaNameOrId, dbAreas);
  if (!matchedArea) return DEFAULT_CARRERAS;

  const areaId = matchedArea.id;
  const areaCode = matchedArea.codigo;
  const areaName = (matchedArea.nombre || "").toLowerCase();

  const allCarreras = Array.isArray(dbCarreras) && dbCarreras.length > 0 ? dbCarreras : DEFAULT_CARRERAS;

  const matched = allCarreras.filter((c) => {
    if (c.area_id && (c.area_id === areaId || c.area_id === areaCode)) return true;
    if (c.area_nombre && c.area_nombre.toLowerCase() === areaName) return true;
    const cArea = String(c.area || c.areaAcademica || "").toLowerCase();
    if (cArea && (cArea === areaName || areaName.includes(cArea) || cArea.includes(areaName))) return true;
    return false;
  });

  if (matched.length > 0) return matched;

  // Respaldo garantizado desde DEFAULT_CARRERAS
  return DEFAULT_CARRERAS.filter((c) => c.area_id === areaId || c.area_nombre?.toLowerCase() === areaName);
};

const DEFAULT_TIPOS_CICLO = [
  {
    id: "TCIC-SEM",
    codigo: "SEMESTRAL",
    nombre: "Semestral",
    duracion_semanas: 24,
    modalidad: "Virtual",
    descripcion: "Preparación semestral intensiva con desarrollo temático completo.",
    estado: "Activo"
  },
  {
    id: "TCIC-ANU",
    codigo: "ANUAL",
    nombre: "Anual",
    duracion_semanas: 44,
    modalidad: "Virtual",
    descripcion: "Preparación anual integral desde nivel cero hasta avanzado.",
    estado: "Activo"
  },
  {
    id: "TCIC-INT",
    codigo: "INTENSIVO",
    nombre: "Intensivo",
    duracion_semanas: 8,
    modalidad: "Virtual",
    descripcion: "Ciclo rápido y condensado de verano o repaso.",
    estado: "Activo"
  },
  {
    id: "TCIC-ESC",
    codigo: "ESCOLAR",
    nombre: "Reforzamiento Escolar",
    duracion_semanas: 12,
    modalidad: "Virtual",
    descripcion: "Nivelación para escolares de 4to y 5to de secundaria.",
    estado: "Activo"
  }
];

const DEFAULT_CICLOS = [
  {
    id: "CIC-2026-SEM-1",
    codigo: "2026-SEM-I",
    nombre: "Semestral 2026-I",
    tipo_ciclo_id: "TCIC-SEM",
    anio: 2026,
    periodo: "I",
    fecha_inicio: "2026-01-15",
    fecha_fin: "2026-07-31",
    costo_matricula: 100,
    costo_pension_mensual: 300,
    costo_total_contado: 1800,
    es_vigente: true,
    estado: "En Curso"
  },
  {
    id: "CIC-2026-ANU",
    codigo: "2026-ANU",
    nombre: "Anual 2026",
    tipo_ciclo_id: "TCIC-ANU",
    anio: 2026,
    periodo: "Anual",
    fecha_inicio: "2026-03-01",
    fecha_fin: "2026-12-20",
    costo_matricula: 120,
    costo_pension_mensual: 280,
    costo_total_contado: 2500,
    es_vigente: false,
    estado: "En Curso"
  }
];

const DEFAULT_TURNOS = [
  {
    id: "TUR-MAN",
    codigo: "MANANA",
    nombre: "Mañana",
    hora_inicio: "08:00",
    hora_fin: "13:00",
    estado: "Activo"
  },
  {
    id: "TUR-TAR",
    codigo: "TARDE",
    nombre: "Tarde",
    hora_inicio: "14:00",
    hora_fin: "19:00",
    estado: "Activo"
  },
  {
    id: "TUR-NOC",
    codigo: "NOCHE",
    nombre: "Noche",
    hora_inicio: "18:00",
    hora_fin: "22:00",
    estado: "Activo"
  }
];

// In-memory cache synced with backend
let localAreas = [...DEFAULT_AREAS];
let localCarreras = [...DEFAULT_CARRERAS];
let localTiposCiclo = [...DEFAULT_TIPOS_CICLO];
let localCiclos = [...DEFAULT_CICLOS];
let localTurnos = [...DEFAULT_TURNOS];

async function apiFetch(path, options = {}) {
  const url = `${getApiBaseUrl()}${path}`;
  const token = getApiAccessToken();
  const headers = {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };
  const response = await fetch(url, {
    ...options,
    headers
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    const message = errorData.detail?.mensaje || errorData.detail || `Error en ${path}: ${response.statusText}`;
    throw new Error(typeof message === "string" ? message : JSON.stringify(message));
  }

  return response.json();
}

export const academicosService = {
  // Áreas Académicas
  async getAreas() {
    try {
      const data = await apiFetch("/academicos/areas");
      if (Array.isArray(data) && data.length > 0) {
        localAreas = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando respaldo local para áreas:", err.message);
    }
    return localAreas;
  },

  async createArea(areaData) {
    const payload = {
      id: areaData.id || `AREA-${areaData.codigo?.slice(0, 3)?.toUpperCase() || Date.now().toString().slice(-3)}`,
      codigo: areaData.codigo?.trim().toUpperCase(),
      nombre: areaData.nombre?.trim(),
      descripcion: areaData.descripcion?.trim() || null,
      color: areaData.color || "#2563EB",
      estado: areaData.estado || "Activo"
    };

    const created = await apiFetch("/academicos/areas", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localAreas = [created, ...localAreas.filter((a) => a.id !== created.id)];
    return created;
  },

  // Carreras
  async getCarreras() {
    try {
      const data = await apiFetch("/academicos/carreras");
      if (Array.isArray(data) && data.length > 0) {
        localCarreras = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando respaldo local para carreras:", err.message);
    }
    return localCarreras;
  },

  async createCarrera(carreraData) {
    const payload = {
      id: carreraData.id || `CAR-${Date.now().toString().slice(-3)}`,
      codigo: carreraData.codigo?.trim().toUpperCase(),
      nombre: carreraData.nombre?.trim(),
      area_id: carreraData.area_id,
      descripcion: carreraData.descripcion?.trim() || null,
      duracion_anios: Number(carreraData.duracion_anios) || 5,
      grado_academico: carreraData.grado_academico || "Bachiller / Título Profesional",
      universidades_objetivo: Array.isArray(carreraData.universidades_objetivo)
        ? carreraData.universidades_objetivo
        : (carreraData.universidades_objetivo || "").split(",").map((u) => u.trim()).filter(Boolean),
      estado: carreraData.estado || "Activo"
    };

    const created = await apiFetch("/academicos/carreras", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localCarreras = [created, ...localCarreras.filter((c) => c.id !== created.id)];
    return created;
  },

  // Tipos de Ciclo
  async getTiposCiclo() {
    try {
      const data = await apiFetch("/academicos/tipos-ciclo");
      if (Array.isArray(data) && data.length > 0) {
        localTiposCiclo = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando respaldo local para tipos de ciclo:", err.message);
    }
    return localTiposCiclo;
  },

  async createTipoCiclo(tipoCicloData) {
    const payload = {
      id: tipoCicloData.id || `TCIC-${tipoCicloData.codigo?.slice(0, 3)?.toUpperCase() || Date.now().toString().slice(-3)}`,
      codigo: tipoCicloData.codigo?.trim().toUpperCase(),
      nombre: tipoCicloData.nombre?.trim(),
      duracion_semanas: Number(tipoCicloData.duracion_semanas) || 16,
      modalidad: tipoCicloData.modalidad || "Virtual",
      descripcion: tipoCicloData.descripcion?.trim() || null,
      estado: tipoCicloData.estado || "Activo"
    };

    const created = await apiFetch("/academicos/tipos-ciclo", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localTiposCiclo = [created, ...localTiposCiclo.filter((t) => t.id !== created.id)];
    return created;
  },

  // Ciclos Académicos
  async getCiclos() {
    try {
      const data = await apiFetch("/academicos/ciclos");
      if (Array.isArray(data) && data.length > 0) {
        localCiclos = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando respaldo local para ciclos:", err.message);
    }
    return localCiclos;
  },

  async createCiclo(cicloData) {
    const payload = {
      id: cicloData.id || `CIC-${cicloData.anio || 2026}-${Date.now().toString().slice(-4)}`,
      codigo: cicloData.codigo?.trim().toUpperCase(),
      nombre: cicloData.nombre?.trim(),
      tipo_ciclo_id: cicloData.tipo_ciclo_id,
      anio: Number(cicloData.anio) || 2026,
      periodo: cicloData.periodo || "I",
      fecha_inicio: cicloData.fecha_inicio,
      fecha_fin: cicloData.fecha_fin,
      costo_matricula: Number(cicloData.costo_matricula) || 0,
      costo_pension_mensual: Number(cicloData.costo_pension_mensual) || 0,
      costo_total_contado: Number(cicloData.costo_total_contado) || 0,
      es_vigente: Boolean(cicloData.es_vigente),
      estado: cicloData.estado || "En Curso"
    };

    const created = await apiFetch("/academicos/ciclos", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    localCiclos = [created, ...localCiclos.filter((c) => c.id !== created.id)];
    return created;
  },

  // Turnos
  async getTurnos() {
    try {
      const data = await apiFetch("/academicos/turnos");
      if (Array.isArray(data) && data.length > 0) {
        localTurnos = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando respaldo local para turnos:", err.message);
    }
    return localTurnos;
  },

  async createTurno(turnoData) {
    const payload = {
      id: turnoData.id || `TUR-${turnoData.nombre?.slice(0, 3)?.toUpperCase() || Date.now().toString().slice(-3)}`,
      codigo: turnoData.codigo?.trim().toUpperCase(),
      nombre: turnoData.nombre?.trim(),
      hora_inicio: turnoData.hora_inicio,
      hora_fin: turnoData.hora_fin,
      estado: turnoData.estado || "Activo"
    };

    try {
      const created = await apiFetch("/academicos/turnos", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localTurnos = [created, ...localTurnos.filter(t => t.id !== created.id)];
      return created;
    } catch (err) {
      console.warn("[AcademicosService] Fallback local para guardar turno:", err.message);
      localTurnos = [payload, ...localTurnos.filter(t => t.id !== payload.id)];
      return payload;
    }
  },

  // Oferta Académica Combinada
  async getOfertaAcademica() {
    try {
      return await apiFetch("/academicos/oferta");
    } catch (err) {
      console.warn("[AcademicosService] Fallback local oferta académica:", err.message);
      return {
        areas: localAreas,
        carreras: localCarreras,
        tipos_ciclo: localTiposCiclo,
        ciclos: localCiclos,
        turnos: localTurnos
      };
    }
  }
};
