import React, { useState } from "react";
import { X, Clock, Sun, Sunset, Moon } from "lucide-react";

export default function TurnoFormModal({ isOpen, onClose, onSave }) {
  const [formData, setFormData] = useState({
    id: `TUR-${Date.now().toString().slice(-4)}`,
    codigo: "MANANA",
    nombre: "Mañana",
    hora_inicio: "08:00",
    hora_fin: "13:00",
    estado: "Activo"
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "nombre") {
      const codeMap = { "Mañana": "MANANA", "Tarde": "TARDE", "Noche": "NOCHE" };
      const hoursMap = {
        "Mañana": { inicio: "08:00", fin: "13:00" },
        "Tarde": { inicio: "14:00", fin: "19:00" },
        "Noche": { inicio: "18:00", fin: "22:00" }
      };
      setFormData((prev) => ({
        ...prev,
        nombre: value,
        codigo: codeMap[value] || value.toUpperCase(),
        hora_inicio: hoursMap[value]?.inicio || prev.hora_inicio,
        hora_fin: hoursMap[value]?.fin || prev.hora_fin
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombre || !formData.hora_inicio || !formData.hora_fin) {
      setError("Código, nombre, hora de inicio y fin son obligatorios.");
      return;
    }

    if (formData.horaInicio >= formData.horaFin) {
      setError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave(formData);
      onClose();
    } catch (err) {
      setError(err.message || "Error al registrar el turno académico.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden animate-scale-up">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Nuevo Turno de Clases</h3>
              <p className="text-xs text-slate-500">Endpoint: POST /academicos/turnos (TurnoCreate)</p>
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
                placeholder="ej. TUR-MAN"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código *
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="ej. MANANA"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-amber-500 uppercase"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre del Turno *
            </label>
            <select
              name="nombre"
              value={formData.nombre}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-amber-500"
            >
              <option value="Mañana">Mañana (08:00 - 13:00)</option>
              <option value="Tarde">Tarde (14:00 - 19:00)</option>
              <option value="Noche">Noche (18:00 - 22:00)</option>
              <option value="Personalizado">Personalizado</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hora de Inicio (HH:MM) *
              </label>
              <input
                type="time"
                name="hora_inicio"
                value={formData.hora_inicio}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Hora de Fin (HH:MM) *
              </label>
              <input
                type="time"
                name="hora_fin"
                value={formData.hora_fin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Estado
            </label>
            <select
              name="estado"
              value={formData.estado}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-amber-500"
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
              {saving ? "Registrando..." : "Crear Turno"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
