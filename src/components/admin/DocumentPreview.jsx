import React from "react";
import { FileText, X, ShieldAlert } from "lucide-react";

export default function DocumentPreviewModal({ fileData, onClose }) {
  if (!fileData) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-xs p-4 animate-fade-in" role="dialog" aria-modal="true">
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-white/10 overflow-hidden">
        <div className="bg-[#1E3A8A] dark:bg-slate-800 border-b dark:border-white/10 text-white px-6 py-4 flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <FileText className="w-5 h-5 text-amber-300" />
            <h3 className="text-base font-bold">Vista Previa de Sustento</h3>
          </div>
          <button 
            onClick={onClose} 
            className="text-white/80 hover:text-white font-bold text-lg cursor-pointer"
            aria-label="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-6 space-y-4">
          <div className="flex items-center space-x-3 p-3 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10">
            <div className="p-2.5 bg-rose-100 dark:bg-rose-900/30 text-rose-600 dark:text-rose-400 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <p className="text-sm font-bold text-slate-800 dark:text-white">{fileData.archivoNombre}</p>
              <p className="text-xs text-slate-500 dark:text-slate-400">Documento PDF • Verificado por el sistema</p>
            </div>
          </div>

          <div className="p-4 bg-blue-50/60 dark:bg-blue-900/10 border border-blue-100 dark:border-blue-900/50 rounded-xl text-xs text-slate-700 dark:text-slate-300 space-y-2">
            <p className="font-bold text-[#1E3A8A] dark:text-blue-400 flex items-center gap-1.5">
              <ShieldAlert className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              Documento Oficial Adjunto por Docente:
            </p>
            <p><strong>Remitente:</strong> {fileData.docente} (DNI: {fileData.dni})</p>
            <p><strong>Asunto:</strong> Justificación de {fileData.tipo} para {fileData.materia}</p>
            <hr className="border-blue-200 dark:border-blue-900/50 my-2" />
            <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl/50 p-3 rounded border border-blue-100 dark:border-blue-900/50 font-mono text-xs text-slate-600 dark:text-slate-400">
              Vista Previa del Documento <br />
              Certificamos que el documento digital presentado cuenta con validez institucional para el trámite de dispensa y justificación de asistencia docente correspondiente al ciclo 2026-I.
            </div>
          </div>
        </div>

        <div className="bg-slate-50 dark:bg-white/5 px-6 py-3 border-t border-slate-200 dark:border-white/10 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 bg-[#1E3A8A] dark:bg-blue-600 hover:bg-blue-800 dark:hover:bg-blue-700 text-white font-semibold text-xs rounded-xl cursor-pointer transition-colors"
          >
            Cerrar Visor
          </button>
        </div>
      </div>
    </div>
  );
}