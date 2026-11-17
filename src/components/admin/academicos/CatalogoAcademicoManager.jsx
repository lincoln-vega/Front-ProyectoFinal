import React, { useState, useEffect } from "react";
import {
  Layers,
  GraduationCap,
  Calendar,
  CalendarDays,
  Clock,
  Plus,
  RefreshCw,
  Search,
  CheckCircle2,
  AlertCircle
} from "lucide-react";
import { academicosService } from "../../../services/academicosService";
import AreaFormModal from "./AreaFormModal";
import CarreraFormModal from "./CarreraFormModal";
import TipoCicloFormModal from "./TipoCicloFormModal";
import CicloFormModal from "./CicloFormModal";
import TurnoFormModal from "./TurnoFormModal";

export default function CatalogoAcademicoManager({ onNotify }) {
  const [subTab, setSubTab] = useState("areas"); // 'areas' | 'carreras' | 'tipos-ciclo' | 'ciclos' | 'turnos'
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");

  const [areas, setAreas] = useState([]);
  const [carreras, setCarreras] = useState([]);
  const [tiposCiclo, setTiposCiclo] = useState([]);
  const [ciclos, setCiclos] = useState([]);
  const [turnos, setTurnos] = useState([]);

  // Modals state
  const [openModal, setOpenModal] = useState(null); // 'area' | 'carrera' | 'tipo' | 'ciclo' | 'turno' | null

  const loadAll = async () => {
    try {
      setLoading(true);
      const [areasData, carrerasData, tiposData, ciclosData, turnosData] = await Promise.all([
        academicosService.getAreas(),
        academicosService.getCarreras(),
        academicosService.getTiposCiclo(),
        academicosService.getCiclos(),
        academicosService.getTurnos()
      ]);
      setAreas(areasData || []);
      setCarreras(carrerasData || []);
      setTiposCiclo(tiposData || []);
      setCiclos(ciclosData || []);
      setTurnos(turnosData || []);
    } catch (err) {
      console.error("[Catalogo] Error al sincronizar catálogo:", err);
      if (onNotify) onNotify(`Error al cargar catálogo: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAll();
  }, []);

  const handleCreateArea = async (newArea) => {
    const saved = await academicosService.createArea(newArea);
    setAreas((prev) => [saved, ...prev.filter((a) => a.id !== saved.id)]);
    if (onNotify) onNotify(`Área "${saved.nombre}" registrada correctamente.`);
  };

  const handleCreateCarrera = async (newCarrera) => {
    const saved = await academicosService.createCarrera(newCarrera);
    setCarreras((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
    if (onNotify) onNotify(`Carrera "${saved.nombre}" registrada correctamente.`);
  };

  const handleCreateTipoCiclo = async (newTipo) => {
    const saved = await academicosService.createTipoCiclo(newTipo);
    setTiposCiclo((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (onNotify) onNotify(`Tipo de ciclo "${saved.nombre}" registrado correctamente.`);
  };

  const handleCreateCiclo = async (newCiclo) => {
    const saved = await academicosService.createCiclo(newCiclo);
    setCiclos((prev) => [saved, ...prev.filter((c) => c.id !== saved.id)]);
    if (onNotify) onNotify(`Ciclo "${saved.nombre}" convocado correctamente.`);
  };

  const handleCreateTurno = async (newTurno) => {
    const saved = await academicosService.createTurno(newTurno);
    setTurnos((prev) => [saved, ...prev.filter((t) => t.id !== saved.id)]);
    if (onNotify) onNotify(`Turno "${saved.nombre}" configurado correctamente.`);
  };

  return (
    <div className="space-y-5">
      {/* Subtab selection & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-200 dark:border-white/10">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setSubTab("areas")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subTab === "areas"
                ? "bg-[#1E3A8A] text-white"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>Áreas Académicas ({areas.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("carreras")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subTab === "carreras"
                ? "bg-[#1E3A8A] text-white"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <GraduationCap className="w-3.5 h-3.5" />
            <span>Carreras ({carreras.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("tipos-ciclo")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subTab === "tipos-ciclo"
                ? "bg-[#1E3A8A] text-white"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Tipos de Ciclo ({tiposCiclo.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("ciclos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subTab === "ciclos"
                ? "bg-[#1E3A8A] text-white"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <CalendarDays className="w-3.5 h-3.5" />
            <span>Convocatorias Ciclos ({ciclos.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setSubTab("turnos")}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
              subTab === "turnos"
                ? "bg-[#1E3A8A] text-white"
                : "bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 hover:bg-slate-200"
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Turnos ({turnos.length})</span>
          </button>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={loadAll}
            disabled={loading}
            className="p-2 text-slate-500 hover:text-slate-700 bg-slate-100 dark:bg-white/5 rounded-lg text-xs cursor-pointer disabled:opacity-50"
            title="Refrescar catálogo desde Backend"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
          </button>

          {subTab === "areas" && (
            <button
              type="button"
              onClick={() => setOpenModal("area")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Área</span>
            </button>
          )}

          {subTab === "carreras" && (
            <button
              type="button"
              onClick={() => setOpenModal("carrera")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nueva Carrera</span>
            </button>
          )}

          {subTab === "tipos-ciclo" && (
            <button
              type="button"
              onClick={() => setOpenModal("tipo")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Tipo</span>
            </button>
          )}

          {subTab === "ciclos" && (
            <button
              type="button"
              onClick={() => setOpenModal("ciclo")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Convocatoria Ciclo</span>
            </button>
          )}

          {subTab === "turnos" && (
            <button
              type="button"
              onClick={() => setOpenModal("turno")}
              className="inline-flex items-center space-x-1.5 px-3 py-1.5 bg-[#1E3A8A] hover:bg-blue-800 text-white rounded-lg text-xs font-semibold cursor-pointer shadow-xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Nuevo Turno</span>
            </button>
          )}
        </div>
      </div>

      {/* Subtab Content */}
      {subTab === "areas" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {areas.map((area) => (
            <div
              key={area.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 space-y-2 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span
                  className="px-2 py-0.5 rounded text-[11px] font-bold text-white uppercase tracking-wider"
                  style={{ backgroundColor: area.color || "#2563EB" }}
                >
                  {area.codigo}
                </span>
                <span className="text-[11px] font-semibold text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  {area.estado || "Activo"}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {area.nombre}
              </h4>
              <p className="text-xs text-slate-500 line-clamp-2">
                {area.descripcion || "Sin descripción registrada."}
              </p>
              <div className="pt-2 text-[10px] text-slate-400 font-mono">
                ID: {area.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "carreras" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {carreras.map((car) => {
            const area = areas.find((a) => a.id === car.area_id);
            return (
              <div
                key={car.id}
                className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 space-y-2 hover:shadow-sm transition-all"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-mono font-bold text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-950/40 px-2 py-0.5 rounded">
                    {car.codigo}
                  </span>
                  <span className="text-[11px] text-slate-500 font-medium">
                    {car.duracion_anios} años
                  </span>
                </div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                  {car.nombre}
                </h4>
                <div className="text-xs text-slate-500 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full" style={{ backgroundColor: car.area_color || area?.color || "#6366F1" }} />
                  <span>{car.area_nombre || area?.nombre || car.area_id}</span>
                </div>
                {car.universidades_objetivo && car.universidades_objetivo.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-1">
                    {car.universidades_objetivo.map((u) => (
                      <span key={u} className="text-[10px] bg-slate-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-slate-600 dark:text-slate-300">
                        {u}
                      </span>
                    ))}
                  </div>
                )}
                <div className="pt-2 text-[10px] text-slate-400 font-mono flex justify-between">
                  <span>ID: {car.id}</span>
                  <span>{car.grado_academico}</span>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {subTab === "tipos-ciclo" && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tiposCiclo.map((tipo) => (
            <div
              key={tipo.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 space-y-2 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded">
                  {tipo.codigo}
                </span>
                <span className="text-xs font-semibold text-slate-600 dark:text-slate-400">
                  {tipo.modalidad || "Virtual"}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {tipo.nombre}
              </h4>
              <p className="text-xs text-slate-500">
                Duración: <strong>{tipo.duracion_semanas} semanas lectivas</strong>
              </p>
              <p className="text-xs text-slate-400 line-clamp-2">
                {tipo.descripcion || "Sin descripción."}
              </p>
              <div className="pt-2 text-[10px] text-slate-400 font-mono">
                ID: {tipo.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "ciclos" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ciclos.map((ciclo) => (
            <div
              key={ciclo.id}
              className={`p-4 rounded-xl border space-y-3 transition-all ${
                ciclo.es_vigente
                  ? "border-blue-500 bg-blue-50/30 dark:bg-blue-950/20"
                  : "border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5"
              }`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="font-mono text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded">
                    {ciclo.codigo}
                  </span>
                  {ciclo.es_vigente && (
                    <span className="text-[10px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
                      VIGENTE
                    </span>
                  )}
                </div>
                <span className="text-xs font-medium text-slate-500">
                  {ciclo.estado}
                </span>
              </div>

              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                {ciclo.nombre} (Periodo {ciclo.periodo} - {ciclo.anio})
              </h4>

              <div className="grid grid-cols-3 gap-2 text-xs bg-slate-50 dark:bg-white/5 p-2.5 rounded-lg text-center">
                <div>
                  <span className="block text-[10px] text-slate-400">Matrícula</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">S/ {ciclo.costo_matricula}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Pensión Mensual</span>
                  <span className="font-bold text-slate-700 dark:text-slate-200">S/ {ciclo.costo_pension_mensual}</span>
                </div>
                <div>
                  <span className="block text-[10px] text-slate-400">Total Contado</span>
                  <span className="font-bold text-emerald-600">S/ {ciclo.costo_total_contado}</span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 flex justify-between">
                <span>Vigencia: {ciclo.fecha_inicio} al {ciclo.fecha_fin}</span>
                <span className="font-mono text-[10px] text-slate-400">{ciclo.id}</span>
              </div>
            </div>
          ))}
        </div>
      )}

      {subTab === "turnos" && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {turnos.map((turno) => (
            <div
              key={turno.id}
              className="p-4 rounded-xl border border-slate-200 dark:border-white/10 bg-white/70 dark:bg-white/5 space-y-2 hover:shadow-sm transition-all"
            >
              <div className="flex items-center justify-between">
                <span className="font-mono text-xs font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded">
                  {turno.codigo}
                </span>
                <span className="text-xs text-emerald-600 font-semibold">
                  {turno.estado || "Activo"}
                </span>
              </div>
              <h4 className="text-sm font-bold text-slate-800 dark:text-white">
                Turno {turno.nombre}
              </h4>
              <div className="p-2.5 bg-slate-50 dark:bg-white/5 rounded-lg text-xs font-mono font-bold text-center text-slate-700 dark:text-slate-200">
                {turno.hora_inicio} — {turno.hora_fin} hrs
              </div>
              <div className="pt-1 text-[10px] text-slate-400 font-mono">
                ID: {turno.id}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Modals */}
      <AreaFormModal
        isOpen={openModal === "area"}
        onClose={() => setOpenModal(null)}
        onSave={handleCreateArea}
      />

      <CarreraFormModal
        isOpen={openModal === "carrera"}
        areas={areas}
        onClose={() => setOpenModal(null)}
        onSave={handleCreateCarrera}
      />

      <TipoCicloFormModal
        isOpen={openModal === "tipo"}
        onClose={() => setOpenModal(null)}
        onSave={handleCreateTipoCiclo}
      />

      <CicloFormModal
        isOpen={openModal === "ciclo"}
        tiposCiclo={tiposCiclo}
        onClose={() => setOpenModal(null)}
        onSave={handleCreateCiclo}
      />

      <TurnoFormModal
        isOpen={openModal === "turno"}
        onClose={() => setOpenModal(null)}
        onSave={handleCreateTurno}
      />
    </div>
  );
}
