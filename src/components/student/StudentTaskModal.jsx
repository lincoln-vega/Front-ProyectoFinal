// Modal unificado de detalle, entrega real en Supabase Storage y consulta de nota vigesimal del estudiante
import React, { useEffect, useState } from "react";
import {
  FileText,
  Calendar,
  CheckCircle2,
  AlertCircle,
  X,
  UploadCloud,
  FileCheck,
  Send,
  BookOpen,
  Award,
  Download,
  RefreshCw,
  MessageSquare,
  Loader2,
  User,
  Eye
} from "lucide-react";
import { uploadFileToStorage } from "../../lib/supabase";
import { academicActivitiesService } from "../../services/academicActivitiesService";
import FilePreviewModal from "../shared/FilePreviewModal";

const MAX_DELIVERY_BYTES = 15 * 1024 * 1024; // 15 MB límite real del bucket tareas-entregas
const ALLOWED_EXT_REGEX = /\.(pdf|doc|docx|ppt|pptx|xls|xlsx|zip|png|jpg|jpeg|webp)$/i;

const formatShortDate = (iso) => {
  if (!iso) return null;
  const d = new Date(iso);
  return Number.isNaN(d.getTime())
    ? iso
    : d.toLocaleString("es-PE", { dateStyle: "short", timeStyle: "short" });
};

