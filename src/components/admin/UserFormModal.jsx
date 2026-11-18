import { useState, useEffect } from "react";
import { X, AlertCircle, CheckCircle2, Globe, Eye, EyeOff, Lock } from "lucide-react";
import { academicosService, DEFAULT_AREAS, DEFAULT_CARRERAS, getCareersForArea, matchArea } from "../../services/academicosService";

const DOCUMENT_TYPES = [
  { id: "DNI", label: "DNI (Perú - 8 dígitos)", max: 8 },
  { id: "CE", label: "Carnet de Extranjería (CE - 9-12 caracteres)", max: 12 },
  { id: "Pasaporte", label: "Pasaporte (6-12 caracteres)", max: 12 }
];

// Traduce los errores técnicos de PostgreSQL / InsForge a mensajes entendibles
function formatBackendError(rawError) {
  if (!rawError) return "";
  let msg = "";
  if (typeof rawError === "object") {
    msg = rawError.message || JSON.stringify(rawError);
  } else {
    msg = String(rawError);
  }

  if (msg.startsWith("[Backend 422]")) {
    msg = msg.replace("[Backend 422]", "").trim();
  }

  if (msg.includes("users_correo_key")) {
    return "El correo electrónico ingresado ya está registrado con otro usuario.";
  }
  if (msg.includes("chk_users_rol")) {
    return "El rol seleccionado no es válido en la base de datos (debe ser Admin, Estudiante o Docente).";
  }
  if (msg.includes("chk_users_estado")) {
    return "El estado seleccionado no es válido (debe ser Activo o Inactivo).";
  }
  if (msg.includes("chk_users_tipo_doc")) {
    return "El tipo de documento no coincide con las reglas de la base de datos.";
  }
  if (msg.includes("chk_users_dni") || msg.includes("check_users_dni")) {
    return "El formato del documento de identidad no cumple con las reglas de la base de datos.";
  }
  if (msg.includes("chk_users_celular") || msg.includes("check_users_celular")) {
    return "El formato del celular no cumple con las reglas de la base de datos.";
  }
  if (msg.includes("chk_users_ciclo")) {
    return "El ciclo virtual ingresado no es válido.";
  }
  if (msg.includes("chk_users_fecha_nacimiento")) {
    return "La fecha de nacimiento debe estar comprendida entre el 01/01/1926 y la fecha actual.";
  }
  if (msg.includes("chk_users_password")) {
    return "La contraseña no cumple con los formatos permitidos por la base de datos.";
  }
  if (msg.includes("chk_users_nombres") || msg.includes("chk_users_apellidos")) {
    return "Nombres y apellidos solo pueden contener letras y espacios (máx. 40 caracteres).";
  }
  if (msg.includes("chk_users_correo")) {
    return "El formato del correo electrónico contiene caracteres no permitidos o supera los 40 caracteres.";
  }
  if (msg.includes("chk_users_id")) {
    return "El código de usuario debe seguir el formato institucional USR- seguido de números.";
  }
  return msg;
}

