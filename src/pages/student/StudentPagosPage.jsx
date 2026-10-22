import React, { useState, useEffect, useMemo } from "react";
import {
  CreditCard,
  Wallet,
  Receipt,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Printer,
  Download,
  Calendar,
  ExternalLink,
  Sparkles,
  TrendingUp,
  X,
  Check,
  ShieldCheck,
  User,
  GraduationCap
} from "lucide-react";
import { matriculaService, pagoService, userService } from "../../services/api";

export default function StudentPagosPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [matricula, setMatricula] = useState(null);
  const [pagosList, setPagosList] = useState([]);
  const [selectedReceipt, setSelectedReceipt] = useState(null);
  const [estudianteActivo, setEstudianteActivo] = useState(null);

  useEffect(() => {
    let cancelled = false;

    async function cargarEstadoCuenta() {
      try {
        setLoading(true);
        setError("");

        const userEmail = localStorage.getItem("userEmail");
        if (!userEmail) throw new Error("No se encontró el correo de la sesión.");

        const [users, remoteMatriculas, remotePagos, perfil] = await Promise.all([
          userService.getUsers(),
          matriculaService.getMatriculas(),
          pagoService.getPagos(),
          userService.getUserByEmail(userEmail)
        ]);

        if (cancelled) return;

        setEstudianteActivo(perfil);

        const studentName = perfil
          ? `${perfil.nombres || ""} ${perfil.apellidos || ""}`.trim().toLowerCase()
          : "";

        // Encontrar la matrícula del estudiante
        const userMatricula = (remoteMatriculas || []).find((m) => {
          if (perfil?.dni && m.dni === perfil.dni) return true;
          if (userEmail && m.correo?.toLowerCase() === userEmail.toLowerCase()) return true;
          if (studentName && m.estudiante?.toLowerCase().includes(studentName)) return true;
          return false;
        }) || (remoteMatriculas || [])[0] || null;

        setMatricula(userMatricula);

        // Encontrar los pagos asociados a la matrícula o estudiante
        const misPagos = (remotePagos || []).filter((p) => {
          if (userMatricula && p.matriculaId === userMatricula.id) return true;
          if (studentName && p.estudiante?.toLowerCase().includes(studentName)) return true;
          if (userMatricula && p.estudiante?.toLowerCase() === userMatricula.estudiante?.toLowerCase()) return true;
          return false;
        });

        setPagosList(misPagos);
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar estado de cuenta del estudiante:", err);
          setError(err.message || "Error al cargar la información de pagos.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    cargarEstadoCuenta();
    return () => { cancelled = true; };
  }, []);

  const studentName = estudianteActivo
    ? `${estudianteActivo.nombres || ""} ${estudianteActivo.apellidos || ""}`.trim()
    : matricula?.estudiante || "Estudiante";

  const montoTotal = Number(matricula?.montoTotal || 0);
  const montoPagado = Number(matricula?.montoPagado || pagosList.reduce((acc, p) => acc + Number(p.monto || 0), 0));
  const saldoPendiente = Math.max(0, Number(matricula?.saldoPendiente ?? (montoTotal - montoPagado)));
  const porcentajePagado = montoTotal > 0 ? Math.min(100, Math.round((montoPagado / montoTotal) * 100)) : 100;

  const estadoBadge = useMemo(() => {
    if (saldoPendiente <= 0 || matricula?.estado === "Pagado Total") {
      return {
        label: "Pagado Total",
        bg: "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800",
        dot: "bg-emerald-500"
      };
    }
    if (matricula?.estado === "Cuota Vencida") {
      return {
        label: "Cuota Vencida",
        bg: "bg-rose-50 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400 border-rose-200 dark:border-rose-800",
        dot: "bg-rose-500"
      };
    }
    return {
      label: "Al día",
      bg: "bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-300 border border-blue-200 dark:border-blue-800",
      dot: "bg-blue-500"
    };
  }, [saldoPendiente, matricula]);

  return (
    <div className="space-y-6 animate-fade-in">
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}

      {/* BANNER PRINCIPAL DE ESTADO DE CUENTA */}
      <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
        <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
            <Sparkles className="w-3.5 h-3.5 text-amber-300" />
            <span>Módulo Financiero y Estado de Cuenta</span>
          </div>

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight">
                Estado de Pagos y Pensiones
              </h1>
              <p className="text-blue-100 text-xs sm:text-sm mt-1 max-w-2xl leading-relaxed">
                Consulta tu plan de pagos, cuotas abonadas y descarga tus boletas oficiales de matrícula.
              </p>
            </div>

            {matricula && (
              <div className="bg-white/10 backdrop-blur-md px-4 py-3 rounded-xl border border-white/15 text-xs space-y-1">
                <div className="text-blue-200 font-medium">Programa Académico:</div>
                <div className="text-white font-bold text-sm">{matricula.programa}</div>
                <div className="text-blue-200 text-[11px] flex items-center gap-2">
                  <span>{matricula.modalidadPago}</span>
                  <span>•</span>
                  <span>{matricula.ciclo}</span>
                </div>
              </div>
            )}
          </div>

          {/* TARJETAS DE RESUMEN ECONÓMICO */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mt-6 pt-6 border-t border-white/15">
            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <span className="text-blue-200 text-xs font-medium block">Costo Total Pensión</span>
              <div className="text-xl font-extrabold text-white mt-1">
                S/. {montoTotal.toFixed(2)}
              </div>
              <span className="text-[11px] text-blue-200 block mt-0.5">Monto global del periodo</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <span className="text-blue-200 text-xs font-medium block">Total Abonado</span>
              <div className="text-xl font-extrabold text-emerald-300 mt-1">
                S/. {montoPagado.toFixed(2)}
              </div>
              <div className="w-full bg-white/20 h-1.5 rounded-full mt-2 overflow-hidden">
                <div
                  className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                  style={{ width: `${porcentajePagado}%` }}
                />
              </div>
              <span className="text-[10px] text-emerald-200 block mt-1">{porcentajePagado}% pagado</span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10">
              <span className="text-blue-200 text-xs font-medium block">Saldo Pendiente</span>
              <div className={`text-xl font-extrabold mt-1 ${saldoPendiente > 0 ? "text-amber-300" : "text-emerald-300"}`}>
                S/. {saldoPendiente.toFixed(2)}
              </div>
              <span className="text-[11px] text-blue-200 block mt-0.5">
                {saldoPendiente > 0 ? "Por cancelar en cuotas" : "Totalmente cancelado"}
              </span>
            </div>

            <div className="bg-white/10 backdrop-blur-md p-3.5 rounded-xl border border-white/10 flex flex-col justify-between">
              <span className="text-blue-200 text-xs font-medium block">Estado Financiero</span>
              <div className="mt-1">
                <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold border ${estadoBadge.bg}`}>
                  <span className={`w-2 h-2 rounded-full mr-1.5 ${estadoBadge.dot} animate-pulse`} />
                  {estadoBadge.label}
                </span>
              </div>
              <span className="text-[10px] text-blue-200 block mt-2">
                Ref. Matrícula: {matricula?.id || "N/A"}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* HISTORIAL DE CUOTAS Y PAGOS */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
        <div className="p-5 border-b border-slate-200 dark:border-white/10 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-white flex items-center gap-2">
              <Receipt className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
              Historial de Pagos y Comprobantes
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
              Boletas de venta electrónicas registradas y verificadas por administración.
            </p>
          </div>

          <span className="text-xs font-semibold px-3 py-1 bg-slate-100 dark:bg-white/5 text-slate-600 dark:text-slate-300 rounded-lg border border-slate-200 dark:border-white/10 self-start sm:self-auto">
            {pagosList.length} Comprobantes Emitidos
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-slate-50/80 dark:bg-white/5 text-slate-600 dark:text-slate-300 font-semibold border-b border-slate-200 dark:border-white/10 select-none">
                <th className="p-3.5 whitespace-nowrap">N° Comprobante</th>
                <th className="p-3.5 whitespace-nowrap">Concepto de Pago</th>
                <th className="p-3.5 whitespace-nowrap">Método</th>
                <th className="p-3.5 whitespace-nowrap">N° Operación</th>
                <th className="p-3.5 whitespace-nowrap">Fecha y Hora</th>
                <th className="p-3.5 whitespace-nowrap text-right">Monto Abonado</th>
                <th className="p-3.5 whitespace-nowrap text-center">Estado</th>
                <th className="p-3.5 whitespace-nowrap text-center">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
              {pagosList.length === 0 ? (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-slate-400 dark:text-slate-500">
                    <Receipt className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                    No se encontraron pagos registrados para tu expediente.
                  </td>
                </tr>
              ) : (
                pagosList.map((pago) => (
                  <tr
                    key={pago.id}
                    className="hover:bg-blue-50/50 dark:hover:bg-white/5 transition-colors"
                  >
                    <td className="p-3.5 font-mono font-bold text-[#1E3A8A] dark:text-blue-400 whitespace-nowrap">
                      {pago.comprobante || pago.id}
                    </td>
                    <td className="p-3.5 font-semibold text-slate-900 dark:text-white whitespace-nowrap">
                      {pago.concepto}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                      {pago.metodo}
                    </td>
                    <td className="p-3.5 font-mono text-slate-500 dark:text-slate-400 whitespace-nowrap">
                      {pago.operacion}
                    </td>
                    <td className="p-3.5 whitespace-nowrap text-slate-500 dark:text-slate-400">
                      {pago.fecha}
                    </td>
                    <td className="p-3.5 text-right font-extrabold text-emerald-700 dark:text-emerald-400 whitespace-nowrap">
                      S/. {Number(pago.monto || 0).toFixed(2)}
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 dark:bg-emerald-900/30 text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
                        <Check className="w-3 h-3" />
                        {pago.estado || "Aprobado"}
                      </span>
                    </td>
                    <td className="p-3.5 text-center whitespace-nowrap">
                      <button
                        type="button"
                        onClick={() => setSelectedReceipt(pago)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 text-xs font-semibold text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-200 dark:border-blue-800 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer"
                        title="Ver Boleta Electrónica"
                      >
                        <Printer className="w-3.5 h-3.5" />
                        <span>Ver Boleta</span>
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* MODAL OFICIAL: BOLETA DE VENTA ELECTRÓNICA */}
      {selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-md overflow-hidden animate-scale-up my-8">
            <div className="p-6 text-center border-b border-slate-100 dark:border-white/10 space-y-1">
              <div className="w-12 h-12 bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-2">
                <Check className="w-6 h-6" />
              </div>
              <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest block">
                Comprobante de Pago Electrónico
              </span>
              <h3 className="text-xl font-extrabold text-slate-900 dark:text-white">
                {selectedReceipt.comprobante}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Academia Preuniversitaria S.A.C. • RUC: 20608912345
              </p>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="space-y-2 border-b border-slate-100 dark:border-white/10 pb-4 text-slate-600 dark:text-slate-300">
                <div className="flex justify-between">
                  <span className="text-slate-400">Estudiante:</span>
                  <span className="font-bold text-slate-900 dark:text-white text-right">
                    {selectedReceipt.estudiante}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Ref. Matrícula:</span>
                  <span className="font-mono text-[#1E3A8A] dark:text-blue-400 font-bold">
                    {selectedReceipt.matriculaId}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Concepto:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-100 text-right">
                    {selectedReceipt.concepto}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Medio de Pago:</span>
                  <span>{selectedReceipt.metodo}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">N° de Operación:</span>
                  <span className="font-mono text-slate-800 dark:text-slate-200">
                    {selectedReceipt.operacion}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Fecha de Emisión:</span>
                  <span>{selectedReceipt.fecha}</span>
                </div>
              </div>

              <div className="flex justify-between items-center py-2.5 bg-emerald-50 dark:bg-emerald-950/40 px-4 rounded-xl border border-emerald-200 dark:border-emerald-800/60">
                <span className="text-xs font-bold text-emerald-800 dark:text-emerald-300 uppercase">
                  Total Pagado:
                </span>
                <span className="text-xl font-extrabold text-emerald-700 dark:text-emerald-400">
                  S/. {Number(selectedReceipt.monto || 0).toFixed(2)}
                </span>
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between">
              <button
                type="button"
                onClick={() => window.print()}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 dark:text-slate-200 border border-slate-300 dark:border-white/10 rounded-lg hover:bg-white dark:hover:bg-white/10 transition-colors cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir Boleta</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedReceipt(null)}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-[#1E3A8A] hover:bg-blue-800 rounded-lg transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
