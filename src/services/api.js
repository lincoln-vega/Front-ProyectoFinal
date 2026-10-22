import { insforge } from "../lib/insforge";
export { courseService } from "./cursosServices";

const SYSTEM_ROLES = ["Admin", "Docente", "Estudiante"];
const USER_COLUMNS = [
  "id",
  "apellidos",
  "nombres",
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
  "ciclovirtual"
].join(", ");

const normalizeUser = (user) => {
  if (!user) return user;
  const ciclo = user.cicloVirtual || user.ciclovirtual || "Semestral";
  return {
    ...user,
    cicloVirtual: ciclo,
    ciclovirtual: ciclo,
    carreraObjetivo: user.carreraObjetivo || user.areaAcademica || "General",
    areaAcademica: user.areaAcademica || user.carreraObjetivo || "General"
  };
};

const throwIfError = (error, operation) => {
  if (error) {
    console.error(`[InsForge] ${operation}:`, error);
    throw new Error(error.message || `No se pudo completar: ${operation}`);
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
    const safeUsers = users.map(({ password, created_at, ...user }) => {
      const ciclo = user.cicloVirtual || user.ciclovirtual || "Semestral";
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
    const { password, created_at, ...safeUser } = user;
    const ciclo = safeUser.cicloVirtual || safeUser.ciclovirtual || "Semestral";
    const payload = {
      ...safeUser,
      ciclovirtual: ciclo
    };
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
  getRoles: () => {
    const saved = localStorage.getItem("app_roles");
    if (!saved) return SYSTEM_ROLES;
    try {
      const roles = JSON.parse(saved)
        .map((role) => String(role).trim())
        .filter((role) => SYSTEM_ROLES.includes(role));
      return roles.length ? roles : SYSTEM_ROLES;
    } catch {
      return SYSTEM_ROLES;
    }
  },
  saveRoles: (roles) => localStorage.setItem("app_roles", JSON.stringify(roles)),
  resetRoles: () => {
    localStorage.setItem("app_roles", JSON.stringify(SYSTEM_ROLES));
    return SYSTEM_ROLES;
  }
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
    const { created_at, ...row } = incident;
    const { data, error } = await insforge.database
      .from("incidents")
      .upsert([row])
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
