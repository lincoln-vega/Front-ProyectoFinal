import React, { useState, useEffect } from "react";
import { X, Calculator, DollarSign, Calendar, User, FileText, CheckCircle2, AlertCircle } from "lucide-react";
import { incidentService, userService } from "../../services/api";
import SearchableSelect from "../shared/SearchableSelect";

export default function NominaCruceModal({ isOpen, onClose }) {
  const currentMonth = new Date().toISOString().slice(0, 7); // e.g. "2026-11"
  const [teachers, setTeachers] = useState([]);
  const [formData, setFormData] = useState({
    periodo: currentMonth,
    tarifaHoraDefault: 50,
    docenteId: ""
  });
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    let cancelled = false;
    async function loadTeachers() {
      try {
        const users = await userService.getUsers();
        if (!cancelled) {
          const list = (users || []).filter(u => {
            const r = String(u.rol || "").toLowerCase();
            return r === "docente" || r === "profesor" || r === "profesora";
          });
          setTeachers(list);
        }
      } catch (err) {
        console.warn("Error al cargar docentes para nómina:", err);
      }
    }
    if (isOpen) {
      loadTeachers();
    }
    return () => { cancelled = true; };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: name === "tarifaHoraDefault" ? Number(value) : value
    }));
  };

  const handleCalculate = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    setResult(null);

    try {
      const data = await incidentService.calcularCruceNomina({
        periodo: formData.periodo,
        tarifaHoraDefault: formData.tarifaHoraDefault,
        docenteId: formData.docenteId || null
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Error al calcular el cruce de nómina.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-xl overflow-hidden animate-scale-up my-6">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-lg bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <Calculator className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">Cruce de Nómina y Liquidación Docente</h3>
              <p className="text-xs text-slate-500">Endpoint: POST /incidencias/nomina/cruce (ParametrosNomina)</p>
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
        <form onSubmit={handleCalculate} className="p-6 space-y-4">
          {error && (
            <div className="p-3 text-xs bg-rose-50 text-rose-700 border border-rose-200 rounded-lg">
              {error}
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Periodo (YYYY-MM) *
              </label>
              <input
                type="month"
                name="periodo"
                value={formData.periodo}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Tarifa / Hora Base (S/) *
              </label>
              <input
                type="number"
                name="tarifaHoraDefault"
                min="10"
                step="5"
                value={formData.tarifaHoraDefault}
                onChange={handleChange}
                required
                className="w-full px-3 py-2 border border-slate-200 dark:border-white/10 rounded-lg text-xs bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white focus:outline-hidden focus:border-emerald-500"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">
                Filtrar por Docente
              </label>
              <SearchableSelect
                value={formData.docenteId}
                onChange={(val) =>
                  setFormData((prev) => ({ ...prev, docenteId: val }))
                }
                emptyOptionLabel="Todos los docentes"
                options={teachers.map((t) => ({
                  value: t.id,
                  label: `${t.nombres} ${t.apellidos}`,
                  sublabel: `DNI: ${t.dni || "S/D"} • ${t.correo}`,
                  searchText: `${t.dni || ""} ${t.correo || ""}`
                }))}
              />
            </div>
          </div>

          <div className="flex justify-end pt-1">
            <button
              type="submit"
              disabled={loading}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
            >
              <Calculator className="w-3.5 h-3.5" />
              <span>{loading ? "Calculando cruce..." : "Ejecutar Cruce de Nómina"}</span>
            </button>
          </div>
        </form>

        {/* Resultados del cruce */}
        {result && (
          <div className="px-6 pb-6 pt-2 border-t border-slate-100 dark:border-white/10 space-y-4 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Resultado de Liquidación — Periodo {result.periodo || formData.periodo}
              </span>
              <span className="text-[11px] font-mono text-slate-500">
                Tarifa: S/ {result.tarifaHoraDefault || formData.tarifaHoraDefault}/h
              </span>
            </div>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
              <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-100 dark:border-white/5">
                <span className="block text-[10px] text-slate-500">Horas Programadas</span>
                <span className="text-sm font-bold text-slate-800 dark:text-white">
                  {result.totalHorasProgramadas ?? 160} hrs
                </span>
              </div>
              <div className="p-3 bg-rose-50/60 dark:bg-rose-950/20 rounded-xl border border-rose-100 dark:border-rose-900/40">
                <span className="block text-[10px] text-rose-600">Horas Inasistencia</span>
                <span className="text-sm font-bold text-rose-700 dark:text-rose-400">
                  -{result.horasDescuentoInasistencias ?? 0} hrs
                </span>
              </div>
              <div className="p-3 bg-blue-50/60 dark:bg-blue-950/20 rounded-xl border border-blue-100 dark:border-blue-900/40">
                <span className="block text-[10px] text-blue-600">Horas Reemplazo</span>
                <span className="text-sm font-bold text-blue-700 dark:text-blue-400">
                  +{result.horasReemplazoCubiertas ?? 0} hrs
                </span>
              </div>
              <div className="p-3 bg-emerald-50/60 dark:bg-emerald-950/20 rounded-xl border border-emerald-100 dark:border-emerald-900/40">
                <span className="block text-[10px] text-emerald-600 font-bold">Neto a Pagar</span>
                <span className="text-sm font-extrabold text-emerald-700 dark:text-emerald-400">
                  S/ {result.remuneracionNeta?.toFixed(2) || "0.00"}
                </span>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-white/5 rounded-xl text-xs space-y-1 text-slate-600 dark:text-slate-300">
              <div className="flex justify-between">
                <span>Remuneración Bruta Estimada:</span>
                <span className="font-semibold">S/ {(result.remuneracionBruta || (160 * formData.tarifaHoraDefault)).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-rose-600">
                <span>Deducciones por inasistencia / tardanza:</span>
                <span className="font-semibold">-S/ {(result.descuentoTotal || 0).toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-blue-600">
                <span>Bonificación por horas de reemplazo:</span>
                <span className="font-semibold">+S/ {(result.bonoReemplazo || 0).toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
