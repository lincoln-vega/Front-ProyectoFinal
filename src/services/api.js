import db from "../data/db.json";
import { insforge } from "../lib/insforge";

const KEYS = {
  USERS: "academia_users",
  ROLES: "app_roles",
  INCIDENTS: "academia_teacher_incidents",
  SECTIONS: "academia_sections",
  MATRICULAS: "academia_matriculas_data",
  PAGOS: "academia_pagos_data"
};

const SYSTEM_ROLES = ["Admin", "Docente", "Estudiante"];

// Helper para sincronizar en segundo plano sin bloquear llamadas síncronas
const bgSync = (promise, key, callback) => {
  promise.then(({ data, error }) => {
    if (!error && data && data.length > 0) {
      const processed = callback ? callback(data) : data;
      localStorage.setItem(key, JSON.stringify(processed));
    }
  }).catch((err) => console.warn(`[InsForge Sync] Error syncing ${key}:`, err));
};

// --- SERVICIO DE USUARIOS ---
const removeVirtualCycleField = (users) => (users || []).map(({ cicloVirtual, ...user }) => user);

export const userService = {
  getUsers: () => {
    const saved = localStorage.getItem(KEYS.USERS);
    // Lanzar sincronización en background desde InsForge
    bgSync(
      insforge.database.from("users").select("*"),
      KEYS.USERS,
      removeVirtualCycleField
    );

    if (!saved) return removeVirtualCycleField(db.users);
    try {
      return removeVirtualCycleField(JSON.parse(saved));
    } catch {
      return removeVirtualCycleField(db.users);
    }
  },

  // Consulta directa asíncrona a InsForge
  fetchUsers: async () => {
    try {
      const { data, error } = await insforge.database.from("users").select("*");
      if (!error && data) {
        const cleaned = removeVirtualCycleField(data);
        localStorage.setItem(KEYS.USERS, JSON.stringify(cleaned));
        return cleaned;
      }
    } catch (err) {
      console.warn("[InsForge] Fallback a caché local:", err);
    }
    return userService.getUsers();
  },

  saveUsers: (users) => {
    const cleaned = removeVirtualCycleField(users);
    localStorage.setItem(KEYS.USERS, JSON.stringify(cleaned));
    
    // Sincronizar en InsForge PostgreSQL
    insforge.database.from("users").upsert(cleaned).catch((err) => {
      console.error("[InsForge] Error al persistir usuarios:", err);
    });
  },

  saveUser: async (user) => {
    const { data, error } = await insforge.database.from("users").upsert([user]).select();
    if (!error) {
      const current = userService.getUsers();
      const updated = current.some(u => u.id === user.id)
        ? current.map(u => u.id === user.id ? user : u)
        : [user, ...current];
      localStorage.setItem(KEYS.USERS, JSON.stringify(updated));
    }
    return { data, error };
  },

  deleteUser: async (id) => {
    const current = userService.getUsers();
    const updated = current.filter(u => u.id !== id);
    localStorage.setItem(KEYS.USERS, JSON.stringify(updated));

    return await insforge.database.from("users").delete().eq("id", id);
  },

  resetUsers: () => {
    const users = removeVirtualCycleField(db.users);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
    insforge.database.from("users").upsert(users).catch(console.error);
    return users;
  }
};

// --- SERVICIO DE ROLES ---
export const roleService = {
  getRoles: () => {
    const saved = localStorage.getItem(KEYS.ROLES);
    if (!saved) {
      localStorage.setItem(KEYS.ROLES, JSON.stringify(db.roles));
      return SYSTEM_ROLES;
    }
    try {
      const roles = JSON.parse(saved)
        .map((role) => String(role).trim())
        .filter((role) => SYSTEM_ROLES.includes(role));
      const resolvedRoles = roles.length ? roles : SYSTEM_ROLES;
      localStorage.setItem(KEYS.ROLES, JSON.stringify(resolvedRoles));
      return resolvedRoles;
    } catch {
      return SYSTEM_ROLES;
    }
  },
  saveRoles: (roles) => localStorage.setItem(KEYS.ROLES, JSON.stringify(roles)),
  resetRoles: () => {
    localStorage.setItem(KEYS.ROLES, JSON.stringify(SYSTEM_ROLES));
    return SYSTEM_ROLES;
  }
};

