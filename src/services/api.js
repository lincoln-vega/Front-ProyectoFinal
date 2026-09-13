import db from "../data/db.json";

const KEYS = {
  USERS: "academia_users",
  ROLES: "app_roles",
  INCIDENTS: "academia_teacher_incidents",
  COURSES: "academia_courses",
  SECTIONS: "academia_sections"
};

// --- SERVICIO DE USUARIOS ---
export const userService = {
  getUsers: () => {
    const saved = localStorage.getItem(KEYS.USERS);
    if (!saved) {
      localStorage.setItem(KEYS.USERS, JSON.stringify(db.users));
      return db.users;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return db.users;
    }
  },
  saveUsers: (users) => localStorage.setItem(KEYS.USERS, JSON.stringify(users)),
  resetUsers: () => {
    localStorage.setItem(KEYS.USERS, JSON.stringify(db.users));
    return db.users;
  }
};

// --- SERVICIO DE ROLES ---
export const roleService = {
  getRoles: () => {
    const saved = localStorage.getItem(KEYS.ROLES);
    if (!saved) {
      localStorage.setItem(KEYS.ROLES, JSON.stringify(db.roles));
      return db.roles;
    }
    try {
      return JSON.parse(saved);
    } catch {
      return db.roles;
    }
  },
  saveRoles: (roles) => localStorage.setItem(KEYS.ROLES, JSON.stringify(roles)),
  resetRoles: () => {
    localStorage.setItem(KEYS.ROLES, JSON.stringify(db.roles));
    return db.roles;
  }
};

// --- SERVICIO DE INCIDENCIAS ---
export const incidentService = {
  getIncidents: () => {
    const saved = localStorage.getItem(KEYS.INCIDENTS);
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
  saveIncidents: (incidents) => localStorage.setItem(KEYS.INCIDENTS, JSON.stringify(incidents)),
  resetIncidents: () => {
    localStorage.setItem(KEYS.INCIDENTS, JSON.stringify(db.incidents));
    return db.incidents;
  }
};

// --- SERVICIO DE CURSOS Y ESTUDIANTES ---
const removeClassroomField = (courses) => courses.map(({ aula, ...course }) => course);

export const courseService = {
  getCourses: () => {
    const saved = localStorage.getItem(KEYS.COURSES);
    const courses = saved ? JSON.parse(saved) : db.courses;
    const normalizedCourses = removeClassroomField(courses);
    localStorage.setItem(KEYS.COURSES, JSON.stringify(normalizedCourses));
    return normalizedCourses;
  },
  saveCourses: (courses) => localStorage.setItem(KEYS.COURSES, JSON.stringify(removeClassroomField(courses)))
};

export const studentService = {
  getStudentCourses: () => db.studentCourses,
  getStudentAttendance: () => db.studentAttendance
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