import React, { useState } from "react";
import {
  FileText,
  Calendar,
  Clock,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  FileCheck,
  Send,
  BookOpen,
  User
} from "lucide-react";

export default function StudentTaskModal({ task, isOpen, onClose, onDeliver, isReadOnly = false }) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comments, setComments] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen || !task) return null;

  const isDelivered = task.estado === "Entregado";

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isDelivered) {
      onClose();
      return;
    }

    setIsSubmitting(true);
    try {
      await onDeliver(task.id, {
        fileName: selectedFile ? selectedFile.name : "archivo_adjunto.pdf",
        comentario: comments
      });
      onClose();
    } catch (err) {
      console.error("Error al entregar tarea:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

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
            <div className={`p-2.5 rounded-xl shadow-xs ${
              isDelivered
                ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
            }`}>
              {isDelivered ? <CheckCircle2 className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2 py-0.5 rounded-full ${
                isDelivered
                  ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                  : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
              }`}>
                {isDelivered ? "Tarea Entregada" : "Pendiente de Entrega"}
              </span>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1">
                {task.titulo}
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

        {/* Cuerpo / Detalles */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {/* Metadatos */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 text-xs">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Curso</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">{task.curso || "Asignatura"}</p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <div>
                <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha Límite</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200">{task.fechaLimite || "No especificada"}</p>
              </div>
            </div>
          </div>

          {/* Consigna / Descripción */}
          <div className="space-y-1.5">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Instrucciones de la Asignación:
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
              {task.descripcion || "Por favor elabora y sube la solución a los ejercicios propuestos en la sesión de clase."}
            </div>
          </div>

          {/* Zona de Entrega */}
          {isDelivered ? (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/40 text-center space-y-1.5">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-bold text-emerald-900 dark:text-emerald-300">
                ¡Esta tarea ya fue entregada!
              </p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">
                Tu archivo está registrado en el sistema y se encuentra a la espera de calificación por parte del docente.
              </p>
            </div>
          ) : isReadOnly ? (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center space-y-1.5">
              <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
              <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300">
                Ciclo Concluido — Modo Historial (Solo Lectura)
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400">
                Este periodo académico ya finalizó, por lo que no se reciben nuevas entregas de tareas.
              </p>
            </div>
          ) : (
            <div className="space-y-3 pt-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                Subir Archivo de Solución (PDF, DOCX o ZIP):
              </label>
              
              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/5 relative">
                <input
                  type="file"
                  onChange={(e) => setSelectedFile(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  accept=".pdf,.doc,.docx,.zip,.rar,.png,.jpg"
                />
                <div className="flex flex-col items-center justify-center space-y-2 pointer-events-none">
                  {selectedFile ? (
                    <>
                      <FileCheck className="w-8 h-8 text-emerald-500" />
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Clic para cambiar archivo
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-blue-500" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Arrastra tu archivo aquí o <span className="text-blue-600 dark:text-blue-400 underline">haz clic para examinar</span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Tamaño máximo recomendado: 25 MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Nota o Comentario para el Profesor (opcional):
                </label>
                <textarea
                  value={comments}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Escribe alguna observación o duda sobre tu solución..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {/* Botones de acción */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {!isDelivered && !isReadOnly && (
              <button
                type="submit"
                disabled={isSubmitting}
                className="px-5 py-2 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                <span>{isSubmitting ? "Enviando..." : "Entregar Tarea"}</span>
              </button>
            )}
          </div>
        </form>
      </div>
    </div>
  );
}
