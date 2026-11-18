import React, { useState, useEffect } from "react";
import { X, BookOpen, User, Clock, Video, FolderOpen, AlertTriangle, CheckCircle2, ShieldCheck } from "lucide-react";
import { ACADEMIC_AREAS, getCareersByArea } from "../../data/academicCatalog";
import { academicosService } from "../../services/academicosService";
import { userService } from "../../services/api";
import { courseService } from "../../services/cursosServices";

const WEEK_DAYS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];

export default function CursoRegistroModal({
  isOpen,
  courseToEdit = null,
  onClose,
  onAddCourse,
  onUpdateCourse
}) {
  const isEditing = Boolean(courseToEdit && courseToEdit.id);

  const [formData, setFormData] = useState({
    id: "",
    codigo: "",
    asignatura: "",
    area: ACADEMIC_AREAS[0] || "Ciencias Exactas e Ingenierías",
    carrera: "Ingeniería de Sistemas",
    docenteId: "",
    docente: "",
    dias: ["Lunes", "Miércoles"],
    horaInicio: "08:00",
    horaFin: "10:00",
    aula: "Aula V-01",
    meetUrl: "https://meet.google.com/new",
    repositorio: "https://drive.google.com",
    estado: "Activo"
  });

  const [availableAreas, setAvailableAreas] = useState(ACADEMIC_AREAS);
  const [availableCareers, setAvailableCareers] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [saveError, setSaveError] = useState("");
  const [warningMessage, setWarningMessage] = useState("");
  const [validating, setValidating] = useState(false);
  const [saving, setSaving] = useState(false);

  // Cargar áreas y docentes disponibles
  useEffect(() => {
    let cancelled = false;

    async function loadCatalogAndTeachers() {
      try {
        const [areasData, usersData] = await Promise.all([
          academicosService.getAreas().catch(() => []),
          userService.getUsers().catch(() => [])
        ]);

        if (cancelled) return;

        if (areasData && areasData.length > 0) {
          setAvailableAreas(areasData.map(a => a.nombre));
        }

        const teacherList = (usersData || []).filter(u => {
          const r = String(u.rol || "").toLowerCase();
          return r === "docente" || r === "profesor" || r === "profesora";
        });
        setTeachers(teacherList);
      } catch (err) {
        console.warn("[CursoModal] Error al cargar recursos:", err);
      }
    }

    if (isOpen) {
      loadCatalogAndTeachers();
    }

    return () => { cancelled = true; };
  }, [isOpen]);

  // Actualizar carreras según el área seleccionada
  useEffect(() => {
    const careers = getCareersByArea(formData.area);
    setAvailableCareers(careers);
    if (careers.length > 0 && !careers.includes(formData.carrera)) {
      setFormData(prev => ({ ...prev, carrera: careers[0] }));
    }
  }, [formData.area]);

  // Sincronizar datos si es edición o nueva creación
  useEffect(() => {
    if (!isOpen) return;

    if (courseToEdit) {
      const diasArr = Array.isArray(courseToEdit.dias) && courseToEdit.dias.length
        ? courseToEdit.dias
        : ["Lunes", "Miércoles"];
      setFormData({
        id: courseToEdit.id || "",
        codigo: courseToEdit.codigo || courseToEdit.id || "",
        asignatura: courseToEdit.asignatura || "",
        area: courseToEdit.area || ACADEMIC_AREAS[0],
        carrera: courseToEdit.carrera || "Ingeniería de Sistemas",
        docenteId: courseToEdit.docenteId || "",
        docente: courseToEdit.docente || "",
        dias: diasArr,
        horaInicio: courseToEdit.horaInicio || "08:00",
        horaFin: courseToEdit.horaFin || "10:00",
        aula: courseToEdit.aula || `Aula ${courseToEdit.id || "V-01"}`,
        meetUrl: courseToEdit.meetUrl || "https://meet.google.com/new",
        repositorio: courseToEdit.repositorio || "https://drive.google.com",
        estado: courseToEdit.estado || "Activo"
      });
    } else {
      setFormData({
        id: `CRS-${Date.now().toString().slice(-4)}`,
        codigo: `CRS-${Date.now().toString().slice(-4)}`,
        asignatura: "",
        area: ACADEMIC_AREAS[0] || "Ciencias Exactas e Ingenierías",
        carrera: "Ingeniería de Sistemas",
        docenteId: teachers[0]?.id || "",
        docente: teachers[0] ? `${teachers[0].nombres || ""} ${teachers[0].apellidos || ""}`.trim() : "",
        dias: ["Lunes", "Miércoles"],
        horaInicio: "08:00",
        horaFin: "10:00",
        aula: "Aula V-01",
        meetUrl: "https://meet.google.com/new",
        repositorio: "https://drive.google.com",
        estado: "Activo"
      });
    }
    setSaveError("");
    setWarningMessage("");
  }, [isOpen, courseToEdit, teachers]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveError("");
    setWarningMessage("");
  };

  const handleTeacherSelect = (e) => {
    const teacherId = e.target.value;
    const selected = teachers.find(t => t.id === teacherId);
    if (selected) {
      const fullName = `${selected.nombres || ""} ${selected.apellidos || ""}`.trim() || selected.correo;
      setFormData(prev => ({
        ...prev,
        docenteId: selected.id,
        docente: fullName
      }));
    } else {
      setFormData(prev => ({ ...prev, docenteId: "", docente: teacherId }));
    }
  };

  const toggleDay = (day) => {
    setFormData((prev) => {
      const current = prev.dias || [];
      const updated = current.includes(day)
        ? current.filter(d => d !== day)
        : [...current, day];
      return { ...prev, dias: updated };
    });
  };

  const handleValidateSchedule = async () => {
    setValidating(true);
    setWarningMessage("");
    setSaveError("");
    try {
      const res = await courseService.validarCursoConBackend({
        ...formData,
        id: formData.id || "CRS-TEMP"
      });
      if (res && res.cruce) {
        setWarningMessage(`Advertencia de Cruce: ${res.mensaje || "Se detectó solapamiento horario en el backend."}`);
      } else if (res && res.valido === false) {
        setWarningMessage(`Validación del Backend: ${res.mensaje}`);
      } else {
        setWarningMessage("Horario validado sin cruces con el backend (POST /monitoreo/validar-curso).");
      }
    } catch (err) {
      console.warn("Error al validar con backend:", err);
    } finally {
      setValidating(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError("");
    setWarningMessage("");

    if (!formData.asignatura.trim()) {
      setSaveError("El nombre de la asignatura es obligatorio.");
      return;
    }

    if (!formData.docente.trim()) {
      setSaveError("Debes asignar un docente titular.");
      return;
    }

    if (!formData.dias || formData.dias.length === 0) {
      setSaveError("Selecciona al menos un día de clase a la semana.");
      return;
    }

    if (formData.horaInicio >= formData.horaFin) {
      setSaveError("La hora de inicio debe ser anterior a la hora de fin.");
      return;
    }

    // Estructurar según schema CourseCreate (OpenAPI)
    const horarioTexto = `${formData.dias.join(" y ")} ${formData.horaInicio} - ${formData.horaFin}`;
    const cleanId = formData.id || formData.codigo || `CRS-${Date.now().toString().slice(-4)}`;

    const payload = {
      id: cleanId,
      codigo: formData.codigo || cleanId,
      asignatura: formData.asignatura.trim(),
      area: formData.area,
      carrera: formData.carrera,
      docenteId: formData.docenteId || "USR-DOC-01",
      docente: formData.docente.trim(),
      dias: formData.dias,
      horaInicio: formData.horaInicio,
      horaFin: formData.horaFin,
      horario: horarioTexto,
      aula: formData.aula || `Aula ${cleanId.replace("CRS-", "V-")}`,
      meetUrl: formData.meetUrl || "https://meet.google.com/new",
      repositorio: formData.repositorio || "https://drive.google.com",
      estado: formData.estado || "Activo",
      ciclovirtual: "Semestral"
    };

    setSaving(true);
    try {
      if (isEditing && onUpdateCourse) {
        await onUpdateCourse(payload);
      } else if (onAddCourse) {
        await onAddCourse(payload);
      }
      onClose();
    } catch (error) {
      setSaveError(error.message || "Error al registrar el curso en la base de datos.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-2xl overflow-hidden animate-scale-up my-6">
        {/* Encabezado */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-blue-500/10 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <BookOpen className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {isEditing ? "Modificar Curso Virtual" : "Registrar Nuevo Curso Virtual"}
              </h3>
              <p className="text-xs text-slate-500">
                Endpoint: {isEditing ? "PUT /horarios/cursos/{id}" : "POST /horarios/cursos"} (CourseCreate)
              </p>
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

        {/* Formulario */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          {saveError && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0" />
              <span>{saveError}</span>
            </div>
          )}

          {warningMessage && (
            <div className={`p-3 text-xs rounded-lg flex items-center gap-2 border ${
              warningMessage.includes("Advertencia")
                ? "bg-amber-50 text-amber-800 border-amber-200"
                : "bg-emerald-50 text-emerald-800 border-emerald-200"
            }`}>
              {warningMessage.includes("Advertencia") ? (
                <AlertTriangle className="w-4 h-4 shrink-0" />
              ) : (
                <CheckCircle2 className="w-4 h-4 shrink-0" />
              )}
              <span>{warningMessage}</span>
            </div>
          )}

          {/* Código e ID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Código del Curso *
              </label>
              <input
                type="text"
                name="codigo"
                value={formData.codigo}
                onChange={handleChange}
                placeholder="ej. MAT-101"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] uppercase font-mono"
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombre de la Asignatura *
              </label>
              <input
                type="text"
                name="asignatura"
                value={formData.asignatura}
                onChange={handleChange}
                placeholder="ej. Álgebra y Geometría Analítica"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Área y Carrera */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Área Académica *
              </label>
              <select
                name="area"
                value={formData.area}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-900 dark:text-white"
              >
                {formData.area && !availableAreas.includes(formData.area) && (
                  <option value={formData.area}>{formData.area}</option>
                )}
                {availableAreas.map((area) => (
                  <option key={area} value={area}>
                    {area}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Carrera Asociada *
              </label>
              <select
                name="carrera"
                value={formData.carrera}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-900 dark:text-white"
              >
                {formData.carrera && !availableCareers.includes(formData.carrera) && (
                  <option value={formData.carrera}>{formData.carrera}</option>
                )}
                {availableCareers.map((car) => (
                  <option key={car} value={car}>
                    {car}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Docente Titular */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Seleccionar Docente Titular *
              </label>
              <select
                value={formData.docenteId}
                onChange={handleTeacherSelect}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-900 dark:text-white"
              >
                <option value="">-- Seleccionar de la nómina docente --</option>
                {formData.docenteId && !teachers.some(t => t.id === formData.docenteId) && (
                  <option value={formData.docenteId}>
                    {formData.docente ? `${formData.docente} (${formData.docenteId})` : formData.docenteId}
                  </option>
                )}
                {teachers.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.nombres} {t.apellidos} ({t.areaAcademica})
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Días y Horarios */}
          <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10 space-y-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5">
                Días de Clase Semanales *
              </label>
              <div className="flex flex-wrap gap-1.5">
                {WEEK_DAYS.map((day) => {
                  const isSelected = (formData.dias || []).includes(day);
                  return (
                    <button
                      key={day}
                      type="button"
                      onClick={() => toggleDay(day)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                        isSelected
                          ? "bg-[#1E3A8A] text-white shadow-xs"
                          : "bg-white dark:bg-slate-800 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-white/10 hover:border-blue-400"
                      }`}
                    >
                      {day}
                    </button>
                  );
                })}
              </div>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-3 gap-3 items-end">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hora Inicio *
                </label>
                <input
                  type="time"
                  name="horaInicio"
                  value={formData.horaInicio}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Hora Fin *
                </label>
                <input
                  type="time"
                  name="horaFin"
                  value={formData.horaFin}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <button
                  type="button"
                  onClick={handleValidateSchedule}
                  disabled={validating}
                  className="w-full py-2 px-3 border border-blue-600/30 text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 hover:bg-blue-100 rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span>{validating ? "Validando..." : "Validar Cruces"}</span>
                </button>
              </div>
            </div>
          </div>

          {/* Enlaces Síncronos y Recursos */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Enlace Sala Sincrónica (Meet / Zoom) *
              </label>
              <input
                type="url"
                name="meetUrl"
                value={formData.meetUrl}
                onChange={handleChange}
                placeholder="https://meet.google.com/abc-defg-hij"
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Repositorio de Recursos (Drive / Cloud) *
              </label>
              <input
                type="text"
                name="repositorio"
                value={formData.repositorio}
                onChange={handleChange}
                placeholder="https://drive.google.com/drive/folders/..."
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]"
              />
            </div>
          </div>

          {/* Aula y Estado */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Aula Asignada
              </label>
              <input
                type="text"
                name="aula"
                value={formData.aula}
                onChange={handleChange}
                placeholder="Aula V-01"
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-[#1E3A8A]"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado del Curso
              </label>
              <select
                name="estado"
                value={formData.estado}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] cursor-pointer"
              >
                <option value="Activo">Activo</option>
                <option value="En Revisión">En Revisión</option>
                <option value="Inactivo">Inactivo</option>
              </select>
            </div>
          </div>

          {/* Botones de acción */}
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
              className="px-5 py-2 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50"
            >
              {saving ? "Guardando..." : isEditing ? "Actualizar Curso" : "Registrar Curso"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
