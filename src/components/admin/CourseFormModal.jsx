import { ACADEMIC_AREAS, getCareersByArea } from "../../data/academicCatalog";

const inputClassName = "w-full mt-1 p-2 border border-slate-200 rounded font-normal focus:border-[#1E3A8A] focus:outline-hidden";

export default function CourseFormModal({ formData, onChange, onSubmit, onClose }) {
  const updateField = (field, value) => {
    onChange({ ...formData, [field]: value });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4">
      <div
        className="bg-white rounded-xl shadow-2xl max-w-3xl w-full border border-slate-200 overflow-hidden"
        role="dialog"
        aria-modal="true"
        aria-labelledby="course-form-title"
      >
        <div className="bg-[#1E3A8A] text-white px-6 py-4 flex items-center justify-between">
          <h3 id="course-form-title" className="text-base font-bold">Registrar Nuevo Curso</h3>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar formulario"
            className="text-white/80 hover:text-white text-lg font-bold"
          >
            X
          </button>
        </div>

        <form onSubmit={onSubmit} className="p-6 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <label className="font-semibold text-slate-700">
              Código *
              <input required value={formData.codigo} onChange={(event) => updateField("codigo", event.target.value)} placeholder="MAT-101" className={inputClassName} />
            </label>
            <label className="font-semibold text-slate-700">
              Asignatura *
              <input required value={formData.asignatura} onChange={(event) => updateField("asignatura", event.target.value)} placeholder="Álgebra y Funciones" className={inputClassName} />
            </label>
            <label className="font-semibold text-slate-700">
              Área académica *
              <select value={formData.area} onChange={(event) => updateField("area", event.target.value)} className={inputClassName}>
                {ACADEMIC_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </label>
            <label className="font-semibold text-slate-700">
              Carrera asociada
              <select value={formData.carrera || ""} onChange={(event) => updateField("carrera", event.target.value)} className={inputClassName}>
                <option value="">Seleccionar carrera</option>
                {getCareersByArea(formData.area).map((career) => <option key={career} value={career}>{career}</option>)}
              </select>
            </label>
            <label className="font-semibold text-slate-700">
              Docente titular *
              <input required value={formData.docente} onChange={(event) => updateField("docente", event.target.value)} placeholder="Prof. Carmen Herrera" className={inputClassName} />
            </label>
            <label className="font-semibold text-slate-700">
              Horario *
              <input required value={formData.horario} onChange={(event) => updateField("horario", event.target.value)} placeholder="Lunes y Miércoles 08:00 - 10:00 AM" className={inputClassName} />
            </label>
            <label className="font-semibold text-slate-700">
              Repositorio digital
              <input value={formData.repositorio} onChange={(event) => updateField("repositorio", event.target.value)} placeholder="drive.google.com/cursos" className={inputClassName} />
            </label>
            <label className="font-semibold text-slate-700">
              Estado
              <select value={formData.estado} onChange={(event) => updateField("estado", event.target.value)} className={inputClassName}>
                <option>Activo</option>
                <option>En Revisión</option>
              </select>
            </label>
          </div>

          <div className="pt-4 border-t border-slate-200 flex justify-end gap-3">
            <button type="button" onClick={onClose} className="px-4 py-2 border border-slate-300 rounded text-xs text-slate-600 hover:bg-slate-50">
              Cancelar
            </button>
            <button type="submit" className="px-4 py-2 bg-[#1E3A8A] hover:bg-blue-800 text-white font-semibold rounded text-xs shadow-xs">
              Registrar Curso
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
