import { insforge } from "../lib/insforge";
import db from "../data/db.json";
import { inferAreaForCareer } from "../data/academicCatalog";
export { courseService } from "./cursosServices";
export { academicosService } from "./academicosService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://portal-backend-5adf751c-968e-487d-92f9-672da789d8b3.fly.dev";
const STORAGE_KEY_USERS = "academia_users";

const SYSTEM_ROLES = ["Admin", "Docente", "Estudiante"];
const USER_COLUMNS = [
  "id",
  "apellidos",
  "nombres",
  "tipoDocumento",
  "dni",
  "fechaNacimiento",
  "correo",
  "celular",
  "carreraObjetivo",
  "areaAcademica",
  "rol",
  "estado",
  "cursosAsignados",
  "cursosInscritos",
  "created_at",
  "ciclovirtual",
  "salario"
].join(", ");

const normalizeUser = (user) => {
  if (!user) return user;
  const ciclo = user.cicloVirtual || user.ciclovirtual || "Semestral";
  const isTeacher = ["docente", "profesor", "profesora"].includes(String(user.rol || "").toLowerCase());
  const carrera = user.carreraObjetivo || user.carrera || "";
  const area = user.areaAcademica || "";
  return {
    ...user,
    tipoDocumento: user.tipoDocumento || "DNI",
    salario: Number(user.salario) > 0 ? Number(user.salario) : (isTeacher ? 3200 : 0),
    cicloVirtual: ciclo,
    ciclovirtual: ciclo,
    carreraObjetivo: carrera,
    areaAcademica: area
  };
};

const getStoredUsers = () => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_USERS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map(normalizeUser);
      }
    }
  } catch (err) {
    console.warn("[userService] Error leyendo cache de usuarios:", err);
  }
  return [];
};

const throwIfError = (error, operation) => {
  if (error) {
    console.error(`[InsForge] ${operation}:`, error);
    let msg = error.message || `No se pudo completar: ${operation}`;
    
    // Mapeo amigable de restricciones de integridad de PostgreSQL (Capa 3)
    if (msg.includes("check_users_dni")) {
      msg = "Error de Base de Datos: El DNI debe contener exactamente 8 dígitos numéricos sin letras.";
    } else if (msg.includes("check_users_celular")) {
      msg = "Error de Base de Datos: El celular debe contener exactamente 9 dígitos numéricos e iniciar con 9.";
    } else if (msg.includes("check_matriculas_dni")) {
      msg = "Error de Base de Datos: El DNI de la matrícula no cumple el formato peruano de 8 dígitos.";
    } else if (msg.includes("check_matriculas_celular")) {
      msg = "Error de Base de Datos: El celular de la matrícula debe contener 9 dígitos e iniciar con 9.";
    }
    
    throw new Error(msg);
  }
};

const formatRoleForDb = (rol) => {
  if (!rol) return "Estudiante";
  const r = String(rol).trim().toLowerCase();
  if (r.startsWith("admin")) return "Admin";
  if (r.startsWith("doc") || r.startsWith("prof")) return "Docente";
  return "Estudiante";
};

const formatEstadoForDb = (estado) => {
  if (!estado) return "Activo";
  const e = String(estado).trim().toLowerCase();
  if (e === "inactivo") return "Inactivo";
  return "Activo";
};

const formatIdForDb = (id) => {
  if (id && /^USR-\d+$/.test(id)) return id;
  const digits = String(Date.now()).slice(-6);
  return `USR-${digits}`;
};

/**
 * Validador contra el Backend FastAPI (Capa 2)
 */