export default function UserFormModal({
  isEditing = false,
  formData = {},
  roles = [],
  showRole = true,
  serverError = "",
  isSubmitting = false,
  isPendingProfile = false,
  onClearServerError,
  onChange,
  onSubmit,
  onClose
}) {
  const [touched, setTouched] = useState({});
  const [localError, setLocalError] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // Limpiar errores cuando cambia de usuario o modo
  useEffect(() => {
    setLocalError("");
    setTouched({});
    if (onClearServerError) onClearServerError();
  }, [formData?.id, isEditing]);

  const activeError = localError || formatBackendError(serverError);

  const tipoDocumento = formData?.tipoDocumento || "DNI";
  const dni = formData?.dni ? String(formData.dni).trim() : "";
  const celular = formData?.celular ? String(formData.celular).trim() : "";

  // Fecha actual formateada a YYYY-MM-DD para el atributo max del input date
  const todayStr = new Date().toISOString().split("T")[0];

  const cleanDni = dni.replace(/\s+/g, "");
  const cleanCelular = celular.replace(/[\s-]/g, "");

  // Validaciones dinámicas según Tipo de Documento
  let isDocValid = false;
  let docErrorMsg = "";

  if (tipoDocumento === "DNI") {
    isDocValid = /^\d{8}$/.test(cleanDni);
    if (touched.dni && cleanDni && !isDocValid) {
      docErrorMsg = `El DNI peruano debe tener exactamente 8 números`;
    }
  } else if (tipoDocumento === "CE") {
    isDocValid = /^[A-Za-z0-9]{9,12}$/.test(cleanDni);
    if (touched.dni && cleanDni && !isDocValid) {
      docErrorMsg = `El Carnet de Extranjería debe tener entre 9 y 12 caracteres alfanuméricos`;
    }
  } else if (tipoDocumento === "Pasaporte") {
    isDocValid = /^[A-Za-z0-9]{6,12}$/.test(cleanDni);
    if (touched.dni && cleanDni && !isDocValid) {
      docErrorMsg = `El Pasaporte debe tener entre 6 y 12 caracteres alfanuméricos`;
    }
  }

  // Validación de teléfono: Nacional Perú (^9\d{8}$) o Internacional con + (^\+\d{8,15}$)
  const isCelularValid =
    cleanCelular === "" ||
    /^9\d{8}$/.test(cleanCelular) ||
    /^\+\d{8,15}$/.test(cleanCelular);

  const celularError =
    touched.celular && cleanCelular && !isCelularValid
      ? cleanCelular.startsWith("+")
        ? "El número internacional debe tener entre 8 y 15 dígitos numéricos tras el '+'. (Ej: +573001234567)"
        : cleanCelular.length !== 9
        ? `El número nacional debe tener 9 dígitos o use '+' para internacional`
        : "El número celular nacional debe comenzar con 9"
      : "";

  const [dbAreas, setDbAreas] = useState(DEFAULT_AREAS);
  const [dbCarreras, setDbCarreras] = useState(DEFAULT_CARRERAS);
  const [dbCiclos, setDbCiclos] = useState([]);
  const [loadingAcademicos, setLoadingAcademicos] = useState(false);

  // Cargar catálogos académicos directamente de la base de datos
  useEffect(() => {
    let isMounted = true;
    setLoadingAcademicos(true);
    Promise.all([
      academicosService.getAreas().catch(() => []),
      academicosService.getCarreras().catch(() => []),
      academicosService.getTiposCiclo().catch(() => []),
      academicosService.getCiclos().catch(() => [])
    ])
      .then(([areasData, carrerasData, tiposData, ciclosData]) => {
        if (!isMounted) return;
        if (Array.isArray(areasData) && areasData.length > 0) setDbAreas(areasData);
        if (Array.isArray(carrerasData) && carrerasData.length > 0) setDbCarreras(carrerasData);
        const combined = [
          ...(Array.isArray(tiposData) ? tiposData : []),
          ...(Array.isArray(ciclosData) ? ciclosData : [])
        ];
        if (combined.length > 0) setDbCiclos(combined);
      })
      .catch((err) => {
        console.warn("[UserFormModal] Error cargando catálogos académicos de la BD:", err);
      })
      .finally(() => {
        if (isMounted) setLoadingAcademicos(false);
      });

    return () => {
      isMounted = false;
    };
  }, []);

  const clearErrors = () => {
    if (localError) setLocalError("");
    if (serverError && onClearServerError) onClearServerError();
  };

  // 1. Áreas obtenidas de la base de datos con respaldo completo
  const areaOptions = Array.from(new Set(dbAreas.map((a) => a.nombre || a.codigo).filter(Boolean)));
  if (formData?.areaAcademica && !areaOptions.includes(formData.areaAcademica)) {
    areaOptions.unshift(formData.areaAcademica);
  }

  // 2. Carreras filtradas según Área Académica desde la BD
  const relatedCarrerasList = getCareersForArea(formData?.areaAcademica, dbCarreras, dbAreas);
  const careerOptions = Array.from(new Set(relatedCarrerasList.map((c) => c.nombre).filter(Boolean)));
  if (formData?.carreraObjetivo && !careerOptions.includes(formData.carreraObjetivo)) {
    careerOptions.unshift(formData.carreraObjetivo);
  }

  const isCareerObjectiveValid = Boolean(formData?.carreraObjetivo?.trim());
  const birthDateError = touched.fechaNacimiento && !formData?.fechaNacimiento
    ? "La fecha de nacimiento es obligatoria."
    : "";
  const careerObjectiveError = touched.carreraObjetivo && !isCareerObjectiveValid
    ? "Seleccione una carrera objetivo del área académica."
    : "";

  // 3. Ciclos desde la base de datos (tipos_ciclo y ciclos_academicos)
  const cycleOptions = Array.from(new Set(dbCiclos.map((c) => c.nombre || c.codigo).filter(Boolean)));
  if (cycleOptions.length === 0) {
    cycleOptions.push("Semestral", "Anual", "Intensivo", "Repaso / Super Intensivo", "Reforzamiento Escolar");
  }
  if (formData?.cicloVirtual && !cycleOptions.includes(formData.cicloVirtual)) {
    cycleOptions.unshift(formData.cicloVirtual);
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    clearErrors();
    onChange((prev) => ({ ...prev, [name]: value }));
  };

  const handleAreaChange = (e) => {
    const newAreaName = e.target.value;
    clearErrors();

    const relatedCarreras = getCareersForArea(newAreaName, dbCarreras, dbAreas);
    const defaultCareer = relatedCarreras[0]?.nombre || "";

    onChange((prev) => ({
      ...prev,
      areaAcademica: newAreaName,
      carreraObjetivo: relatedCarreras.some((c) => c.nombre === prev.carreraObjetivo)
        ? prev.carreraObjetivo
        : defaultCareer
    }));
  };

  const handleTipoDocumentoChange = (e) => {
    const newTipo = e.target.value;
    onChange((prev) => {
      let cleaned = prev.dni || "";
      if (newTipo === "DNI") {
        cleaned = cleaned.replace(/\D/g, "").slice(0, 8);
      } else {
        cleaned = cleaned.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
      }
      return { ...prev, tipoDocumento: newTipo, dni: cleaned };
    });
    clearErrors();
  };

  const handleDocChange = (e) => {
    const raw = e.target.value;
    let cleaned = "";
    if (tipoDocumento === "DNI") {
      cleaned = raw.replace(/\D/g, "").slice(0, 8);
    } else {
      cleaned = raw.replace(/[^a-zA-Z0-9]/g, "").slice(0, 12).toUpperCase();
    }
    setTouched((prev) => ({ ...prev, dni: true }));
    clearErrors();
    onChange((prev) => ({ ...prev, dni: cleaned }));
  };

  const handleCelularChange = (e) => {
    let raw = e.target.value.trim();
    let cleaned = "";
    if (raw.startsWith("+")) {
      cleaned = "+" + raw.slice(1).replace(/\D/g, "").slice(0, 15);
    } else {
      cleaned = raw.replace(/\D/g, "").slice(0, 9);
    }
    setTouched((prev) => ({ ...prev, celular: true }));
    clearErrors();
    onChange((prev) => ({ ...prev, celular: cleaned }));
  };

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const handleFormSubmit = (e) => {
    e.preventDefault();
    setTouched({
      dni: true,
      celular: true,
      apellidos: true,
      nombres: true,
      fechaNacimiento: true,
      carreraObjetivo: true
    });

    if (!formData?.apellidos?.trim() || !formData?.nombres?.trim()) {
      setLocalError("Por favor complete los campos obligatorios (Nombres y Apellidos).");
      return;
    }

    if (!isDocValid) {
      setLocalError(`El documento no es válido para el tipo '${tipoDocumento}'. Verifique el formato.`);
      return;
    }

    if (!isCelularValid) {
      setLocalError("El número de teléfono no es válido. Ingrese 9 dígitos para Perú o formato internacional (+ código país).");
      return;
    }

    if (!formData?.fechaNacimiento) {
      setLocalError("La fecha de nacimiento es obligatoria.");
      return;
    }

    if (!isCareerObjectiveValid) {
      setLocalError("Seleccione una carrera objetivo del área académica.");
      return;
    }

    // Validación de Ciclo Virtual traído de la base de datos
    const selectedCiclo = formData?.cicloVirtual || cycleOptions[0];
    if (!selectedCiclo || (cycleOptions.length > 0 && !cycleOptions.includes(selectedCiclo))) {
      setLocalError("Por favor seleccione un ciclo virtual válido registrado en la base de datos.");
      return;
    }

    // Validación de fecha de nacimiento (mínimo 01/01/1926 y máximo fecha actual)
    if (formData?.fechaNacimiento) {
      const selectedDate = new Date(formData.fechaNacimiento);
      const minDate = new Date("1926-01-01");
      const today = new Date();

      if (selectedDate < minDate || selectedDate > today) {
        setLocalError("La fecha de nacimiento no puede ser anterior al 01/01/1926 ni superior a la fecha actual.");
        return;
      }
    }

    setLocalError("");
    if (typeof onSubmit === "function") {
      onSubmit(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      {/* Alerta flotante ubicada justo arriba del modal */}
      {activeError && (
        <div
          role="alert"
          className="w-full max-w-2xl mb-3 p-3.5 bg-red-50 dark:bg-red-950/90 border border-red-300 dark:border-red-700 rounded-xl shadow-lg flex items-start justify-between gap-3 text-xs text-red-800 dark:text-red-200 animate-in fade-in slide-in-from-top-2 duration-200"
        >
          <div className="flex items-start gap-2.5">
            <AlertCircle className="w-4 h-4 shrink-0 text-red-600 dark:text-red-400 mt-0.5" />
            <div>
              <p className="font-bold text-red-900 dark:text-red-100">
                No se pudo completar el registro
              </p>
              <p className="mt-0.5 leading-relaxed">{activeError}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={clearErrors}
            className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/50 transition-colors cursor-pointer"
            title="Cerrar alerta"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Tarjeta principal del modal */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-slate-200 dark:border-white/10 w-full max-w-2xl max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <h3 className="text-base font-bold text-slate-800 dark:text-white">
            {isEditing ? "Editar Registro de Usuario" : "Registro de Nuevo Usuario"}
          </h3>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleFormSubmit} className="p-5 space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Apellidos *
              </label>
              <input
                type="text"
                name="apellidos"
                value={formData?.apellidos || ""}
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
                value={formData?.nombres || ""}
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
                value={formData?.dni || ""}
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
                Fecha Nacimiento *
              </label>
              <input
                type="date"
                name="fechaNacimiento"
                min="1926-01-01"
                max={todayStr}
                value={formData?.fechaNacimiento || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("fechaNacimiento")}
                required
                aria-invalid={Boolean(birthDateError)}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white dark:[color-scheme:dark] ${
                  birthDateError
                    ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                    : "border-slate-200 dark:border-white/10 focus:ring-blue-500"
                }`}
              />
              {birthDateError && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {birthDateError}
                </p>
              )}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Correo Electrónico
              </label>
              <input
                type="email"
                name="correo"
                value={formData?.correo || ""}
                onChange={handleChange}
                required={!isEditing}
                disabled={isPendingProfile}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
              />
            </div>

            {/* Campo Contraseña con visor de puntos/texto */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center gap-1">
                <Lock className="w-3 h-3 text-slate-400" />
                Contraseña
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  name="password"
                  placeholder="••••••••"
                  value={formData?.password || ""}
                  onChange={handleChange}
                  required={!isEditing && !isPendingProfile}
                  disabled={isPendingProfile}
                  className="w-full px-3 py-2 pr-9 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  title={showPassword ? "Ocultar contraseña" : "Ver contraseña"}
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              <p className="mt-0.5 text-[10px] text-slate-400 dark:text-slate-500">
                {isPendingProfile
                  ? "La cuenta Auth ya existe; el reintento solo guarda el perfil."
                  : "Se muestra en puntos por seguridad."}
              </p>
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
                value={formData?.celular || ""}
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

            {/* Selector de Área Académica */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Área Académica
              </label>
              <select
                name="areaAcademica"
                value={formData?.areaAcademica || ""}
                onChange={handleAreaChange}
                disabled={loadingAcademicos && areaOptions.length === 0}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white disabled:opacity-50"
              >
                <option value="" className="dark:bg-[#0a0a0e] dark:text-white">
                  {loadingAcademicos && areaOptions.length === 0
                    ? "-- Cargando áreas de la BD... --"
                    : "-- Seleccione un Área --"}
                </option>
                {areaOptions.map((area) => (
                  <option key={area} value={area} className="dark:bg-[#0a0a0e] dark:text-white">
                    {area}
                  </option>
                ))}
              </select>
            </div>

            {/* Selector dinámico de Carrera según Área */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Carrera / Objetivo *
              </label>
              <select
                name="carreraObjetivo"
                value={formData?.carreraObjetivo || ""}
                onChange={handleChange}
                onBlur={() => handleBlur("carreraObjetivo")}
                required
                aria-invalid={Boolean(careerObjectiveError)}
                disabled={(!formData?.areaAcademica && careerOptions.length === 0) || (loadingAcademicos && careerOptions.length === 0)}
                className={`w-full px-3 py-2 border rounded-lg text-xs focus:ring-2 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white disabled:opacity-50 ${
                  careerObjectiveError
                    ? "border-red-400 dark:border-red-500 focus:ring-red-400"
                    : "border-slate-200 dark:border-white/10 focus:ring-blue-500"
                }`}
              >
                <option value="" className="dark:bg-[#0a0a0e] dark:text-white">
                  {loadingAcademicos && careerOptions.length === 0
                    ? "-- Cargando carreras de la BD... --"
                    : formData?.areaAcademica
                    ? "-- Seleccione Carrera --"
                    : "-- Seleccione Área Primero --"}
                </option>
                {careerOptions.map((carrera) => (
                  <option key={carrera} value={carrera} className="dark:bg-[#0a0a0e] dark:text-white">
                    {carrera}
                  </option>
                ))}
              </select>
              {careerObjectiveError && (
                <p className="mt-1 text-[11px] text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3 shrink-0" />
                  {careerObjectiveError}
                </p>
              )}
            </div>

            {/* Selector de Ciclo Virtual cargado dinámicamente de la BD */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Ciclo Virtual *
              </label>
              <select
                name="cicloVirtual"
                value={formData?.cicloVirtual || cycleOptions[0] || "Semestral"}
                onChange={handleChange}
                disabled={loadingAcademicos && cycleOptions.length === 0}
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white disabled:opacity-50"
              >
                {loadingAcademicos && cycleOptions.length === 0 && (
                  <option value="">-- Cargando ciclos de la BD... --</option>
                )}
                {cycleOptions.map((ciclo) => (
                  <option key={ciclo} value={ciclo} className="dark:bg-[#0a0a0e] dark:text-white">
                    {ciclo}
                  </option>
                ))}
              </select>
            </div>

            {/* Mapeo dinámico de Roles */}
            {showRole && (
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Rol *
                </label>
                <select
                  name="rol"
                  value={formData?.rol || (roles[0] ?? "Estudiante")}
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
            )}

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Estado *
              </label>
              <select
                name="estado"
                value={formData?.estado || "Activo"}
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
              disabled={isSubmitting}
              className="px-4 py-2 text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg transition-colors cursor-pointer disabled:opacity-50"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={!isDocValid || !isCelularValid || isSubmitting}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#1E3A8A] dark:bg-white/10 dark:hover:bg-white/20 border border-transparent dark:border-white/10 rounded-lg transition-colors cursor-pointer shadow-xs disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isSubmitting
                ? "Guardando..."
                : isPendingProfile
                ? "Reintentar perfil"
                : isEditing
                ? "Guardar Cambios"
                : "Registrar Usuario"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
