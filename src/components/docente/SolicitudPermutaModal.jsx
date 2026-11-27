import React, { useState, useEffect } from "react";
import {
  ArrowRightLeft,
  BookOpen,
  FileText,
  Upload,
  CheckCircle2,
  X,
  Eye,
  FileCheck,
  Loader2
} from "lucide-react";
import { courseService, incidentService, userService } from "../../services/api";
import { uploadFileToStorage } from "../../lib/supabase";
import FilePreviewModal from "../shared/FilePreviewModal";
import SearchableSelect from "../shared/SearchableSelect";

const MAX_JUSTIFICANTE_BYTES = 5 * 1024 * 1024; // 5 MB bucket justificantes-docentes

export default function SolicitudPermutaModal({ isOpen, onClose, onSuccess, currentTeacherName }) {
  const [courses, setCourses] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [sustentoFile, setSustentoFile] = useState(null);
  const [previewOpen, setPreviewOpen] = useState(false);

  const [formData, setFormData] = useState({
    tipo: "Solicitud de Permuta / Reemplazo",
    cursoId: "",
    materia: "",
    horario: "",
    motivo: "",
    docentePropuesto: ""
  });

  useEffect(() => {
    if (!isOpen) return;

    let cancelled = false;
    setSustentoFile(null);
    setPreviewOpen(false);
    setError("");

    async function loadData() {
      try {
        setLoading(true);
        const [allCourses, allUsers] = await Promise.all([
          courseService.getCourses(),
          userService.getUsers()
        ]);

        if (cancelled) return;

        const safeCourses = allCourses || [];
        const safeUsers = allUsers || [];
        setCourses(safeCourses);

        const teacherUsers = safeUsers.filter((u) => {
          const r = String(u.rol || "").toLowerCase();
          return r === "docente" || r === "profesor" || r === "profesora";
        });
        setTeachers(teacherUsers);

        if (safeCourses.length > 0) {
          const firstCourse = safeCourses[0];
          const horarioTexto =
            firstCourse.horario ||
            (Array.isArray(firstCourse.dias) && firstCourse.horaInicio
              ? `${firstCourse.dias.join(", ")} ${firstCourse.horaInicio} - ${firstCourse.horaFin || ""}`
              : "");

          setFormData((prev) => ({
            ...prev,
            cursoId: firstCourse.id,
            materia: firstCourse.asignatura,
            horario: horarioTexto
          }));
        }
      } catch (err) {
        if (!cancelled) {
          setError(err.message || "No se pudieron cargar los datos de cursos y docentes.");
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
  }, [isOpen]);

  if (!isOpen) return null;

  const handleCourseChange = (e) => {
    const courseId = e.target.value;
    const selected = courses.find((c) => c.id === courseId);
    const horarioTexto =
      selected?.horario ||
      (selected && Array.isArray(selected.dias) && selected.horaInicio
        ? `${selected.dias.join(", ")} ${selected.horaInicio} - ${selected.horaFin || ""}`
        : "");

    setFormData((prev) => ({
      ...prev,
      cursoId,
      materia: selected ? selected.asignatura : "",
      horario: horarioTexto || prev.horario
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      setError("");

      let uploaded = null;
      if (sustentoFile) {
        uploaded = await uploadFileToStorage(
          "justificantes-docentes",
          sustentoFile,
          formData.cursoId || "permutas"
        );
      }

      const currentIncidents = (await incidentService.getIncidents()) || [];
      const newId = `INC-D${String(currentIncidents.length + 1).padStart(2, "0")}`;

      const newIncident = {
        id: newId,
        docente: currentTeacherName || "Docente Titular",
        tipo: formData.tipo,
        fechaPresentacion: `Hoy ${new Date().toLocaleTimeString("es-PE", {
          hour: "2-digit",
          minute: "2-digit"
        })}`,
        materia: formData.materia,
        cursoId: formData.cursoId,
        horario: formData.horario,
        motivo: formData.motivo,
        archivoNombre: uploaded?.fileName || sustentoFile?.name || "sin_adjunto.pdf",
        archivoUrl: uploaded?.url || null,
        archivoPath: uploaded?.path || null,
        docentePropuesto: formData.docentePropuesto || null,
        estado: "Pendiente"
      };

      const saved = await incidentService.saveIncident(newIncident);
      if (onSuccess) {
        onSuccess(saved || newIncident);
      }
      onClose();
    } catch (err) {
      setError(err.message || "No se pudo registrar la solicitud en Supabase.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div
        className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl max-w-xl w-full border border-slate-200 dark:border-white/10 overflow-hidden my-8 animate-in fade-in duration-200"
        role="dialog"
        aria-modal="true"
      >
        {/* ENCABEZADO */}
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-white/10 rounded-xl">
              <ArrowRightLeft className="w-5 h-5 text-blue-200" />
            </div>
            <div>
              <h2 className="text-base font-extrabold tracking-tight">
                Solicitar Permuta o Justificación Docente
              </h2>
              <p className="text-xs text-blue-200">
                Registra sustento digital en Supabase Storage para aprobación de Coordinación
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-white/80 hover:text-white hover:bg-white/10 cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-xs">
          {error && (
            <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 font-semibold">
              {error}
            </div>
          )}

          {loading ? (
            <div className="py-6 text-center text-slate-400">Cargando cursos y docentes...</div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                    Tipo de Solicitud *
                  </label>
                  <select
                    value={formData.tipo}
                    onChange={(e) => setFormData({ ...formData, tipo: e.target.value })}
                    className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                  >
                    <option value="Solicitud de Permuta / Reemplazo">Solicitud de Permuta / Reemplazo</option>
                    <option value="Inasistencia por Salud / Médica">Justificación por Salud / Médica</option>
                    <option value="Tardanza Justificada">Justificación de Tardanza</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1 flex items-center gap-1">
                    <BookOpen className="w-3.5 h-3.5 text-blue-600" />
                    Curso Afectado *
                  </label>
                  <SearchableSelect
                    value={formData.cursoId}
                    onChange={(val) => handleCourseChange({ target: { value: val } })}
                    placeholder="Buscar curso afectado..."
                    options={courses.map((c) => ({
                      value: c.id,
                      label: c.asignatura,
                      sublabel: `${c.docente || ""} • ${c.id}`,
                      searchText: `${c.id} ${c.docente || ""}`
                    }))}
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-200 mb-1">
                  Docente de Reemplazo Sugerido (opcional):
                </label>
                <SearchableSelect
                  value={formData.docentePropuesto}
                  onChange={(val) => setFormData({ ...formData, docentePropuesto: val })}
                  emptyOptionLabel="-- Dejar que Coordinación Académica asigne --"
                  options={teachers.map((teacher) => ({
                    value: `Prof. ${teacher.nombres} ${teacher.apellidos}`,
                    label: `${teacher.nombres} ${teacher.apellidos}`,
                    sublabel: teacher.correo,
                    searchText: `${teacher.dni || ""} ${teacher.correo || ""}`
                  }))}
                />
              </div>

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
                  placeholder="Detalle la razón de la permuta o justificación médica/laboral..."
                  className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white"
                />
              </div>

              {/* SUBIDA REAL DE SUSTENTO PDF / IMAGEN + PREVISUALIZADOR */}
              <div className="space-y-2">
                <label className="block font-bold text-slate-700 dark:text-slate-200 flex items-center gap-1.5">
                  <Upload className="w-3.5 h-3.5 text-blue-600" />
                  Adjuntar Documento de Sustento (PDF o Imagen • máx. 5 MB)
                </label>

                <label className="flex items-center justify-between gap-2 p-3 rounded-xl border border-dashed border-slate-300 dark:border-white/15 bg-slate-50 dark:bg-white/5 hover:border-blue-500 cursor-pointer transition-colors">
                  <input
                    type="file"
                    accept=".pdf,.png,.jpg,.jpeg,.webp,.doc,.docx"
                    className="hidden"
                    onChange={(e) => {
                      const f = e.target.files?.[0] || null;
                      if (f && f.size > MAX_JUSTIFICANTE_BYTES) {
                        setError("El archivo supera el límite máximo de 5 MB para justificantes.");
                        e.target.value = "";
                        return;
                      }
                      setError("");
                      setSustentoFile(f);
                    }}
                  />
                  <span className="flex items-center gap-2 truncate text-slate-600 dark:text-slate-300">
                    {sustentoFile ? (
                      <>
                        <FileCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                        <span className="font-bold text-emerald-700 dark:text-emerald-300 truncate">
                          {sustentoFile.name} ({(sustentoFile.size / 1024).toFixed(0)} KB)
                        </span>
                      </>
                    ) : (
                      <span>Haz clic para adjuntar certificado médico o constancia en PDF/Imagen...</span>
                    )}
                  </span>
                  <span className="font-extrabold text-blue-600 dark:text-blue-400 underline shrink-0">
                    {sustentoFile ? "Cambiar" : "Examinar"}
                  </span>
                </label>

                {sustentoFile && (
                  <div className="flex items-center justify-end gap-2">
                    <button
                      type="button"
                      onClick={() => setPreviewOpen(true)}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 font-extrabold cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Previsualizar sustento</span>
                    </button>
                  </div>
                )}
              </div>
            </>
          )}

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
              disabled={submitting}
              className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 disabled:opacity-50 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              {submitting ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>{submitting ? "Subiendo y enviando..." : "Enviar Solicitud a Coordinación"}</span>
            </button>
          </div>
        </form>
      </div>

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={`Sustento Adjunto — ${formData.tipo}`}
        subtitle={`${formData.materia || ""} • Vista previa antes de enviar`}
        fileName={sustentoFile?.name || "sustento.pdf"}
        localFile={sustentoFile}
      />
    </div>
  );
}