export const validateWithBackend = async ({ tipoDocumento = "DNI", dni, celular, correo }) => {
  try {
    const res = await fetch(`${BACKEND_URL}/usuarios/validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        tipoDocumento: tipoDocumento || "DNI",
        dni: dni ? String(dni).trim() : null,
        celular: celular ? String(celular).trim() : null,
        correo: correo ? String(correo).trim().toLowerCase() : null
      })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.detail?.errores) {
        const errorList = Object.values(data.detail.errores);
        throw new Error(errorList.join(" | "));
      } else if (typeof data?.detail?.mensaje === "string") {
        throw new Error(data.detail.mensaje);
      } else if (typeof data?.detail === "string") {
        throw new Error(data.detail);
      }
      throw new Error(`Validación fallida con código HTTP ${res.status}`);
    }
  } catch (err) {
    if (err.message && !err.message.includes("Failed to fetch") && !err.message.includes("Network request failed") && !err.message.includes("fetch failed")) {
      throw err;
    }
    // Si el backend remoto o local no está disponible, registramos y procedemos con Capa 1 y 3
    console.warn("[Backend] Servidor FastAPI no disponible en", BACKEND_URL, "validando con Capa 1 y Capa 3:", err.message);
  }
};

export const userService = {
  getStoredUsers,

  async getUsers() {
    // 1. Si hay token de autenticación en localStorage, consultar backend FastAPI
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      try {
        const res = await fetch(`${BACKEND_URL}/usuarios/`, {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
        if (res.ok) {
          const remoteUsers = await res.json();
          const list = Array.isArray(remoteUsers)
            ? remoteUsers
            : Array.isArray(remoteUsers?.data)
            ? remoteUsers.data
            : null;
          if (list && list.length > 0) {
            const normalized = list.map(normalizeUser);
            if (typeof window !== "undefined") {
              localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(normalized));
            }
            return normalized;
          }
        }
      } catch (err) {
        console.warn("[userService] Error al consultar backend FastAPI:", err.message);
      }
    }

    // 2. Consultar base de datos InsForge PostgreSQL
    try {
      const { data, error } = await insforge.database
        .from("users")
        .select(USER_COLUMNS)
        .order("created_at", { ascending: false })
        .limit(500);
      if (!error && Array.isArray(data)) {
        const normalized = data.map(normalizeUser);
        if (typeof window !== "undefined") {
          localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(normalized));
        }
        return normalized;
      }
    } catch (err) {
      console.warn("[userService] Error al consultar InsForge:", err.message);
    }

    // 3. Fallback resiliente a cache de localStorage
    return getStoredUsers();
  },

  async fetchUsers() {
    return userService.getUsers();
  },

  async getUserByEmail(email) {
    const targetEmail = (email || "").trim().toLowerCase();
    // Primero buscar en InsForge
    try {
      const { data, error } = await insforge.database
        .from("users")
        .select(USER_COLUMNS)
        .eq("correo", targetEmail)
        .limit(1);
      if (!error && data?.[0]) return normalizeUser(data[0]);
    } catch {}

    // Fallback a usuarios locales
    const local = getStoredUsers();
    const found = local.find((u) => (u.correo || "").trim().toLowerCase() === targetEmail);
    return found ? normalizeUser(found) : null;
  },

  async saveUsers(users) {
    const safeUsers = users.map(({ password, created_at, cicloVirtual, universidad, ...user }) => {
      const ciclo = cicloVirtual || user.ciclovirtual || "Semestral";
      return {
        ...user,
        ciclovirtual: ciclo
      };
    });
    if (safeUsers.length === 0) return [];

    try {
      await insforge.database.from("users").upsert(safeUsers);
    } catch (err) {
      console.warn("[userService] Error guardando usuarios en InsForge:", err.message);
    }

    const normalized = users.map(normalizeUser);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(normalized));
    }
    return normalized;
  },

  async saveUser(user) {
    const { password, created_at, cicloVirtual, universidad, ...safeUser } = user;
    const ciclo = cicloVirtual || safeUser.ciclovirtual || "Semestral";
    const payload = {
      ...safeUser,
      id: formatIdForDb(safeUser.id),
      rol: formatRoleForDb(safeUser.rol),
      estado: formatEstadoForDb(safeUser.estado),
      tipoDocumento: safeUser.tipoDocumento || "DNI",
      dni: safeUser.dni ? String(safeUser.dni).trim() : "",
      celular: safeUser.celular ? String(safeUser.celular).trim() : "",
      correo: safeUser.correo ? String(safeUser.correo).trim().toLowerCase() : "",
      ciclovirtual: ciclo
    };

    // Validación Capa 2 (FastAPI Backend)
    await validateWithBackend({
      tipoDocumento: payload.tipoDocumento,
      dni: payload.dni,
      celular: payload.celular,
      correo: payload.correo
    });

    let saved = null;
    try {
      const { data, error } = await insforge.database
        .from("users")
        .upsert([payload])
        .select(USER_COLUMNS);
      if (error) {
        console.error("[userService] Error al guardar en InsForge:", error);
        throw new Error(error.message || "Error al persistir en la base de datos");
      }
      if (data?.[0]) {
        saved = normalizeUser(data[0]);
      }
    } catch (err) {
      console.warn("[userService] Error al persistir usuario en InsForge:", err.message);
      throw err;
    }

    if (!saved) {
      saved = normalizeUser(payload);
    }

    // Sincronizar en localStorage
    const current = getStoredUsers();
    const idx = current.findIndex((u) => u.id === saved.id || (saved.dni && u.dni === saved.dni));
    let updated;
    if (idx >= 0) {
      updated = [...current];
      updated[idx] = { ...current[idx], ...saved };
    } else {
      updated = [saved, ...current];
    }
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(updated));
    }

    return saved;
  },

  async deleteUser(id) {
    // 1. Eliminar en el backend FastAPI si hay sesión con token
    const token = typeof window !== "undefined" ? localStorage.getItem("authToken") : null;
    if (token) {
      try {
        await fetch(`${BACKEND_URL}/usuarios/${id}`, {
          method: "DELETE",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`
          }
        });
      } catch (err) {
        console.warn("[userService] Error al eliminar en FastAPI:", err.message);
      }
    }

    // 2. Eliminar en InsForge PostgreSQL
    const { error } = await insforge.database
      .from("users")
      .delete()
      .eq("id", id);
    if (error) {
      console.error("[userService] Error al eliminar en InsForge:", error);
      throw new Error(`Error en base de datos al eliminar usuario: ${error.message}`);
    }

    // 3. Actualizar almacenamiento local para que coincida de inmediato
    const current = getStoredUsers();
    const filtered = current.filter((u) => u.id !== id);
    if (typeof window !== "undefined") {
      localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(filtered));
    }
    return true;
  },

  async resetUsers() {
    // Ya no reinserta usuarios estáticos de db.json: recarga los usuarios reales de la base de datos
    return userService.getUsers();
  }
};

