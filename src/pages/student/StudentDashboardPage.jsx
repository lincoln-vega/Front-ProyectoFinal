import React, { useState } from "react";
import db from "../../data/db.json";

const studentCourses = db.studentCourses;
const studentAttendance = db.studentAttendance;

import {
  Video,
  Clock,
  User,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  GraduationCap,
  Sparkles,
  ExternalLink,
  BookOpen,
  Calendar,
  X
} from "lucide-react";

export default function StudentDashboardPage() {
  const [activeMeetModal, setActiveMeetModal] = useState(null);
  const studentName = localStorage.getItem("userName") || "Juan Carlos Flores";

  const handleJoinMeet = (course) => {
    setActiveMeetModal(course);
  };

  return (
    <div className="space-y-8 animate-fade-in">
      {/* BANNER DE BIENVENIDA */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Panel del Estudiante • SCRM-30</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
            ¡Hola, {studentName}! 🚀
          </h1>
          <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
            Bienvenido a tu plataforma de preparación preuniversitaria. Revisa tus asignaturas del día, únete a tus salas virtuales de Meet y monitorea tu registro de asistencia.
          </p>

          <div className="mt-6 flex flex-wrap gap-4 text-xs">
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <span className="text-blue-200 block">Ciclo Académico:</span>
              <strong className="text-white text-sm">Anual San Marcos 2026</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <span className="text-blue-200 block">Meta Universitaria:</span>
              <strong className="text-white text-sm">Medicina Humana (UNMSM)</strong>
            </div>
            <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
              <span className="text-blue-200 block">Puntualidad General:</span>
              <strong className="text-emerald-300 text-sm">92.5% de Asistencia</strong>
            </div>
          </div>
        </div>
      </div>

      {/* SECCIÓN 1: MIS CURSOS DE ADMISIÓN */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Mis Cursos de Admisión
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Accede directamente a tus clases virtuales en vivo con docentes especializados.
            </p>
          </div>
          <span className="text-sm font-semibold px-3 py-1.5 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg self-start sm:self-auto border border-slate-200 dark:border-white/10">
            {studentCourses.length} Materias Asignadas
          </span>
        </div>

        {/* Grid de Tarjetas de Materias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-blue-300"
            >
              {/* Encabezado de la Tarjeta */}
              <div className="p-5 space-y-3.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 px-3 py-1 rounded-md border border-blue-100 dark:border-blue-900/50 uppercase tracking-wide">
                    {course.aula}
                  </span>
                  <span className="text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/30 px-2.5 py-1 rounded-full border border-emerald-200 dark:border-emerald-900/50 flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    En vivo hoy
                  </span>
                </div>

                <h3 className="text-xl font-bold text-slate-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors leading-snug">
                  {course.materia}
                </h3>

                <div className="space-y-2.5 text-sm text-slate-700 dark:text-slate-200 pt-1">
                  <div className="flex items-center space-x-2.5">
                    <User className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Docente:</strong> {course.docente}</span>
                  </div>
                  <div className="flex items-center space-x-2.5">
                    <Clock className="w-4.5 h-4.5 text-slate-400 shrink-0" />
                    <span><strong className="text-slate-900 dark:text-white">Horario:</strong> {course.horario}</span>
                  </div>
                  <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5 text-sm text-slate-800 dark:text-slate-200">
                    <span className="text-slate-500 dark:text-slate-400 block font-bold uppercase text-xs tracking-wider mb-1">
                      Tema de la semana
                    </span>
                    <span className="font-medium text-slate-900 dark:text-slate-100">
                      {course.temaActual}
                    </span>
                  </div>
                </div>
              </div>

              {/* Pie de Tarjeta con Botón Verde Llamativo para Meet */}
              <div className="p-5 pt-0">
                <button
                  onClick={() => handleJoinMeet(course)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3.5 px-4 rounded-xl shadow-md hover:shadow-emerald-600/30 transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer group-hover:scale-[1.01]"
                >
                  <Video className="w-5 h-5 shrink-0 animate-bounce" />
                  <span className="tracking-wide text-base font-bold">
                    Unirse a Sala Virtual (Meet)
                  </span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* SECCIÓN 2: MI HISTORIAL DE ASISTENCIA */}
      <section className="space-y-4 pt-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 dark:border-white/10 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Mi Historial de Asistencia
              </h2>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
              Registro biométrico y de conexión virtual de las últimas sesiones sincrónicas.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 text-sm">
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 font-semibold">
              <CheckCircle2 className="w-4 h-4 mr-1.5" />
              Puntual: 4
            </span>
            <span className="inline-flex items-center px-3 py-1.5 rounded-lg bg-amber-50 dark:bg-amber-900/30 text-amber-700 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 font-semibold">
              <AlertTriangle className="w-4 h-4 mr-1.5" />
              Tardanzas: 2
            </span>
          </div>
        </div>

        {/* Tabla Limpia y Amigable de Asistencia */}
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-sm">
              <thead>
                <tr className="bg-slate-100/80 dark:bg-white/5 text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-white/10 font-bold text-sm uppercase tracking-wider">
                  <th scope="col" className="py-4 px-4">Fecha</th>
                  <th scope="col" className="py-4 px-4">Materia / Curso</th>
                  <th scope="col" className="py-4 px-4">Hora de Registro</th>
                  <th scope="col" className="py-4 px-4">Modalidad</th>
                  <th scope="col" className="py-4 px-4 text-center">Estado de Asistencia</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
                {studentAttendance.map((item) => (
                  <tr
                    key={item.id}
                    className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-200 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4.5 h-4.5 text-slate-400" />
                        <span>{item.fecha}</span>
                      </div>
                    </td>
                    <td className="py-3.5 px-4 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">
                      {item.materia}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-sm text-slate-700 dark:text-slate-300 whitespace-nowrap">
                      {item.horaRegistro}
                    </td>
                    <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300 whitespace-nowrap font-medium">
                      {item.modalidad}
                    </td>
                    <td className="py-3.5 px-4 text-center whitespace-nowrap">
                      {item.estado === "Asistió Puntual" ? (
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-900/50 shadow-2xs">
                          <CheckCircle2 className="w-4 h-4 mr-1.5 text-emerald-600 dark:text-emerald-400" />
                          Asistió Puntual
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 border border-amber-200 dark:border-amber-900/50 shadow-2xs">
                          <AlertTriangle className="w-4 h-4 mr-1.5 text-amber-600 dark:text-amber-400" />
                          Tardanza
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3.5 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/5 text-center text-sm text-slate-500 dark:text-slate-400 font-medium">
            Mostrando las últimas 6 asistencias sincronizadas con el aula virtual.
          </div>
        </div>
      </section>

      {/* MODAL SIMULADO DE CONEXIÓN A GOOGLE MEET */}
      {activeMeetModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
          <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 dark:border-white/10 overflow-hidden animate-fade-in text-center p-6 space-y-4">
            <div className="w-14 h-14 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center mx-auto text-emerald-700 dark:text-emerald-400">
              <Video className="w-7 h-7" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                Conectando a Sala Virtual
              </h3>
              <p className="text-base font-bold text-[#1E3A8A] dark:text-blue-400 mt-1">
                {activeMeetModal.materia}
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-2">
                Docente a cargo: <strong className="text-slate-900 dark:text-white">{activeMeetModal.docente}</strong>
              </p>
              <p className="text-sm text-slate-600 dark:text-slate-300">
                Horario: {activeMeetModal.horario}
              </p>
            </div>

            <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-xl border border-slate-200 dark:border-white/10 text-sm font-mono text-slate-700 dark:text-slate-200 flex items-center justify-between">
              <span className="truncate pr-2">{activeMeetModal.meetUrl}</span>
              <span className="text-xs bg-emerald-600 text-white font-sans px-2.5 py-1 rounded-md font-bold shrink-0">
                Activa
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <button
                onClick={() => setActiveMeetModal(null)}
                className="w-full py-3 px-4 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 font-semibold rounded-xl text-sm hover:bg-slate-50 dark:hover:bg-white/5 cursor-pointer"
              >
                Regresar al Panel
              </button>
              <a
                href={activeMeetModal.meetUrl}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setActiveMeetModal(null)}
                className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md cursor-pointer"
              >
                <span>Abrir Google Meet</span>
                <ExternalLink className="w-4 h-4" />
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
