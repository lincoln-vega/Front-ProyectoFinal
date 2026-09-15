import db from "../data/db.json";

const KEYS = {
  USERS: "academia_users",
  ROLES: "app_roles",
  INCIDENTS: "academia_teacher_incidents",
  COURSES: "academia_courses",
  SECTIONS: "academia_sections"
};

const SYSTEM_ROLES = ["Admin", "Docente", "Estudiante"];

// --- SERVICIO DE USUARIOS ---
const removeVirtualCycleField = (users) => users.map(({ cicloVirtual, ...user }) => user);

export const userService = {
  getUsers: () => {
    const saved = localStorage.getItem(KEYS.USERS);
    if (!saved) return removeVirtualCycleField(db.users);
    try {
      const users = removeVirtualCycleField(JSON.parse(saved));
      localStorage.setItem(KEYS.USERS, JSON.stringify(users));
      return users;
    } catch {
      return removeVirtualCycleField(db.users);
    }
  },
  saveUsers: (users) => localStorage.setItem(KEYS.USERS, JSON.stringify(removeVirtualCycleField(users))),
  resetUsers: () => {
    const users = removeVirtualCycleField(db.users);
    localStorage.setItem(KEYS.USERS, JSON.stringify(users));
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
    const normalizedCourses = removeClassroomField(courses).map((course) => ({
      ...course,
      docenteId: course.docenteId || db.courses.find((initialCourse) => initialCourse.id === course.id)?.docenteId || "",
      meetUrl: course.meetUrl || db.courses.find((initialCourse) => initialCourse.id === course.id)?.meetUrl || ""
    }));
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