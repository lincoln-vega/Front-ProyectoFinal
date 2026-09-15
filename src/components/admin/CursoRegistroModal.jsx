import React, { useEffect, useState } from "react";
import { X } from "lucide-react";
import { ACADEMIC_AREAS, getCareersByArea } from "../../data/academicCatalog";
import { userService } from "../../services/api";

const emptyFormData = {
    asignatura: "",
    docente: "",
    docenteId: "",
    codigo: "",
    dias: [],
    horaInicio: "08:00",
    horaFin: "10:00",
    area: "Ciencias Exactas",
    carrera: "",
    estado: "Activo",
    repositorio: "drive.google.com",
    meetUrl: ""
};

const DAY_NAMES = {
  lunes: "Lunes", lun: "Lunes",
  martes: "Martes", mar: "Martes",
  miércoles: "Miércoles", miercoles: "Miércoles", mie: "Miércoles", mié: "Miércoles",
  jueves: "Jueves", jue: "Jueves",
  viernes: "Viernes", vie: "Viernes"
};

const getFormData = (course) => {
  if (!course) return { ...emptyFormData };

  const timeRange = course.horario?.match(/(\d{2}:\d{2})\s*-\s*(\d{2}:\d{2})/);
  const dayText = course.horario?.replace(/\s*\d{2}:\d{2}\s*-\s*\d{2}:\d{2}(?:\s*(?:AM|PM|hrs?\.?)?)\s*$/i, "").trim();
  const horarioDays = dayText?.split(/\s+y\s+|,\s*|\s*\/\s*/i)
    .map((day) => DAY_NAMES[day.trim().toLowerCase()])
    .filter(Boolean) || [];
  const dias = (Array.isArray(course.dias) && course.dias.length > 0 ? course.dias : horarioDays).slice(0, 2);

  return {
    ...emptyFormData,
    ...course,
    codigo: course.codigo || "",
    dias,
    horaInicio: timeRange?.[1] || emptyFormData.horaInicio,
    horaFin: timeRange?.[2] || emptyFormData.horaFin
  };
};

export default function CursoRegistroModal({ isOpen, onClose, onAddCourse, onUpdateCourse, courseToEdit }) {
  const [formData, setFormData] = useState({ ...emptyFormData });
  const availableCareers = getCareersByArea(formData.area);
  const docentes = userService.getUsers().filter((user) => String(user.rol).toLowerCase() === "docente");

  useEffect(() => {
    if (isOpen) setFormData(getFormData(courseToEdit));
  }, [courseToEdit, isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => name === "area"
      ? { ...prev, area: value, carrera: "" }
      : { ...prev, [name]: value });
  };

  const handleDayToggle = (day) => {
    setFormData((prev) => {
      const selectedDays = Array.isArray(prev.dias) ? prev.dias : [];
      const isSelected = selectedDays.includes(day);

      if (isSelected) {
        return { ...prev, dias: selectedDays.filter((selectedDay) => selectedDay !== day) };
      }

      return selectedDays.length < 2 ? { ...prev, dias: [...selectedDays, day] } : prev;
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
      if (!formData.asignatura || !formData.docente || !formData.dias?.length || formData.dias.length > 2 || !formData.horaInicio || !formData.horaFin) return;

    const selectedTeacher = docentes.find((docente) => `${docente.nombres} ${docente.apellidos}` === formData.docente);
    const course = {
      id: courseToEdit?.id || Date.now(),
      ...formData,
      docenteId: formData.docenteId || selectedTeacher?.id || courseToEdit?.docenteId || "",
      horario: `${formData.dias.join(" y ")} ${formData.horaInicio} - ${formData.horaFin}`,
      carrera: formData.carrera,
      codigo: formData.codigo.toUpperCase() || "CURSO-NEW",
    };

    if (courseToEdit) {
      onUpdateCourse(course);
    } else {
      onAddCourse(course);
    }
    onClose();

    setFormData({ ...emptyFormData });
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 w-full max-w-md p-5 animate-in fade-in zoom-in-95 duration-150">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <h3 className="text-base font-bold text-slate-800">{courseToEdit ? "Editar Curso" : "Registrar Nuevo Curso"}</h3>
          <button 
            type="button" 
            onClick={onClose} 
            className="text-slate-400 hover:text-slate-600 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Nombre de la Asignatura *
            </label>
            <input
              type="text"
              name="asignatura"
              value={formData.asignatura}
              onChange={handleChange}
              placeholder="Ej. Matemática Discreta"
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Docente Titular *
            </label>
            <select
              name="docente"
              value={formData.docente}
              onChange={handleChange}
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] transition-all"
            >
              <option value="">Seleccionar docente</option>
              {formData.docente && !docentes.some((docente) => `${docente.nombres} ${docente.apellidos}` === formData.docente) && (
                <option value={formData.docente}>{formData.docente}</option>
              )}
              {docentes.map((docente) => (
                <option key={docente.id} value={`${docente.nombres} ${docente.apellidos}`}>
                  {docente.nombres} {docente.apellidos}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Enlace de Google Meet *
            </label>
            <input
              type="url"
              name="meetUrl"
              value={formData.meetUrl || ""}
              onChange={handleChange}
              placeholder="https://meet.google.com/..."
              required
              className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] transition-all"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Código</label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="Ej. MAT-101"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] transition-all"
              />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-2">Días * <span className="font-normal text-slate-400">(máximo 2)</span></label>
            <div className="grid grid-cols-5 gap-2">
                {[{ name: "Lunes", initial: "L" }, { name: "Martes", initial: "M" }, { name: "Miércoles", initial: "X" }, { name: "Jueves", initial: "J" }, { name: "Viernes", initial: "V" }].map(({ name, initial }) => {
                  const day = name;
                  const checked = formData.dias?.includes(day);
                  return (
                    <label key={day} title={day} className={`flex items-center justify-center gap-2 px-2.5 py-2 rounded-lg border text-xs font-semibold cursor-pointer transition-colors ${checked ? "border-blue-200 bg-blue-50 text-[#1E3A8A]" : "border-slate-200 bg-slate-50 text-slate-600"}`}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={() => handleDayToggle(day)}
                        className="accent-[#1E3A8A]"
                      />
                      {initial}
                    </label>
                  );
                })}
              </div>
            </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hora inicio *</label>
              <input
                type="time"
                name="horaInicio"
                value={formData.horaInicio}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Hora fin *</label>
              <input
                type="time"
                name="horaFin"
                value={formData.horaFin}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] transition-all cursor-pointer"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Área Académica
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] cursor-pointer"
              >
                {ACADEMIC_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Carrera</label>
              <select name="carrera" value={formData.carrera} onChange={handleChange} className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]">
                <option value="">Seleccionar carrera</option>
                {availableCareers.map((career) => <option key={career} value={career}>{career}</option>)}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Estado</label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-xs bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="En Revisión">En Revisión</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
            >
              {courseToEdit ? "Guardar Cambios" : "Guardar Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}