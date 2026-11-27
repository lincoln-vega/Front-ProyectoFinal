import { getApiAccessToken } from "../lib/supabase";
import { getApiBaseUrl } from "../lib/apiUrl";
export { courseService } from "./cursosServices";
export { academicosService } from "./academicosService";

const STORAGE_KEY_USERS = "academia_users";
const SYSTEM_ROLES = ["Admin", "Docente", "Estudiante"];
const ADMIN_USER_ROLES = ["admin", "docente", "estudiante"];

export const parseCourseList = (value) => {
  if (!value) return [];
  if (Array.isArray(value)) {
    return value
      .map((item) => (typeof item === "object" && item !== null ? item.id : item))
      .filter(Boolean)
      .map((x) => String(x).trim());
  }
  if (typeof value === "string") {
    const trimmed = value.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") && trimmed.endsWith("]")) {
      try {
        const parsed = JSON.parse(trimmed);
        if (Array.isArray(parsed)) return parseCourseList(parsed);
      } catch {}
    }
    const cleanStr = trimmed.replace(/^\{|\}$/g, "");
    return cleanStr
      .split(",")
      .map((s) => s.trim().replace(/^["']|["']$/g, ""))
      .filter(Boolean);
  }
  return [];
};

const normalizeUser = (user) => {
  if (!user) return user;
  const ciclo = user.cicloVirtual || user.ciclovirtual || user.ciclo_virtual || "Semestral";
  const isTeacher = ["docente", "profesor", "profesora"].includes(String(user.rol || "").toLowerCase());
  const carrera = user.carreraObjetivo || user.carrera_objetivo || user.carrera || "";
  const area = user.areaAcademica || user.area_academica || "";
  const fechaNac = user.fechaNacimiento || user.fecha_nacimiento || "";
  const tipoDoc = user.tipoDocumento || user.tipo_documento || "DNI";
  const rawAsignados = user.cursosAsignados || user.cursos_asignados || user.CursosAsignados;
  const rawInscritos = user.cursosInscritos || user.cursos_inscritos || user.CursosInscritos;
  const asignados = parseCourseList(rawAsignados);
  const inscritos = parseCourseList(rawInscritos);
  return {
    ...user,
    tipoDocumento: tipoDoc,
    fechaNacimiento: fechaNac,
    salario: Number(user.salario) > 0 ? Number(user.salario) : (isTeacher ? 3200 : 0),
    cicloVirtual: ciclo,
    ciclovirtual: ciclo,
    carreraObjetivo: carrera,
    areaAcademica: area,
    cursosAsignados: asignados,
    cursosInscritos: inscritos,
    especialidad: user.especialidad || area || carrera || "Docencia General"
  };
};

const getStoredUsers = () => {
  try {
    const raw = typeof window !== "undefined" ? localStorage.getItem(STORAGE_KEY_USERS) : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed.map((user) => {
          const { password, ...safeUser } = user || {};
          return normalizeUser(safeUser);
        });
      }
    }
  } catch (err) {
    console.warn("[userService] Error leyendo cache de usuarios:", err);
  }
  return [];
};

const cacheUsers = (users) => {
  if (typeof window !== "undefined" && Array.isArray(users)) {
    const safeUsers = users.map(({ password, ...user }) => user);
    localStorage.setItem(STORAGE_KEY_USERS, JSON.stringify(safeUsers));
  }
};