// --- SERVICIO DE INCIDENCIAS ---
export const incidentService = {
  getIncidents: () => {
    const saved = localStorage.getItem(KEYS.INCIDENTS);
    bgSync(insforge.database.from("incidents").select("*"), KEYS.INCIDENTS);

    if (!saved) {
      localStorage.setItem(KEYS.INCIDENTS, JSON.stringify(db.incidents));
      return db.incidents;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return db.incidents;
    }
  },
  saveIncidents: (incidents) => {
    localStorage.setItem(KEYS.INCIDENTS, JSON.stringify(incidents));
    insforge.database.from("incidents").upsert(incidents).catch(console.error);
  },
  resetIncidents: () => {
    localStorage.setItem(KEYS.INCIDENTS, JSON.stringify(db.incidents));
    insforge.database.from("incidents").upsert(db.incidents).catch(console.error);
    return db.incidents;
  }
};

// --- SERVICIO DE SECCIONES ---
export const sectionService = {
  getSections: () => {
    const saved = localStorage.getItem(KEYS.SECTIONS);
    if (!saved) {
      const initialData = db.sections || db.secciones || [];
      localStorage.setItem(KEYS.SECTIONS, JSON.stringify(initialData));
      return initialData;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return db.sections || db.secciones || [];
    }
  },
  saveSections: (sections) => {
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(sections));
  },
  resetSections: () => {
    const initialData = db.sections || db.secciones || [];
    localStorage.setItem(KEYS.SECTIONS, JSON.stringify(initialData));
    return initialData;
  }
};

// --- SERVICIO DE MATRICULAS (INSFORGE POSTGRESQL) ---
export const matriculaService = {
  getMatriculas: (callback) => {
    const saved = localStorage.getItem(KEYS.MATRICULAS);
    bgSync(
      insforge.database.from("matriculas").select("*"),
      KEYS.MATRICULAS,
      (data) => {
        if (callback) callback(data);
        return data;
      }
    );
    return saved ? JSON.parse(saved) : null;
  },

  saveMatriculas: (matriculas) => {
    localStorage.setItem(KEYS.MATRICULAS, JSON.stringify(matriculas));
    insforge.database.from("matriculas").upsert(matriculas).catch((err) => {
      console.error("[InsForge] Error al persistir matrículas:", err);
    });
  },

  saveMatricula: async (matricula) => {
    return await insforge.database.from("matriculas").upsert([matricula]).select();
  },

  deleteMatricula: async (id) => {
    return await insforge.database.from("matriculas").delete().eq("id", id);
  }
};

// --- SERVICIO DE PAGOS (INSFORGE POSTGRESQL) ---
export const pagoService = {
  getPagos: (callback) => {
    const saved = localStorage.getItem(KEYS.PAGOS);
    bgSync(
      insforge.database.from("pagos").select("*"),
      KEYS.PAGOS,
      (data) => {
        if (callback) callback(data);
        return data;
      }
    );
    return saved ? JSON.parse(saved) : null;
  },

  savePagos: (pagos) => {
    localStorage.setItem(KEYS.PAGOS, JSON.stringify(pagos));
    insforge.database.from("pagos").upsert(pagos).catch((err) => {
      console.error("[InsForge] Error al persistir pagos:", err);
    });
  },

  savePago: async (pago) => {
    return await insforge.database.from("pagos").upsert([pago]).select();
  },

  deletePago: async (id) => {
    return await insforge.database.from("pagos").delete().eq("id", id);
  }
};