export const roleService = {
  getRoles: () => SYSTEM_ROLES,
  saveRoles: (roles) => roles,
  resetRoles: () => SYSTEM_ROLES
};

export const incidentService = {
  async getIncidents() {
    const { data, error } = await insforge.database
      .from("incidents")
      .select("id, docente, dni, correo, tipo, fechaPresentacion, materia, horario, motivo, archivoNombre, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    throwIfError(error, "cargar incidencias");
    return data || [];
  },

  async updateIncidentStatus(id, estado) {
    const { error } = await insforge.database
      .from("incidents")
      .update({ estado })
      .eq("id", id);
    throwIfError(error, "actualizar incidencia");
  },

  async updateIncident(id, fields) {
    const { error } = await insforge.database
      .from("incidents")
      .update(fields)
      .eq("id", id);
    throwIfError(error, "actualizar incidencia");
  },

    async saveIncident(incident) {
    const {
      created_at,
      docenteId,
      cursoId,
      docentePropuesto,
      docenteReemplazo,
      horarioActualizado,
      ...row
    } = incident;

    const payload = {
      ...row,
      docenteid: docenteId || row.docenteid,
      cursoid: cursoId || row.cursoid,
      docentepropuesto: docentePropuesto || row.docentepropuesto,
      docentereemplazo: docenteReemplazo || row.docentereemplazo,
      horarioactualizado: horarioActualizado || row.horarioactualizado
    };

    // Eliminar claves undefined para evitar enviar campos invalidos
    Object.keys(payload).forEach(key => payload[key] === undefined && delete payload[key]);

    const { data, error } = await insforge.database
      .from("incidents")
      .upsert([payload])
      .select();
    throwIfError(error, "guardar incidencia");
    return data?.[0] || null;
  },

  async saveIncidents(incidents) {
    if (incidents.length === 0) return [];
    const rows = incidents.map(({ created_at, ...inc }) => inc);
    const { data, error } = await insforge.database
      .from("incidents")
      .upsert(rows)
      .select();
    throwIfError(error, "guardar incidencias");
    return data || [];
  },

  async cambiarEstadoBackend(incidenciaId, { nuevoEstado, docenteReemplazo, docenteReemplazoId, horarioActualizado, observaciones }) {
    try {
      const res = await fetch(`${BACKEND_URL}/incidencias/${incidenciaId}/estado`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nuevoEstado,
          docenteReemplazo: docenteReemplazo || null,
          docenteReemplazoId: docenteReemplazoId || null,
          horarioActualizado: horarioActualizado || null,
          observaciones: observaciones || null
        })
      });
      if (!res.ok) {
        console.warn(`[Backend] Estado transition en backend retornó HTTP ${res.status}`);
      }
    } catch (err) {
      console.warn("[Backend] Error al notificar transición de estado al backend:", err.message);
    }
  },

  async calcularCruceNomina({ periodo = "2026-10", tarifaHoraDefault = 50, docenteId = null }) {
    try {
      const res = await fetch(`${BACKEND_URL}/incidencias/nomina/cruce`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          periodo,
          tarifaHoraDefault: Number(tarifaHoraDefault) || 50,
          docenteId: docenteId || null
        })
      });
      if (res.ok) {
        return await res.json();
      }
    } catch (err) {
      console.warn("[Backend] Cálculo de cruce de nómina en backend no disponible:", err.message);
    }
    // Fallback con estimación local
    return {
      periodo,
      tarifaHoraDefault: Number(tarifaHoraDefault) || 50,
      totalHorasProgramadas: 160,
      horasDescuentoInasistencias: 4,
      horasReemplazoCubiertas: 4,
      remuneracionBruta: 160 * (Number(tarifaHoraDefault) || 50),
      descuentoTotal: 4 * (Number(tarifaHoraDefault) || 50),
      bonoReemplazo: 4 * (Number(tarifaHoraDefault) || 50),
      remuneracionNeta: 160 * (Number(tarifaHoraDefault) || 50)
    };
  },

  resetIncidents() {
    return incidentService.getIncidents();
  }
};

