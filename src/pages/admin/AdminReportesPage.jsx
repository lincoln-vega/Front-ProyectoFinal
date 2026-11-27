// Centro Institucional de Reportes Paramétricos 360° (Estilo JasperReports Studio + Monitor en Vivo)
import React, { useCallback, useEffect, useMemo, useState } from "react";
import {
  FileText,
  FileSpreadsheet,
  Search,
  Users,
  Video,
  AlertTriangle,
  DollarSign,
  Award,
  ClipboardCheck,
  GraduationCap,
  Briefcase,
  RefreshCw,
  Eye,
  Filter,
  Loader2
} from "lucide-react";
import { userService, courseService, academicosService } from "../../services/api";
import { reportesService } from "../../services/reportesService";
import { clasesVivoService } from "../../services/clasesVivoService";
import { exportToCSV } from "../../utils/exportUtils";
import Notification from "../../components/admin/Notification";
import ReportViewerModal from "../../components/shared/ReportViewerModal";

const REPORT_CATALOG = [
  {
    id: "notas",
    label: "Récord de Notas y Evaluaciones",
    shortDesc: "Consolidado vigesimal (0-20), entregas y tasa de aprobación por ciclo y curso.",
    icon: Award,
    endpoint: "/reportes/notas",
    csvName: "acta_consolidada_notas_evaluaciones"
  },
  {
    id: "kardex",
    label: "Kardex Individual de Alumno",
    shortDesc: "Ficha integral por estudiante: cursos, promedio, notas detalladas y % de asistencia.",
    icon: GraduationCap,
    endpoint: "/reportes/kardex-alumno",
    csvName: "kardex_individual_estudiante"
  },
  {
    id: "asistencia",
    label: "Acta de Asistencia Estudiantil",
    shortDesc: "Sesiones dictadas en Meet, asistencias, tardanzas, faltas y minutos de permanencia.",
    icon: ClipboardCheck,
    endpoint: "/reportes/asistencia",
    csvName: "acta_asistencia_estudiantil"
  },
  {
    id: "docentes",
    label: "Récord y Planilla Docente",
    shortDesc: "Sesiones reales Meet, tardanzas, justificantes y liquidación neta según configuración.",
    icon: Briefcase,
    endpoint: "/reportes/docentes",
    csvName: "liquidacion_y_record_docente"
  },
  {
    id: "matriculas",
    label: "Matrículas y Estado Financiero",
    shortDesc: "Padrón de matriculados, facturación, cobros acreditados y cartera por cobrar.",
    icon: DollarSign,
    endpoint: "/reportes/matriculas",
    csvName: "padron_matriculas_recaudacion"
  }
];

