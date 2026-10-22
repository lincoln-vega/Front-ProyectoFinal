import React, { useMemo, useState, useEffect } from 'react';

import CursoDetalleView from './DocenteCursosDetalles';

import { Video, BookOpen, Loader2 } from 'lucide-react';

import { getTeacherAttendances, saveTeacherAttendance } from '../../services/asistencia';

import { courseService } from '../../services/cursosServices';



const normalizeName = (value) => value

  .toLowerCase()

  .replace(/^(prof\.|dra\.|dr\.|ing\.|lic\.)\s*/i, '')

  .trim();

const matchesTeacherName = (courseName, userName) => {

  const assignedTeacher = normalizeName(courseName || '');

  const loggedInTeacher = normalizeName(userName || '');

  return assignedTeacher && (

    assignedTeacher === loggedInTeacher ||

    assignedTeacher.startsWith(`${loggedInTeacher} `) ||

    loggedInTeacher.startsWith(`${assignedTeacher} `)

  );

};



export default function DocenteCursosPage() {

  const [cursoSeleccionado, setCursoSeleccionado] = useState(null);

  const [listaCursos, setListaCursos] = useState([]);

  const [loading, setLoading] = useState(true);

  const [error, setError] = useState(null);



  const userId = localStorage.getItem('userId') || 'USR-002';

  const userName = localStorage.getItem('userName') || 'Prof. Carmen Rosa Herrera';

  const userEmail = localStorage.getItem('userEmail') || 'carmen.herrera@universidad.edu';



  const [startedCourses, setStartedCourses] = useState([]);



  // Cargar cursos desde el backend de FastAPI al montar el componente

  useEffect(() => {

    async function cargarCursos() {

      try {

        setLoading(true);

        const today = new Date().toISOString().slice(0, 10);
        const [data, attendances] = await Promise.all([
          courseService.getCourses(),
          getTeacherAttendances(userId, today)
        ]);
        setListaCursos(data || []);
        setStartedCourses(attendances.map((attendance) => attendance.cursoId));

      } catch (err) {

        console.error('Error al conectar con FastAPI:', err);

        setError('No se pudo conectar con el servidor para cargar los cursos.');

      } finally {

        setLoading(false);

      }

    }



    cargarCursos();

  }, [userId]);



  // Filtrar según el docente logueado y estado 'Activo'

  const cursosFiltrados = useMemo(() => {

    return listaCursos.filter((course) => {

      if (course.estado !== 'Activo') return false;

      return (

        course.docenteId === userId ||

        matchesTeacherName(course.docente, userName) ||

        Boolean(userEmail && course.docente?.toLowerCase().includes(userEmail.toLowerCase()))

      );

    });

  }, [listaCursos, userId, userName, userEmail]);



  const handleStartMeet = async (curso) => {

    const now = new Date();

    try {
    await saveTeacherAttendance({

      id: `TATT-${now.getTime()}`,

      docenteId: userId,

      docente: userName,

      cursoId: curso.id,

      curso: curso.asignatura,

      fecha: now.toISOString().slice(0, 10),

      horaIngreso: now.toLocaleTimeString('es-PE'),

      estado: 'Presente',

      meetUrl: curso.meetUrl

    });

    setStartedCourses((current) => current.includes(curso.id) ? current : [...current, curso.id]);

    if (curso.meetUrl) {

      window.open(curso.meetUrl, '_blank', 'noopener,noreferrer');

    }
    } catch (err) {
      console.error("No se pudo iniciar la sesión de clase:", err);
      window.alert(`No se pudo guardar la sesión en InsForge: ${err.message}`);
    }

  };



  if (cursoSeleccionado) {

    return (

      <CursoDetalleView

        cursoId={cursoSeleccionado.id}

        onVolver={() => setCursoSeleccionado(null)}

      />

    );

  }



  if (loading) {

    return (

      <div className="flex justify-center items-center min-h-[400px]">

        <Loader2 className="w-8 h-8 animate-spin text-indigo-500" />

      </div>

    );

  }



  return (

    <div className="space-y-6 text-slate-800 dark:text-slate-100">

      {/* Cabecera */}

      <div className="flex justify-between items-center">

        <div>

          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Mis Cursos</h2>

          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Cursos asignados al docente (Backend FastAPI)</p>

        </div>

      </div>



      {error && (

        <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-500 text-sm">

          {error}

        </div>

      )}



      {/* Contenido / Cuadrícula de Cursos */}

      {!error && cursosFiltrados.length === 0 ? (

        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[400px]">

          <BookOpen className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />

          <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">No hay cursos asignados</h3>

          <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-md">

            No se encontraron cursos activos en el backend asignados a tu usuario.

          </p>

        </div>

      ) : (

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

          {cursosFiltrados.map((curso) => (

            <div

              key={curso.id}

              onClick={() => setCursoSeleccionado(curso)}

              className="bg-white/70 dark:bg-slate-900/80 backdrop-blur-xl p-5 rounded-3xl border border-white/40 dark:border-slate-800 shadow-xl hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between group"

            >

              <div>

                <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-200 dark:border-slate-800">

                  <div>

                    <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20">

                      {curso.area}

                    </span>

                    <h3 className="font-bold text-slate-800 dark:text-white text-base mt-2 group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">

                      {curso.asignatura}

                    </h3>

                  </div>

                  <button

                    type="button"

                    onClick={(e) => {

                      e.stopPropagation();

                    }}

                    className="text-slate-400 hover:text-slate-700 dark:hover:text-white px-1.5 py-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 cursor-pointer text-sm"

                  >

                    ⋮

                  </button>

                </div>



                <div className="my-4 space-y-2">

                  <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">

                    Carrera: <span className="text-slate-700 dark:text-slate-200 font-semibold">{curso.carrera}</span>

                  </p>

                  <p className="text-sm text-slate-600 dark:text-slate-300 flex items-center gap-1.5 font-medium">

                    <span className="text-slate-400">👤</span> Docente: <strong className="text-slate-800 dark:text-white">{curso.docente}</strong>

                  </p>

                </div>

              </div>



              <div className="pt-4 border-t border-slate-200 dark:border-slate-800 flex items-center justify-between text-xs gap-2">

                <span className="text-slate-500 dark:text-slate-400 flex items-center gap-1.5 truncate">

                  🗓️ <span className="text-slate-700 dark:text-slate-100 font-semibold truncate">

                    {Array.isArray(curso.dias) ? curso.dias.join(', ') : curso.dias} ({curso.horaInicio} - {curso.horaFin})

                  </span>

                </span>

                <button

                  type="button"

                  disabled={!curso.meetUrl}

                  onClick={(event) => {

                    event.stopPropagation();

                    void handleStartMeet(curso);

                  }}

                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white transition-colors hover:bg-emerald-700 disabled:cursor-not-allowed disabled:bg-slate-400 dark:disabled:bg-slate-700 shadow-sm shrink-0"

                >

                  <Video className="h-4 w-4" />

                  {startedCourses.includes(curso.id) ? 'Asistido' : curso.meetUrl ? 'Iniciar Meet' : 'Sin Meet'}

                </button>

              </div>

            </div>

          ))}

        </div>

      )}

    </div>

  );

} 