export const matriculaService = {
  async getMatriculas() {
    const { data, error } = await insforge.database
      .from("matriculas")
      .select("id, estudiante, dni, correo, celular, programa, ciclo, turno, fechaMatricula, modalidadPago, montoTotal, montoPagado, saldoPendiente, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    throwIfError(error, "cargar matrículas");
    return data || [];
  },

  async saveMatriculas(matriculas) {
    if (matriculas.length === 0) return [];
    const rows = matriculas.map(({ estudianteId, created_at, ...matricula }) => matricula);
    const { data, error } = await insforge.database
      .from("matriculas")
      .upsert(rows)
      .select();
    throwIfError(error, "guardar matrículas");
    return data || [];
  },

  async saveMatricula(matricula) {
    const { estudianteId, created_at, ...row } = matricula;
    const { data, error } = await insforge.database
      .from("matriculas")
      .upsert([row])
      .select();
    throwIfError(error, "guardar matrícula");
    return data?.[0] || null;
  },

  async deleteMatricula(id) {
    const { error } = await insforge.database
      .from("matriculas")
      .delete()
      .eq("id", id);
    throwIfError(error, "eliminar matrícula");
  }
};

export const pagoService = {
  async getPagos() {
    const { data, error } = await insforge.database
      .from("pagos")
      .select("id, matriculaId, estudiante, concepto, monto, metodo, operacion, comprobante, fecha, estado, created_at")
      .order("created_at", { ascending: false })
      .limit(500);
    throwIfError(error, "cargar pagos");
    return data || [];
  },

  async savePagos(pagos) {
    if (pagos.length === 0) return [];
    const rows = pagos.map(({ created_at, ...pago }) => pago);
    const { data, error } = await insforge.database
      .from("pagos")
      .upsert(rows)
      .select();
    throwIfError(error, "guardar pagos");
    return data || [];
  },

  async savePago(pago) {
    const { created_at, ...row } = pago;
    const { data, error } = await insforge.database
      .from("pagos")
      .upsert([row])
      .select();
    throwIfError(error, "guardar pago");
    return data?.[0] || null;
  }
};

export const configService = {
  async getConfig() {
    const { data, error } = await insforge.database
      .from("configuracion")
      .select("*")
      .eq("id", "general")
      .limit(1);
    throwIfError(error, "cargar configuración");
    return data?.[0] || null;
  },

  async saveConfig(config) {
    const { updated_at, ...row } = config;
    const { data, error } = await insforge.database
      .from("configuracion")
      .upsert([{ id: "general", ...row, updated_at: new Date().toISOString() }])
      .select();
    throwIfError(error, "guardar configuración");
    return data?.[0] || null;
  }
};
