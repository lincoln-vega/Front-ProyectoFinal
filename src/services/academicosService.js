import { insforge } from "../lib/insforge";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://portal-backend-5adf751c-968e-487d-92f9-672da789d8b3.fly.dev";

const DEFAULT_AREAS = [
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

const DEFAULT_CARRERAS = [
  {
    id: "CAR-001",
    codigo: "MED-HUM",
    nombre: "Medicina Humana",
    area_id: "AREA-MED",
    descripcion: "Programa de formación médica y ciencias de la salud.",
    duracion_anios: 7,
    grado_academico: "Médico Cirujano",
    universidades_objetivo: ["UNMSM", "UPCH", "UNFV"],
    estado: "Activo"
  },
  {
    id: "CAR-002",
    codigo: "ING-SIS",
    nombre: "Ingeniería de Sistemas",
    area_id: "AREA-EXA",
    descripcion: "Ingeniería orientada al software, cloud y sistemas computacionales.",
    duracion_anios: 5,
    grado_academico: "Ingeniero de Sistemas",
    universidades_objetivo: ["UNI", "UNMSM", "PUCP"],
    estado: "Activo"
  },
  {
    id: "CAR-003",
    codigo: "DER-POL",
    nombre: "Derecho y Ciencias Políticas",
    area_id: "AREA-HUM",
    descripcion: "Ciencias jurídicas, legislación pública y litigio civil y penal.",
    duracion_anios: 6,
    grado_academico: "Abogado",
    universidades_objetivo: ["PUCP", "UNMSM"],
    estado: "Activo"
  },
  {
    id: "CAR-004",
    codigo: "ING-IND",
    nombre: "Ingeniería Industrial",
    area_id: "AREA-EXA",
    descripcion: "Optimización de procesos productivos y dirección de operaciones.",
    duracion_anios: 5,
    grado_academico: "Ingeniero Industrial",
    universidades_objetivo: ["UNI", "UNMSM", "ULIMA"],
    estado: "Activo"
  }
];

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
  const url = `${BACKEND_URL}${path}`;
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
      ...(options.headers || {})
    },
    ...options
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
      const { data, error } = await insforge.database
        .from("areas_academicas")
        .select("*")
        .order("nombre");
      if (!error && Array.isArray(data) && data.length > 0) {
        localAreas = data;
        return data;
      }
    } catch {}

    try {
      const data = await apiFetch("/academicos/areas");
      if (Array.isArray(data) && data.length > 0) {
        localAreas = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando fallback local para áreas:", err.message);
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

    try {
      await insforge.database.from("areas_academicas").upsert([payload]);
    } catch {}

    try {
      const created = await apiFetch("/academicos/areas", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localAreas = [created, ...localAreas.filter(a => a.id !== created.id)];
      return created;
    } catch (err) {
      console.warn("[AcademicosService] Fallback local para guardar área:", err.message);
      localAreas = [payload, ...localAreas.filter(a => a.id !== payload.id)];
      return payload;
    }
  },

  // Carreras
  async getCarreras() {
    try {
      const { data, error } = await insforge.database
        .from("carreras")
        .select("*")
        .order("nombre");
      if (!error && Array.isArray(data) && data.length > 0) {
        localCarreras = data;
        return data;
      }
    } catch {}

    try {
      const data = await apiFetch("/academicos/carreras");
      if (Array.isArray(data) && data.length > 0) {
        localCarreras = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando fallback local para carreras:", err.message);
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
        : (carreraData.universidades_objetivo || "").split(",").map(u => u.trim()).filter(Boolean),
      estado: carreraData.estado || "Activo"
    };

    try {
      await insforge.database.from("carreras").upsert([payload]);
    } catch {}

    try {
      const created = await apiFetch("/academicos/carreras", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localCarreras = [created, ...localCarreras.filter(c => c.id !== created.id)];
      return created;
    } catch (err) {
      console.warn("[AcademicosService] Fallback local para guardar carrera:", err.message);
      localCarreras = [payload, ...localCarreras.filter(c => c.id !== payload.id)];
      return payload;
    }
  },

  // Tipos de Ciclo
  async getTiposCiclo() {
    try {
      const { data, error } = await insforge.database
        .from("tipos_ciclo")
        .select("*")
        .order("nombre");
      if (!error && Array.isArray(data) && data.length > 0) {
        localTiposCiclo = data;
        return data;
      }
    } catch {}

    try {
      const data = await apiFetch("/academicos/tipos-ciclo");
      if (Array.isArray(data) && data.length > 0) {
        localTiposCiclo = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando fallback local para tipos de ciclo:", err.message);
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

    try {
      await insforge.database.from("tipos_ciclo").upsert([payload]);
    } catch {}

    try {
      const created = await apiFetch("/academicos/tipos-ciclo", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localTiposCiclo = [created, ...localTiposCiclo.filter(t => t.id !== created.id)];
      return created;
    } catch (err) {
      console.warn("[AcademicosService] Fallback local para guardar tipo ciclo:", err.message);
      localTiposCiclo = [payload, ...localTiposCiclo.filter(t => t.id !== payload.id)];
      return payload;
    }
  },

  // Ciclos Académicos
  async getCiclos() {
    try {
      const { data, error } = await insforge.database
        .from("ciclos_academicos")
        .select("*")
        .order("nombre");
      if (!error && Array.isArray(data) && data.length > 0) {
        localCiclos = data;
        return data;
      }
    } catch {}

    try {
      const data = await apiFetch("/academicos/ciclos");
      if (Array.isArray(data) && data.length > 0) {
        localCiclos = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando fallback local para ciclos:", err.message);
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

    try {
      await insforge.database.from("ciclos_academicos").upsert([payload]);
    } catch {}

    try {
      const created = await apiFetch("/academicos/ciclos", {
        method: "POST",
        body: JSON.stringify(payload)
      });
      localCiclos = [created, ...localCiclos.filter(c => c.id !== created.id)];
      return created;
    } catch (err) {
      console.warn("[AcademicosService] Fallback local para guardar ciclo:", err.message);
      localCiclos = [payload, ...localCiclos.filter(c => c.id !== payload.id)];
      return payload;
    }
  },

  // Turnos
  async getTurnos() {
    try {
      const { data, error } = await insforge.database
        .from("turnos")
        .select("*")
        .order("nombre");
      if (!error && Array.isArray(data) && data.length > 0) {
        localTurnos = data;
        return data;
      }
    } catch {}

    try {
      const data = await apiFetch("/academicos/turnos");
      if (Array.isArray(data) && data.length > 0) {
        localTurnos = data;
        return data;
      }
    } catch (err) {
      console.warn("[AcademicosService] Usando fallback local para turnos:", err.message);
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
