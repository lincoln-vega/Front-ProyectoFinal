import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  BookOpen,
  FileText,
  Mail,
  ExternalLink,
  Loader2,
  AlertCircle,
  GraduationCap,
  Sparkles,
  ChevronRight,
  Filter
} from "lucide-react";
import { getCurrentSessionProfile } from "../../services/session";
import { courseService } from "../../services/cursosServices";
import { userService, academicosService, parseCourseList } from "../../services/api";

const normalizeName = (value) =>
  String(value || "")
    .toLowerCase()
    .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, "")
    .trim();

const matchesTeacherName = (courseName, userName) => {
  const assigned = normalizeName(courseName);
  const logged = normalizeName(userName);
  if (!assigned || !logged) return false;
  if (assigned === logged || assigned.includes(logged) || logged.includes(assigned)) return true;

  const assignedWords = assigned.split(/\s+/).filter(Boolean);
  const loggedWords = logged.split(/\s+/).filter(Boolean);
  const shared = loggedWords.filter((w) => assignedWords.includes(w));
  return (
    shared.length >= 2 ||
    (shared.length >= 1 && (shared.includes("chavez") || shared.includes("herrera") || shared.includes("paredes")))
  );
};

export default function DocenteEstudiantesPage() {
  const [profile, setProfile] = useState(null);
  const [courses, setCourses] = useState([]);
  const [ciclosList, setCiclosList] = useState([]);
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [selectedCycleFilter, setSelectedCycleFilter] = useState("vigentes");
  const [selectedCourseFilter, setSelectedCourseFilter] = useState("todos");
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadData() {
      try {
        setLoading(true);
        setError("");

        const [{ profile: currentProfile }, allCourses, allUsers, ciclos] = await Promise.all([
          getCurrentSessionProfile(),
          courseService.getCourses(),
          userService.getUsers().catch(() => []),
          academicosService.getCiclos().catch(() => [])
        ]);

        if (!cancelled) {
          setProfile(currentProfile);
          setCourses(allCourses || []);
          setUsers(allUsers || []);
          setCiclosList(Array.isArray(ciclos) ? ciclos : []);
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "Error al cargar los estudiantes.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, []);

  // Cursos asignados al docente filtrados por el ciclo seleccionado
  const myAssignedCourses = useMemo(() => {
    if (!profile) return [];
    const fullName = `${profile.nombres || ""} ${profile.apellidos || ""}`.trim();
    const idsAsignados = new Set(
      (Array.isArray(profile.cursosAsignados) ? profile.cursosAsignados : [])
        .map((c) => (typeof c === "object" && c !== null ? c.id : c))
        .filter(Boolean)
        .map(String)
    );

    return courses.filter((course) => {
      if (String(course.estado || "").toLowerCase() === "inactivo") return false;
      const belongsToTeacher =
        idsAsignados.has(String(course.id)) ||
        course.docenteId === profile.id ||
        matchesTeacherName(course.docente, fullName);
      if (!belongsToTeacher) return false;

      const isClosedCourse =
        String(course.estado || "").toLowerCase() === "finalizado" ||
        String(course.cicloEstado || "").toLowerCase() === "finalizado";

      if (selectedCycleFilter === "vigentes") return !isClosedCourse;
      if (selectedCycleFilter === "todos") return true;
      return String(course.cicloId || "") === String(selectedCycleFilter);
    });
  }, [courses, profile, selectedCycleFilter]);

  // Cruzar estudiantes con los cursos asignados a este docente
  const studentsWithCourses = useMemo(() => {
    if (myAssignedCourses.length === 0) return [];

    const studentList = users.filter((u) => String(u.rol || "").toLowerCase() === "estudiante");

    return studentList
      .map((student) => {
        const inscritos = parseCourseList(student.cursosInscritos || student.cursos_inscritos || student.CursosInscritos);
        const studentCourseIds = new Set(
          inscritos.map((c) => (typeof c === "object" && c !== null ? String(c.id) : String(c)))
        );

        // Cursos del docente donde este alumno está efectivamente matriculado en la BD
        const matchingCourses = myAssignedCourses.filter((course) =>
          studentCourseIds.has(String(course.id).trim())
        );

        if (matchingCourses.length === 0) return null;

        return {
          ...student,
          enrolledTeacherCourses: matchingCourses
        };
      })
      .filter(Boolean);
  }, [users, myAssignedCourses]);

  // Filtrado por curso seleccionado y término de búsqueda
  const filteredStudents = useMemo(() => {
    return studentsWithCourses.filter((item) => {
      // Filtro de curso
      if (selectedCourseFilter !== "todos") {
        const isInCourse = item.enrolledTeacherCourses.some(
          (c) => String(c.id) === String(selectedCourseFilter)
        );
        if (!isInCourse) return false;
      }

      // Filtro de búsqueda de texto
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase().trim();
        const fullName = `${item.nombres || ""} ${item.apellidos || ""}`.toLowerCase();
        const email = (item.correo || "").toLowerCase();
        const dni = String(item.dni || "");
        const carrera = (item.carreraObjetivo || "").toLowerCase();
        return (
          fullName.includes(query) ||
          email.includes(query) ||
          dni.includes(query) ||
          carrera.includes(query)
        );
      }

      return true;
    });
  }, [studentsWithCourses, selectedCourseFilter, searchQuery]);

  if (loading) {
    return (
      <div className="flex min-h-[400px] flex-col items-center justify-center space-y-3">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
        <p className="text-xs font-semibold text-slate-500">Cargando nómina de estudiantes...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 text-slate-800 dark:text-slate-100 animate-fade-in pb-10">
      {/* 1. HEADER PRINCIPAL */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-white/10 pb-4">
        <div>
          <h2 className="text-2xl font-extrabold text-slate-900 dark:text-white flex items-center gap-2.5">
            <Users className="w-7 h-7 text-blue-600 dark:text-blue-400" />
            <span>Nómina de Alumnos Matriculados</span>
          </h2>
          <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
            Consulta los estudiantes asignados a tus materias filtrando por ciclo académico vigente o histórico.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-start sm:self-auto">
          <select
            value={selectedCycleFilter}
            onChange={(e) => {
              setSelectedCycleFilter(e.target.value);
              setSelectedCourseFilter("todos");
            }}
            aria-label="Filtrar alumnos por periodo académico"
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-white/10 text-slate-700 dark:text-slate-200 cursor-pointer"
          >
            <option value="vigentes">Ciclos Vigentes (En Curso)</option>
            {ciclosList.map((cic) => (
              <option key={cic.id} value={cic.id}>
                {cic.nombre} ({cic.estado})
              </option>
            ))}
            <option value="todos">Todos los Periodos</option>
          </select>
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            {studentsWithCourses.length} Alumnos a Cargo
          </span>
          <span className="text-xs font-extrabold px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
            {myAssignedCourses.length} Materias
          </span>
        </div>
      </div>

      {error && (
        <div role="alert" className="p-4 rounded-xl border border-red-200 bg-red-50 text-red-600 text-xs font-bold flex items-center gap-2">
          <AlertCircle className="w-4 h-4" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. FILTROS POR CURSO Y BUSCADOR */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-4 shadow-xs space-y-3">
        {/* Pestañas de filtrado por curso */}
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-slate-500 flex items-center gap-1 mr-1">
            <Filter className="w-3.5 h-3.5" />
            <span>Materia:</span>
          </span>

          <button
            type="button"
            onClick={() => setSelectedCourseFilter("todos")}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedCourseFilter === "todos"
                ? "bg-blue-600 text-white shadow-xs"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
            }`}
          >
            Todos mis Alumnos ({studentsWithCourses.length})
          </button>

          {myAssignedCourses.map((c) => {
            const countInCourse = studentsWithCourses.filter((s) =>
              s.enrolledTeacherCourses.some((item) => String(item.id) === String(c.id))
            ).length;

            return (
              <button
                key={c.id}
                type="button"
                onClick={() => setSelectedCourseFilter(c.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedCourseFilter === c.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-white/10"
                }`}
              >
                {c.asignatura} ({countInCourse})
              </button>
            );
          })}
        </div>

        {/* Buscador de alumnos */}
        <div className="relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Buscar alumno por nombre, DNI, correo o carrera..."
            className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-slate-50 dark:bg-white/5 text-xs text-slate-800 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      {/* 3. LISTADO DE ESTUDIANTES */}
      {filteredStudents.length === 0 ? (
        <div className="p-12 text-center rounded-3xl border border-dashed border-slate-200 dark:border-white/10 bg-white/50 dark:bg-slate-900/50 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 text-indigo-600 dark:text-indigo-400 mx-auto flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
          <h4 className="text-base font-extrabold text-slate-800 dark:text-white">
            No se encontraron alumnos para esta búsqueda
          </h4>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            {searchQuery
              ? "Prueba con otro término de búsqueda o limpia el filtro."
              : "No hay alumnos inscritos en este curso específico actualmente."}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredStudents.map((student) => {
            const initials = `${(student.nombres || "A").charAt(0)}${(student.apellidos || "E").charAt(0)}`.toUpperCase();

            return (
              <div
                key={student.id}
                className="bg-white dark:bg-slate-900/90 rounded-2xl border border-slate-200/90 dark:border-white/10 p-5 shadow-xs hover:shadow-md hover:border-blue-300 dark:hover:border-blue-700 transition-all flex flex-col justify-between group"
              >
                <div className="space-y-3">
                  {/* Encabezado con Avatar e Iniciales */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-sm flex items-center justify-center shrink-0 shadow-xs">
                        {initials}
                      </div>
                      <div className="min-w-0">
                        <h4 className="text-sm font-extrabold text-slate-900 dark:text-white truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                          {student.nombres} {student.apellidos}
                        </h4>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400 block truncate">
                          DNI: {student.dni || "—"}
                        </span>
                      </div>
                    </div>

                    <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 shrink-0">
                      Activo
                    </span>
                  </div>

                  {/* Metadatos Académicos */}
                  <div className="space-y-1 bg-slate-50 dark:bg-white/5 p-3 rounded-xl border border-slate-100 dark:border-white/5 text-xs">
                    <div className="flex items-center gap-1.5 text-indigo-700 dark:text-indigo-300 font-bold">
                      <GraduationCap className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">Meta: {student.carreraObjetivo || "Ingeniería"}</span>
                    </div>
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">
                      {student.areaAcademica || "Área General"}
                    </p>
                  </div>

                  {/* Cursos que lleva con este Docente */}
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400 block mb-1.5">
                      Cursos con tu docencia:
                    </span>
                    <div className="flex flex-wrap gap-1.5">
                      {student.enrolledTeacherCourses.map((c) => (
                        <Link
                          key={c.id}
                          to={`/docente/cursos?cursoId=${c.id}&tab=alumnos`}
                          className="text-[10px] font-extrabold px-2 py-1 rounded-lg bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-900 hover:bg-blue-100 transition-colors flex items-center gap-1"
                          title={`Gestionar sección de ${c.asignatura}`}
                        >
                          <BookOpen className="w-3 h-3" />
                          <span>{c.asignatura}</span>
                        </Link>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Footer con Acciones Directas */}
                <div className="mt-4 pt-3 border-t border-slate-100 dark:border-white/5 flex items-center justify-between text-xs">
                  <a
                    href={`mailto:${student.correo}`}
                    className="inline-flex items-center gap-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
                    title={`Enviar correo a ${student.correo}`}
                  >
                    <Mail className="w-3.5 h-3.5" />
                    <span className="truncate max-w-[140px]">{student.correo}</span>
                  </a>

                  {student.enrolledTeacherCourses.length > 0 && (
                    <Link
                      to={`/docente/cursos?cursoId=${student.enrolledTeacherCourses[0].id}&tab=tareas`}
                      className="inline-flex items-center gap-1 text-[11px] font-bold text-indigo-600 dark:text-indigo-400 hover:text-indigo-700"
                      title="Asignar tarea para esta materia"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>+ Tarea</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
