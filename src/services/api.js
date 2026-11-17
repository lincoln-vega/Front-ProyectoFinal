import {
  createIsolatedAuthClient,
  getApiAccessToken,
  insforge
} from "../lib/insforge";
export { courseService } from "./cursosServices";

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

const getApiBaseUrl = () => {
  const apiUrl = import.meta.env.VITE_API_URL?.trim();
  if (!apiUrl) {
    throw new Error("Falta configurar la variable VITE_API_URL para conectar con el backend.");
  }
  return apiUrl.replace(/\/+$/, "");
};

const getApiErrorMessage = (body, status) => {
  const detail = body?.detail;
  const errorCode = String(
    body?.code || body?.error_code || detail?.code || ""
  ).toUpperCase();
  let message = "";

  if (detail?.errores && typeof detail.errores === "object") {
    message = String(Object.values(detail.errores)[0] || "");
  } else if (Array.isArray(detail)) {
    message = detail
      .map((item) => {
        const field = Array.isArray(item?.loc) ? item.loc[item.loc.length - 1] : "";
        return [field, item?.msg].filter(Boolean).join(": ");
      })
      .filter(Boolean)
      .join("; ");
  } else if (typeof detail === "string") {
    message = detail;
  } else if (typeof body?.message === "string") {
    message = body.message;
  } else if (typeof body?.error === "string") {
    message = body.error;
  } else if (typeof body === "string") {
    message = body;
  }

  if (
    ["AUTH_NEED_VERIFICATION", "EMAIL_NOT_VERIFIED", "EMAIL_UNVERIFIED"].includes(errorCode) ||
    /verific|confirm.*correo|email.*confirm/i.test(message)
  ) {
    return "Debes verificar tu correo antes de iniciar sesión.";
  }
  if (/correo|email/i.test(message) && /duplicad|registrad|existe|already|exist/i.test(message)) {
    return "Ese correo ya está registrado.";
  }
  if (status === 401) {
    return "La sesión expiró o las credenciales no son válidas. Inicia sesión nuevamente.";
  }
  if (status === 403) {
    return "No tienes permisos para realizar esta operación. Se requiere una sesión de administrador.";
  }
  if (status === 409) {
    return "El correo o el perfil ya existe en el backend. Revisa los datos antes de reintentar.";
  }
  return message || `El backend respondió con el código HTTP ${status}.`;
};

const parseApiResponseBody = async (response) => {
  const text = await response.text();
  if (!text) return null;
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
};

const requestBackend = async (path, options = {}) => {
  let response;
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, options);
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el backend. Verifica VITE_API_URL, DNS y CORS.");
    }
    throw error;
  }
  const body = await parseApiResponseBody(response);
  if (!response.ok) {
    throw new Error(getApiErrorMessage(body, response.status));
  }
  return body;
};

export const authService = {
  async login(email, password) {
    const body = await requestBackend("/usuarios/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        correo: String(email || "").trim().toLowerCase(),
        password
      })
    });

    if (!body?.access_token || !body?.role) {
      throw new Error("El backend no devolvió access_token y role para iniciar sesión.");
    }
    return body;
  }
};

/**
 * Validador contra el Backend FastAPI (Capa 2)
 */
export const validateWithBackend = async ({ tipoDocumento = "DNI", dni, celular, correo }) => {
  const accessToken = getApiAccessToken();
  const headers = { "Content-Type": "application/json" };
  if (accessToken) headers.Authorization = `Bearer ${accessToken}`;

  await requestBackend("/usuarios/validar", {
    method: "POST",
    headers,
    body: JSON.stringify({ tipoDocumento, dni, celular, correo })
  });
};

const ADMIN_USER_ROLES = ["admin", "docente", "estudiante"];

const assertAllowedAdminUserRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  if (!ADMIN_USER_ROLES.includes(normalizedRole)) {
    throw new Error("El rol debe ser admin, docente o estudiante.");
  }
  return normalizedRole;
};

