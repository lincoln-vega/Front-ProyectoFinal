import React, { useState, useEffect } from "react";
import { X, AlertTriangle, User, BookOpen, Clock, FileText, CheckCircle2 } from "lucide-react";
import { userService, courseService } from "../../services/api";

const TIPOS_INCIDENCIA = [
  "Tardanza (15 min)",
  "Tardanza (+20 min)",
  "Inasistencia por Salud / Médica",
  "Inasistencia por Conectividad",
  "Inasistencia por Motivo Personal",
  "Solicitud de Permuta / Reemplazo"
];

export default function NuevaIncidenciaModal({ isOpen, onClose, onSave }) {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const [formData, setFormData] = useState({
    docenteId: "",
    docente: "",
    dni: "",
    correo: "",
    cursoId: "",
    materia: "",
    horario: "08:00 - 10:00 hrs",
    tipo: TIPOS_INCIDENCIA[0],
    fechaPresentacion: new Date().toLocaleDateString("es-PE"),
    motivo: "",
    estado: "Pendiente",
    archivoNombre: "justificacion_administrativa.pdf"
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;

    async function loadData() {
      try {
        setLoadingResources(true);
        const [allUsers, allCourses] = await Promise.all([
          userService.getUsers(),
          courseService.getCourses()
        ]);

        if (cancelled) return;

        const teacherList = (allUsers || []).filter((u) => {
          const r = String(u.rol || "").toLowerCase();
          return r === "docente" || r === "profesor" || r === "profesora";
        });

        setTeachers(teacherList);
        setCourses(allCourses || []);

        if (teacherList.length > 0) {
          const firstTeacher = teacherList[0];
          const teacherName = `${firstTeacher.nombres || ""} ${firstTeacher.apellidos || ""}`.trim() || firstTeacher.correo;
          const teacherCourses = (allCourses || []).filter((c) => c.docenteId === firstTeacher.id);
          const firstCourse = teacherCourses[0] || allCourses?.[0];

          setFormData((prev) => ({
            ...prev,
            docenteId: firstTeacher.id,
            docente: teacherName,
            dni: firstTeacher.dni || "",
            correo: firstTeacher.correo || "",
            cursoId: firstCourse?.id || "",
            materia: firstCourse?.asignatura || "",
            horario: firstCourse?.horario || "08:00 - 10:00 hrs"
          }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar docentes o cursos para la justificación:", err);
        }
      } finally {
        if (!cancelled) {
          setLoadingResources(false);
        }
      }
    }

    loadData();
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTeacherChange = (e) => {
    const selectedId = e.target.value;
    const teacher = teachers.find((t) => t.id === selectedId);
    if (!teacher) return;

    const teacherName = `${teacher.nombres || ""} ${teacher.apellidos || ""}`.trim() || teacher.correo;
    const teacherCourses = courses.filter((c) => c.docenteId === teacher.id);
    const assignedCourse = teacherCourses[0] || courses[0];

    setFormData((prev) => ({
      ...prev,
      docenteId: teacher.id,
      docente: teacherName,
      dni: teacher.dni || "",
      correo: teacher.correo || "",
      cursoId: assignedCourse?.id || prev.cursoId,
      materia: assignedCourse?.asignatura || prev.materia,
      horario: assignedCourse?.horario || prev.horario
    }));
  };

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const course = courses.find((c) => c.id === courseId);
    if (!course) return;

    setFormData((prev) => ({
      ...prev,
      cursoId: course.id,
      materia: course.asignatura,
      horario: course.horario || `${course.horaInicio || "08:00"} - ${course.horaFin || "10:00"} hrs`
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.docente || !formData.materia || !formData.motivo) {
      setFormError("Por favor completa el docente, materia y el motivo del registro.");
      return;
    }

    setSubmitting(true);
    setFormError("");

    try {
      await onSave({
        ...formData,
        docenteid: formData.docenteId,
        cursoid: formData.cursoId
      });
      onClose();
    } catch (err) {
      setFormError(err.message || "Error al guardar la justificación en InsForge.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg overflow-hidden animate-scale-up my-8">
        {/* Cabecera del Modal */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-2">
            <div className="p-2 bg-amber-100 dark:bg-amber-900/40 text-amber-700 dark:text-amber-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                Registrar Justificación Manual
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Auditoría de asistencia e incidencias del personal docente
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {formError && (
            <p role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs rounded-xl font-medium">
              {formError}
            </p>
          )}

          {/* Docente Titular */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Docente Titular *
            </label>
            <select
              value={formData.docenteId}
              onChange={handleTeacherChange}
              disabled={loadingResources}
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
            >
              {teachers.map((t) => (
                <option key={t.id} value={t.id} className="dark:bg-slate-900 dark:text-white">
                  {t.nombres} {t.apellidos} ({t.dni || t.id})
                </option>
              ))}
            </select>
          </div>

          {/* Materia / Asignatura y Horario */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Asignatura Afectada *
              </label>
              <select
                value={formData.cursoId}
                onChange={handleCourseChange}
                disabled={loadingResources}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
              >
                {courses.map((c) => (
                  <option key={c.id} value={c.id} className="dark:bg-slate-900 dark:text-white">
                    {c.asignatura} ({c.id})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Horario de Clase *
              </label>
              <input
                type="text"
                name="horario"
                value={formData.horario}
                onChange={handleChange}
                placeholder="08:00 - 10:00 hrs"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Tipo de Incidencia y Fecha */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Incidencia *
              </label>
              <select
                name="tipo"
                value={formData.tipo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
              >
                {TIPOS_INCIDENCIA.map((t) => (
                  <option key={t} value={t} className="dark:bg-slate-900 dark:text-white">
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha del Suceso *
              </label>
              <input
                type="text"
                name="fechaPresentacion"
                value={formData.fechaPresentacion}
                onChange={handleChange}
                placeholder="DD/MM/AAAA"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Motivo o Sustento */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Motivo / Sustento de la Incidencia *
            </label>
            <textarea
              name="motivo"
              value={formData.motivo}
              onChange={handleChange}
              rows={3}
              placeholder="Describe la razón técnica, médica o personal comunicada por el docente..."
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
            />
          </div>

          {/* Estado Inicial de Resolución */}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estado de Validación Administrativa *
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
            >
              <option value="Pendiente" className="dark:bg-slate-900 dark:text-white">
                Pendiente (Por revisar)
              </option>
              <option value="Aprobado" className="dark:bg-slate-900 dark:text-white">
                Aprobado (Justificado - Sin descuento)
              </option>
              <option value="Rechazado" className="dark:bg-slate-900 dark:text-white">
                Rechazado (No procede - Con descuento)
              </option>
            </select>
          </div>

          {/* Botones de Acción */}
          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-xl transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submitting ? "Registrando..." : "Guardar Incidencia"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
