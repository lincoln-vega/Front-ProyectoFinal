import React, { useState, useEffect } from "react";
import {
  X,
  AlertTriangle,
  FileText,
  Upload,
  FileCheck,
  Eye,
  Loader2
} from "lucide-react";
import { userService, courseService } from "../../services/api";
import { uploadFileToStorage } from "../../lib/supabase";
import FilePreviewModal from "../shared/FilePreviewModal";

const TIPOS_INCIDENCIA = [
  "Tardanza (15 min)",
  "Tardanza (+20 min)",
  "Inasistencia por Salud / Médica",
  "Inasistencia por Conectividad",
  "Inasistencia por Motivo Personal",
  "Solicitud de Permuta / Reemplazo"
];

const MAX_JUSTIFICANTE_BYTES = 5 * 1024 * 1024;

export default function NuevaIncidenciaModal({ isOpen, onClose, onSave }) {
  const [teachers, setTeachers] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loadingResources, setLoadingResources] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [sustentoFile, setSustentoFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

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
    estado: "Pendiente"
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setSustentoFile(null);
    setPreviewOpen(false);
    setFormError("");

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
          const teacherName =
            `${firstTeacher.nombres || ""} ${firstTeacher.apellidos || ""}`.trim() ||
            firstTeacher.correo;
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
          console.error("Error al cargar docentes o cursos:", err);
        }
      } finally {
        if (!cancelled) {
          setLoadingResources(false);
        }
      }
    }

    loadData();
    return () => {
      cancelled = true;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleTeacherChange = (e) => {
    const selectedId = e.target.value;
    const teacher = teachers.find((t) => t.id === selectedId);
    if (!teacher) return;

    const teacherName =
      `${teacher.nombres || ""} ${teacher.apellidos || ""}`.trim() || teacher.correo;
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
      let uploaded = null;
      if (sustentoFile) {
        uploaded = await uploadFileToStorage(
          "justificantes-docentes",
          sustentoFile,
          formData.cursoId || "admin"
        );
      }

      await onSave({
        ...formData,
        docenteid: formData.docenteId,
        cursoid: formData.cursoId,
        archivoNombre: uploaded?.fileName || sustentoFile?.name || "registro_administrativo.pdf",
        archivoUrl: uploaded?.url || null,
        archivoPath: uploaded?.path || null
      });
      onClose();
    } catch (err) {
      setFormError(err.message || "Error al guardar la justificación en Supabase.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg overflow-hidden animate-scale-up my-8">
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center gap-2.5">
            <div className="p-2 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-600">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Registrar Incidencia / Justificación Docente
              </h3>
              <p className="text-[11px] text-slate-500">
                Con respaldo documental en Supabase Storage
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-3.5 text-xs">
          {formError && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {formError}
            </div>
          )}

          {loadingResources ? (
            <div className="py-6 text-center text-slate-400">Cargando docentes y cursos...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Docente *
                  </label>
                  <select
                    value={formData.docenteId}
                    onChange={handleTeacherChange}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                  >
                    {teachers.map((t) => (
                      <option key={t.id} value={t.id}>
                        {t.nombres} {t.apellidos}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Asignatura *
                  </label>
                  <select
                    value={formData.cursoId}
                    onChange={handleCourseChange}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                  >
                    {courses.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.asignatura}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Tipo de Incidencia *
                  </label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                  >
                    {TIPOS_INCIDENCIA.map((t) => (
                      <option key={t} value={t}>
                        {t}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                    Fecha del Suceso *
                  </label>
                  <input
                    type="text"
                    name="fechaPresentacion"
                    value={formData.fechaPresentacion}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Motivo / Sustento de la Incidencia *
                </label>
                <textarea
                  name="motivo"
                  value={formData.motivo}
                  onChange={handleChange}
                  rows={3}
                  required
                  placeholder="Describe la razón técnica, médica o personal..."
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                />
              </div>

              {/* Subida real de PDF / Imagen con previsualización */}
              <div className="space-y-2">
                <label className="block font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  Adjuntar Comprobante / Justificante (PDF o Imagen • máx. 5 MB)
                </label>
                <label className="flex items-center justify-between gap-2 p-2.5 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:border-blue-500 cursor-pointer">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f && f.size > MAX_JUSTIFICANTE_BYTES) {
                        setFormError("El archivo supera el límite máximo de 5 MB.");
                        e.target.value = "";
                        return;
                      }
                      setFormError("");
                      setSustentoFile(f);
                    }}
                  />
                  <span className="flex items-center gap-2 truncate text-slate-600 dark:text-slate-300">
                    {sustentoFile ? (
                      <>
                        <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
                          {sustentoFile.name}
                        </span>
                      </>
                    ) : (
                      <span>Seleccionar PDF o constancia digital...</span>
                    )}
                  </span>
                  <span className="font-bold text-blue-600 underline shrink-0">
                    {sustentoFile ? "Cambiar" : "Adjuntar"}
                  </span>
                </label>

                {sustentoFile && (
                  <div className="flex justify-end">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1 rounded-lg bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 font-bold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Previsualizar archivo</span>
                    </button>
                  </div>
                )}
              </div>

              <div>
                <label className="block font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado de Validación Administrativa *
                </label>
                <select
                  name="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-slate-800 dark:text-white"
                >
                  <option value="Pendiente">Pendiente (Por revisar)</option>
                  <option value="Aprobado">Aprobado (Justificado - Sin descuento)</option>
                  <option value="Rechazado">Rechazado (No procede - Con descuento)</option>
                </select>
              </div>
            </>
          )}

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 px-4 py-2 font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-xl cursor-pointer shadow-xs disabled:opacity-50"
            >
              {submitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
              <span>{submitting ? "Guardando..." : "Guardar Incidencia"}</span>
            </button>
          </div>
        </form>
      </div>

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Comprobante — ${formData.docente}`}
        subtitle={`${formData.tipo} • Vista previa antes de guardar`}
        fileName={sustentoFile?.name || "justificante.pdf"}
        localFile={sustentoFile}
      />
    </div>
  );
}
