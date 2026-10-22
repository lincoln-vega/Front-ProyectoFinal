import React, { useState, useEffect } from "react";
import {
  Settings,
  Building,
  Calendar,
  DollarSign,
  Save,
  CheckCircle2,
  AlertTriangle,
  School,
  Mail,
  Phone,
  MapPin,
  Clock,
  ShieldCheck,
  RefreshCw,
  Sparkles
} from "lucide-react";
import { configService } from "../../services/api";
import Notification from "../../components/admin/Notification";

export default function AdminConfiguracionPage() {
  const [activeTab, setActiveTab] = useState("institucion"); // 'institucion' | 'ciclo' | 'auditoria'
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);

  const [formData, setFormData] = useState({
    id: "general",
    institucion_nombre: "Academia Preuniversitaria S.A.C.",
    institucion_ruc: "20608912345",
    institucion_direccion: "Av. Universitaria 1234, Lima, Perú",
    institucion_telefono: "+51 987 654 321",
    institucion_correo: "contacto@academia.edu.pe",
    ciclo_vigente: "Semestral 2026-I",
    ciclo_inicio: "2026-01-15",
    ciclo_fin: "2026-07-31",
    ciclo_estado: "En Curso",
    tarifa_hora_docente: 50.0,
    tolerancia_tardanza_min: 15,
    horas_descuento_inasistencia: 2.0
  });

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    let cancelled = false;

    async function loadConfig() {
      try {
        setLoading(true);
        setError("");
        const data = await configService.getConfig();
        if (cancelled) return;
        if (data) {
          setFormData((prev) => ({
            ...prev,
            ...data,
            tarifa_hora_docente: Number(data.tarifa_hora_docente || 50),
            tolerancia_tardanza_min: Number(data.tolerancia_tardanza_min || 15),
            horas_descuento_inasistencia: Number(data.horas_descuento_inasistencia || 2)
          }));
        }
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar configuración:", err);
          setError(err.message || "Error al cargar configuración.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadConfig();
    return () => { cancelled = true; };
  }, []);

  const handleChange = (e) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "number" ? Number(value) : value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const saved = await configService.saveConfig(formData);
      if (saved) {
        setFormData((prev) => ({ ...prev, ...saved }));
      }
      showNotification("Configuración del sistema actualizada correctamente en InsForge.");
    } catch (err) {
      console.error("Error al guardar configuración:", err);
      setError(err.message || "No se pudo guardar la configuración.");
      showNotification(`Error: ${err.message}`);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      {error && (
        <p role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-700 font-medium">
          {error}
        </p>
      )}

      {/* BANNER PRINCIPAL */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Panel de Configuración y Control Global</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Ajustes y Parámetros del Sistema
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Administra los datos corporativos de la institución, ciclos académicos vigentes y reglas de auditoría docente.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={handleSave}
                disabled={saving || loading}
                className="inline-flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{saving ? "Guardando..." : "Guardar Ajustes"}</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* TABS DE SECCIONES */}
      <div className="flex items-center space-x-1 border-b border-slate-200 dark:border-white/10 overflow-x-auto pb-1 text-xs">
        <button
          type="button"
          onClick={() => setActiveTab("institucion")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "institucion"
              ? "border-[#1E3A8A] text-[#1E3A8A] dark:text-blue-400 dark:border-blue-400 bg-white/60 dark:bg-white/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Building className="w-4 h-4" />
          <span>Datos de la Institución</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("ciclo")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "ciclo"
              ? "border-[#1E3A8A] text-[#1E3A8A] dark:text-blue-400 dark:border-blue-400 bg-white/60 dark:bg-white/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <Calendar className="w-4 h-4" />
          <span>Periodo y Ciclo Académico</span>
        </button>

        <button
          type="button"
          onClick={() => setActiveTab("auditoria")}
          className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-xl font-bold transition-all border-b-2 cursor-pointer ${
            activeTab === "auditoria"
              ? "border-[#1E3A8A] text-[#1E3A8A] dark:text-blue-400 dark:border-blue-400 bg-white/60 dark:bg-white/5"
              : "border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-300"
          }`}
        >
          <DollarSign className="w-4 h-4" />
          <span>Nómina y Parámetros de Asistencia</span>
        </button>
      </div>

      {/* CONTENIDO DEL FORMULARIO SEGÚN LA PESTAÑA */}
      <form onSubmit={handleSave} className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs p-6 space-y-6">
        {activeTab === "institucion" && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <School className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                Identidad y Contacto Institucional
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Datos emitidos en comprobantes de pago, boletas y reportes oficiales.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Nombre o Razón Social *
                </label>
                <input
                  type="text"
                  name="institucion_nombre"
                  value={formData.institucion_nombre}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  RUC Institucional *
                </label>
                <input
                  type="text"
                  name="institucion_ruc"
                  value={formData.institucion_ruc}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Dirección de Sede Central *
                </label>
                <input
                  type="text"
                  name="institucion_direccion"
                  value={formData.institucion_direccion}
                  onChange={handleChange}
                  required
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Teléfono de Contacto / Mesa de Ayuda
                </label>
                <input
                  type="text"
                  name="institucion_telefono"
                  value={formData.institucion_telefono}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Correo Electrónico Institucional
                </label>
                <input
                  type="email"
                  name="institucion_correo"
                  value={formData.institucion_correo}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "ciclo" && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <Calendar className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                Periodo Académico Activo
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Define el ciclo que se asigna por defecto a los nuevos estudiantes y matrículas.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Denominación del Ciclo *
                </label>
                <input
                  type="text"
                  name="ciclo_vigente"
                  value={formData.ciclo_vigente}
                  onChange={handleChange}
                  required
                  placeholder="Semestral 2026-I"
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Estado del Ciclo *
                </label>
                <select
                  name="ciclo_estado"
                  value={formData.ciclo_estado}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                >
                  <option value="En Curso">En Curso (Clases Activas)</option>
                  <option value="En Matrícula">En Proceso de Matrícula</option>
                  <option value="Finalizado">Finalizado / En Cierre</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha de Inicio de Periodo
                </label>
                <input
                  type="date"
                  name="ciclo_inicio"
                  value={formData.ciclo_inicio}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Fecha de Fin de Periodo
                </label>
                <input
                  type="date"
                  name="ciclo_fin"
                  value={formData.ciclo_fin}
                  onChange={handleChange}
                  className="w-full px-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A]"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === "auditoria" && (
          <div className="space-y-4 animate-fade-in">
            <div className="border-b border-slate-100 dark:border-white/10 pb-3">
              <h3 className="text-base font-bold text-slate-800 dark:text-white flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                Tarifas y Reglas de Nómina Docente
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Parámetros utilizados por el módulo de Métricas y Reportes para el cálculo de sueldos y penalidades.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tarifa por Hora Lectiva (PEN) *
                </label>
                <div className="relative mt-2">
                  <span className="absolute left-3 top-2 text-xs font-bold text-slate-400">S/.</span>
                  <input
                    type="number"
                    step="0.5"
                    min="10"
                    name="tarifa_hora_docente"
                    value={formData.tarifa_hora_docente}
                    onChange={handleChange}
                    required
                    className="w-full pl-8 pr-3 py-2 text-sm font-bold border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Valor base por hora dictada en aula virtual.
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Tolerancia de Tardanza (Minutos) *
                </label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    min="0"
                    max="60"
                    name="tolerancia_tardanza_min"
                    value={formData.tolerancia_tardanza_min}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Minutos de gracia antes de penalidad en nómina.
                </span>
              </div>

              <div className="p-4 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/10">
                <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                  Descuento por Inasistencia (Horas) *
                </label>
                <div className="relative mt-2">
                  <input
                    type="number"
                    step="0.5"
                    min="1"
                    name="horas_descuento_inasistencia"
                    value={formData.horas_descuento_inasistencia}
                    onChange={handleChange}
                    required
                    className="w-full px-3 py-2 text-sm font-bold border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-900 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
                  />
                </div>
                <span className="text-[10px] text-slate-500 dark:text-slate-400 mt-1 block">
                  Horas descontadas por clase sin justificación.
                </span>
              </div>
            </div>
          </div>
        )}

        {/* FOOTER DEL FORMULARIO CON BOTÓN DE GUARDADO */}
        <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-white/10">
          <span className="text-xs text-slate-400 dark:text-slate-500">
            * Los cambios se aplican automáticamente en los módulos correspondientes.
          </span>
          <button
            type="submit"
            disabled={saving || loading}
            className="inline-flex items-center space-x-2 px-5 py-2.5 bg-[#1E3A8A] hover:bg-blue-800 text-white font-bold rounded-xl text-xs shadow-md transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? "Guardando..." : "Guardar Cambios"}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
