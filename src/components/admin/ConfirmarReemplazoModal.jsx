import React, { useState, useEffect } from "react";
import {
  UserCheck,
  Calendar,
  Clock,
  BookOpen,
  AlertCircle,
  CheckCircle2,
  X,
  ArrowRightLeft,
  FileText
} from "lucide-react";
import { userService, courseService } from "../../services/api";

export default function ConfirmarReemplazoModal({
  isOpen,
  incident,
  onClose,
  onConfirm
}) {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [selectedTeacherId, setSelectedTeacherId] = useState("");
  const [selectedCourseId, setSelectedCourseId] = useState("");
  const [newSchedule, setNewSchedule] = useState("");
  const [remarks, setRemarks] = useState("");
  const [notificarDocentes, setNotificarDocentes] = useState(true);

  useEffect(() => {
    if (!isOpen || !incident) return;

    // Cargar docentes activos
    const allUsers = userService.getUsers() || [];
    const teacherUsers = allUsers.filter(
      (u) => u.rol === "docente" || u.rol === "profesor"
    );
    setTeachers(teacherUsers);

    // Cargar cursos
    const allCourses = courseService.getCourses() || [];
    setCourses(allCourses);

    // Detección automática del curso correspondiente
    let matchedCourse = null;
    if (incident.cursoId) {
      matchedCourse = allCourses.find((c) => c.id === incident.cursoId);
    }
    if (!matchedCourse && incident.materia) {
      const cleanSubject = incident.materia.split("(")[0].trim().toLowerCase();
      matchedCourse = allCourses.find((c) =>
        c.asignatura.toLowerCase().includes(cleanSubject) ||
        cleanSubject.includes(c.asignatura.toLowerCase())
      );
    }

    if (matchedCourse) {
      setSelectedCourseId(matchedCourse.id);
      setNewSchedule(matchedCourse.horario || incident.horario || "");
    } else {
      setSelectedCourseId(allCourses[0]?.id || "");
      setNewSchedule(incident.horario || "");
    }

    // Seleccionar por defecto al primer docente disponible que no sea el titular
    const titularName = (incident.docente || "").toLowerCase();
    const availableTeacher = teacherUsers.find(
      (t) => !titularName.includes(t.nombres.toLowerCase()) && !titularName.includes(t.apellidos.toLowerCase())
    ) || teacherUsers[0];

    if (availableTeacher) {
      setSelectedTeacherId(availableTeacher.id);
    }

    setRemarks(
      `Reemplazo académico asignado y horario confirmado ante reporte de incidencia (${incident.id}).`
    );
  }, [isOpen, incident]);

  if (!isOpen || !incident) return null;

  const handleCourseChange = (courseId) => {
    setSelectedCourseId(courseId);
    const found = courses.find((c) => c.id === courseId);
    if (found && found.horario) {
      setNewSchedule(found.horario);
    }
  };

  const handleConfirm = (e) => {
    e.preventDefault();
    const substituteTeacher = teachers.find((t) => t.id === selectedTeacherId);
    const teacherDisplayName = substituteTeacher
      ? `Prof. ${substituteTeacher.nombres} ${substituteTeacher.apellidos}`
      : "Docente Reemplazo";

    onConfirm({
      incidentId: incident.id,
      substituteTeacherId: selectedTeacherId,
      substituteTeacherName: teacherDisplayName,
      courseId: selectedCourseId,
      newSchedule: newSchedule.trim(),
      remarks: remarks.trim(),
      notificarDocentes
    });
  };

  const selectedTeacher = teachers.find((t) => t.id === selectedTeacherId);
  const selectedCourse = courses.find((c) => c.id === selectedCourseId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-2xl w-full border border-slate-200 dark:border-white/10 overflow-hidden my-8 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirmar-reemplazo-title"
      >
        {/* ENCABEZADO */}
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 id="confirmar-reemplazo-title" className="text-base font-bold">
                Confirmar Reemplazo y Actualizar Horario
              </h3>
              <p className="text-xs text-blue-100">
                Gestión institucional de incidencias, suplencias y horarios académicos
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal"
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* CONTENIDO DEL FORMULARIO */}
        <form onSubmit={handleConfirm} className="p-6 space-y-5">
          {/* DETALLES DE LA INCIDENCIA */}
          <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 space-y-2 text-xs">
            <div className="flex items-center justify-between text-slate-500 dark:text-slate-400">
              <span className="font-bold uppercase tracking-wider text-slate-600 dark:text-slate-300">
                Incidencia: {incident.id}
              </span>
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 font-bold border border-amber-200 dark:border-amber-500/30">
                {incident.tipo}
              </span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 pt-1 text-slate-700 dark:text-slate-300">
              <div>
                <span className="text-slate-400 block text-[11px]">Docente Titular:</span>
                <strong className="text-slate-900 dark:text-white">{incident.docente}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[11px]">Materia / Salón:</span>
                <strong className="text-slate-900 dark:text-white">{incident.materia}</strong>
              </div>
            </div>
            {incident.motivo && (
              <div className="pt-1 text-[11px] text-slate-600 dark:text-slate-400 italic">
                "{incident.motivo}"
              </div>
            )}
          </div>

          <div className="space-y-4 text-xs">
            {/* SELECCIÓN DE DOCENTE DE REEMPLAZO */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <UserCheck className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Docente de Reemplazo (Suplente) *
              </label>
              <select
                required
                value={selectedTeacherId}
                onChange={(e) => setSelectedTeacherId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              >
                <option value="">-- Seleccionar docente suplente --</option>
                {teachers.map((teacher) => (
                  <option key={teacher.id} value={teacher.id}>
                    {teacher.nombres} {teacher.apellidos} ({teacher.correo})
                  </option>
                ))}
              </select>
              {selectedTeacher && (
                <p className="mt-1 text-[11px] text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Docente activo y habilitado para cubrir la sesión.
                </p>
              )}
            </div>

            {/* CURSO ASOCIADO EN EL SISTEMA */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <BookOpen className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Curso Académico a Actualizar *
              </label>
              <select
                required
                value={selectedCourseId}
                onChange={(e) => handleCourseChange(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              >
                <option value="">-- Seleccionar curso --</option>
                {courses.map((course) => (
                  <option key={course.id} value={course.id}>
                    {course.id}: {course.asignatura} ({course.docente})
                  </option>
                ))}
              </select>
            </div>

            {/* HORARIO PROGRAMADO */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Horario Confirmado / Reprogramado *
              </label>
              <input
                type="text"
                required
                value={newSchedule}
                onChange={(e) => setNewSchedule(e.target.value)}
                placeholder="Ej. Lunes y Miércoles 08:00 - 10:00 AM"
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              />
              <span className="text-[11px] text-slate-400 block mt-1">
                Puede mantener el horario original o indicar un bloque de reprogramación horaria.
              </span>
            </div>

            {/* OBSERVACIONES / RESOLUCIÓN */}
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
                <FileText className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                Observaciones y Sustento de la Resolución Administrativa
              </label>
              <textarea
                rows={2}
                value={remarks}
                onChange={(e) => setRemarks(e.target.value)}
                placeholder="Notas de confirmación para el registro oficial de asistencias e incidencias..."
                className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A]"
              />
            </div>

            {/* NOTIFICACIÓN SIMULADA */}
            <div className="flex items-center space-x-2 pt-1">
              <input
                type="checkbox"
                id="notif_docentes"
                checked={notificarDocentes}
                onChange={(e) => setNotificarDocentes(e.target.checked)}
                className="rounded border-slate-300 text-blue-600 focus:ring-blue-500 cursor-pointer"
              />
              <label
                htmlFor="notif_docentes"
                className="text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none"
              >
                Sincronizar notificación y actualizar de inmediato el módulo de Cursos y Horarios
              </label>
            </div>
          </div>

          {/* BOTONES DE ACCIÓN */}
          <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!selectedTeacherId || !selectedCourseId}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Confirmar Reemplazo y Actualizar Horario</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
