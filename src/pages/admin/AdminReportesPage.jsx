import React, { useState, useEffect } from "react";
import {
  DollarSign,
  Clock,
  AlertTriangle,
  CheckCircle2,
  Download,
  Search,
  Filter,
  Users,
  TrendingUp,
  FileSpreadsheet,
  Award,
  ArrowUpRight
} from "lucide-react";
import { userService, courseService, incidentService } from "../../services/api";
import { exportToCSV } from "../../utils/exportUtils";
import Notification from "../../components/admin/Notification";

export default function AdminReportesPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [payrollData, setPayrollData] = useState([]);
  const [metrics, setMetrics] = useState({
    totalPlanilla: 0,
    totalHorasProgramadas: 0,
    totalHorasEfectivas: 0,
    totalDescuentos: 0,
    eficiencia: "100%"
  });
  const [notification, setNotification] = useState(null);

  const showNotification = (msg) => {
    setNotification(msg);
    setTimeout(() => setNotification(null), 3500);
  };

  useEffect(() => {
    // 1. Obtener usuarios docentes
    const allUsers = userService.getUsers() || [];
    const teachers = allUsers.filter(u => u.rol === "docente" || u.rol === "profesor");

    // 2. Obtener cursos e incidencias
    const courses = courseService.getCourses() || [];
    const incidents = incidentService.getIncidents() || [];

    const TARIFA_HORA = 50.0; // S/ 50 por hora lectiva
    let sumPlanilla = 0;
    let sumHorasProg = 0;
    let sumHorasEfect = 0;
    let sumDescuentos = 0;

    const calculated = teachers.map((teacher) => {
      const teacherName = `${teacher.nombres || ""} ${teacher.apellidos || ""}`.trim() || teacher.name || "Docente";
      
      // Cursos dictados
      const teacherCourses = courses.filter(
        c => c.docenteId === teacher.id || c.docente?.toLowerCase().includes(teacher.apellidos?.toLowerCase() || "")
      );

      // Horas programadas (16h mensuales por curso o mínimo 16h)
      const horasProgramadas = teacherCourses.length > 0 ? teacherCourses.length * 16 : 16;

      // Incidencias del docente
      const teacherIncidents = incidents.filter(
        i => i.docenteId === teacher.id || i.docente?.toLowerCase().includes(teacher.apellidos?.toLowerCase() || "")
      );

      let horasDescontadas = 0;
      let tardanzasMin = 0;
      let inasistenciasNoJust = 0;
      let permutasAprobadas = 0;

      teacherIncidents.forEach((inc) => {
        const tipo = (inc.tipo || "").toLowerCase();
        const estado = inc.estado;

        if (tipo.includes("tardanza")) {
          const mins = tipo.includes("+20") ? 20 : 15;
          tardanzasMin += mins;
          if (estado !== "Aprobado") {
            horasDescontadas += mins / 60;
          }
        } else if (tipo.includes("inasistencia")) {
          if (estado !== "Aprobado") {
            inasistenciasNoJust += 1;
            horasDescontadas += 2.0; // Bloque de 2 horas
          }
        } else if (tipo.includes("permuta") || tipo.includes("reemplazo")) {
          if (estado === "Aprobado") {
            permutasAprobadas += 1;
          }
        }
      });

      const horasEfectivas = Math.max(0, horasProgramadas - horasDescontadas);
      const montoBruto = horasProgramadas * TARIFA_HORA;
      const descuentoPEN = horasDescontadas * TARIFA_HORA;
      const montoNeto = horasEfectivas * TARIFA_HORA;

      let estadoAuditoria = "100% Efectivo";
      if (horasDescontadas > 0) {
        estadoAuditoria = "Con Descuentos";
      } else if (teacherIncidents.length > 0 && horasDescontadas === 0) {
        estadoAuditoria = "Regularizado";
      }

      sumPlanilla += montoNeto;
      sumHorasProg += horasProgramadas;
      sumHorasEfect += horasEfectivas;
      sumDescuentos += descuentoPEN;

      return {
        id: teacher.id,
        docente: teacherName,
        dni: teacher.dni || "N/A",
        correo: teacher.correo || "N/A",
        cursosAsignados: teacherCourses.length,
        nombresCursos: teacherCourses.map(c => c.asignatura).join(", ") || "General",
        horasProgramadas,
        tardanzasMin,
        horasDescontadas: Number(horasDescontadas.toFixed(2)),
        horasEfectivas: Number(horasEfectivas.toFixed(2)),
        tarifaHora: TARIFA_HORA,
        montoBruto: Number(montoBruto.toFixed(2)),
        descuentoPEN: Number(descuentoPEN.toFixed(2)),
        montoNeto: Number(montoNeto.toFixed(2)),
        estadoAuditoria
      };
    });

    setPayrollData(calculated);
    setMetrics({
      totalPlanilla: sumPlanilla,
      totalHorasProgramadas: sumHorasProg,
      totalHorasEfectivas: sumHorasEfect,
      totalDescuentos: sumDescuentos,
      eficiencia: sumHorasProg > 0 ? `${((sumHorasEfect / sumHorasProg) * 100).toFixed(1)}%` : "100%"
    });
  }, []);

  const handleExportPayroll = () => {
    if (!filteredData || filteredData.length === 0) {
      showNotification("No hay datos disponibles para exportar.");
      return;
    }

    const columns = [
      { key: "id", label: "CODIGO DOCENTE" },
      { key: "docente", label: "APELLIDOS Y NOMBRES" },
      { key: "dni", label: "DNI" },
      { key: "correo", label: "CORREO INSTITUCIONAL" },
      { key: "cursosAsignados", label: "CURSOS ASIGNADOS" },
      { key: "nombresCursos", label: "DETALLE ASIGNATURAS" },
      { key: "horasProgramadas", label: "HORAS PROGRAMADAS (H)" },
      { key: "tardanzasMin", label: "TARDANZAS TOTAL (MIN)" },
      { key: "horasDescontadas", label: "HORAS DESCONTADAS (H)" },
      { key: "horasEfectivas", label: "HORAS EFECTIVAS AUDITADAS (H)" },
      { key: "tarifaHora", label: "TARIFA X HORA (PEN)" },
      { key: "montoBruto", label: "TOTAL BRUTO (PEN)" },
      { key: "descuentoPEN", label: "TOTAL DESCUENTOS (PEN)" },
      { key: "montoNeto", label: "NETO A PAGAR (PEN)" },
      { key: "estadoAuditoria", label: "ESTADO AUDITORIA" }
    ];

    const success = exportToCSV(filteredData, "reporte_nomina_cruce_horas_docentes", columns);
    if (success) {
      showNotification("Reporte de Nómina exportado exitosamente a CSV/Excel.");
    }
  };

  const filteredData = payrollData.filter((item) => {
    const matchesSearch =
      item.docente.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.dni.includes(searchTerm) ||
      item.correo.toLowerCase().includes(searchTerm.toLowerCase());

    if (statusFilter === "TODOS") return matchesSearch;
    return matchesSearch && item.estadoAuditoria === statusFilter;
  });

  return (
    <div className="space-y-6">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      {/* ENCABEZADO */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="inline-flex items-center space-x-2 px-2.5 py-1 rounded bg-blue-50 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 text-xs font-bold uppercase tracking-wider border border-blue-200 dark:border-blue-500/30 mb-2">
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>SCRM-106 • Reporte de Pagos, Nómina y Auditoría</span>
            </div>
            <h1 className="text-2xl font-extrabold text-slate-800 dark:text-white">
              Liquidación de Nómina y Cruce Automatizado de Horas
            </h1>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Cruce sistemático de horas lectivas programadas vs tardanzas e inasistencias reportadas. Cálculo de haberes netos y control de auditoría docente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPayroll}
              className="inline-flex items-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>Exportar Planilla a Excel</span>
            </button>
          </div>
        </div>

        {/* TARJETAS DE MÉTRICAS GLOBALES */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-100 dark:border-white/10">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Total Planilla Neta</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                S/ {metrics.totalPlanilla.toFixed(2)}
              </span>
              <DollarSign className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Periodo: Octubre 2026</span>
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Horas Efectivas Dictadas</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">
                {metrics.totalHorasEfectivas.toFixed(1)} hrs
              </span>
              <Clock className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">
              De {metrics.totalHorasProgramadas} hrs programadas
            </span>
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Descuentos Aplicados</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-rose-600 dark:text-rose-400">
                - S/ {metrics.totalDescuentos.toFixed(2)}
              </span>
              <AlertTriangle className="w-5 h-5 text-rose-500" />
            </div>
            <span className="text-xs text-slate-500 dark:text-slate-400 mt-1 block">Por tardanzas e inasistencias</span>
          </div>

          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-4 rounded-xl border border-slate-200/80 dark:border-white/10">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Cumplimiento Global</span>
            <div className="flex items-center justify-between mt-2">
              <span className="text-2xl font-extrabold text-slate-900 dark:text-white">{metrics.eficiencia}</span>
              <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium mt-1 block">Rendimiento institucional</span>
          </div>
        </div>
      </div>

      {/* BANDEJA DE AUDITORÍA Y TABLA */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs p-6 space-y-4">
        {/* BUSCADOR Y FILTROS */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-100 dark:border-white/10">
          <div className="relative w-full sm:w-80">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por docente, DNI o correo..."
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-xl bg-slate-50 dark:bg-white/5 text-slate-800 dark:text-white focus:outline-hidden focus:border-[#1E3A8A]"
            />
          </div>

          <div className="flex items-center space-x-1 bg-slate-100 dark:bg-white/5 p-1 rounded-xl text-xs">
            <button
              onClick={() => setStatusFilter("TODOS")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${statusFilter === "TODOS" ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
            >
              Todos ({payrollData.length})
            </button>
            <button
              onClick={() => setStatusFilter("100% Efectivo")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${statusFilter === "100% Efectivo" ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
            >
              100% Efectivo
            </button>
            <button
              onClick={() => setStatusFilter("Con Descuentos")}
              className={`px-3 py-1.5 rounded-lg font-medium transition-colors cursor-pointer ${statusFilter === "Con Descuentos" ? "bg-white dark:bg-white/10 text-slate-800 dark:text-white shadow-xs" : "text-slate-600 dark:text-slate-400"}`}
            >
              Con Descuentos
            </button>
          </div>
        </div>

        {/* TABLA DE AUDITORÍA */}
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50 dark:bg-white/5 text-slate-500 dark:text-slate-400 uppercase tracking-wider font-semibold border-b border-slate-200 dark:border-white/10">
              <tr>
                <th className="py-3 px-4">Docente Titular</th>
                <th className="py-3 px-3">Cursos</th>
                <th className="py-3 px-3">Horas Prog.</th>
                <th className="py-3 px-3">Descuentos</th>
                <th className="py-3 px-3">Horas Efectivas</th>
                <th className="py-3 px-3">Tarifa/Hora</th>
                <th className="py-3 px-3">Neto a Pagar</th>
                <th className="py-3 px-4">Estado Auditoría</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5">
              {filteredData.length > 0 ? (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 dark:hover:bg-white/5 transition-colors">
                    <td className="py-3.5 px-4">
                      <div className="font-bold text-slate-800 dark:text-white">{item.docente}</div>
                      <div className="text-[11px] text-slate-400 font-mono">DNI: {item.dni} • {item.correo}</div>
                    </td>
                    <td className="py-3.5 px-3">
                      <span className="px-2 py-0.5 rounded-full font-bold bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                        {item.cursosAsignados} curso(s)
                      </span>
                    </td>
                    <td className="py-3.5 px-3 font-semibold text-slate-700 dark:text-slate-300">
                      {item.horasProgramadas} hrs
                    </td>
                    <td className="py-3.5 px-3">
                      {item.horasDescontadas > 0 ? (
                        <span className="font-bold text-rose-600 dark:text-rose-400">
                          -{item.horasDescontadas} hrs (-S/ {item.descuentoPEN.toFixed(2)})
                        </span>
                      ) : (
                        <span className="text-slate-400">S/ 0.00</span>
                      )}
                    </td>
                    <td className="py-3.5 px-3 font-bold text-slate-900 dark:text-white">
                      {item.horasEfectivas} hrs
                    </td>
                    <td className="py-3.5 px-3 text-slate-600 dark:text-slate-300">
                      S/ {item.tarifaHora.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-3 font-extrabold text-emerald-600 dark:text-emerald-400 text-sm">
                      S/ {item.montoNeto.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
                        item.estadoAuditoria === "100% Efectivo"
                          ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-500/30"
                          : item.estadoAuditoria === "Con Descuentos"
                          ? "bg-rose-100 dark:bg-rose-900/30 text-rose-800 dark:text-rose-400 border-rose-200 dark:border-rose-500/30"
                          : "bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-500/30"
                      }`}>
                        {item.estadoAuditoria === "100% Efectivo" && <CheckCircle2 className="w-3 h-3 text-emerald-600" />}
                        {item.estadoAuditoria === "Con Descuentos" && <AlertTriangle className="w-3 h-3 text-rose-600" />}
                        <span>{item.estadoAuditoria}</span>
                      </span>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="py-8 text-center text-slate-400">
                    No se encontraron registros de nómina con los filtros actuales.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
