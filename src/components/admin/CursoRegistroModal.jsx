import React, { useState } from "react";
import { X } from "lucide-react";

export default function CursoRegistroModal({ isOpen, onClose, onAddCourse }) {
  const [formData, setFormData] = useState({
    asignatura: "",
    docente: "",
    codigo: "",
    aula: "",
    horario: "Lun / Mié 08:00 - 10:00 hrs",
    area: "Ciencias Exactas",
    estado: "Activo",
    tipoSala: "zoom",
    repositorio: "drive.google.com"
  });
  const [saveError, setSaveError] = useState("");

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.asignatura || !formData.docente) return;

    // Crea el objeto del curso estructurado
    const newCourse = {
      id: Date.now(),
      ...formData,
      codigo: formData.codigo.toUpperCase() || "CURSO-NEW",
      aula: formData.aula.toUpperCase() || "AULA-00"
    };

    setSaveError("");
    try {
      await onAddCourse(newCourse);
      onClose();
    } catch (error) {
      setSaveError(error.message || "No se pudo guardar el curso en InsForge.");
      return;
    }

    // Resetear formulario
    setFormData({
      asignatura: "",
      docente: "",
      codigo: "",
      aula: "",
      horario: "Lun / Mié 08:00 - 10:00 hrs",
      area: "Ciencias Exactas",
      estado: "Activo",
      tipoSala: "zoom",
      repositorio: "drive.google.com"
    });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-white/5 dark:backdrop-blur-2xl rounded-xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">Registrar Nuevo Curso</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          {saveError && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{saveError}</p>}
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Nombre de la Asignatura *
            </label>
            <input
              type="text"
              name="asignatura"
              value={formData.asignatura}
              onChange={handleChange}
              placeholder="Ej. Matemática Discreta"
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:outline-hidden focus:border-[#1E3A8A] dark:focus:border-blue-500 transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
              Docente Titular *
            </label>
            <input
              type="text"
              name="docente"
              value={formData.docente}
              onChange={handleChange}
              placeholder="Ej. Ing. Carlos Pérez"
              required
              className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:outline-hidden focus:border-[#1E3A8A] dark:focus:border-blue-500 transition-all"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Código</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ej. MAT-101"
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:outline-hidden focus:border-[#1E3A8A] dark:focus:border-blue-500 transition-all"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Aula</label>
              <input
                type="text"
                name="aula"
                value={formData.aula}
                onChange={handleChange}
                placeholder="Ej. A-201"
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:outline-hidden focus:border-[#1E3A8A] dark:focus:border-blue-500 transition-all"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Área Académica
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:outline-hidden focus:border-[#1E3A8A] dark:focus:border-blue-500 cursor-pointer"
              >
                <option value="Ciencias Exactas" className="dark:bg-[#0a0a0e] dark:text-white">Ciencias Exactas</option>
                <option value="Ciencias Médicas" className="dark:bg-[#0a0a0e] dark:text-white">Ciencias Médicas</option>
                <option value="Humanidades y Letras" className="dark:bg-[#0a0a0e] dark:text-white">Humanidades y Letras</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-white/10 focus:outline-hidden focus:border-[#1E3A8A] dark:focus:border-blue-500 cursor-pointer"
              >
                <option value="Activo" className="dark:bg-[#0a0a0e] dark:text-white">Activo</option>
                <option value="En Revisión" className="dark:bg-[#0a0a0e] dark:text-white">En Revisión</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 bg-white dark:bg-transparent border border-slate-200 dark:border-white/10 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] dark:bg-white/10 dark:hover:bg-white/20 border border-transparent dark:border-white/10 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              Guardar Curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}