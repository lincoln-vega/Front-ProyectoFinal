import React, { useState } from "react";
import db from "../../data/db.json";

import HeaderStudent from "../../components/HeaderStudent";
import MeetModalPage from "./MeetModalPage";
import { saveAttendanceRecord } from "../../services/asistencia";

const studentCourses = db.studentCourses;
const studentAttendance = db.studentAttendance;

import {
  Video,
  Clock,
  User,
  CalendarCheck,
  CheckCircle2,
  AlertTriangle,
  BookOpen,
  Calendar
} from "lucide-react";

export default function StudentDashboardPage() {
  const [activeMeetModal, setActiveMeetModal] = useState(null);
  const studentName = localStorage.getItem("userName") || "Juan Carlos Flores";

  return (
    <div className="space-y-8 animate-fade-in">
      {/* BANNER DE BIENVENIDA */}
      <HeaderStudent studentName={studentName} />

      {/* SECCIÓN 1: MIS CURSOS DE ADMISIÓN */}
      <section className="space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <BookOpen className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-xl font-bold text-slate-800">
                Mis Cursos de Admisión
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Accede directamente a tus clases virtuales en vivo con docentes especializados.
            </p>
          </div>
          <span className="text-xs font-semibold px-2.5 py-1 bg-slate-100 text-slate-600 rounded-lg self-start sm:self-auto border border-slate-200">
            {studentCourses.length} Materias Asignadas
          </span>
        </div>

        {/* Grid de Tarjetas de Materias */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {studentCourses.map((course) => (
            <div
              key={course.id}
              className="bg-white rounded-2xl border border-slate-200/90 shadow-sm hover:shadow-md transition-all duration-200 flex flex-col justify-between overflow-hidden group hover:border-blue-300"
            >
              <div className="p-5 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#1E3A8A] bg-blue-50 px-2.5 py-1 rounded-md border border-blue-100 uppercase tracking-wide">
                    {course.aula}
                  </span>
                  <span className="text-[11px] font-medium text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                    En vivo hoy
                  </span>
                </div>

                <h3 className="text-lg font-bold text-slate-900 group-hover:text-[#1E3A8A] transition-colors leading-snug">
                  {course.materia}
                </h3>

                <div className="space-y-2 text-xs text-slate-600 pt-1">
                  <div className="flex items-center space-x-2">
                    <User className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>Docente:</strong> {course.docente}</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Clock className="w-4 h-4 text-slate-400 shrink-0" />
                    <span><strong>Horario:</strong> {course.horario}</span>
                  </div>
                  <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-100 text-[11px] text-slate-700">
                    <span className="text-slate-400 block font-semibold uppercase text-[9px] tracking-wider mb-0.5">
                      Tema de la semana
                    </span>
                    {course.temaActual}
                  </div>
                </div>
              </div>

              <div className="p-5 pt-0">
                <button
                  type="button"
                  onClick={() => setActiveMeetModal(course)}
                  className="w-full bg-emerald-600 hover:bg-emerald-700 active:bg-emerald-800 text-white font-bold py-3 px-4 rounded-xl shadow-md hover:shadow-emerald-600/30 transition-all duration-150 flex items-center justify-center space-x-2 cursor-pointer group-hover:scale-[1.01]"
                >
                  <Video className="w-4 h-4 shrink-0 animate-bounce" />
                  <span className="tracking-wide text-sm">
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
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200 pb-3">
          <div>
            <div className="flex items-center space-x-2">
              <CalendarCheck className="w-5 h-5 text-[#1E3A8A]" />
              <h2 className="text-xl font-bold text-slate-800">
                Mi Historial de Asistencia
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-0.5">
              Registro biométrico y de conexión virtual de las últimas sesiones sincrónicas.
            </p>
          </div>

          <div className="flex items-center space-x-2 text-xs">
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              Puntual: 4
            </span>
            <span className="inline-flex items-center px-2.5 py-1 rounded-md bg-amber-50 text-amber-700 border border-amber-200 font-medium">
              <AlertTriangle className="w-3.5 h-3.5 mr-1" />
              Tardanzas: 2
            </span>
          </div>
        </div>

        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="bg-slate-100/80 text-slate-700 border-b border-slate-200 font-semibold text-xs uppercase tracking-wider">
                  <th scope="col" className="py-3.5 px-4">Fecha</th>
                  <th scope="col" className="py-3.5 px-4">Materia / Curso</th>
                  <th scope="col" className="py-3.5 px-4">Hora de Registro</th>
                  <th scope="col" className="py-3.5 px-4">Modalidad</th>
                  <th scope="col" className="py-3.5 px-4 text-center">Estado de Asistencia</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {studentAttendance.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/80 transition-colors">
                    <td className="py-3 px-4 font-semibold text-slate-900 whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        <Calendar className="w-4 h-4 text-slate-400" />
                        <span>{item.fecha}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-medium text-slate-800 whitespace-nowrap">
                      {item.materia}
                    </td>
                    <td className="py-3 px-4 font-mono text-slate-600 whitespace-nowrap">
                      {item.horaRegistro}
                    </td>
                    <td className="py-3 px-4 text-slate-500 whitespace-nowrap">
                      {item.modalidad}
                    </td>
                    <td className="py-3 px-4 text-center whitespace-nowrap">
                      {item.estado === "Asistió Puntual" ? (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200 shadow-2xs">
                          <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-600" />
                          Asistió Puntual
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200 shadow-2xs">
                          <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-600" />
                          Tardanza
                        </span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="p-3 bg-slate-50 border-t border-slate-100 text-center text-xs text-slate-500">
            Mostrando las últimas 6 asistencias sincronizadas con el aula virtual.
          </div>
        </div>
      </section>

      {/* MODAL MEET */}
      <MeetModalPage course={activeMeetModal} onClose={() => setActiveMeetModal(null)} />
    </div>
  );
}