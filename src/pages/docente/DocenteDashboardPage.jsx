import React, { useEffect, useState, useMemo } from "react";
import { BookOpen, Users, AlertCircle, Loader2 } from "lucide-react";
import { courseService } from "../../services/cursosServices";
import { userService } from "../../services/api";

// Función de normalización para asegurar la coincidencia exacta del docente
const normalizeName = (value) => 
  (value || '')
    .toLowerCase()
    .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, '')
    .trim();

const matchesTeacherName = (courseName, userName) => {
  const assignedTeacher = normalizeName(courseName);
  const loggedInTeacher = normalizeName(userName);
  return assignedTeacher && (
    assignedTeacher === loggedInTeacher ||
    assignedTeacher.startsWith(`${loggedInTeacher} `) ||
    loggedInTeacher.startsWith(`${assignedTeacher} `)
  );
};

export default function DocenteDashboardPage() {
  const userName = localStorage.getItem("userName") || "Docente";
  const userId = localStorage.getItem("userId") || "";
  const userEmail = localStorage.getItem("userEmail") || "";

  const [listaCursos, setListaCursos] = useState([]);
  const [listaUsuarios, setListaUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [docenteData, setDocenteData] = useState(null);

  useEffect(() => {
    async function cargarDatosDashboard() {
      try {
        setLoading(true);
        
        // 1. Cargar cursos desde el servicio
        const cursos = courseService.getCourses();
        setListaCursos(cursos || []);

        // 2. Obtener usuarios desde el servicio local y su caché, sin depender del endpoint antiguo.
        setListaUsuarios(userService.getUsers() || []);

        // 3. Buscar información adicional de nómina/especialidad en localStorage si existe
        const stored = localStorage.getItem("docentesData");
        if (stored) {
          const docentes = JSON.parse(stored);
          const mine = docentes.find(d => d.nombre === userName);
          if (mine) setDocenteData(mine);
        }
      } catch (err) {
        console.error("Error al cargar datos del dashboard:", err);
      } finally {
        setLoading(false);
      }
    }

    cargarDatosDashboard();
  }, [userName]);

  // Filtrar los cursos asignados al docente activo con estado 'Activo'
  const cursosAsignados = useMemo(() => {
    return listaCursos.filter((course) => {
      if (course.estado !== 'Activo') return false;
      return (
        course.docenteId === userId || 
        matchesTeacherName(course.docente, userName) ||
        Boolean(userEmail && course.docente?.toLowerCase().includes(userEmail.toLowerCase()))
      );
    });
  }, [listaCursos, userId, userName, userEmail]);

  // Calcular el total de estudiantes matriculados en los cursos del docente
  const totalEstudiantes = useMemo(() => {
    const idsCursosDocente = new Set(cursosAsignados.map(c => c.id));
    
    // Contar estudiantes únicos cuyo campo 'cursosInscritos' contenga alguno de los cursos del profesor
    const estudiantesUnicos = listaUsuarios.filter(u => {
      if (u.rol !== 'estudiante' || !Array.isArray(u.cursosInscritos)) return false;
      return u.cursosInscritos.some(c => idsCursosDocente.has(c.id));
    });

    return estudiantesUnicos.length;
  }, [cursosAsignados, listaUsuarios]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">¡Bienvenido(a), {userName}!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Este es tu panel de control principal. Aquí podrás ver un resumen de tus clases, nómina e incidencias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        
        {/* Tarjeta de Cursos Asignados (Dinámico) */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400">
            <BookOpen className="w-6 h-6"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cursos Asignados</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{cursosAsignados.length}</p>
          </div>
        </div>

        {/* Tarjeta de Total Estudiantes Matriculados (Dinámico) */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400">
            <Users className="w-6 h-6"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Estudiantes</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{totalEstudiantes}</p>
          </div>
        </div>

        {/* Tarjeta de Incidencias (Fijado en 0) */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400">
            <AlertCircle className="w-6 h-6"/>
          </div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Incidencias</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">0</p>
          </div>
        </div>

      </div>

      {docenteData && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Información de Nómina e Incidencias</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Especialidad</span>
              <span className="font-semibold dark:text-slate-200">{docenteData.especialidad}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Nómina Base (S/)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">S/ {docenteData.salario.toFixed(2)}</span>
            </div>
            <div className="py-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium mb-2 block">Historial de Incidencias:</span>
              <p className="text-sm text-slate-400 dark:text-slate-500 italic">No tienes incidencias registradas.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}