const formatAuthCreationError = (error) => {
  const code = String(error?.error || error?.code || "").toUpperCase();
  const message = String(error?.message || "");

  if (code === "AUTH_EMAIL_EXISTS" || /email.*(already|exists)|correo.*(registrad|existe)/i.test(message)) {
    return "Ya existe una cuenta de InsForge Auth con ese correo.";
  }
  if (code === "AUTH_NEED_VERIFICATION") {
    return "La cuenta ya existe, pero el correo necesita verificación antes de iniciar sesión.";
  }
  if (code === "AUTH_WEAK_PASSWORD") {
    return "La contraseña no cumple los requisitos de InsForge Auth.";
  }
  if (code === "AUTH_INVALID_EMAIL") {
    return "El correo no tiene un formato válido.";
  }
  if (code === "AUTH_SIGNUP_DISABLED") {
    return "InsForge Auth no permite crear cuentas en este momento.";
  }
  return message || "No se pudo crear la cuenta en InsForge Auth.";
};

export const adminUserRegistrationService = {
  async validate(formData, adminAccessToken) {
    assertAllowedAdminUserRole(formData.rol);
    if (!adminAccessToken) {
      throw new Error("No se encontró el token de la sesión de administrador.");
    }

    await requestBackend("/usuarios/validar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminAccessToken}`
      },
      body: JSON.stringify({
        tipoDocumento: formData.tipoDocumento || "DNI",
        dni: formData.dni,
        celular: formData.celular,
        correo: String(formData.correo || "").trim().toLowerCase()
      })
    });
  },

  async createAuthAccount(formData) {
    const isolatedClient = createIsolatedAuthClient();
    const { data, error } = await isolatedClient.auth.signUp({
      email: String(formData.correo || "").trim().toLowerCase(),
      password: formData.password,
      name: `${formData.nombres || ""} ${formData.apellidos || ""}`.trim()
    });

    if (error) {
      throw new Error(formatAuthCreationError(error));
    }
    if (!data?.user?.id) {
      throw new Error(
        "InsForge no devolvió el ID de la cuenta creada. Verifica Auth antes de volver a intentarlo."
      );
    }

    return {
      authUserId: data.user.id,
      emailVerified: data.user.emailVerified === true,
      requiresEmailVerification: data.requireEmailVerification === true
    };
  },

  buildProfilePayload(formData, authUserId) {
    const role = assertAllowedAdminUserRole(formData.rol);
    if (!authUserId) {
      throw new Error("No se puede guardar el perfil sin el ID de la cuenta Auth.");
    }

    const payload = {
      authUserId,
      apellidos: String(formData.apellidos || "").trim(),
      nombres: String(formData.nombres || "").trim(),
      tipoDocumento: formData.tipoDocumento || "DNI",
      dni: String(formData.dni || "").trim(),
      correo: String(formData.correo || "").trim().toLowerCase(),
      rol: role,
      estado: formData.estado || "Activo",
      areaAcademica: formData.areaAcademica || formData.carreraObjetivo || "General",
      carreraObjetivo: formData.carreraObjetivo || formData.areaAcademica || "General",
      cicloVirtual: formData.cicloVirtual || formData.ciclovirtual || "Semestral"
    };

    if (formData.fechaNacimiento) payload.fechaNacimiento = formData.fechaNacimiento;
    if (formData.celular) payload.celular = formData.celular;

    return payload;
  },

  async saveProfile(profilePayload, adminAccessToken) {
    if (!adminAccessToken) {
      throw new Error("No se encontró el token de la sesión de administrador.");
    }

    const safeProfile = { ...profilePayload };
    delete safeProfile.password;
    delete safeProfile.universidad;

    const savedProfile = await requestBackend("/usuarios/", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${adminAccessToken}`
      },
      body: JSON.stringify(safeProfile)
    });

    return normalizeUser(
      savedProfile && typeof savedProfile === "object" ? savedProfile : safeProfile
    );
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
