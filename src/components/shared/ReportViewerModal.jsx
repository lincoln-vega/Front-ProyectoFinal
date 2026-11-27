// Visor interactivo de documentos PDF oficiales generados en servidor (equivalente a JasperViewer)
import React, { useEffect, useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  FileSpreadsheet,
  Loader2,
  AlertCircle,
  X,
  RefreshCw
} from "lucide-react";
import { reportesService } from "../../services/reportesService";
import { exportToCSV } from "../../utils/exportUtils";

export default function ReportViewerModal({
  isOpen,
  onClose,
  title = "Visor Oficial de Documento PDF",
  subtitle = "",
  endpointPath,
  params = {},
  csvFilename = "reporte_oficial"
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [pdfInfo, setPdfInfo] = useState(null);
  const [exportingCsv, setExportingCsv] = useState(false);

  const paramsKey = JSON.stringify(params || {});

  const loadPdf = async () => {
    if (!endpointPath) return;
    setLoading(true);
    setError("");
    try {
      const result = await reportesService.fetchReportPdf(endpointPath, params);
      setPdfInfo((prev) => {
        if (prev?.blobUrl) URL.revokeObjectURL(prev.blobUrl);
        return result;
      });
    } catch (err) {
      setError(err.message || "No se pudo renderizar el documento PDF.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen && endpointPath) {
      loadPdf();
    }
    return () => {
      setPdfInfo((prev) => {
        if (prev?.blobUrl) URL.revokeObjectURL(prev.blobUrl);
        return null;
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen, endpointPath, paramsKey]);

  if (!isOpen) return null;

  const handleDownloadPdf = () => {
    if (!pdfInfo?.blobUrl) return;
    const a = document.createElement("a");
    a.href = pdfInfo.blobUrl;
    a.download = pdfInfo.filename || "reporte_oficial.pdf";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleOpenPrintTab = () => {
    if (!pdfInfo?.blobUrl) return;
    window.open(pdfInfo.blobUrl, "_blank", "noopener,noreferrer");
  };

  const handleExportExcel = async () => {
    if (!endpointPath || exportingCsv) return;
    setExportingCsv(true);
    try {
      const data = await reportesService.fetchReportData(endpointPath, params);
      if (data?.filas?.length > 0) {
        exportToCSV(data.filas, csvFilename, data.columnas || []);
      } else {
        alert("No hay registros en este filtro para exportar a Excel.");
      }
    } catch (err) {
      alert("No se pudo exportar a Excel: " + err.message);
    } finally {
      setExportingCsv(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/75 backdrop-blur-xs p-3 sm:p-5 animate-fade-in overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-6xl h-[90vh] flex flex-col overflow-hidden">
        {/* Barra de herramientas estilo JasperViewer */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 bg-[#0F172A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-amber-400/15 border border-amber-400/30 text-amber-300 shrink-0">
              <FileText className="w-5 h-5" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-500/25 text-blue-200 border border-blue-400/30">
                  Documento Oficial PDF
                </span>
                {pdfInfo?.filename && (
                  <span className="text-[11px] font-mono text-slate-400 truncate hidden md:inline">
                    {pdfInfo.filename}
                  </span>
                )}
              </div>
              <h3 className="text-sm sm:text-base font-extrabold text-white truncate mt-0.5">
                {title}
              </h3>
              {subtitle && (
                <p className="text-[11px] text-slate-300 truncate">{subtitle}</p>
              )}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2 shrink-0">
            <button
              type="button"
              onClick={loadPdf}
              disabled={loading}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/15 text-slate-200 transition-colors cursor-pointer disabled:opacity-50"
              title="Regenerar documento con datos en vivo"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
            </button>

            <button
              type="button"
              onClick={handleExportExcel}
              disabled={exportingCsv}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>{exportingCsv ? "Exportando..." : "Excel (.csv)"}</span>
            </button>

            <button
              type="button"
              onClick={handleOpenPrintTab}
              disabled={!pdfInfo?.blobUrl || loading}
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors cursor-pointer disabled:opacity-50"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              <span>Imprimir / Pestaña</span>
            </button>

            <button
              type="button"
              onClick={handleDownloadPdf}
              disabled={!pdfInfo?.blobUrl || loading}
              className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar PDF</span>
            </button>

            <button
              type="button"
              onClick={onClose}
              className="p-2 rounded-xl text-slate-300 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
              title="Cerrar visor"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Lienzo de previsualización PDF */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-2 sm:p-4 overflow-hidden flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-600 dark:text-slate-300">
              <Loader2 className="w-10 h-10 animate-spin text-blue-600" />
              <p className="text-sm font-extrabold">Compilando documento oficial PDF en servidor...</p>
              <p className="text-xs text-slate-500">
                Consultando registros reales en Supabase PostgreSQL y aplicando membrete institucional
              </p>
            </div>
          ) : error ? (
            <div className="max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-rose-200 dark:border-rose-800 p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                No se pudo generar el reporte
              </h4>
              <p className="text-xs text-rose-600 dark:text-rose-400">{error}</p>
              <button
                type="button"
                onClick={loadPdf}
                className="px-4 py-2 rounded-xl bg-blue-600 text-white text-xs font-bold cursor-pointer"
              >
                Reintentar
              </button>
            </div>
          ) : pdfInfo?.blobUrl ? (
            <iframe
              src={pdfInfo.blobUrl}
              title={title}
              className="w-full h-full rounded-xl border border-slate-300 dark:border-white/10 bg-white shadow-inner"
            />
          ) : null}
        </div>
      </div>
    </div>
  );
}
