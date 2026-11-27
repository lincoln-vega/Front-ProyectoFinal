// Panel Ejecutivo de Inicio del Administrador (/admin/inicio):
// Estadísticas reales, barras porcentuales desde PostgreSQL y malla Bento de acceso a los 8 módulos.
import React, { useCallback, useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  BookOpen,
  Calendar,
  Briefcase,
  ClipboardCheck,
  CreditCard,
  BarChart3,
  Settings,
  Video,
  TrendingUp,
  Award,
  AlertTriangle,
  ArrowUpRight,
  RefreshCw,
  Building2,
  Layers,
  GraduationCap,
  CheckCircle2
} from "lucide-react";
import { reportesService } from "../../services/reportesService";
import { clasesVivoService } from "../../services/clasesVivoService";
import SearchableSelect from "../../components/shared/SearchableSelect";

export default function AdminDashboardPage() {
  const [selectedCicloId, setSelectedCicloId] = useState("");
  const [summary, setSummary] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const userName = localStorage.getItem("userName") || "Dirección Académica";

  const loadSummary = useCallback(
    async (silent = false) => {
      if (!silent) setLoading(true);
      setError("");
      try {
        const data = await reportesService.getResumenEjecutivo(selectedCicloId || null);
        setSummary(data);
      } catch (err) {
        setError(err.message || "No se pudo sincronizar el resumen ejecutivo desde Supabase.");
      } finally {
        if (!silent) setLoading(false);
      }
    },
    [selectedCicloId]
  );

  useEffect(() => {
    loadSummary(false);
    const timer = setInterval(() => {
      if (!document.hidden) loadSummary(true);
    }, 30000);
    const unsub = clasesVivoService.subscribeLiveChanges(() => {
      loadSummary(true);
    });
    return () => {
      clearInterval(timer);
      unsub();
    };
  }, [loadSummary]);

  const kpis = summary?.kpis || {};
  const pcts = summary?.indicadoresPorcentuales || {};
  const ciclos = summary?.ciclos || [];
  const distCiclos = summary?.distribucionCiclos || [];
  const distAreas = summary?.distribucionAreas || [];
  const clasesVivo = summary?.clasesEnVivo || [];
  const inst = summary?.institucion || {};

  // Configuración viva de la Galería / Malla de 8 Módulos Corporativos
  const moduleCards = [
    {
      title: "Gestión de Usuarios",
      desc: "Cuentas institucionales, control de perfiles, roles y accesos.",
      path: "/admin/usuarios",
      icon: Users,
      accentBg: "from-blue-600 to-indigo-700",
      badgeText: `${kpis.usuariosTotales ?? 0} registrados • ${kpis.estudiantesActivos ?? 0} alumnos`,
      badgeTone: "bg-blue-50 dark:bg-blue-950/50 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800"
    },
    {
      title: "Cursos y Materias",
      desc: "Asignaturas por ciclo, cátedra asignada y salas Google Meet.",
      path: "/admin/cursos",
      icon: BookOpen,
      accentBg: "from-indigo-600 to-violet-700",
      badgeText: `${kpis.cursosActivos ?? 0} activos de ${kpis.cursosTotales ?? 0} cursos`,
      badgeTone: "bg-indigo-50 dark:bg-indigo-950/50 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800"
    },
    {
      title: "Horarios y Salones",
      desc: "Parrilla horaria semanal sin cruces, turnos y aulas virtuales.",
      path: "/admin/horarios",
      icon: Calendar,
      accentBg: "from-sky-600 to-blue-700",
      badgeText:
        (kpis.clasesEnVivoCount || 0) > 0
          ? `🔴 ${kpis.clasesEnVivoCount} aula(s) en vivo ahora`
          : `${kpis.sesionesCerradasCount ?? 0} sesiones dictadas`,
      badgeTone:
        (kpis.clasesEnVivoCount || 0) > 0
          ? "bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800"
          : "bg-sky-50 dark:bg-sky-950/50 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800"
    },
    {
      title: "Docentes y Nóminas",
      desc: "Plana docente por especialidad, tarifa horaria y liquidaciones.",
      path: "/admin/docentes",
      icon: Briefcase,
      accentBg: "from-teal-600 to-emerald-700",
      badgeText: `${kpis.docentesActivos ?? 0} docentes • Base S/ ${Number(inst.tarifaHoraDocente || 50).toFixed(0)}/h`,
      badgeTone: "bg-teal-50 dark:bg-teal-950/50 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800"
    },
    {
      title: "Control de Asistencias",
      desc: "Justificantes PDF, permutas, reemplazos y auditoría de horas.",
      path: "/admin/incidentes",
      icon: ClipboardCheck,
      accentBg: "from-amber-500 to-orange-600",
      badgeText:
        (kpis.incidenciasPendientesCount || 0) > 0
          ? `⚠️ ${kpis.incidenciasPendientesCount} ${
              kpis.incidenciasPendientesCount === 1 ? "caso por resolver" : "casos por resolver"
            }`
          : "✓ Auditoría al día",
      badgeTone:
        (kpis.incidenciasPendientesCount || 0) > 0
          ? "bg-amber-50 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300 border-amber-300 dark:border-amber-800"
          : "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    {
      title: "Matrículas y Pagos",
      desc: "Inscripción por ciclo, cobro de pensiones y saldos pendientes.",
      path: "/admin/matriculas",
      icon: CreditCard,
      accentBg: "from-emerald-600 to-green-700",
      badgeText: `${kpis.matriculasCount ?? 0} matrículas • ${kpis.cuentasConSaldoCount ?? 0} con saldo`,
      badgeTone: "bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800"
    },
    {
      title: "Métricas y Reportes PDF",
      desc: "Emisión oficial de Actas, Kardex, Asistencia y Planilla en PDF.",
      path: "/admin/reportes",
      icon: BarChart3,
      accentBg: "from-purple-600 to-indigo-800",
      badgeText: "5 reportes oficiales PDF + Excel",
      badgeTone: "bg-purple-50 dark:bg-purple-950/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800"
    },
    {
      title: "Configuración Global",
      desc: "Datos fiscales (RUC), ciclos vigentes, carreras y tolerancias.",
      path: "/admin/configuracion",
      icon: Settings,
      accentBg: "from-slate-700 to-slate-900",
      badgeText: summary?.cicloVigente || "Parámetros institucionales",
      badgeTone: "bg-slate-100 dark:bg-white/10 text-slate-700 dark:text-slate-300 border-slate-300 dark:border-white/15"
    }
  ];

  const entregasTotales = Number(kpis.entregasTotalesCount ?? 0);
  const entregasPendientes = Number(kpis.entregasPorCalificarCount ?? 0);
  const sesionesCerradas = Number(kpis.sesionesCerradasCount ?? 0);
  const incTotales = Number(kpis.incidenciasTotalesCount ?? 0);
  const incPendientes = Number(kpis.incidenciasPendientesCount ?? 0);
  const incResueltas = Math.max(0, incTotales - incPendientes);

  const progressIndicators = [
    {
      label: "Eficiencia de Recaudación de Pensiones",
      pct: Number(pcts.recaudacionPct ?? 100),
      detail: `S/ ${Number(kpis.recaudacionTotal || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2
      })} cobrados de S/ ${Number(kpis.facturadoTotal || 0).toLocaleString("es-PE", {
        minimumFractionDigits: 2
      })} facturados`,
      barClass: "from-emerald-500 to-teal-500",
      pillClass: "text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50"
    },
    {
      label: "Cumplimiento de Calificación de Evaluaciones",
      pct: Number(pcts.revisionTareasPct ?? 100),
      detail: `${entregasTotales} ${
        entregasTotales === 1 ? "entrega recibida" : "entregas recibidas"
      } (${entregasPendientes} ${
        entregasPendientes === 1 ? "pendiente de revisión" : "pendientes de revisión"
      })`,
      barClass: "from-indigo-500 to-blue-600",
      pillClass: "text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-950/50"
    },
    {
      label: "Tasa de Asistencia Estudiantil en Salas Meet",
      pct: Number(pcts.asistenciaEstudiantilPct ?? 100),
      detail: `${sesionesCerradas} ${
        sesionesCerradas === 1
          ? "acta de clase cerrada y auditada en el periodo"
          : "actas de clase cerradas y auditadas en el periodo"
      }`,
      barClass: "from-blue-500 to-sky-500",
      pillClass: "text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/50"
    },
    {
      label: "Resolución de Incidencias y Permutas Docentes",
      pct: Number(pcts.resolucionIncidenciasPct ?? 100),
      detail: `${incResueltas} ${incResueltas === 1 ? "resuelta" : "resueltas"} de ${incTotales} ${
        incTotales === 1 ? "registrada" : "registradas"
      }`,
      barClass: "from-amber-500 to-orange-500",
      pillClass: "text-amber-800 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/50"
    }
  ];

  return (
    <div className="space-y-5 pb-6 animate-fade-in">
      {/* 1. BANNER EJECUTIVO DE DIRECCIÓN (COMPACTO Y PROPORCIONADO) */}
      <section className="relative z-20 rounded-2xl bg-gradient-to-br from-[#0F172A] via-[#1E3A8A] to-[#172554] text-white px-5 py-4 sm:px-6 sm:py-5 shadow-lg border border-blue-800/40">
        <div className="absolute inset-0 overflow-hidden rounded-2xl pointer-events-none">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-blue-400/10 blur-3xl" />
          <div className="absolute right-24 -bottom-16 w-52 h-52 rounded-full bg-amber-400/10 blur-3xl" />
        </div>

        <div className="relative z-30 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="flex flex-wrap items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-white/10 border border-white/15 text-[10px] font-extrabold uppercase tracking-wider text-amber-300">
                <Building2 className="w-3.5 h-3.5" />
                <span>{inst.nombre || "Academia Preuniversitaria"}</span>
              </span>
              {inst.ruc && (
                <span className="text-[11px] font-mono text-blue-200/90 px-2.5 py-0.5 rounded-full bg-slate-950/35 border border-white/10">
                  RUC: {inst.ruc}
                </span>
              )}
              {clasesVivo.length > 0 && (
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-rose-500/25 border border-rose-400/50 text-[11px] font-extrabold text-rose-200">
                  <span className="w-2 h-2 rounded-full bg-rose-400 animate-pulse" />
                  {clasesVivo.length} Clase(s) En Vivo Ahora
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black tracking-tight leading-snug">
              Centro de Mando Institucional
            </h1>
            <p className="text-xs text-blue-100/85 leading-relaxed">
              Bienvenido(a), <strong className="text-white font-bold">{userName.split(" ")[0]}</strong>. Supervisa los indicadores académicos y financieros en vivo o accede a cada área operativa desde la galería inferior.
            </p>
          </div>

          {/* Filtro rápido por Ciclo + Botón Actualizar perfectamente alineados */}
          <div className="shrink-0 bg-slate-950/55 shadow-inner px-3.5 py-2.5 rounded-2xl border border-white/15">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block mb-1.5">
              Filtrar métricas por ciclo:
            </span>
            <div className="flex items-center gap-2">
              <div className="min-w-[225px] flex-1">
                <SearchableSelect
                  value={selectedCicloId}
                  onChange={setSelectedCicloId}
                  emptyOptionLabel="Todos los Ciclos (Global)"
                  options={ciclos.map((ci) => ({
                    value: ci.id,
                    label: `${ci.nombre}`,
                    sublabel: `Estado: ${ci.estado}`
                  }))}
                />
              </div>

              <button
                type="button"
                onClick={() => loadSummary(false)}
                className="h-[36px] w-[36px] flex items-center justify-center rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/15 transition-colors cursor-pointer shrink-0"
                title="Actualizar indicadores en vivo"
              >
                <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
              </button>
            </div>
          </div>
        </div>

        {/* Franja de 4 KPIs rápidos dentro del Hero */}
        <div className="relative z-10 grid grid-cols-2 lg:grid-cols-4 gap-2.5 mt-4 pt-4 border-t border-white/10">
          <div className="rounded-xl bg-white/[0.07] border border-white/10 px-3.5 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
              Postulantes Activos
            </span>
            <div className="mt-0.5 flex items-baseline justify-between">
              <strong className="text-xl sm:text-2xl font-black">{kpis.estudiantesActivos ?? 0}</strong>
              <span className="text-[11px] text-emerald-300 font-bold">
                {kpis.matriculasCount ?? 0} {kpis.matriculasCount === 1 ? "matrícula" : "matrículas"}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.07] border border-white/10 px-3.5 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
              Plana y Cursos
            </span>
            <div className="mt-0.5 flex items-baseline justify-between">
              <strong className="text-xl sm:text-2xl font-black">{kpis.cursosActivos ?? 0}</strong>
              <span className="text-[11px] text-amber-300 font-bold">
                {kpis.docentesActivos ?? 0} {kpis.docentesActivos === 1 ? "catedrático" : "catedráticos"}
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.07] border border-white/10 px-3.5 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
              Recaudación Efectiva
            </span>
            <div className="mt-0.5 flex items-baseline justify-between gap-1">
              <strong className="text-xl sm:text-2xl font-black text-emerald-300 truncate">
                S/ {Number(kpis.recaudacionTotal || 0).toLocaleString("es-PE")}
              </strong>
              <span className="text-[11px] text-blue-200 font-bold shrink-0">
                {pcts.recaudacionPct ?? 100}%
              </span>
            </div>
          </div>

          <div className="rounded-xl bg-white/[0.07] border border-white/10 px-3.5 py-2.5">
            <span className="text-[10px] font-bold uppercase tracking-wider text-blue-200 block">
              Cartera por Cobrar
            </span>
            <div className="mt-0.5 flex items-baseline justify-between gap-1">
              <strong className="text-xl sm:text-2xl font-black text-amber-300 truncate">
                S/ {Number(kpis.saldoPendienteTotal || 0).toLocaleString("es-PE")}
              </strong>
              <span className="text-[11px] text-blue-200 font-bold shrink-0">
                {kpis.cuentasConSaldoCount ?? 0} {kpis.cuentasConSaldoCount === 1 ? "cuenta" : "cuentas"}
              </span>
            </div>
          </div>
        </div>
      </section>

      {error && (
        <div role="alert" className="p-3.5 rounded-2xl border border-rose-300 bg-rose-50 text-xs font-bold text-rose-700 flex items-center gap-2">
          <AlertTriangle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* 2. SECCIÓN ANALÍTICA: PORCENTAJES Y BARRAS COMPARATIVAS EN TIEMPO REAL */}
      <section className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        {/* Columna Izquierda (7 cols): Barras Porcentuales de Desempeño (sin hueco intermedio) */}
        <div className="lg:col-span-7 bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-2xs flex flex-col">
          <div className="flex items-center justify-between gap-2">
            <div>
              <span className="text-[10px] font-black uppercase tracking-wider text-blue-600 dark:text-blue-400 flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                Indicadores Porcentuales en Vivo
              </span>
              <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
                Rendimiento Operativo, Académico y Financiero
              </h2>
            </div>
            <Link
              to="/admin/reportes"
              className="text-xs font-extrabold text-[#1E3A8A] dark:text-blue-400 hover:underline inline-flex items-center gap-1 shrink-0"
            >
              <span>Ver Actas PDF</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="mt-4 space-y-2.5">
            {progressIndicators.map((ind, idx) => {
              const clamped = Math.max(0, Math.min(100, Number(ind.pct || 0)));
              return (
                <div
                  key={idx}
                  className="p-3 rounded-xl bg-slate-50/90 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-100">
                      {ind.label}
                    </span>
                    <span className={`px-2 py-0.5 rounded-full font-black text-[11px] shrink-0 ${ind.pillClass}`}>
                      {clamped.toFixed(1)}%
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                    <div
                      className={`h-full rounded-full bg-gradient-to-r ${ind.barClass} transition-all duration-700`}
                      style={{ width: `${Math.max(clamped, 4)}%` }}
                    />
                  </div>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400">
                    {ind.detail}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Franja inferior de consolidación académica para equilibrar simétricamente ambas columnas */}
          <div className="mt-auto pt-3">
            <div className="p-3 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/25 border border-indigo-200/70 dark:border-indigo-800/40 flex flex-wrap items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 text-indigo-900 dark:text-indigo-200 font-semibold">
                <Award className="w-4 h-4 text-indigo-600 dark:text-amber-400 shrink-0" />
                <span>
                  Promedio Académico Global:{" "}
                  <strong className="font-black">
                    {Number(kpis.promedioGeneralNotas || 0) > 0
                      ? `${Number(kpis.promedioGeneralNotas).toFixed(2)} / 20`
                      : "En evaluación"}
                  </strong>
                </span>
              </div>
              <span className="text-[11px] font-bold text-indigo-700 dark:text-indigo-300">
                {kpis.tareasPublicadasCount ?? 0}{" "}
                {kpis.tareasPublicadasCount === 1 ? "evaluación publicada" : "evaluaciones publicadas"}
              </span>
            </div>
          </div>
        </div>

        {/* Columna Derecha (5 cols): Barras de Distribución por Ciclo y Área + Monitor Meet */}
        <div className="lg:col-span-5 bg-white dark:bg-white/5 backdrop-blur-xl rounded-2xl border border-slate-200 dark:border-white/10 p-5 shadow-2xs flex flex-col">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400 flex items-center gap-1">
              <Layers className="w-3.5 h-3.5" />
              Distribución por Ciclos y Áreas
            </span>
            <h2 className="text-base font-extrabold text-slate-900 dark:text-white mt-0.5">
              Carga Académica y Postulantes por Área
            </h2>

            {/* Barras por Ciclo Académico */}
            <div className="mt-4 space-y-2.5">
              {distCiclos.slice(0, 3).map((ci) => (
                <div
                  key={ci.id}
                  className="p-2.5 rounded-xl bg-slate-50 dark:bg-white/[0.03] border border-slate-200/70 dark:border-white/10 space-y-1.5"
                >
                  <div className="flex items-center justify-between gap-2 text-xs">
                    <span className="font-bold text-slate-800 dark:text-slate-100 truncate">
                      {ci.nombre}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold px-2 py-0.5 rounded-full shrink-0 ${
                        String(ci.estado).toLowerCase() === "finalizado"
                          ? "bg-slate-200 dark:bg-white/10 text-slate-600 dark:text-slate-400"
                          : "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300"
                      }`}
                    >
                      {ci.estado}
                    </span>
                  </div>
                  <div className="w-full h-2 rounded-full bg-slate-200/80 dark:bg-white/10 overflow-hidden">
                    <div
                      className="h-full rounded-full bg-gradient-to-r from-[#1E3A8A] to-indigo-500 transition-all duration-700"
                      style={{ width: `${Math.max(Number(ci.barPct || 0), 8)}%` }}
                    />
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400">
                    <span>
                      {ci.cursosCount} {ci.cursosCount === 1 ? "curso" : "cursos"} •{" "}
                      {ci.matriculasCount} {ci.matriculasCount === 1 ? "matrícula" : "matrículas"}
                    </span>
                    <span className="font-bold text-emerald-600 dark:text-emerald-400">
                      S/ {Number(ci.recaudado || 0).toLocaleString("es-PE")}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Distribución compacta de postulantes por área */}
          {distAreas.length > 0 && (
            <div className="mt-3 pt-3 border-t border-slate-100 dark:border-white/10 space-y-2">
              <span className="text-[11px] font-extrabold text-slate-600 dark:text-slate-300 flex items-center gap-1.5">
                <GraduationCap className="w-3.5 h-3.5 text-indigo-500" />
                Preferencia de Postulación Estudiantil:
              </span>
              <div className="space-y-1.5">
                {distAreas.slice(0, 3).map((ar, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex items-center justify-between text-[11px]">
                      <span className="text-slate-700 dark:text-slate-300 font-semibold truncate pr-2">
                        {ar.area}
                      </span>
                      <span className="font-bold text-slate-900 dark:text-white shrink-0">
                        {ar.estudiantesCount} ({ar.porcentaje}%)
                      </span>
                    </div>
                    <div className="w-full h-1.5 rounded-full bg-slate-100 dark:bg-white/10 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-indigo-500"
                        style={{ width: `${Math.max(ar.porcentaje, 6)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Estado en vivo de salas Google Meet */}
          <div className="mt-auto pt-3">
            {clasesVivo.length > 0 ? (
              <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/60 flex items-center justify-between gap-2 text-xs">
                <div className="flex items-center gap-2 min-w-0">
                  <Video className="w-4 h-4 text-rose-600 shrink-0 animate-pulse" />
                  <span className="font-bold text-rose-800 dark:text-rose-200 truncate">
                    En vivo: {clasesVivo.map((c) => c.asignatura).join(", ")}
                  </span>
                </div>
                <Link to="/admin/horarios" className="font-extrabold text-rose-700 dark:text-rose-300 underline shrink-0">
                  Ver
                </Link>
              </div>
            ) : (
              <div className="p-3 rounded-xl bg-emerald-50/70 dark:bg-emerald-950/25 border border-emerald-200/70 dark:border-emerald-800/40 flex items-center gap-2 text-xs text-emerald-800 dark:text-emerald-300 font-semibold">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>Plataforma operativa • Sin incidencias críticas de sala</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* 3. GALERÍA / MALLA EJECUTIVA DE MÓDULOS DE GESTIÓN (GRID 4x2) */}
      <section className="space-y-3.5">
        <div className="flex items-center justify-between">
          <div>
            <span className="text-[10px] font-black uppercase tracking-wider text-slate-400 block">
              Acceso Directo Modular
            </span>
            <h2 className="text-lg sm:text-xl font-extrabold text-slate-900 dark:text-white">
              Módulos de Administración y Control Académico
            </h2>
          </div>
          <span className="hidden sm:inline-flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
            <Award className="w-3.5 h-3.5 text-amber-500" />
            Selecciona un módulo para gestionar sus registros
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {moduleCards.map((mod) => {
            const Icon = mod.icon;
            return (
              <Link
                key={mod.path}
                to={mod.path}
                className="group relative bg-white dark:bg-white/[0.04] hover:bg-slate-50/90 dark:hover:bg-white/[0.07] rounded-2xl border border-slate-200/90 dark:border-white/10 hover:border-blue-400 dark:hover:border-blue-500/60 p-5 shadow-2xs hover:shadow-lg transition-all duration-200 hover:-translate-y-0.5 flex flex-col justify-between gap-4 cursor-pointer"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div
                      className={`w-11 h-11 rounded-2xl bg-gradient-to-br ${mod.accentBg} text-white flex items-center justify-center shadow-md group-hover:scale-105 transition-transform`}
                    >
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="p-1.5 rounded-xl bg-slate-100 dark:bg-white/5 text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 group-hover:bg-blue-50 dark:group-hover:bg-blue-950/50 transition-colors">
                      <ArrowUpRight className="w-4 h-4" />
                    </span>
                  </div>

                  <div>
                    <h3 className="text-sm sm:text-base font-extrabold text-slate-900 dark:text-white group-hover:text-[#1E3A8A] dark:group-hover:text-blue-400 transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed line-clamp-2">
                      {mod.desc}
                    </p>
                  </div>
                </div>

                <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between gap-2">
                  <span
                    className={`text-[11px] font-extrabold px-2.5 py-1 rounded-lg border truncate ${mod.badgeTone}`}
                  >
                    {mod.badgeText}
                  </span>
                </div>
              </Link>
            );
          })}
        </div>
      </section>
    </div>
  );
}
