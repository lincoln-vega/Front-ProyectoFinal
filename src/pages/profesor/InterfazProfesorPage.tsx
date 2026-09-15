import React, { useState } from 'react';
import { 
  Trophy, 
  Medal, 
  Award, 
  Users, 
  BookOpen, 
  CheckCircle2, 
  AlertCircle, 
  Radio, 
  TrendingUp,
  GraduationCap,
  Calendar,
  Clock,
  Sparkles
} from 'lucide-react';

interface StudentRanking {
  puesto: number;
  nombre: string;
  codigo: string;
  carrera: string;
  promedio: number;
  asistencia: number;
  avatarText: string;
}

interface CourseCycleRanking {
  id: string;
  curso: string;
  codigoCurso: string;
  ciclo: string;
  horario: string;
  aula: string;
  totalAlumnos: number;
  topEstudiantes: StudentRanking[];
}

const rankingPorCursoCiclo: CourseCycleRanking[] = [
  {
    id: '1',
    curso: 'Introducción al Cálculo Avanzado',
    codigoCurso: 'MAT-301',
    ciclo: 'Ciclo 2026-I (Ciencias Exactas)',
    horario: 'Mar y Jue 08:00 - 10:00 AM',
    aula: 'Aula Virtual A-101',
    totalAlumnos: 45,
    topEstudiantes: [
      {
        puesto: 1,
        nombre: 'Valeria Sofía Quispe Alarcón',
        codigo: 'A202606',
        carrera: 'Ing. de Sistemas (UNI)',
        promedio: 19.8,
        asistencia: 100,
        avatarText: 'VQ'
      },
      {
        puesto: 2,
        nombre: 'Juan Carlos Flores Mendoza',
        codigo: 'A202605',
        carrera: 'Medicina Humana (UNMSM)',
        promedio: 19.3,
        asistencia: 98,
        avatarText: 'JF'
      },
      {
        puesto: 3,
        nombre: 'Lucía Fernanda Gómez Pérez',
        codigo: 'A202607',
        carrera: 'Derecho (PUCP)',
        promedio: 18.9,
        asistencia: 95,
        avatarText: 'LG'
      }
    ]
  },
  {
    id: '2',
    curso: 'Física Fundamental',
    codigoCurso: 'FIS-201',
    ciclo: 'Ciclo 2026-I (Ingeniería)',
    horario: 'Mar y Jue 08:00 - 10:00 AM',
    aula: 'Aula Virtual B-204',
    totalAlumnos: 38,
    topEstudiantes: [
      {
        puesto: 1,
        nombre: 'Diego Flores Mendoza',
        codigo: 'A202609',
        carrera: 'Ing. Mecánica (UNI)',
        promedio: 19.6,
        asistencia: 100,
        avatarText: 'DF'
      },
      {
        puesto: 2,
        nombre: 'Carlos López Morales',
        codigo: 'A202603',
        carrera: 'Ing. Electrónica (UNI)',
        promedio: 19.1,
        asistencia: 97,
        avatarText: 'CL'
      },
      {
        puesto: 3,
        nombre: 'Elena Morales Ruiz',
        codigo: 'A202610',
        carrera: 'Física Pura (UNMSM)',
        promedio: 18.7,
        asistencia: 95,
        avatarText: 'EM'
      }
    ]
  },
  {
    id: '3',
    curso: 'Biología y Anatomía',
    codigoCurso: 'BIO-105',
    ciclo: 'Ciclo 2026-II (Ciencias Médicas)',
    horario: 'Lun y Vie 03:00 - 05:00 PM',
    aula: 'Aula Virtual C-302',
    totalAlumnos: 42,
    topEstudiantes: [
      {
        puesto: 1,
        nombre: 'Ana Martínez Torres',
        codigo: 'A202604',
        carrera: 'Medicina Humana (UNMSM)',
        promedio: 19.9,
        asistencia: 100,
        avatarText: 'AM'
      },
      {
        puesto: 2,
        nombre: 'María García Vargas',
        codigo: 'A202602',
        carrera: 'Enfermería (UNMSM)',
        promedio: 19.4,
        asistencia: 98,
        avatarText: 'MG'
      },
      {
        puesto: 3,
        nombre: 'Pedro Sánchez Huamán',
        codigo: 'A202608',
        carrera: 'Odontología (UNFV)',
        promedio: 18.8,
        asistencia: 93,
        avatarText: 'PS'
      }
    ]
  }
];

