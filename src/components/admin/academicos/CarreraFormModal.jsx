import React, { useState } from "react";
import { X, GraduationCap, Building, Clock, Award } from "lucide-react";

export default function CarreraFormModal({ isOpen, areas = [], onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: `CAR-${Date.now().toString().slice(-4)}`,
    codigo: "",
    nombre: "",
    area_id: areas[0]?.id || "AREA-EXA",
    descripcion: "",
    duracion_anios: 5,
    grado_academico: "Bachiller / Título Profesional",
    universidades_objetivo: "UNMSM, UNI, PUCP",
    estado: "Activo"
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombre || !formData.area_id) {
      setError("Código, nombre y área académica son campos obligatorios.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        ...formData,
        duracion_anios: Number(formData.duracion_anios) || 5,
        universidades_objetivo: typeof formData.universidades_objetivo === "string"
          ? formData.universidades_objetivo.split(",").map(u => u.trim()).filter(Boolean)
          : formData.universidades_objetivo
      });
      onClose();
    } catch (err) {
      setError(err.message || "Error al registrar la carrera profesional.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-lg overflow-hidden animate-scale-up my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 flex items-center justify-center">
              <GraduationCap className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Nueva Carrera Profesional</h3>
              <p className="text-xs text-slate-500">Endpoint: POST /academicos/carreras (CarreraCreate)</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                ID Único *
              </label>
              <input
                type="text"
                name="id"
                value={formData.id}
                onChange={handleChange}
                placeholder="ej. CAR-001"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código de Carrera *
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="ej. MED-HUM"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Carrera *
            </label>
            <input
              type="text"
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              placeholder="ej. Medicina Humana"
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Área Académica de Adscripción *
            </label>
            <select
              name="area_id"
              value={formData.area_id}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500 cursor-pointer"
            >
              {areas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.nombre} ({a.codigo})
                </option>
              ))}
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Duración (Años, 1-10)
              </label>
              <input
                type="number"
                name="duracion_anios"
                min="1"
                max="10"
                value={formData.duracion_anios}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Grado Académico Otorgado
              </label>
              <input
                type="text"
                name="grado_academico"
                value={formData.grado_academico}
                onChange={handleChange}
                placeholder="ej. Licenciado / Ingeniero"
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Universidades Objetivo (separadas por coma)
            </label>
            <input
              type="text"
              name="universidades_objetivo"
              value={formData.universidades_objetivo}
              onChange={handleChange}
              placeholder="UNMSM, UNI, PUCP, UPCH"
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Descripción del Perfil Profesional
            </label>
            <textarea
              name="descripcion"
              value={formData.descripcion}
              onChange={handleChange}
              rows={2}
              placeholder="Perfil del postulante y enfoque curricular..."
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-indigo-500"
            >
              <option value="Activo">Activo</option>
              <option value="Inactivo">Inactivo</option>
            </select>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 hover:bg-slate-50 rounded-lg cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? "Registrando..." : "Crear Carrera"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
