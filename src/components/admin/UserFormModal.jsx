import { X } from "lucide-react";
import { ACADEMIC_AREAS, getCareersByArea } from "../../data/academicCatalog";

export default function UserFormModal({
  isEditing,
  formData,
  roles = [],
  onChange,
  onSubmit,
  onClose
}) {
  const availableCareers = getCareersByArea(formData.areaAcademica);

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange((prev) => name === "areaAcademica"
      ? { ...prev, areaAcademica: value, carreraObjetivo: "" }
      : { ...prev, [name]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-base font-bold text-slate-800">
            {isEditing ? "Editar Registro de Usuario" : "Registro de Nuevo Usuario"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/50 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                DNI *
              </label>
              <input
                type="text"
                name="dni"
                value={formData.dni || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Celular
              </label>
              <input
                type="text"
                name="celular"
                value={formData.celular || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Área académica
              </label>
              <select
                name="areaAcademica"
                value={formData.areaAcademica || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="">Seleccionar área</option>
                {ACADEMIC_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carrera / Objetivo</label>
              <select name="carreraObjetivo" value={formData.carreraObjetivo || ""} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white">
                <option value="">Seleccionar carrera</option>
                {availableCareers.map((career) => <option key={career} value={career}>{career}</option>)}
              </select>
            </div>

            {/* Mapeo dinámico de Roles */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Rol *
              </label>
              <select
                name="rol"
                value={formData.rol || (roles[0] ?? "Estudiante")}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                {roles.map((rol) => (
                  <option key={rol} value={rol}>
                    {rol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado || "Activo"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white"
              >
                <option value="Activo">Activo</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs"
            >
              {isEditing ? "Guardar Cambios" : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}