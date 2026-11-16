import { insforge } from "../lib/insforge";
export { courseService } from "./cursosServices";
export { academicosService } from "./academicosService";

const BACKEND_URL = import.meta.env.VITE_BACKEND_URL || "https://portal-backend-5adf751c-968e-487d-92f9-672da789d8b3.fly.dev";

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
  "universidad",
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
  return {
    ...user,
    tipoDocumento: user.tipoDocumento || "DNI",
    salario: Number(user.salario) > 0 ? Number(user.salario) : (isTeacher ? 3200 : 0),
    cicloVirtual: ciclo,
    ciclovirtual: ciclo,
    carreraObjetivo: user.carreraObjetivo || user.areaAcademica || "General",
    areaAcademica: user.areaAcademica || user.carreraObjetivo || "General"
  };
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

/**
 * Validador contra el Backend FastAPI (Capa 2)
 */
export const validateWithBackend = async ({ tipoDocumento = "DNI", dni, celular, correo }) => {
  try {
    const res = await fetch(`${BACKEND_URL}/usuarios/validar`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ tipoDocumento, dni, celular, correo })
    });
    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      if (data?.detail?.errores) {
        const firstError = Object.values(data.detail.errores)[0];
        throw new Error(`[Backend 422] ${firstError}`);
      } else if (typeof data?.detail === "string") {
        throw new Error(`[Backend 422] ${data.detail}`);
      }
      throw new Error(`[Backend] Validación fallida con código HTTP ${res.status}`);
    }
  } catch (err) {
    if (err.message && err.message.startsWith("[Backend")) {
      throw err;
    }
    // Si el backend remoto o local no está disponible, registramos y procedemos con Capa 1 y 3
    console.warn("[Backend] Servidor FastAPI no disponible en", BACKEND_URL, "validando con Capa 1 y Capa 3:", err.message);
  }
};

export const userService = {
  async getUsers() {
    const { data, error } = await insforge.database
      .from("users")
      .select(USER_COLUMNS)
      .order("created_at", { ascending: false })
      .limit(500);
    throwIfError(error, "cargar usuarios");
    return (data || []).map(normalizeUser);
  },

  async fetchUsers() {
    return userService.getUsers();
  },

  async getUserByEmail(email) {
    const { data, error } = await insforge.database
      .from("users")
      .select(USER_COLUMNS)
      .eq("correo", email.trim().toLowerCase())
      .limit(1);
    throwIfError(error, "cargar perfil");
    return data?.[0] ? normalizeUser(data[0]) : null;
  },

    async saveUsers(users) {
    const safeUsers = users.map(({ password, created_at, cicloVirtual, ...user }) => {
      const ciclo = cicloVirtual || user.ciclovirtual || "Semestral";
      return {
        ...user,
        ciclovirtual: ciclo
      };
    });
    if (safeUsers.length === 0) return [];

    const { data, error } = await insforge.database
      .from("users")
      .upsert(safeUsers)
      .select(USER_COLUMNS);
    throwIfError(error, "guardar usuarios");
    return (data || []).map(normalizeUser);
  },

    async saveUser(user) {
    const { password, created_at, cicloVirtual, ...safeUser } = user;
    const ciclo = cicloVirtual || safeUser.ciclovirtual || "Semestral";
    const payload = {
      ...safeUser,
      ciclovirtual: ciclo
    };

    // Validación Capa 2 (FastAPI Backend)
    await validateWithBackend({
      tipoDocumento: payload.tipoDocumento || "DNI",
      dni: payload.dni,
      celular: payload.celular,
      correo: payload.correo
    });

    const { data, error } = await insforge.database
      .from("users")
      .upsert([payload])
      .select(USER_COLUMNS);
    throwIfError(error, "guardar usuario");
    return data?.[0] ? normalizeUser(data[0]) : null;
  },

  async deleteUser(id) {
    const { error } = await insforge.database
      .from("users")
      .delete()
      .eq("id", id);
    throwIfError(error, "eliminar usuario");
  },

  resetUsers() {
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
