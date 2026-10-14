import db from "../data/db.json";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token_acceso");

  return {
    "Content-Type": "application/json",
    ...(token ? { Authorization: `Bearer ${token}` } : {})
  };
};

const getErrorMessage = async (response, fallback) => {
  try {
    const data = await response.json();
    if (typeof data.detail === "string") return data.detail;
    if (Array.isArray(data.detail)) {
      return data.detail.map((item) => item.msg).join(", ");
    }
  } catch {
    // La respuesta puede no contener JSON.
  }
  return fallback;
};

export const courseService = {
  async getCourses() {
    const response = await fetch(`${API_URL}/horarios/cursos`, {
      method: "GET",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Error al cargar los cursos"));
    }

    const data = await response.json();
    return Array.isArray(data) ? data : data.items || data.courses || [];
  },

  async createCourse(courseData) {
    const response = await fetch(`${API_URL}/horarios/cursos`, {
      method: "POST",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Error al crear el curso"));
    }

    return response.json();
  },

  async updateCourse(courseId, courseData) {
    const response = await fetch(`${API_URL}/horarios/cursos/${encodeURIComponent(courseId)}`, {
      method: "PUT",
      headers: getAuthHeaders(),
      body: JSON.stringify(courseData)
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Error al actualizar el curso"));
    }

    return response.json();
  },

  async deleteCourse(courseId) {
    const response = await fetch(`${API_URL}/horarios/cursos/${encodeURIComponent(courseId)}`, {
      method: "DELETE",
      headers: getAuthHeaders()
    });

    if (!response.ok) {
      throw new Error(await getErrorMessage(response, "Error al desactivar el curso"));
    }

    return response.json();
  }
};

const readStorage = (key, fallback) => {
  const saved = localStorage.getItem(key);
  return saved ? JSON.parse(saved) : fallback;
};

const writeStorage = (key, value) => {
  localStorage.setItem(key, JSON.stringify(value));
};

export const userService = {
  getUsers: () => readStorage("db_users", db.users || []),
  saveUsers: (users) => writeStorage("db_users", users),
  resetUsers: () => {
    writeStorage("db_users", db.users || []);
    return db.users || [];
  }
};

export const roleService = {
  getRoles: () => readStorage("db_roles", db.roles || []),
  saveRoles: (roles) => writeStorage("db_roles", roles),
  resetRoles: () => {
    writeStorage("db_roles", db.roles || []);
    return db.roles || [];
  }
};

export const incidentService = {
  getIncidents: () => readStorage("db_incidents", db.incidents || []),
  saveIncidents: (incidents) => writeStorage("db_incidents", incidents),
  resetIncidents: () => {
    writeStorage("db_incidents", db.incidents || []);
    return db.incidents || [];
  }
};