const getApiErrorMessage = (body, status) => {
  const detail = body?.detail;
  const errorCode = String(body?.code || body?.error_code || detail?.code || "").toUpperCase();
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
    return message || "No tienes permisos para realizar esta operación.";
  }
  if (status === 409) {
    return message || "El correo o documento ya existe en la plataforma.";
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

export const buildAuthHeaders = (extra = {}) => {
  const headers = { "Content-Type": "application/json", ...extra };
  const token = getApiAccessToken();
  if (token && !headers.Authorization) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
};

export const requestBackend = async (path, options = {}) => {
  let response;
  const headers = buildAuthHeaders(options.headers || {});
  try {
    response = await fetch(`${getApiBaseUrl()}${path}`, {
      ...options,
      headers
    });
  } catch (error) {
    if (error instanceof TypeError) {
      throw new Error("No se pudo conectar con el backend. Verifica VITE_API_URL y que el servidor esté encendido.");
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

export const validateWithBackend = async ({ tipoDocumento = "DNI", dni, celular, correo }) => {
  return requestBackend("/usuarios/validar", {
    method: "POST",
    body: JSON.stringify({ tipoDocumento, dni, celular, correo })
  });
};

const assertAllowedAdminUserRole = (role) => {
  const normalizedRole = String(role || "").trim().toLowerCase();
  if (!ADMIN_USER_ROLES.includes(normalizedRole)) {
    throw new Error("El rol debe ser admin, docente o estudiante.");
  }
  return normalizedRole;
};

export const adminUserRegistrationService = {
  async validate(formData, adminAccessToken) {
    assertAllowedAdminUserRole(formData.rol);
    if (!adminAccessToken) {
      throw new Error("No se encontró el token de la sesión de administrador.");
    }

    await requestBackend("/usuarios/validar", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      body: JSON.stringify({
        tipoDocumento: formData.tipoDocumento || "DNI",
        dni: formData.dni,
        celular: formData.celular,
        correo: String(formData.correo || "").trim().toLowerCase()
      })
    });
  },

  async createAuthAccount(formData) {
    const adminAccessToken = getApiAccessToken();
    if (!adminAccessToken) {
      throw new Error("No se encontró el token de administrador para crear la cuenta en Supabase Auth.");
    }

    const email = String(formData.correo || "").trim().toLowerCase();
    const role = assertAllowedAdminUserRole(formData.rol);
    const fullName = `${formData.nombres || ""} ${formData.apellidos || ""}`.trim();

    return requestBackend("/usuarios/auth-account", {
      method: "POST",
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      body: JSON.stringify({
        correo: email,
        password: formData.password,
        nombre: fullName,
        rol: role
      })
    });
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
    if (formData.salario !== undefined && formData.salario !== "") {
      payload.salario = Number(formData.salario) || 0;
    }
    if (formData.especialidad) payload.especialidad = formData.especialidad;
    if (Array.isArray(formData.cursosAsignados)) payload.cursosAsignados = formData.cursosAsignados;
    if (Array.isArray(formData.cursosInscritos)) payload.cursosInscritos = formData.cursosInscritos;

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
      headers: { Authorization: `Bearer ${adminAccessToken}` },
      body: JSON.stringify(safeProfile)
    });

    const returnedUser =
      savedProfile?.user ||
      savedProfile?.data ||
      savedProfile?.usuario ||
      (savedProfile && typeof savedProfile === "object" ? savedProfile : {});

    return normalizeUser({
      ...safeProfile,
      ...(returnedUser && typeof returnedUser === "object" ? returnedUser : {}),
      id: returnedUser?.id || safeProfile.id || formatIdForDb(safeProfile.id),
      rol: formatRoleForDb(returnedUser?.rol || safeProfile.rol),
      estado: formatEstadoForDb(returnedUser?.estado || safeProfile.estado)
    });
  }
};

let _loggedProfileCache = { email: "", profile: null, ts: 0 };
let _inFlightUsersPromise = null;

export const userService = {
  getStoredUsers,

  cacheLoggedProfile(rawProfile) {
    if (!rawProfile || typeof rawProfile !== "object") return null;
    const norm = normalizeUser(rawProfile);
    const cleanEmail = String(norm.correo || "").trim().toLowerCase();
    if (cleanEmail) {
      _loggedProfileCache = { email: cleanEmail, profile: norm, ts: Date.now() };
      try {
        localStorage.setItem("academia_logged_profile", JSON.stringify(norm));
      } catch {}
    }
    return norm;
  },

  getCachedLoggedProfile(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail) return null;
    if (_loggedProfileCache.email === cleanEmail && _loggedProfileCache.profile) {
      return _loggedProfileCache.profile;
    }
    try {
      const raw = localStorage.getItem("academia_logged_profile");
      if (raw) {
        const parsed = normalizeUser(JSON.parse(raw));
        if (String(parsed?.correo || "").trim().toLowerCase() === cleanEmail) {
          _loggedProfileCache = { email: cleanEmail, profile: parsed, ts: 0 };
          return parsed;
        }
      }
    } catch {}
    return null;
  },

  async getUsers() {
    if (_inFlightUsersPromise) return _inFlightUsersPromise;
    _inFlightUsersPromise = (async () => {
      try {
        const backUsers = await requestBackend("/usuarios/");
        if (Array.isArray(backUsers)) {
          const users = backUsers.map(normalizeUser);
          cacheUsers(users);
          return users;
        }
        return getStoredUsers();
      } finally {
        _inFlightUsersPromise = null;
      }
    })();
    return _inFlightUsersPromise;
  },

  async fetchUsers() {
    return userService.getUsers();
  },

  async getUserByEmail(email) {
    const cleanEmail = String(email || "").trim().toLowerCase();
    if (!cleanEmail) return null;
    // Si el perfil acaba de llegar en la respuesta de /usuarios/login (<60s), devolver en 0 ms
    if (
      _loggedProfileCache.email === cleanEmail &&
      _loggedProfileCache.profile &&
      Date.now() - _loggedProfileCache.ts < 60000
    ) {
      return _loggedProfileCache.profile;
    }
    try {
      const user = await requestBackend(`/usuarios/${encodeURIComponent(cleanEmail)}`);
      return user ? userService.cacheLoggedProfile(user) : null;
    } catch {
      const all = await userService.getUsers();
      const found = all.find((u) => String(u.correo || "").toLowerCase() === cleanEmail) || null;
      return found ? userService.cacheLoggedProfile(found) : null;
    }
  },

  async saveUsers(users) {
    if (!Array.isArray(users) || users.length === 0) return [];
    const results = [];
    for (const u of users) {
      const saved = await userService.saveUser(u);
      if (saved) results.push(saved);
    }
    return results;
  },

  async saveUser(user) {
    const { password, created_at, universidad, id, ...rest } = user || {};
    const targetId = id || formatIdForDb(id);
    const payload = {
      nombres: rest.nombres || "",
      apellidos: rest.apellidos || "",
      correo: rest.correo ? String(rest.correo).trim().toLowerCase() : "",
      rol: String(rest.rol || "estudiante").toLowerCase(),
      estado: formatEstadoForDb(rest.estado),
      tipoDocumento: rest.tipoDocumento || "DNI",
      dni: rest.dni ? String(rest.dni).trim() : "",
      celular: rest.celular ? String(rest.celular).trim() : null,
      fechaNacimiento: rest.fechaNacimiento || null,
      carreraObjetivo: rest.carreraObjetivo || "",
      cicloVirtual: rest.cicloVirtual || rest.ciclovirtual || "Semestral",
      areaAcademica: rest.areaAcademica || "",
      salario: Number(rest.salario) || (formatRoleForDb(rest.rol) === "Docente" ? 3200 : 0),
      especialidad: rest.especialidad || rest.areaAcademica || rest.carreraObjetivo || "",
      cursosAsignados: parseCourseList(rest.cursosAsignados),
      cursosInscritos: parseCourseList(rest.cursosInscritos)
    };

    await validateWithBackend({
      tipoDocumento: payload.tipoDocumento,
      dni: payload.dni,
      celular: payload.celular,
      correo: payload.correo
    });

    const res = await requestBackend(`/usuarios/${encodeURIComponent(targetId)}`, {
      method: "PUT",
      body: JSON.stringify(payload)
    });

    const returned = res?.usuario || res;
    const savedUser = normalizeUser({ id: targetId, ...payload, ...(returned || {}) });
    const current = getStoredUsers();
    cacheUsers([savedUser, ...current.filter((stored) => stored.id !== savedUser.id)]);
    return savedUser;
  },

  async deleteUser(id) {
    await requestBackend(`/usuarios/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
    cacheUsers(getStoredUsers().filter((user) => user.id !== id));
  },

  async resetUsers() {
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
    const data = await requestBackend("/incidencias");
    return (Array.isArray(data) ? data : []).map((row) => ({
      ...row,
      docenteId: row.docenteid || row.docenteId || null,
      cursoId: row.cursoid || row.cursoId || null,
      docentePropuesto: row.docentepropuesto || row.docentePropuesto || null,
      docenteReemplazo: row.docentereemplazo || row.docenteReemplazo || null,
      horarioActualizado: row.horarioactualizado || row.horarioActualizado || null
    }));
  },

  async updateIncidentStatus(id, estado) {
    return incidentService.cambiarEstadoBackend(id, { nuevoEstado: estado });
  },

  async updateIncident(id, fields) {
    if (fields?.estado) {
      return incidentService.cambiarEstadoBackend(id, {
        nuevoEstado: fields.estado,
        docenteReemplazo: fields.docenteReemplazo || fields.docentereemplazo,
        horarioActualizado: fields.horarioActualizado || fields.horarioactualizado,
        observaciones: fields.observaciones
      });
    }
    return fields;
  },

  async saveIncident(incident) {
    const payload = {
      id: incident.id,
      docenteId: incident.docenteId || incident.docenteid || null,
      docente: incident.docente,
      dni: incident.dni || null,
      correo: incident.correo || null,
      tipo: incident.tipo,
      materia: incident.materia || "General",
      cursoId: incident.cursoId || incident.cursoid || null,
      horario: incident.horario || "",
      motivo: incident.motivo || "",
      archivoNombre: incident.archivoNombre || null,
      docentePropuesto: incident.docentePropuesto || incident.docentepropuesto || null,
      docenteReemplazo: incident.docenteReemplazo || incident.docentereemplazo || null,
      horarioActualizado: incident.horarioActualizado || incident.horarioactualizado || null,
      observaciones: incident.observaciones || null,
      fechaPresentacion: incident.fechaPresentacion || null
    };
    const res = await requestBackend("/incidencias", {
      method: "POST",
      body: JSON.stringify(payload)
    });
    return res?.incidencia || res;
  },

  async saveIncidents(incidents) {
    const results = [];
    for (const inc of incidents || []) {
      results.push(await incidentService.saveIncident(inc));
    }
    return results;
  },

  async cambiarEstadoBackend(incidenciaId, { nuevoEstado, docenteReemplazo, docenteReemplazoId, horarioActualizado, observaciones }) {
    return requestBackend(`/incidencias/${encodeURIComponent(incidenciaId)}/estado`, {
      method: "PATCH",
      body: JSON.stringify({
        nuevoEstado,
        docenteReemplazo: docenteReemplazo || null,
        docenteReemplazoId: docenteReemplazoId || null,
        horarioActualizado: horarioActualizado || null,
        observaciones: observaciones || null
      })
    });
  },

  async calcularCruceNomina({ periodo, tarifaHoraDefault = 50, docenteId = null }) {
    return requestBackend("/incidencias/nomina/cruce", {
      method: "POST",
      body: JSON.stringify({
        periodo,
        tarifaHoraDefault: Number(tarifaHoraDefault) || 50,
        docenteId: docenteId || null
      })
    });
  },

  resetIncidents() {
    return incidentService.getIncidents();
  }
};

export const matriculaService = {
  async getMatriculas() {
    const data = await requestBackend("/matriculas/");
    return Array.isArray(data) ? data : [];
  },

  async saveMatriculas(matriculas) {
    const results = [];
    for (const m of matriculas || []) {
      results.push(await matriculaService.saveMatricula(m));
    }
    return results;
  },

  async saveMatricula(matricula) {
    const existing = await matriculaService.getMatriculas().catch(() => []);
    const isUpdate = existing.some((m) => m.id === matricula.id);
    if (isUpdate) {
      return requestBackend(`/matriculas/${encodeURIComponent(matricula.id)}`, {
        method: "PUT",
        body: JSON.stringify(matricula)
      });
    }
    const res = await requestBackend("/matriculas/", {
      method: "POST",
      body: JSON.stringify(matricula)
    });
    return res?.matricula || res;
  },

  async deleteMatricula(id) {
    return requestBackend(`/matriculas/${encodeURIComponent(id)}`, {
      method: "DELETE"
    });
  }
};

export const pagoService = {
  async getPagos() {
    const data = await requestBackend("/matriculas/pagos");
    return Array.isArray(data) ? data : [];
  },

  async savePagos(pagos) {
    const results = [];
    for (const p of pagos || []) {
      results.push(await pagoService.savePago(p));
    }
    return results;
  },

  async savePago(pago) {
    const res = await requestBackend("/matriculas/pagos", {
      method: "POST",
      body: JSON.stringify(pago)
    });
    return res?.pago || res;
  }
};

export const configService = {
  async getConfig() {
    return requestBackend("/configuracion");
  },

  async saveConfig(config) {
    return requestBackend("/configuracion", {
      method: "PUT",
      body: JSON.stringify(config)
    });
  }
};