export default function StudentTaskModal({
  task,
  isOpen,
  onClose,
  onDeliver,
  isReadOnly = false
}) {
  const [selectedFile, setSelectedFile] = useState(null);
  const [comments, setComments] = useState("");
  const [stepStatus, setStepStatus] = useState(""); // "" | "uploading" | "saving"
  const [errorMsg, setErrorMsg] = useState("");
  const [isReplacing, setIsReplacing] = useState(false);
  const [previewTarget, setPreviewTarget] = useState(null);

  useEffect(() => {
    if (isOpen && task) {
      setSelectedFile(null);
      setComments(task.miEntrega?.comentarioAlumno || "");
      setStepStatus("");
      setErrorMsg("");
      setIsReplacing(false);
      setPreviewTarget(null);
    }
  }, [isOpen, task?.id]);

  if (!isOpen || !task) return null;

  const miEntrega = task.miEntrega || null;
  const estado = miEntrega?.estado || task.estadoAlumno || "Por entregar";
  const isCalificado = estado === "Calificado";
  const isObservado = estado === "Observado";
  const isEntregado = estado === "Entregado";
  const hasUploadedFile = Boolean(miEntrega?.archivoUrl || miEntrega?.archivoNombre);

  const canUploadForm =
    !isReadOnly &&
    !isCalificado &&
    (!isEntregado || isReplacing);

  const handleFileChange = (e) => {
    const file = e.target.files?.[0] || null;
    setErrorMsg("");
    if (!file) {
      setSelectedFile(null);
      return;
    }
    if (!ALLOWED_EXT_REGEX.test(file.name)) {
      setErrorMsg("Formato no admitido. Sube un archivo PDF, DOCX, PPTX, XLSX, ZIP, PNG o JPG.");
      e.target.value = "";
      return;
    }
    if (file.size > MAX_DELIVERY_BYTES) {
      setErrorMsg("El archivo supera el límite máximo permitido de 15 MB.");
      e.target.value = "";
      return;
    }
    setSelectedFile(file);
  };

  const handleOpenTeacherGuide = () => {
    setPreviewTarget({
      title: `Guía Docente — ${task.titulo}`,
      subtitle: `${task.curso} • ${task.docente || "Cátedra"}`,
      fileName: task.archivoNombre || "guia_docente.pdf",
      bucket: "materiales-clase",
      path: task.archivoPath,
      fallbackUrl: task.archivoUrl
    });
  };

  const handleOpenMyFile = () => {
    setPreviewTarget({
      title: `Mi Entrega — ${task.titulo}`,
      subtitle: `${task.curso} • Archivo registrado`,
      fileName: miEntrega?.archivoNombre || "mi_entrega.pdf",
      bucket: "tareas-entregas",
      path: miEntrega?.archivoPath,
      fallbackUrl: miEntrega?.archivoUrl
    });
  };

  const handlePreviewLocalSelection = () => {
    if (!selectedFile) return;
    setPreviewTarget({
      title: `Previsualización — ${selectedFile.name}`,
      subtitle: "Verifica tu archivo antes de confirmar la entrega",
      fileName: selectedFile.name,
      localFile: selectedFile
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!canUploadForm) {
      onClose();
      return;
    }
    if (!selectedFile) {
      setErrorMsg("Selecciona primero el archivo de tu solución (PDF, DOCX, ZIP o imagen) antes de entregar.");
      return;
    }

    setErrorMsg("");
    setStepStatus("uploading");
    try {
      const folder = String(task.cursoId || task.curso_id || "general");
      const uploaded = await uploadFileToStorage("tareas-entregas", selectedFile, folder);

      setStepStatus("saving");
      const savedEntrega = await academicActivitiesService.submitTaskDelivery(task.id, {
        archivoPath: uploaded.path,
        archivoUrl: uploaded.url,
        archivoNombre: uploaded.fileName || selectedFile.name,
        tamanoBytes: uploaded.sizeBytes || selectedFile.size,
        comentarioAlumno: comments.trim()
      });

      if (onDeliver) {
        await onDeliver(task.id, savedEntrega);
      }
      onClose();
    } catch (err) {
      setErrorMsg(err.message || "No se pudo completar la entrega. Intenta nuevamente.");
    } finally {
      setStepStatus("");
    }
  };

  const notaNum = miEntrega?.nota !== null && miEntrega?.nota !== undefined ? Number(miEntrega.nota) : null;
  const approvedGrade = notaNum !== null && notaNum >= 11;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/65 backdrop-blur-xs p-4 animate-fade-in overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget && !stepStatus) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-lg w-full flex flex-col max-h-[90vh] overflow-hidden overscroll-contain">
        {/* Cabecera */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/60 dark:bg-white/5">
          <div className="flex items-center space-x-3 min-w-0">
            <div
              className={`p-2.5 rounded-xl shadow-xs shrink-0 ${
                isCalificado
                  ? "bg-indigo-100 dark:bg-indigo-950/70 text-indigo-600 dark:text-indigo-400"
                  : isEntregado
                  ? "bg-emerald-100 dark:bg-emerald-950/60 text-emerald-600 dark:text-emerald-400"
                  : isObservado
                  ? "bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400"
                  : "bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400"
              }`}
            >
              {isCalificado ? (
                <Award className="w-5 h-5" />
              ) : isEntregado ? (
                <CheckCircle2 className="w-5 h-5" />
              ) : (
                <FileText className="w-5 h-5" />
              )}
            </div>
            <div className="min-w-0">
              <div className="flex flex-wrap items-center gap-1.5">
                <span
                  className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                    isCalificado
                      ? "bg-indigo-100 dark:bg-indigo-900/60 text-indigo-800 dark:text-indigo-300"
                      : isEntregado
                      ? "bg-emerald-100 dark:bg-emerald-900/60 text-emerald-800 dark:text-emerald-300"
                      : isObservado
                      ? "bg-rose-100 dark:bg-rose-900/60 text-rose-800 dark:text-rose-300"
                      : "bg-amber-100 dark:bg-amber-900/60 text-amber-800 dark:text-amber-300"
                  }`}
                >
                  {isCalificado
                    ? `Calificado • ${notaNum !== null ? `${notaNum}/20` : "Revisado"}`
                    : isEntregado
                    ? "Entregado • En Revisión"
                    : isObservado
                    ? "Observado • Corregir"
                    : "Pendiente de Entrega"}
                </span>
                <span className="text-[10px] font-bold text-slate-400 uppercase">
                  {task.tipo || "Tarea Calificada"}
                </span>
              </div>
              <h3 className="text-base font-extrabold text-slate-900 dark:text-white mt-1 leading-snug">
                {task.titulo}
              </h3>
            </div>
          </div>
          <button
            type="button"
            disabled={Boolean(stepStatus)}
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Cuerpo */}
        <form onSubmit={handleSubmit} className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {/* Metadatos del curso y docente */}
          <div className="grid grid-cols-2 gap-3 p-3.5 bg-slate-50 dark:bg-white/5 rounded-xl border border-slate-200/60 dark:border-white/10 text-xs">
            <div className="flex items-center gap-2 min-w-0">
              <BookOpen className="w-4 h-4 text-blue-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Curso</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {task.curso || "Asignatura"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0">
              <Calendar className="w-4 h-4 text-amber-500 shrink-0" />
              <div className="min-w-0">
                <p className="text-[10px] font-bold text-slate-400 uppercase">Fecha Límite</p>
                <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                  {task.fechaLimite || "No especificada"}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 min-w-0 col-span-2 pt-2 border-t border-slate-200/60 dark:border-white/10 justify-between">
              <span className="flex items-center gap-1.5 text-slate-600 dark:text-slate-300 truncate">
                <User className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                <span className="truncate">Docente: <strong>{task.docente || "Cátedra"}</strong></span>
              </span>
              <span className="font-extrabold text-indigo-600 dark:text-indigo-400 shrink-0">
                Escala: {task.puntos || "20 pts"}
              </span>
            </div>
          </div>

          {/* Consigna + Guía PDF opcional adjuntada por el docente */}
          <div className="space-y-2">
            <h4 className="text-xs font-bold text-slate-700 dark:text-slate-300">
              Instrucciones de la Asignación:
            </h4>
            <div className="p-3.5 rounded-xl bg-slate-50/70 dark:bg-slate-800/50 border border-slate-200/60 dark:border-white/5 text-xs text-slate-600 dark:text-slate-300 leading-relaxed whitespace-pre-line">
              {task.descripcion || "Desarrolla los ejercicios indicados en clase y adjunta tu resolución completa en PDF."}
            </div>

            {(task.archivoUrl || task.archivoPath) && (
              <button
                type="button"
                onClick={handleOpenTeacherGuide}
                className="w-full flex items-center justify-between gap-2 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800/60 text-blue-700 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/50 transition-colors cursor-pointer text-xs font-bold"
              >
                <span className="flex items-center gap-2 truncate">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">
                    Guía del Docente: {task.archivoNombre || "Descargar enunciado adjunto"}
                  </span>
                </span>
                <span className="inline-flex items-center gap-1 text-[11px] font-extrabold shrink-0">
                  <Eye className="w-3.5 h-3.5" /> Previsualizar
                </span>
              </button>
            )}
          </div>

          {/* 1. TARJETA DE CALIFICACIÓN OFICIAL (CUANDO YA ESTÁ CALIFICADA) */}
          {isCalificado && (
            <div className="p-4 rounded-2xl bg-gradient-to-br from-indigo-50 via-white to-emerald-50/60 dark:from-indigo-950/40 dark:via-slate-900 dark:to-emerald-950/30 border border-indigo-200 dark:border-indigo-800/60 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <span className="text-[10px] font-black uppercase tracking-wider text-indigo-600 dark:text-indigo-400">
                    Calificación Oficial Registrada
                  </span>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    {miEntrega?.calificadoEn
                      ? `Revisado el ${formatShortDate(miEntrega.calificadoEn)}`
                      : "Evaluación revisada por tu docente"}
                  </p>
                </div>
                <div
                  className={`px-3.5 py-2 rounded-2xl border text-right ${
                    approvedGrade
                      ? "bg-emerald-500/15 border-emerald-400/50 text-emerald-700 dark:text-emerald-300"
                      : "bg-rose-500/15 border-rose-400/50 text-rose-700 dark:text-rose-300"
                  }`}
                >
                  <span className="text-xl font-black leading-none">
                    {notaNum !== null ? notaNum.toFixed(notaNum % 1 === 0 ? 0 : 1) : "—"}
                  </span>
                  <span className="text-xs font-bold opacity-80"> / 20</span>
                </div>
              </div>

              {miEntrega?.comentarioDocente && (
                <div className="p-3 rounded-xl bg-white/90 dark:bg-slate-800/80 border border-slate-200/70 dark:border-white/10 text-xs space-y-1">
                  <span className="font-extrabold text-indigo-700 dark:text-indigo-300 flex items-center gap-1.5 text-[11px]">
                    <MessageSquare className="w-3.5 h-3.5" />
                    Retroalimentación del Docente:
                  </span>
                  <p className="text-slate-700 dark:text-slate-200 leading-relaxed">
                    {miEntrega.comentarioDocente}
                  </p>
                </div>
              )}

              {hasUploadedFile && (
                <div className="flex items-center justify-between gap-2 pt-1 text-xs">
                  <span className="text-slate-500 dark:text-slate-400 truncate">
                    Tu archivo: <strong className="text-slate-700 dark:text-slate-200">{miEntrega.archivoNombre}</strong>
                  </span>
                  {(miEntrega.archivoUrl || miEntrega.archivoPath) && (
                    <button
                      type="button"
                      onClick={handleOpenMyFile}
                      className="text-indigo-600 dark:text-indigo-400 hover:underline font-extrabold inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Eye className="w-3.5 h-3.5" /> Previsualizar entrega
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* 2. BANNER DE ENTREGA OBSERVADA (REQUIERE CORRECCIÓN) */}
          {isObservado && (
            <div className="p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/35 border border-rose-200 dark:border-rose-800/60 space-y-2 text-xs">
              <div className="flex items-center gap-2 font-extrabold text-rose-800 dark:text-rose-300">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>Tu docente observó esta entrega para que puedas corregirla</span>
              </div>
              {miEntrega?.comentarioDocente && (
                <p className="text-rose-700 dark:text-rose-200 bg-white/70 dark:bg-slate-900/60 p-2.5 rounded-lg border border-rose-200/60 dark:border-rose-800/40">
                  “{miEntrega.comentarioDocente}”
                </p>
              )}
              {miEntrega?.archivoUrl && (
                <button
                  type="button"
                  onClick={handleOpenMyFile}
                  className="text-[11px] font-bold text-rose-700 dark:text-rose-300 underline inline-flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3" /> Ver versión anterior ({miEntrega.archivoNombre})
                </button>
              )}
            </div>
          )}

          {/* 3. TARJETA DE ENTREGA ENVIADA (PENDIENTE DE CALIFICAR) */}
          {isEntregado && !isReplacing && (
            <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/50 space-y-2.5">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <CheckCircle2 className="w-6 h-6 text-emerald-500 shrink-0" />
                  <div>
                    <p className="text-sm font-extrabold text-emerald-900 dark:text-emerald-300">
                      ¡Solución enviada correctamente!
                    </p>
                    <p className="text-[11px] text-emerald-700 dark:text-emerald-400">
                      {miEntrega?.entregadoEn
                        ? `Registrado el ${formatShortDate(miEntrega.entregadoEn)} • En espera de calificación`
                        : "En espera de revisión por el docente"}
                    </p>
                  </div>
                </div>
              </div>

              {hasUploadedFile && (
                <div className="flex items-center justify-between gap-2 p-2.5 rounded-lg bg-white/80 dark:bg-slate-900/60 border border-emerald-200/70 dark:border-emerald-800/40 text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200 truncate">
                    📄 {miEntrega.archivoNombre}
                  </span>
                  {(miEntrega.archivoUrl || miEntrega.archivoPath) && (
                    <button
                      type="button"
                      onClick={handleOpenMyFile}
                      className="px-2.5 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-[11px] inline-flex items-center gap-1 shrink-0 cursor-pointer"
                    >
                      <Eye className="w-3 h-3" /> Previsualizar
                    </button>
                  )}
                </div>
              )}

              {miEntrega?.comentarioAlumno && (
                <p className="text-[11px] text-slate-600 dark:text-slate-300 italic">
                  Tu comentario: “{miEntrega.comentarioAlumno}”
                </p>
              )}

              {!isReadOnly && (
                <div className="pt-1 flex justify-end">
                  <button
                    type="button"
                    onClick={() => setIsReplacing(true)}
                    className="text-[11px] font-bold text-emerald-800 dark:text-emerald-300 hover:underline inline-flex items-center gap-1 cursor-pointer"
                  >
                    <RefreshCw className="w-3 h-3" /> ¿Subiste el archivo equivocado? Reemplazar entrega
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. MODO HISTORIAL (SOLO LECTURA SIN ENTREGA O BLOQUEADO) */}
          {isReadOnly && !isCalificado && !isEntregado && (
            <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800/50 text-center space-y-1.5">
              <AlertCircle className="w-7 h-7 text-amber-500 mx-auto" />
              <p className="text-xs font-extrabold text-amber-900 dark:text-amber-300">
                Ciclo Concluido — Modo Historial (Solo Lectura)
              </p>
              <p className="text-[11px] text-amber-800 dark:text-amber-400">
                Este periodo académico ya finalizó y no se admiten nuevas entregas de tareas.
              </p>
            </div>
          )}

          {/* 5. FORMULARIO DE SUBIDA REAL A SUPABASE STORAGE */}
          {canUploadForm && (
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                  {isReplacing || isObservado
                    ? "Subir Nueva Versión de tu Solución:"
                    : "Subir Archivo de Solución (PDF, DOCX, ZIP o Imagen):"}
                </label>
                {isReplacing && (
                  <button
                    type="button"
                    onClick={() => {
                      setIsReplacing(false);
                      setSelectedFile(null);
                      setErrorMsg("");
                    }}
                    className="text-[11px] font-bold text-slate-500 hover:text-slate-700 dark:hover:text-slate-200 cursor-pointer"
                  >
                    Cancelar reemplazo
                  </button>
                )}
              </div>

              <div className="border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-xl p-5 text-center cursor-pointer transition-colors bg-slate-50/50 dark:bg-white/5 relative">
                <input
                  type="file"
                  disabled={Boolean(stepStatus)}
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer disabled:cursor-not-allowed"
                  accept=".pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.zip,.png,.jpg,.jpeg,.webp"
                />
                <div className="flex flex-col items-center justify-center space-y-1.5 pointer-events-none">
                  {selectedFile ? (
                    <>
                      <FileCheck className="w-8 h-8 text-emerald-500" />
                      <p className="text-xs font-bold text-emerald-600 dark:text-emerald-400 break-all px-2">
                        {selectedFile.name}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        {(selectedFile.size / 1024).toFixed(1)} KB • Haz clic para elegir otro archivo
                      </p>
                    </>
                  ) : (
                    <>
                      <UploadCloud className="w-8 h-8 text-blue-500" />
                      <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                        Arrastra tu solución aquí o{" "}
                        <span className="text-blue-600 dark:text-blue-400 underline">
                          haz clic para examinar
                        </span>
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Formatos permitidos: PDF, DOCX, ZIP, PNG o JPG • Máx. 15 MB
                      </p>
                    </>
                  )}
                </div>
              </div>

              {selectedFile && (
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={handlePreviewLocalSelection}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 border border-indigo-200 dark:border-indigo-800 text-indigo-700 dark:text-indigo-300 hover:bg-indigo-100 text-xs font-extrabold cursor-pointer transition-colors"
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span>Previsualizar archivo antes de enviar</span>
                  </button>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  Comentario para el Docente (opcional):
                </label>
                <textarea
                  value={comments}
                  disabled={Boolean(stepStatus)}
                  onChange={(e) => setComments(e.target.value)}
                  placeholder="Ej: Adjunto el desarrollo paso a paso de los ejercicios 1 al 15..."
                  rows={2}
                  className="w-full text-xs p-2.5 rounded-xl border border-slate-200 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>
          )}

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-xs font-semibold text-rose-700 dark:text-rose-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Botones inferiores */}
          <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-end gap-2.5">
            <button
              type="button"
              disabled={Boolean(stepStatus)}
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
            >
              Cerrar
            </button>

            {canUploadForm && (
              <button
                type="submit"
                disabled={Boolean(stepStatus)}
                className="px-5 py-2 rounded-xl text-xs font-extrabold bg-blue-600 hover:bg-blue-700 text-white shadow-sm flex items-center gap-1.5 transition-all cursor-pointer disabled:opacity-60"
              >
                {stepStatus ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>
                      {stepStatus === "uploading"
                        ? "Subiendo archivo a Storage..."
                        : "Registrando entrega..."}
                    </span>
                  </>
                ) : (
                  <>
                    <Send className="w-3.5 h-3.5" />
                    <span>{isReplacing || isObservado ? "Actualizar Entrega" : "Entregar Tarea"}</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      </div>

      <FilePreviewModal
        isOpen={Boolean(previewTarget)}
        onClose={() => setPreviewTarget(null)}
        title={previewTarget?.title}
        subtitle={previewTarget?.subtitle}
        fileName={previewTarget?.fileName}
        localFile={previewTarget?.localFile}
        bucket={previewTarget?.bucket}
        path={previewTarget?.path}
        fallbackUrl={previewTarget?.fallbackUrl}
      />
    </div>
  );
}
