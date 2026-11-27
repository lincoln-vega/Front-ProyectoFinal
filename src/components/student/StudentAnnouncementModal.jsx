import React, { useState } from "react";
import {
  AlertCircle,
  X,
  BookOpen,
  User,
  Eye
} from "lucide-react";
import FilePreviewModal from "../shared/FilePreviewModal";

export default function StudentAnnouncementModal({ announcement, isOpen, onClose }) {
  const [previewOpen, setPreviewOpen] = useState(false);

  if (!isOpen || !announcement) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden overscroll-contain">
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 shadow-xs">
              <AlertCircle className="w-5 h-5" />
            </div>
            <div>
              <span
                className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                  announcement.prioridad === "Alta" || announcement.prioridad === "Urgente"
                    ? "bg-red-100 dark:bg-red-950/60 text-red-700 dark:text-red-300"
                    : "bg-blue-100 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300"
                }`}
              >
                Prioridad: {announcement.prioridad || "General"}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {announcement.titulo}
              </h3>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Contenido */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain text-xs">
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Asignatura</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {announcement.curso || "Academia Pre"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <User className="w-4 h-4 text-emerald-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Publicado Por</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {announcement.docente || "Coordinación Académica"}
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Detalle del Aviso:
            </h4>
            <div className="p-4 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-slate-700 dark:text-slate-300 text-xs leading-relaxed space-y-2">
              <p>
                {announcement.contenido ||
                  announcement.descripcion ||
                  "No hay descripción adicional para este aviso."}
              </p>
            </div>
          </div>

          {(announcement.archivoUrl || announcement.archivoPath) && (
            <button
              type="button"
              onClick={() => setPreviewOpen(true)}
              className="w-full flex items-center justify-between gap-3 p-3.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-300 dark:border-blue-700/60 text-blue-700 dark:text-blue-200 hover:bg-blue-100 dark:hover:bg-blue-950/70 transition-colors cursor-pointer"
            >
              <span className="font-extrabold truncate">
                📄 {announcement.archivoNombre || "Material adjunto de clase"}
              </span>
              <span className="inline-flex items-center gap-1 font-black shrink-0 underline">
                <Eye className="w-3.5 h-3.5" />
                <span>Previsualizar</span>
              </span>
            </button>
          )}

          <div className="p-3 bg-amber-50 dark:bg-amber-950/30 rounded-xl border border-amber-200 dark:border-amber-900/40 text-[11px] text-amber-800 dark:text-amber-300">
            💡 Puedes consultar cualquier duda sobre este comunicado comunicándote con el docente a través del canal de tutoría.
          </div>

          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-xs transition-colors cursor-pointer"
            >
              Cerrar
            </button>
          </div>
        </div>
      </div>

      <FilePreviewModal
        isOpen={previewOpen}
        onClose={() => setPreviewOpen(false)}
        title={announcement.titulo}
        subtitle={`${announcement.curso || ""} • ${announcement.docente || ""}`}
        fileName={announcement.archivoNombre || "material_adjunto.pdf"}
        bucket="materiales-clase"
        path={announcement.archivoPath}
        fallbackUrl={announcement.archivoUrl}
      />
    </div>
  );
}
