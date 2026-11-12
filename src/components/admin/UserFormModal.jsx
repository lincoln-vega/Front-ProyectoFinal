import { useState } from "react";
import { X, AlertCircle, CheckCircle2, Globe } from "lucide-react";

const DOCUMENT_TYPES = [
  { id: "DNI", label: "DNI (Perú - 8 dígitos)", max: 8 },
  { id: "CE", label: "Carnet de Extranjería (CE - 9-12 caracteres)", max: 12 },
  { id: "Pasaporte", label: "Pasaporte (6-12 caracteres)", max: 12 }
];

export default function UserFormModal({
  isEditing,
  formData,
  roles = [],
  onChange,
  onSubmit,
  onClose
}) {
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState("");

  const tipoDocumento = formData.tipoDocumento || "DNI";
  const dni = formData.dni ? String(formData.dni).trim() : "";
  const celular = formData.celular ? String(formData.celular).trim() : "";

  // Validaciones dinámicas de Capa 1 según Tipo de Documento
  let isDocValid = false;
  let docErrorMsg = "";

  if (tipoDocumento === "DNI") {
    isDocValid = /^\d{8}$/.test(dni);
    if (touched.dni && dni && !isDocValid) {
      docErrorMsg = `El DNI peruano debe tener exactamente 8 números (actual: ${dni.length}/8)`;
    }
  } else if (tipoDocumento === "CE") {
    isDocValid = /^[A-Za-z0-9]{9,12}$/.test(dni);
    if (touched.dni && dni && !isDocValid) {
      docErrorMsg = `El Carnet de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos (actual: ${dni.length})`;
    }
  } else if (tipoDocumento === "Pasaporte") {
    isDocValid = /^[A-Za-z0-9]{6,12}$/.test(dni);
    if (touched.dni && dni && !isDocValid) {
      docErrorMsg = `El Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos (actual: ${dni.length})`;
    }
  }

  // Validación de teléfono: Nacional Perú (^9\d{8}$) o Internacional con + (^\+\d{8,15}$)
  const isCelularValid =
    celular === "" ||
    /^9\d{8}$/.test(celular) ||
    /^\+\d{8,15}$/.test(celular);

  const celularError =
    touched.celular && celular && !isCelularValid
      ? celular.startsWith("+")
        ? "El número internacional debe tener entre 8 y 15 dígitos numéricos tras el '+'. (Ej: +573001234567)"
        : celular.length !== 9
        ? `El número nacional debe tener 9 dígitos (actual: ${celular.length}/9) o use '+' para internacional`
        : "El número celular nacional debe comenzar con 9"
      : "";

  const handleChange = (e) => {
    const { name, value } = e.target;
    onChange((prev) => ({ ...prev, [name]: value }));
  };

  const handleTipoDocumentoChange = (e) => {
    const newTipo = e.target.value;
    onChange((prev) => {
      // Limpiar documento según nuevo tipo
      let cleaned = prev.dni || "";
      if (newTipo === "DNI") {
        cleaned = cleaned.replace(/\D/g, "").slice(0, 8);
      } else {
        cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
      }
      return { ...prev, tipoDocumento: newTipo, dni: cleaned };
    });
    setLocalError("");
  };

  // Máscaras de teclado en vivo dinámicas
  const handleDocChange = (e) => {
    const raw = e.target.value;
    let cleaned = "";
    if (tipoDocumento === "DNI") {
      cleaned = raw.replace(/\D/g, "").slice(0, 8);
    } else {
      cleaned = raw.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
    }
    setTouched((prev) => ({ ...prev, dni: true }));
    setLocalError("");
    onChange((prev) => ({ ...prev, dni: cleaned }));
  };

  const handleCelularChange = (e) => {
    let raw = e.target.value.trim();
    // Permitir '+' solo en la primera posición y dígitos después
    let cleaned = "";
    if (raw.startsWith("+")) {
      cleaned = "+" + raw.slice(1).replace(/\D/g, "").slice(0, 15);
    } else {
      cleaned = raw.replace(/\D/g, "").slice(0, 9);
    }
    setTouched((prev) => ({ ...prev, celular: true }));
    setLocalError("");
    onChange((prev) => ({ ...prev, celular: cleaned }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setTouched({ dni: true, celular: true, apellidos: true, nombres: true });

    if (!isDocValid) {
      setLocalError(`El documento no es válido para el tipo '${tipoDocumento}'. Verifique el formato.`);
      return;
    }

    if (!isCelularValid) {
      setLocalError("El número de teléfono no es válido. Ingrese 9 dígitos para Perú o formato internacional (+ código país).");
      return;
    }

    setLocalError("");
    onSubmit(e);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-2xl max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {isEditing ? "Editar Registro de Usuario" : "Registro de Nuevo Usuario"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {localError && (
          <div className="mx-5 mt-4 p-3 bg-red-50 dark:bg-red-950/40 border border-red-200 dark:border-red-800/50 rounded-lg flex items-center gap-2 text-xs text-red-700 dark:text-red-300">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-500" />
            <span>{localError}</span>
          </div>
        )}

        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData.apellidos || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Nombres *
              </label>
              <input
                type="text"
                name="nombres"
                value={formData.nombres || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
                required
              />
            </div>

            {/* Selector de Tipo de Documento */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tipo de Documento *
              </label>
              <select
                name="tipoDocumento"
                value={tipoDocumento}
                onChange={handleTipoDocumentoChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-slate-900 dark:text-white"
              >
                {DOCUMENT_TYPES.map((t) => (
                  <option key={t.id} value={t.id}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Campo Documento de Identidad Dinámico */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Número de {tipoDocumento} *
                </label>
                {isDocValid && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Válido ({tipoDocumento})
                  </span>
                )}
              </div>
              <input
                type="text"
                name="dni"
                maxLength={tipoDocumento === "DNI" ? 8 : 12}
                placeholder={
                  tipoDocumento === "DNI"
                    ? "Ej. 74839201"
                    : tipoDocumento === "CE"
                    ? "Ej. CE001234567"
                    : "Ej. PAS987654"
                }
                value={formData.dni || ""}
                onChange={handleDocChange}
                onBlur={() => handleBlur("dni")}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white transition-colors uppercase ${
                  docErrorMsg
                    ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                    : "border-slate-200 dark:border-white/10 focus:ring-blue-500"
                }`}
                required
              />
              {docErrorMsg ? (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {docErrorMsg}
                </p>
              ) : (
                <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                  {tipoDocumento === "DNI"
                    ? "DNI: 8 dígitos numéricos peruanos."
                    : tipoDocumento === "CE"
                    ? "CE: 9 a 12 caracteres alfanuméricos de Migraciones."
                    : "Pasaporte: 6 a 12 caracteres alfanuméricos internacionales."}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Fecha Nacimiento
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                value={formData.fechaNacimiento || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white dark:[color-scheme:dark]"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={formData.correo || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Campo Celular Nacional o Internacional */}
            <div>
              <div className="flex items-center justify-between mb-1">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Globe className="w-3.5 h-3.5 text-slate-400" />
                  Celular (Nacional / Internacional)
                </label>
                {celular && isCelularValid && (
                  <span className="text-[10px] font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Conforme
                  </span>
                )}
              </div>
              <input
                type="text"
                name="celular"
                maxLength={16}
                placeholder="Ej. 987654321 o +573001234567"
                value={formData.celular || ""}
                onChange={handleCelularChange}
                onBlur={() => handleBlur("celular")}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white transition-colors ${
                  celularError
                    ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                    : "border-slate-200 dark:border-white/10 focus:ring-blue-500"
                }`}
              />
              {celularError ? (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {celularError}
                </p>
              ) : (
                <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                  9 dígitos (Perú) o use '+' seguido del código de país (ej. +57, +34, +1).
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Carrera / Objetivo
              </label>
              <input
                type="text"
                name="carreraObjetivo"
                value={formData.carreraObjetivo || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ciclo Virtual
              </label>
              <input
                type="text"
                name="cicloVirtual"
                value={formData.cicloVirtual || ""}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Mapeo dinámico de Roles */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Rol *
              </label>
              <select
                name="rol"
                value={formData.rol || (roles[0] ?? "Estudiante")}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
              >
                {roles.map((rol) => (
                  <option key={rol} value={rol} className="dark:bg-[#0a0a0e] dark:text-white">
                    {rol}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado *
              </label>
              <select
                name="estado"
                value={formData.estado || "Activo"}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
              >
                <option value="Activo" className="dark:bg-[#0a0a0e] dark:text-white">Activo</option>
                <option value="Inactivo" className="dark:bg-[#0a0a0e] dark:text-white">Inactivo</option>
              </select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4 border-t border-slate-100 dark:border-white/10">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isDocValid || !isCelularValid}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] dark:bg-white/10 dark:hover:bg-white/20 border border-transparent dark:border-white/10 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isEditing ? "Guardar Cambios" : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
