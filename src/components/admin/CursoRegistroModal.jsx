import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ACADEMIC_AREAS, getCareersByArea } from "../../data/academicCatalog";

const emptyForm = {
  id: "",
  asignatura: "",
  area: "Ciencias Exactas",
  carrera: "",
  docenteId: "",
  docente: "",
  dias: [],
  horaInicio: "",
  horaFin: "",
  meetUrl: "",
  repositorio: "",
  estado: "Activo"
};

const inputClassName =
  "w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]";

export default function CursoRegistroModal({
  isOpen,
  onClose,
  onSaveCourse,
  courseToEdit
}) {
  const [formData, setFormData] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!isOpen) return;
    setFormData({ ...emptyForm, ...(courseToEdit || {}) });
    setError("");
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const updateField = (field, value) => {
    setFormData((current) => ({ ...current, [field]: value }));
  };

  const toggleDay = (day) => {
    setFormData((current) => ({
      ...current,
      dias: current.dias.includes(day)
        ? current.dias.filter((item) => item !== day)
        : [...current.dias, day]
    }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError("");

    if (!formData.dias.length) {
      setError("Selecciona al menos un día de clases.");
      return;
    }

    setSaving(true);
    try {
      await onSaveCourse({
        ...formData,
        id: formData.id.trim(),
        dias: formData.dias
      });
      onClose();
    } catch (requestError) {
      setError(requestError.message || "No se pudo guardar el curso.");
    } finally {
      setSaving(false);
    }
  };

  const days = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50">
          <h3 className="text-base font-bold text-slate-800">
            {courseToEdit ? "Editar curso" : "Registrar nuevo curso"}
          </h3>
          <button type="button" onClick={onClose} aria-label="Cerrar formulario">
            <X className="w-5 h-5 text-slate-500" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {error && (
            <p className="rounded-lg border border-red-200 bg-red-50 p-3 text-xs text-red-700">
              {error}
            </p>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label className="font-semibold text-slate-700">
              ID del curso *
              <input
                required
                disabled={Boolean(courseToEdit)}
                value={formData.id}
                onChange={(event) => updateField("id", event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="font-semibold text-slate-700">
              Asignatura *
              <input
                required
                value={formData.asignatura}
                onChange={(event) => updateField("asignatura", event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="font-semibold text-slate-700">
              Área *
              <select
                value={formData.area}
                onChange={(event) => updateField("area", event.target.value)}
                className={inputClassName}
              >
                {ACADEMIC_AREAS.map((area) => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </label>
            <label className="font-semibold text-slate-700">
              Carrera
              <select
                value={formData.carrera}
                onChange={(event) => updateField("carrera", event.target.value)}
                className={inputClassName}
              >
                <option value="">Seleccionar carrera</option>
                {getCareersByArea(formData.area).map((career) => (
                  <option key={career} value={career}>{career}</option>
                ))}
              </select>
            </label>
            <label className="font-semibold text-slate-700">
              ID del docente *
              <input
                required
                value={formData.docenteId}
                onChange={(event) => updateField("docenteId", event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="font-semibold text-slate-700">
              Nombre del docente *
              <input
                required
                value={formData.docente}
                onChange={(event) => updateField("docente", event.target.value)}
                className={inputClassName}
              />
            </label>
            <div className="md:col-span-2">
              <span className="font-semibold text-slate-700">Días *</span>
              <div className="mt-2 flex flex-wrap gap-2">
                {days.map((day) => (
                  <label key={day} className="flex items-center gap-1 rounded border border-slate-200 px-2 py-1">
                    <input
                      type="checkbox"
                      checked={formData.dias.includes(day)}
                      onChange={() => toggleDay(day)}
                    />
                    {day}
                  </label>
                ))}
              </div>
            </div>
            <label className="font-semibold text-slate-700">
              Hora de inicio *
              <input
                required
                type="time"
                value={formData.horaInicio}
                onChange={(event) => updateField("horaInicio", event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="font-semibold text-slate-700">
              Hora de fin *
              <input
                required
                type="time"
                value={formData.horaFin}
                onChange={(event) => updateField("horaFin", event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="font-semibold text-slate-700">
              Enlace Meet *
              <input
                required
                type="url"
                value={formData.meetUrl}
                onChange={(event) => updateField("meetUrl", event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="font-semibold text-slate-700">
              Repositorio
              <input
                value={formData.repositorio}
                onChange={(event) => updateField("repositorio", event.target.value)}
                className={inputClassName}
              />
            </label>
            <label className="font-semibold text-slate-700">
              Estado
              <select
                value={formData.estado}
                onChange={(event) => updateField("estado", event.target.value)}
                className={inputClassName}
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
            <button type="button" onClick={onClose} className="px-4 py-2 border rounded text-xs">
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 bg-[#1E3A8A] text-white font-semibold rounded text-xs disabled:opacity-60"
            >
              {saving ? "Guardando..." : "Guardar curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
