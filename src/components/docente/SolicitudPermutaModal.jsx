import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  Calendar,
  Clock,
  BookOpen,
  FileText,
  Upload,
  CheckCircle2,
  X,
  AlertCircle
} from "lucide-react";
import { courseService, incidentService, userService } from "../../services/api";

export default function SolicitudPermutaModal({ isOpen, onClose, onSuccess, currentTeacherName }) {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    tipo: "Solicitud de Permuta / Reemplazo",
    cursoId: "",
    materia: "",
    horario: "",
    motivo: "",
    docentePropuesto: "",
    archivoNombre: "comprobante_solicitud.pdf"
  });

  useEffect(() => {
    if (!isOpen) return;

    const allCourses = courseService.getCourses() || [];
    setCourses(allCourses);

    const allUsers = userService.getUsers() || [];
    const teacherUsers = allUsers.filter(u => u.rol === "docente" || u.rol === "profesor");
    setTeachers(teacherUsers);

    if (allCourses.length > 0) {
      setFormData(prev => ({
        ...prev,
        cursoId: allCourses[0].id,
        materia: allCourses[0].asignatura,
        horario: allCourses[0].horario || ""
      }));
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selected = courses.find(c => c.id === courseId);
    setFormData(prev => ({
      ...prev,
      cursoId,
      materia: selected ? selected.asignatura : "",
      horario: selected ? selected.horario : prev.horario
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const currentIncidents = incidentService.getIncidents() || [];
    const newId = `INC-D${String(currentIncidents.length + 1).padStart(2, "0")}`;

    const newIncident = {
      id: newId,
      docente: currentTeacherName || "Docente Titular",
      tipo: formData.tipo,
      fechaPresentacion: `Hoy ${new Date().toLocaleTimeString("es-PE", { hour: "2-digit", minute: "2-digit" })}`,
      materia: formData.materia,
      cursoId: formData.cursoId,
      horario: formData.horario,
      motivo: formData.motivo,
      archivoNombre: formData.archivoNombre,
      docentePropuesto: formData.docentePropuesto || null,
      estado: "Pendiente"
    };

    const updated = [newIncident, ...currentIncidents];
    incidentService.saveIncidents(updated);

    if (onSuccess) {
      onSuccess(newIncident);
    }
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-white/10 overflow-hidden my-8 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
        aria-labelledby="solicitud-permuta-title"
      >
        {/* ENCABEZADO */}
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h3 id="solicitud-permuta-title" className="text-base font-bold">
                Nueva Solicitud de Permuta o Justificación
              </h3>
              <p className="text-xs text-blue-100">
                Ticket SCRM-106 • Gestión de permutas, suplencias y dispensa docente
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

        {/* FORMULARIO */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {/* TIPO DE SOLICITUD */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Tipo de Solicitud *
            </label>
            <select
              value={formData.tipo}
              onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
            >
              <option value="Solicitud de Permuta / Reemplazo">Solicitud de Permuta / Reemplazo</option>
              <option value="Justificación de Tardanza (+15 min)">Justificación de Tardanza (+15 min)</option>
              <option value="Inasistencia Inesperada (Descanso Médico)">Inasistencia Inesperada (Descanso Médico)</option>
              <option value="Reprogramación de Clase por Feriado/Evento">Reprogramación de Clase por Feriado/Evento</option>
            </select>
          </div>

          {/* CURSO AFECTADO */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-blue-600" />
              Curso / Materia a Permutar *
            </label>
            <select
              required
              value={formData.cursoId}
              onChange={handleCourseChange}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
            >
              {courses.map(course => (
                <option key={course.id} value={course.id}>
                  {course.id}: {course.asignatura} ({course.horario})
                </option>
              ))}
            </select>
          </div>

          {/* HORARIO PROGRAMADO */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-600" />
              Horario Programado de la Sesión *
            </label>
            <input
              type="text"
              required
              value={formData.horario}
              onChange={(e) => setFormData({ ...formData, horario: e.target.value })}
              placeholder="Ej. Lunes y Miércoles 08:00 - 10:00 AM"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
            />
          </div>

          {/* DOCENTE SUPLENTE PROPUESTO (OPCIONAL) */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
              Docente Suplente Sugerido (Opcional)
            </label>
            <select
              value={formData.docentePropuesto}
              onChange={(e) => setFormData({ ...formData, docentePropuesto: e.target.value })}
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
            >
              <option value="">-- Dejar que Coordinación Académica asigne --</option>
              {teachers.map(teacher => (
                <option key={teacher.id} value={`Prof. ${teacher.nombres} ${teacher.apellidos}`}>
                  {teacher.nombres} {teacher.apellidos} ({teacher.correo})
                </option>
              ))}
            </select>
          </div>

          {/* MOTIVO DETALLADO */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <FileText className="w-3.5 h-3.5 text-blue-600" />
              Motivo o Sustento de la Solicitud *
            </label>
            <textarea
              required
              rows={3}
              value={formData.motivo}
              onChange={(e) => setFormData({ ...formData, motivo: e.target.value })}
              placeholder="Detalle la razón de la permuta (evento académico, emergencia médica, sustentación, etc.)..."
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
            />
          </div>

          {/* ADJUNTO */}
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5 text-blue-600" />
              Documento de Sustento (PDF / Constancia)
            </label>
            <input
              type="text"
              value={formData.archivoNombre}
              onChange={(e) => setFormData({ ...formData, archivoNombre: e.target.value })}
              placeholder="nombre_del_archivo.pdf"
              className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
            />
            <span className="text-[11px] text-slate-400 mt-1 block">
              Simulación de adjunto en formato digital para auditoría.
            </span>
          </div>

          {/* BOTONES */}
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
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Enviar Solicitud a Coordinación</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
