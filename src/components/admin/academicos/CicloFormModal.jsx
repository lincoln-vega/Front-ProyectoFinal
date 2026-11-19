import React, { useState } from "react";
import { X, CalendarDays, DollarSign, Clock, ShieldCheck } from "lucide-react";

export default function CicloFormModal({ isOpen, tiposCiclo = [], onClose, onSave }) {
  const currentYear = new Date().getFullYear();
  const [formData, setFormData] = useState({
    id: `CIC-${currentYear}-SEM-${Date.now().toString().slice(-3)}`,
    codigo: `${currentYear}-SEM-I`,
    nombre: `Semestral ${currentYear}-I`,
    tipo_ciclo_id: tiposCiclo[0]?.id || "TCIC-SEM",
    anio: currentYear,
    periodo: "I",
    fecha_inicio: `${currentYear}-03-01`,
    fecha_fin: `${currentYear}-07-31`,
    costo_matricula: 100,
    costo_pension_mensual: 300,
    costo_total_contado: 1500,
    es_vigente: true,
    estado: "En Curso"
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : type === "number" ? Number(value) : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.codigo || !formData.nombre || !formData.tipo_ciclo_id || !formData.fecha_inicio || !formData.fecha_fin) {
      setError("Código, nombre, tipo de ciclo y fechas de inicio/fin son obligatorios.");
      return;
    }

    try {
      setSaving(true);
      setError("");
      await onSave({
        ...formData,
        anio: Number(formData.anio) || currentYear,
        costo_matricula: Number(formData.costo_matricula) || 0,
        costo_pension_mensual: Number(formData.costo_pension_mensual) || 0,
        costo_total_contado: Number(formData.costo_total_contado) || 0
      });
      onClose();
    } catch (err) {
      setError(err.message || "Error al registrar la convocatoria del ciclo.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-xl overflow-hidden animate-scale-up my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <CalendarDays className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Nueva Convocatoria de Ciclo</h3>
              <p className="text-xs text-slate-500">Endpoint: POST /academicos/ciclos (CicloAcademicoCreate)</p>
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
                placeholder="ej. CIC-2026-SEM-1"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código Convocatoria *
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="ej. 2026-SEM-I"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500 uppercase"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre de Convocatoria *
              </label>
              <input
                type="text"
                name="nombre"
                value={formData.nombre}
                onChange={handleChange}
                placeholder="ej. Semestral 2026-I"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Ciclo Base *
              </label>
              <select
                name="tipo_ciclo_id"
                value={formData.tipo_ciclo_id}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
              >
                {tiposCiclo.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombre} ({t.duracion_semanas} sem)
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Año
              </label>
              <input
                type="number"
                name="anio"
                min="2020"
                value={formData.anio}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Periodo
              </label>
              <select
                name="periodo"
                value={formData.periodo}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="I">I</option>
                <option value="II">II</option>
                <option value="Anual">Anual</option>
                <option value="Verano">Verano</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Inicio *
              </label>
              <input
                type="date"
                name="fecha_inicio"
                value={formData.fecha_inicio}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Fin *
              </label>
              <input
                type="date"
                name="fecha_fin"
                value={formData.fecha_fin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Costo Matrícula (S/)
              </label>
              <input
                type="number"
                name="costo_matricula"
                min="0"
                step="10"
                value={formData.costo_matricula}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Pensión Mensual (S/)
              </label>
              <input
                type="number"
                name="costo_pension_mensual"
                min="0"
                step="10"
                value={formData.costo_pension_mensual}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Total al Contado (S/)
              </label>
              <input
                type="number"
                name="costo_total_contado"
                min="0"
                step="50"
                value={formData.costo_total_contado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-blue-500"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 items-center">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado del Ciclo
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-blue-500"
              >
                <option value="Planificado">Planificado</option>
                <option value="En Convocatoria">En Convocatoria</option>
                <option value="En Curso">En Curso</option>
                <option value="Finalizado">Finalizado</option>
                <option value="Cerrado">Cerrado</option>
              </select>
            </div>

            <div className="pt-4">
              <label className="flex items-center space-x-2 text-xs font-medium text-slate-700 dark:text-slate-300 cursor-pointer">
                <input
                  type="checkbox"
                  name="es_vigente"
                  checked={formData.es_vigente}
                  onChange={handleChange}
                  className="rounded text-blue-600 focus:ring-blue-500 w-4 h-4 cursor-pointer"
                />
                <span>Establecer como ciclo vigente de la academia</span>
              </label>
            </div>
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
              {saving ? "Registrando..." : "Crear Convocatoria"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
