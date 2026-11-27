// Visor universal integrado de archivos PDF e Imágenes (soporta archivos locales pre-subida y archivos privados en Supabase Storage)
import React, { useEffect, useMemo, useState } from "react";
import {
  FileText,
  Download,
  ExternalLink,
  Loader2,
  AlertCircle,
  X,
  Image as ImageIcon,
  FileArchive
} from "lucide-react";
import { resolveStorageUrl } from "../../lib/supabase";

function detectFileKind(fileName = "", mimeType = "", url = "") {
  const probe = `${fileName} ${url}`.toLowerCase();
  const mime = String(mimeType || "").toLowerCase();

  if (mime.includes("pdf") || /\.pdf($|\?|#)/i.test(probe)) {
    return "pdf";
  }
  if (
    mime.startsWith("image/") ||
    /\.(png|jpg|jpeg|webp|gif|svg)($|\?|#)/i.test(probe)
  ) {
    return "image";
  }
  return "other";
}

export default function FilePreviewModal({
  isOpen,
  onClose,
  title = "Vista Previa de Archivo",
  subtitle = "",
  fileName = "",
  localFile = null,
  bucket = null,
  path = null,
  fallbackUrl = null
}) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [resolvedUrl, setResolvedUrl] = useState("");

  useEffect(() => {
    if (!isOpen) {
      setResolvedUrl("");
      setError("");
      setLoading(false);
      return undefined;
    }

    // Caso 1: Previsualización instantánea (0 ms) de un File local antes de subirlo
    if (localFile instanceof File || localFile instanceof Blob) {
      const objUrl = URL.createObjectURL(localFile);
      setResolvedUrl(objUrl);
      setError("");
      setLoading(false);
      return () => URL.revokeObjectURL(objUrl);
    }

    // Caso 2: Archivo almacenado en Supabase Storage (renueva URL firmada bajo demanda)
    let cancelled = false;
    setLoading(true);
    setError("");
    resolveStorageUrl(bucket, path, fallbackUrl)
      .then((url) => {
        if (!cancelled) setResolvedUrl(url);
      })
      .catch((err) => {
        if (!cancelled) {
          setError(
            err.message ||
              "Este registro corresponde a una constancia sin archivo binario cargado en la nube."
          );
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [isOpen, localFile, bucket, path, fallbackUrl]);

  const effectiveName = localFile?.name || fileName || "documento_adjunto.pdf";
  const kind = useMemo(
    () => detectFileKind(effectiveName, localFile?.type, resolvedUrl || fallbackUrl || ""),
    [effectiveName, localFile, resolvedUrl, fallbackUrl]
  );

  if (!isOpen) return null;

  const handleDownload = () => {
    if (!resolvedUrl) return;
    const a = document.createElement("a");
    a.href = resolvedUrl;
    a.download = effectiveName;
    a.target = "_blank";
    a.rel = "noopener noreferrer";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div
      className="fixed inset-0 z-[70] flex items-center justify-center bg-slate-950/80 backdrop-blur-xs p-3 sm:p-5 animate-fade-in overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-5xl h-[88vh] flex flex-col overflow-hidden">
        {/* Cabecera estilo visor documental */}
        <div className="px-5 py-3.5 border-b border-slate-200 dark:border-white/10 bg-[#0F172A] text-white flex flex-col sm:flex-row sm:items-center justify-between gap-3 shrink-0">
          <div className="flex items-center gap-3 min-w-0">
            <div className="p-2 rounded-xl bg-blue-500/20 border border-blue-400/30 text-amber-300 shrink-0">
              {kind === "image" ? (
                <ImageIcon className="w-5 h-5" />
              ) : kind === "pdf" ? (
                <FileText className="w-5 h-5" />
              ) : (
                <FileArchive className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-200 border border-emerald-400/30">
                  {localFile ? "Vista Previa Local (Antes de Enviar)" : "Visor Integrado de Archivo"}
                </span>
                <span className="text-[11px] font-mono text-slate-400 truncate hidden md:inline">
                  {effectiveName}
                </span>
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
            {resolvedUrl && (
              <>
                <a
                  href={resolvedUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/15 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>Nueva Pestaña</span>
                </a>
                <button
                  type="button"
                  onClick={handleDownload}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-xs transition-colors cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Descargar</span>
                </button>
              </>
            )}
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

        {/* Cuerpo del visor */}
        <div className="flex-1 bg-slate-200 dark:bg-slate-950 p-2 sm:p-4 overflow-auto flex items-center justify-center">
          {loading ? (
            <div className="flex flex-col items-center justify-center space-y-3 text-slate-600 dark:text-slate-300">
              <Loader2 className="w-9 h-9 animate-spin text-blue-600" />
              <p className="text-sm font-extrabold">Cargando archivo seguro desde Supabase Storage...</p>
            </div>
          ) : error ? (
            <div className="max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-amber-200 dark:border-amber-800 p-6 text-center space-y-3">
              <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
              <h4 className="text-sm font-extrabold text-slate-900 dark:text-white">
                Vista previa binaria no disponible
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-300">{error}</p>
              <p className="text-[11px] font-mono text-slate-400">Referencia: {effectiveName}</p>
            </div>
          ) : resolvedUrl && kind === "pdf" ? (
            <iframe
              src={resolvedUrl}
              title={effectiveName}
              className="w-full h-full rounded-xl border border-slate-300 dark:border-white/10 bg-white shadow-inner"
            />
          ) : resolvedUrl && kind === "image" ? (
            <div className="w-full h-full flex items-center justify-center overflow-auto bg-slate-900/40 rounded-xl p-4">
              <img
                src={resolvedUrl}
                alt={effectiveName}
                className="max-w-full max-h-full object-contain rounded-lg shadow-xl"
              />
            </div>
          ) : resolvedUrl ? (
            <div className="max-w-md bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-white/10 p-6 text-center space-y-4 shadow-lg">
              <FileArchive className="w-12 h-12 text-blue-600 mx-auto" />
              <div>
                <h4 className="text-sm font-extrabold text-slate-900 dark:text-white break-all">
                  {effectiveName}
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Los archivos de paquete u ofimática (DOCX, XLSX, PPTX o ZIP) no se renderizan dentro del navegador, pero están listos para descarga directa.
                </p>
              </div>
              <button
                type="button"
                onClick={handleDownload}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-extrabold shadow-md cursor-pointer"
              >
                <Download className="w-4 h-4" />
                <span>Descargar Archivo ({effectiveName})</span>
              </button>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