export default function PrincipalView() {
  const [cursoSeleccionadoId, setCursoSeleccionadoId] = useState<string>('1');

  const cursoActual = rankingPorCursoCiclo.find((c) => c.id === cursoSeleccionadoId) || rankingPorCursoCiclo[0];

  return (
    <div className="space-y-6 text-slate-100">
      {/* Encabezado de Bienvenida */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-xl font-bold text-white">Vista General del Panel</h2>
            <span className="text-[11px] font-semibold text-indigo-400 bg-indigo-950/60 px-2.5 py-0.5 rounded-full border border-indigo-800/50 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-indigo-400" />
              Rol Docente
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Resumen académico y seguimiento en tiempo real de tus clases y estudiantes destacados.
          </p>
        </div>

        <div className="flex items-center gap-2 text-xs text-slate-400 bg-slate-950/70 border border-slate-800 px-3.5 py-2 rounded-lg self-start md:self-auto">
          <Calendar className="w-4 h-4 text-indigo-400" />
          <span>Periodo Académico: <strong className="text-white">2026 - I</strong></span>
        </div>
      </div>

      {/* Cuadrícula de Métricas de Docente */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1: Alumnos conectados a la última clase */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Alumnos conectados
            </span>
            <span className="flex items-center gap-1 text-[11px] text-emerald-400 font-medium">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              En vivo
            </span>
          </div>
          <div className="my-2">
            <div className="flex items-baseline gap-2">
              <h3 className="text-2xl font-extrabold text-white">38</h3>
              <span className="text-xs text-slate-400">/ 42 alumnos</span>
            </div>
            <span className="inline-block mt-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
              90.5% en la última clase
            </span>
          </div>
          <p className="text-[11px] text-slate-400 flex items-center gap-1.5 mt-1">
            <Radio className="w-3.5 h-3.5 text-emerald-400" />
            <span>Última sesión: Cálculo Avanzado</span>
          </p>
        </div>

        {/* Métrica 2: Cursos a mi cargo */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Cursos asignados
            </span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white">3</h3>
            <span className="inline-block mt-1 text-[11px] font-medium text-indigo-300 bg-indigo-950/60 px-2 py-0.5 rounded-full border border-indigo-800/50">
              Activos en este ciclo
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            MAT-301, FIS-201, BIO-105
          </p>
        </div>

        {/* Métrica 3: Asistencia promedio general */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Asistencia promedio
            </span>
            <TrendingUp className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white">93.4%</h3>
            <span className="inline-block mt-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
              +4.2% respecto al mes anterior
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            Registro global acumulado
          </p>
        </div>

        {/* Métrica 4: Incidencias o consultas de alumnos */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between hover:border-slate-700 transition-colors">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
              Consultas e incidencias
            </span>
            <AlertCircle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-amber-400">2</h3>
            <span className="inline-block mt-1 text-[11px] font-medium text-amber-300 bg-amber-950/60 px-2 py-0.5 rounded-full border border-amber-800/50">
              Pendientes de revisión
            </span>
          </div>
          <p className="text-[11px] text-slate-400">
            1 justificación médica, 1 consulta
          </p>
        </div>
      </div>

      {/* Cuadrícula de Detalles: Top 3 Estudiantes y Actividad Reciente */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* TOP 3 ESTUDIANTES POR CURSO / CICLO (Reemplaza a Tareas Administrativas) */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between space-y-4">
          <div>
            {/* Cabecera de la sección con selector de curso/ciclo */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div className="flex items-center space-x-2.5">
                <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Top 3 Estudiantes</h3>
                  <p className="text-[11px] text-slate-400">Mejores promedios y asistencia por curso</p>
                </div>
              </div>

              {/* Selector interactivo de Curso / Ciclo */}
              <div className="flex items-center">
                <select
                  value={cursoSeleccionadoId}
                  onChange={(e) => setCursoSeleccionadoId(e.target.value)}
                  className="bg-slate-950 border border-slate-700 text-xs text-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:border-indigo-500 cursor-pointer"
                >
                  {rankingPorCursoCiclo.map((item) => (
                    <option key={item.id} value={item.id} className="bg-slate-900 text-slate-200">
                      {item.codigoCurso} - {item.curso}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Subcabecera informativa del curso/ciclo activo */}
            <div className="mt-3.5 mb-3 bg-slate-950/60 border border-slate-800/80 rounded-lg p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-slate-300 font-medium">
                <GraduationCap className="w-4 h-4 text-indigo-400" />
                <span>{cursoActual.ciclo}</span>
              </div>
              <div className="flex items-center gap-3 text-slate-400 text-[11px]">
                <span>{cursoActual.aula}</span>
                <span>•</span>
                <span>{cursoActual.horario}</span>
              </div>
            </div>

            {/* Podio / Lista del Top 3 */}
            <div className="space-y-3 mt-2">
              {cursoActual.topEstudiantes.map((estudiante) => {
                const esPrimero = estudiante.puesto === 1;
                const esSegundo = estudiante.puesto === 2;
                const esTercero = estudiante.puesto === 3;

                return (
                  <div
                    key={estudiante.codigo}
                    className={`p-3.5 rounded-xl border transition-all flex items-center justify-between gap-3 ${
                      esPrimero
                        ? 'bg-gradient-to-r from-amber-950/30 via-slate-900 to-slate-900 border-amber-500/40 shadow-sm shadow-amber-950/20'
                        : esSegundo
                        ? 'bg-gradient-to-r from-slate-800/40 via-slate-900 to-slate-900 border-slate-700'
                        : 'bg-gradient-to-r from-orange-950/20 via-slate-900 to-slate-900 border-orange-900/40'
                    }`}
                  >
                    {/* Posición y Avatar */}
                    <div className="flex items-center space-x-3 min-w-0">
                      <div className="flex-shrink-0 flex items-center justify-center w-8 h-8 rounded-full font-extrabold text-xs shadow-inner">
                        {esPrimero && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-500 text-slate-950 font-black shadow-md shadow-amber-500/30">
                            1°
                          </span>
                        )}
                        {esSegundo && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-slate-300 text-slate-950 font-black">
                            2°
                          </span>
                        )}
                        {esTercero && (
                          <span className="flex items-center justify-center w-8 h-8 rounded-full bg-amber-700 text-white font-black">
                            3°
                          </span>
                        )}
                      </div>

                      {/* Iniciales Avatar */}
                      <div className="flex-shrink-0 w-9 h-9 rounded-lg bg-slate-800 border border-slate-700 flex items-center justify-center text-xs font-bold text-indigo-300">
                        {estudiante.avatarText}
                      </div>

                      {/* Información Alumno */}
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="text-sm font-bold text-white truncate">
                            {estudiante.nombre}
                          </h4>
                          {esPrimero && (
                            <span title="Mejor Promedio">
                              <Medal className="w-3.5 h-3.5 text-amber-400 flex-shrink-0" />
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 truncate">
                          {estudiante.carrera} • <span className="font-mono text-slate-500">{estudiante.codigo}</span>
                        </p>
                      </div>
                    </div>

                    {/* Calificación y Asistencia */}
                    <div className="flex-shrink-0 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <span className="text-[10px] uppercase font-semibold text-slate-400">Nota:</span>
                        <span className={`text-sm font-extrabold ${
                          esPrimero ? 'text-amber-400' : esSegundo ? 'text-slate-200' : 'text-orange-300'
                        }`}>
                          {estudiante.promedio.toFixed(1)}
                        </span>
                        <span className="text-[10px] text-slate-500">/20</span>
                      </div>
                      <div className="mt-1 flex items-center justify-end gap-1 text-[11px] text-emerald-400">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                        <span>{estudiante.asistencia}% asist.</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Pie del bloque de Ranking */}
          <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-500">
            <span>Evaluando a {cursoActual.totalAlumnos} alumnos matriculados</span>
            <span className="text-indigo-400 font-medium cursor-pointer hover:underline">
              Ver cuadro de honor completo →
            </span>
          </div>
        </div>

        {/* Actividad Reciente del Docente */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Actividad y Registros Recientes</h3>
              <span className="text-xs text-slate-400">Últimas 24 horas</span>
            </div>

            <ul className="space-y-4 my-4">
              <li className="border-l-2 border-emerald-500 pl-3">
                <div className="flex items-center justify-between">
                  <small className="text-[11px] font-semibold text-emerald-400">08:00 AM, Hoy</small>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-950/70 text-emerald-300 border border-emerald-800/40">Completado</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Sesión en vivo de <strong className="text-white">Cálculo Avanzado (MAT-301)</strong> finalizada. Asistencia guardada: 38 alumnos conectados.
                </p>
              </li>

              <li className="border-l-2 border-indigo-500 pl-3">
                <div className="flex items-center justify-between">
                  <small className="text-[11px] font-semibold text-indigo-400">Ayer, 04:30 PM</small>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-indigo-950/70 text-indigo-300 border border-indigo-800/40">Calificaciones</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Se actualizaron las notas de la Práctica 1 en <strong className="text-white">Física Fundamental</strong>.
                </p>
              </li>

              <li className="border-l-2 border-amber-500 pl-3">
                <div className="flex items-center justify-between">
                  <small className="text-[11px] font-semibold text-amber-400">Ayer, 11:20 AM</small>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-950/70 text-amber-300 border border-amber-800/40">Justificación</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Nueva solicitud de justificación médica recibida para revisión en el aula virtual.
                </p>
              </li>

              <li className="border-l-2 border-slate-700 pl-3">
                <div className="flex items-center justify-between">
                  <small className="text-[11px] font-semibold text-slate-400">06 Sep, 03:00 PM</small>
                  <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">Material</span>
                </div>
                <p className="text-xs text-slate-300 mt-1">
                  Material didáctico subido con éxito: <strong className="text-white">Guía de Ejercicios Semana 2</strong>.
                </p>
              </li>
            </ul>
          </div>

          <div className="pt-3 border-t border-slate-800 text-xs text-slate-500 flex items-center justify-between">
            <span>Registro sincronizado con la plataforma</span>
            <span className="text-slate-400">4 registros mostrados</span>
          </div>
        </div>
      </div>
    </div>
  );
}