export default function AdminReportesPage() {
  const [selectedReportType, setSelectedReportType] = useState("notas");
  const [selectedCicloId, setSelectedCicloId] = useState("");
  const [selectedCursoId, setSelectedCursoId] = useState("");
  const [selectedEstudianteId, setSelectedEstudianteId] = useState("");
  const [selectedDocenteId, setSelectedDocenteId] = useState("");
  const [selectedEstadoPago, setSelectedEstadoPago] = useState("TODOS");
  const [tableSearch, setTableSearch] = useState("");

  // Catálogos para filtros paramétricos
  const [ciclos, setCiclos] = useState([]);
  const [courses, setCourses] = useState([]);
  const [students, setStudents] = useState([]);
  const [teachers, setTeachers] = useState([]);
  const [execSummary, setExecSummary] = useState(null);

  // Datos previsualizados del reporte activo
  const [reportData, setReportData] = useState(null);
  const [loadingReport, setLoadingReport] = useState(true);
  const [error, setError] = useState("");
  const [notification, setNotification] = useState(null);
  const [isPdfViewerOpen, setIsPdfViewerOpen] = useState(false);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  // 1. Cargar catálogos y resumen ejecutivo en vivo
  const loadExecutiveAndCatalogs = useCallback(async () => {
    try {
      const [execRes, allUsers, allCourses, allCiclos] = await Promise.all([
        reportesService.getResumenEjecutivo(selectedCicloId || null).catch(() => null),
        userService.getUsers().catch(() => []),
        courseService.getCourses().catch(() => []),
        academicosService.getCiclos().catch(() => [])
      ]);

      if (execRes) setExecSummary(execRes);
      const safeCiclos = Array.isArray(allCiclos) && allCiclos.length > 0 ? allCiclos : execRes?.ciclos || [];
      setCiclos(safeCiclos);
      setCourses(allCourses || []);

      const estList = (allUsers || []).filter((u) => String(u.rol || "").toLowerCase() === "estudiante");
      const docList = (allUsers || []).filter((u) =>
        ["docente", "profesor", "profesora"].includes(String(u.rol || "").toLowerCase())
      );
      setStudents(estList);
      setTeachers(docList);

      if (!selectedEstudianteId && estList.length > 0) {
        const esteban = estList.find((s) => String(s.correo || "").toLowerCase() === "esteban@gmail.com");
        setSelectedEstudianteId((esteban || estList[0]).id);
      }
    } catch {}
  }, [selectedCicloId, selectedEstudianteId]);

  useEffect(() => {
    loadExecutiveAndCatalogs();
    const unsub = clasesVivoService.subscribeLiveChanges(() => {
      reportesService.getResumenEjecutivo(selectedCicloId || null).then(setExecSummary).catch(() => {});
    });
    return unsub;
  }, [loadExecutiveAndCatalogs, selectedCicloId]);

  // Resolver endpoint y parámetros activos según plantilla elegida
  const activeReportMeta = useMemo(
    () => REPORT_CATALOG.find((r) => r.id === selectedReportType) || REPORT_CATALOG[0],
    [selectedReportType]
  );

  const activeEndpointAndParams = useMemo(() => {
    if (selectedReportType === "kardex") {
      if (!selectedEstudianteId) return { endpoint: null, params: {} };
      return {
        endpoint: `/reportes/kardex-alumno/${encodeURIComponent(selectedEstudianteId)}`,
        params: { ciclo_id: selectedCicloId || undefined }
      };
    }
    if (selectedReportType === "notas" || selectedReportType === "asistencia") {
      return {
        endpoint: activeReportMeta.endpoint,
        params: {
          ciclo_id: selectedCicloId || undefined,
          curso_id: selectedCursoId || undefined
        }
      };
    }
    if (selectedReportType === "docentes") {
      return {
        endpoint: "/reportes/docentes",
        params: {
          ciclo_id: selectedCicloId || undefined,
          docente_id: selectedDocenteId || undefined
        }
      };
    }
    return {
      endpoint: "/reportes/matriculas",
      params: {
        ciclo_id: selectedCicloId || undefined,
        estado_pago: selectedEstadoPago !== "TODOS" ? selectedEstadoPago : undefined
      }
    };
  }, [
    selectedReportType,
    selectedCicloId,
    selectedCursoId,
    selectedEstudianteId,
    selectedDocenteId,
    selectedEstadoPago,
    activeReportMeta
  ]);

  // 2. Cargar vista previa JSON del reporte activo
  const loadActiveReportPreview = useCallback(async () => {
    if (!activeEndpointAndParams.endpoint) {
      setLoadingReport(false);
      return;
    }
    setLoadingReport(true);
    setError("");
    try {
      const data = await reportesService.fetchReportData(
        activeEndpointAndParams.endpoint,
        activeEndpointAndParams.params
      );
      setReportData(data);
    } catch (err) {
      setError(err.message || "No se pudo consultar el reporte en el servidor.");
    } finally {
      setLoadingReport(false);
    }
  }, [activeEndpointAndParams]);

  useEffect(() => {
    loadActiveReportPreview();
  }, [loadActiveReportPreview]);

  const filteredCoursesByCycle = useMemo(() => {
    if (!selectedCicloId) return courses;
    return courses.filter(
      (c) => String(c.cicloId || c.ciclo_id || "") === String(selectedCicloId)
    );
  }, [courses, selectedCicloId]);

  const filteredRows = useMemo(() => {
    const rows = reportData?.filas || [];
    if (!tableSearch.trim()) return rows;
    const q = tableSearch.toLowerCase().trim();
    return rows.filter((r) =>
      Object.values(r).some((val) => String(val ?? "").toLowerCase().includes(q))
    );
  }, [reportData, tableSearch]);

  const handleExportCurrentCsv = () => {
    if (!filteredRows.length) {
      showNotification("No hay filas en la vista actual para exportar.");
      return;
    }
    const ok = exportToCSV(filteredRows, activeReportMeta.csvName, reportData?.columnas || []);
    if (ok) {
      showNotification(`Reporte "${activeReportMeta.label}" exportado a Excel (.csv).`);
    }
  };

  const execKpis = execSummary?.kpis || {};

  return (
    <div className="space-y-6 pb-8">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      {/* 1. MONITOR EJECUTIVO INSTITUCIONAL EN TIEMPO REAL */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Aulas En Vivo Ahora
            </span>
            <Video
              className={`w-4 h-4 ${
                (execKpis.clasesEnVivoCount || 0) > 0 ? "text-rose-500 animate-pulse" : "text-slate-400"
              }`}
            />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {execKpis.clasesEnVivoCount ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">sesiones Meet activas</span>
          </div>
          {execSummary?.clasesEnVivo?.length > 0 ? (
            <p className="text-[11px] font-bold text-rose-600 dark:text-rose-400 mt-1 truncate">
              🔴 {execSummary.clasesEnVivo.map((c) => c.asignatura).join(", ")}
            </p>
          ) : (
            <p className="text-[11px] text-slate-400 mt-1">Sin sesiones abiertas en este instante</p>
          )}
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Comunidad Activa
            </span>
            <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {execKpis.estudiantesActivos ?? students.length}
            </span>
            <span className="text-xs font-semibold text-slate-500">
              alumnos • {execKpis.docentesActivos ?? teachers.length} docentes
            </span>
          </div>
          <p className="text-[11px] text-blue-600 dark:text-blue-400 font-semibold mt-1 truncate">
            Vigente: {execSummary?.cicloVigente || "Semestral San Marcos 2026-II"}
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Recaudación Acumulada
            </span>
            <DollarSign className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-600 dark:text-emerald-400">
              S/ {Number(execKpis.recaudacionTotal || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
            </span>
          </div>
          <p className="text-[11px] text-amber-600 dark:text-amber-400 font-semibold mt-1">
            Por cobrar: S/ {Number(execKpis.saldoPendienteTotal || 0).toLocaleString("es-PE", { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-white dark:bg-white/5 rounded-2xl p-4 border border-slate-200 dark:border-white/10 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400">
              Auditoría Docente
            </span>
            <AlertTriangle className="w-4 h-4 text-amber-500" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-slate-900 dark:text-white">
              {execKpis.incidenciasPendientesCount ?? 0}
            </span>
            <span className="text-xs font-semibold text-slate-500">incidencias por revisar</span>
          </div>
          <p className="text-[11px] text-slate-400 mt-1">
            Tardanzas, inasistencias y permutas
          </p>
        </div>
      </div>

      {/* 2. GENERADOR PARAMÉTRICO DE REPORTES OFICIALES (ESTILO JASPER STUDIO) */}
      <div className="bg-white dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs p-5 sm:p-6 space-y-5">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 border-b border-slate-100 dark:border-white/10 pb-4">
          <div>
            <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 text-[11px] font-extrabold uppercase tracking-wider border border-indigo-200 dark:border-indigo-800">
              <FileText className="w-3.5 h-3.5" />
              Centro Institucional de Reportes Oficiales (PDF / Excel)
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white mt-1.5">
              Emisión de Actas, Kardex Académico, Asistencias y Planillas
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Selecciona el tipo de documento y sus parámetros para previsualizar en tiempo real, abrir el PDF oficial membretado o descargar en Excel.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadActiveReportPreview}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-white/10 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/10 cursor-pointer"
              title="Refrescar datos desde Supabase"
            >
              <RefreshCw className={`w-4 h-4 ${loadingReport ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleExportCurrentCsv}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Exportar Excel (.csv)</span>
            </button>

            <button
              type="button"
              disabled={!activeEndpointAndParams.endpoint}
              onClick={() => setIsPdfViewerOpen(true)}
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#1E3A8A] hover:bg-blue-800 text-white text-xs font-extrabold shadow-md transition-all cursor-pointer disabled:opacity-50"
            >
              <Eye className="w-4 h-4 text-amber-300" />
              <span>Emitir Documento PDF Oficial</span>
            </button>
          </div>
        </div>

        {/* Selector visual de las 5 plantillas de reporte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2.5">
          {REPORT_CATALOG.map((rep) => {
            const Icon = rep.icon;
            const active = selectedReportType === rep.id;
            return (
              <button
                key={rep.id}
                type="button"
                onClick={() => {
                  setSelectedReportType(rep.id);
                  setTableSearch("");
                }}
                className={`text-left p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2 ${
                  active
                    ? "bg-[#1E3A8A] text-white border-[#1E3A8A] shadow-md"
                    : "bg-slate-50/80 dark:bg-white/[0.03] text-slate-700 dark:text-slate-200 border-slate-200 dark:border-white/10 hover:border-blue-400"
                }`}
              >
                <div className="flex items-center justify-between">
                  <Icon className={`w-4 h-4 ${active ? "text-amber-300" : "text-blue-600 dark:text-blue-400"}`} />
                  {active && (
                    <span className="text-[9px] font-black uppercase px-1.5 py-0.5 rounded bg-white/15 text-amber-200">
                      Activo
                    </span>
                  )}
                </div>
                <div>
                  <p className="text-xs font-extrabold leading-snug">{rep.label}</p>
                  <p className={`text-[10px] mt-1 line-clamp-2 ${active ? "text-blue-100" : "text-slate-500 dark:text-slate-400"}`}>
                    {rep.shortDesc}
                  </p>
                </div>
              </button>
            );
          })}
        </div>

        {/* Barra de Parámetros Dinámicos del Reporte */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 p-4 rounded-2xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/80 dark:border-white/10 text-xs">
          <div>
            <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1 flex items-center gap-1">
              <Filter className="w-3 h-3 text-blue-600" />
              <span>Periodo / Ciclo Académico:</span>
            </label>
            <select
              value={selectedCicloId}
              onChange={(e) => {
                setSelectedCicloId(e.target.value);
                setSelectedCursoId("");
              }}
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
            >
              <option value="">Todos los Ciclos (Consolidado)</option>
              {ciclos.map((ci) => (
                <option key={ci.id} value={ci.id}>
                  {ci.nombre} ({ci.estado})
                </option>
              ))}
            </select>
          </div>

          {(selectedReportType === "notas" || selectedReportType === "asistencia") && (
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Asignatura / Curso:
              </label>
              <select
                value={selectedCursoId}
                onChange={(e) => setSelectedCursoId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
              >
                <option value="">Todas las Asignaturas ({filteredCoursesByCycle.length})</option>
                {filteredCoursesByCycle.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.asignatura} — {c.docente}
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === "kardex" && (
            <div className="sm:col-span-2">
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Seleccionar Estudiante (Kardex Individual):
              </label>
              <select
                value={selectedEstudianteId}
                onChange={(e) => setSelectedEstudianteId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
              >
                {students.map((st) => (
                  <option key={st.id} value={st.id}>
                    {st.apellidos}, {st.nombres} — DNI: {st.dni || "S/D"} ({st.correo})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === "docentes" && (
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Docente Auditado:
              </label>
              <select
                value={selectedDocenteId}
                onChange={(e) => setSelectedDocenteId(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
              >
                <option value="">Plana Docente Completa ({teachers.length})</option>
                {teachers.map((doc) => (
                  <option key={doc.id} value={doc.id}>
                    {doc.apellidos}, {doc.nombres} (DNI: {doc.dni || "S/D"})
                  </option>
                ))}
              </select>
            </div>
          )}

          {selectedReportType === "matriculas" && (
            <div>
              <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
                Estado Financiero:
              </label>
              <select
                value={selectedEstadoPago}
                onChange={(e) => setSelectedEstadoPago(e.target.value)}
                className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white font-semibold"
              >
                <option value="TODOS">Todas las Matrículas</option>
                <option value="CON_DEUDA">Con Saldo Pendiente (&gt; S/ 0)</option>
                <option value="Al día">Al día</option>
                <option value="Pagado Total">Pagado Total</option>
                <option value="Pendiente">Pendiente</option>
              </select>
            </div>
          )}

          <div className="lg:col-start-4">
            <label className="font-bold text-slate-600 dark:text-slate-300 block mb-1">
              Filtrar filas en tabla:
            </label>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={tableSearch}
                onChange={(e) => setTableSearch(e.target.value)}
                placeholder="Buscar nombre, DNI, curso..."
                className="w-full pl-8 pr-3 py-2.5 rounded-xl border border-slate-300 dark:border-white/15 bg-white dark:bg-slate-900 text-slate-800 dark:text-white"
              />
            </div>
          </div>
        </div>

        {error && (
          <div role="alert" className="p-3.5 rounded-xl border border-rose-300 bg-rose-50 text-xs font-bold text-rose-700">
            {error}
          </div>
        )}

        {/* 3. VISTA PREVIA EN VIVO DEL REPORTE SELECCIONADO */}
        {loadingReport ? (
          <div className="py-16 flex flex-col items-center justify-center text-slate-500 space-y-2">
            <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
            <p className="text-xs font-bold">Generando consolidado en tiempo real desde PostgreSQL...</p>
          </div>
        ) : reportData ? (
          <div className="space-y-4">
            {/* KPIs propios del reporte activo */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
              {(reportData.kpis || []).map((kpi, idx) => (
                <div
                  key={idx}
                  className="p-3.5 rounded-xl bg-blue-50/60 dark:bg-blue-950/25 border border-blue-200/70 dark:border-blue-800/40"
                >
                  <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 block">
                    {kpi.label}
                  </span>
                  <span className="text-lg font-black text-slate-900 dark:text-white mt-0.5 block">
                    {kpi.value}
                  </span>
                </div>
              ))}
            </div>

            {/* Tabla principal del reporte */}
            <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
              <div className="px-4 py-2.5 bg-slate-100 dark:bg-white/5 border-b border-slate-200 dark:border-white/10 flex flex-wrap items-center justify-between gap-2 text-xs">
                <span className="font-extrabold text-slate-800 dark:text-slate-200">
                  {reportData.titulo}
                </span>
                <span className="font-mono text-[11px] text-slate-500">
                  Código: {reportData.reportCode} • {filteredRows.length} registro(s)
                </span>
              </div>

              <div className="overflow-x-auto max-h-[460px]">
                <table className="w-full text-left border-collapse text-xs">
                  <thead className="sticky top-0 z-10">
                    <tr className="bg-[#0F172A] text-white uppercase text-[11px] font-bold">
                      {(reportData.columnas || []).map((col) => (
                        <th key={col.key} className="py-3 px-3.5 whitespace-nowrap">
                          {col.label}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                    {filteredRows.length === 0 ? (
                      <tr>
                        <td
                          colSpan={(reportData.columnas || []).length || 1}
                          className="py-10 text-center text-slate-400"
                        >
                          No existen registros para los parámetros seleccionados.
                        </td>
                      </tr>
                    ) : (
                      filteredRows.map((row, rIdx) => (
                        <tr
                          key={rIdx}
                          className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors"
                        >
                          {(reportData.columnas || []).map((col) => (
                            <td
                              key={col.key}
                              className="py-2.5 px-3.5 text-slate-700 dark:text-slate-200 whitespace-nowrap"
                            >
                              {row[col.key]}
                            </td>
                          ))}
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tabla secundaria (ej. Historial detallado de Evaluaciones en Kardex de Alumno) */}
            {reportData.extraSection?.columnas && (
              <div className="rounded-xl border border-slate-200 dark:border-white/10 overflow-hidden">
                <div className="px-4 py-2.5 bg-indigo-50/70 dark:bg-indigo-950/30 border-b border-slate-200 dark:border-white/10 text-xs font-extrabold text-indigo-900 dark:text-indigo-200">
                  {reportData.extraSection.titulo}
                </div>
                <div className="overflow-x-auto max-h-[320px]">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="bg-slate-800 text-white uppercase text-[11px] font-bold">
                        {reportData.extraSection.columnas.map((col) => (
                          <th key={col.key} className="py-2.5 px-3.5 whitespace-nowrap">
                            {col.label}
                          </th>
                        ))}
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                      {(reportData.extraSection.filas || []).length === 0 ? (
                        <tr>
                          <td
                            colSpan={reportData.extraSection.columnas.length}
                            className="py-6 text-center text-slate-400"
                          >
                            El estudiante aún no registra evaluaciones calificadas en este filtro.
                          </td>
                        </tr>
                      ) : (
                        reportData.extraSection.filas.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50 dark:hover:bg-white/5">
                            {reportData.extraSection.columnas.map((col) => (
                              <td key={col.key} className="py-2.5 px-3.5 text-slate-700 dark:text-slate-200">
                                {row[col.key]}
                              </td>
                            ))}
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        ) : null}
      </div>

      {/* VISOR INTERACTIVO PDF ESTILO JASPERVIEWER */}
      <ReportViewerModal
        isOpen={isPdfViewerOpen}
        onClose={() => setIsPdfViewerOpen(false)}
        title={reportData?.titulo || activeReportMeta.label}
        subtitle={reportData?.subtitulo || activeReportMeta.shortDesc}
        endpointPath={activeEndpointAndParams.endpoint}
        params={activeEndpointAndParams.params}
        csvFilename={activeReportMeta.csvName}
      />
    </div>
  );
}
