import React, { useState, useEffect } from "react";
import {
  MessageSquare,
  X,
  Send,
  User,
  CheckCircle2,
  Clock,
  BookOpen,
  GraduationCap,
  Sparkles,
  Filter
} from "lucide-react";
import { chatAcademicService } from "../../services/chatAcademicService";

export default function DocenteChatModal({
  isOpen,
  onClose,
  docenteName = "Docente Titular",
  docenteId = "DOC-TITULAR",
  docenteEmail = "",
  targetMessageId = null
}) {
  const [filter, setFilter] = useState("todos"); // "todos" | "pendientes" | "respondidos"
  const [messages, setMessages] = useState([]);
  const [replyText, setReplyText] = useState({});
  const [sendingId, setSendingId] = useState(null);

  useEffect(() => {
    if (!isOpen) return;

    if (targetMessageId) {
      setFilter("todos");
    }

    const refreshFromCache = () => {
      const teacherMsgs = chatAcademicService.getMessagesForTeacher(
        docenteId,
        docenteName,
        docenteEmail
      );
      setMessages(teacherMsgs);
    };

    chatAcademicService.fetchMessages().then(refreshFromCache);
    window.addEventListener("storage", refreshFromCache);
    return () => window.removeEventListener("storage", refreshFromCache);
  }, [isOpen, docenteId, docenteName, docenteEmail, targetMessageId]);

  // Bloquear el scroll del fondo mientras el modal está abierto
  useEffect(() => {
    if (!isOpen) return;
    const originalOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = originalOverflow;
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const handleSendReply = (messageId) => {
    const text = replyText[messageId];
    if (!text || !text.trim()) {
      alert("Por favor escribe una respuesta antes de enviar.");
      return;
    }

    setSendingId(messageId);
    try {
      chatAcademicService.replyMessage(messageId, text, docenteName);
      setReplyText((prev) => ({ ...prev, [messageId]: "" }));
      const updated = chatAcademicService.getMessagesForTeacher(
        docenteId,
        docenteName,
        docenteEmail
      );
      setMessages(updated);
    } catch (err) {
      alert("Error al enviar respuesta: " + err.message);
    } finally {
      setSendingId(null);
    }
  };

  const filteredMessages = messages.filter((m) => {
    if (filter === "pendientes") return m.estado === "Pendiente";
    if (filter === "respondidos") return m.estado === "Respondido";
    return true;
  });

  const pendientesCount = messages.filter((m) => m.estado === "Pendiente").length;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/60 backdrop-blur-xs p-4 animate-fade-in overscroll-contain"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 max-w-2xl w-full flex flex-col max-h-[90vh] overflow-hidden overscroll-contain">
        
        {/* ENCABEZADO DEL MODAL */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-slate-50/50 dark:bg-white/5">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 rounded-xl shadow-xs">
              <MessageSquare className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white">
                  Consultas y Tutoría con Estudiantes
                </h3>
                {pendientesCount > 0 && (
                  <span className="text-[10px] font-extrabold px-2 py-0.5 rounded-full bg-amber-500 text-slate-950 animate-pulse">
                    {pendientesCount} por responder
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Atiende las dudas académicas formuladas por tus estudiantes matriculados
              </p>
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

        {/* BARRA DE FILTROS */}
        <div className="px-5 py-3 border-b border-slate-100 dark:border-white/10 flex items-center justify-between shrink-0 bg-white dark:bg-slate-900">
          <div className="flex items-center gap-1.5">
            {[
              { id: "todos", label: "Todas las consultas" },
              { id: "pendientes", label: `Pendientes (${pendientesCount})` },
              { id: "respondidos", label: "Respondidas" }
            ].map((f) => (
              <button
                key={f.id}
                type="button"
                onClick={() => setFilter(f.id)}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                  filter === f.id
                    ? "bg-blue-600 text-white shadow-xs"
                    : "text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-white/5"
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Docente: {docenteName}
          </span>
        </div>

        {/* LISTADO DE MENSAJES DE ESTUDIANTES */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1 overscroll-contain">
          {filteredMessages.length === 0 ? (
            <div className="text-center py-12 text-slate-400 space-y-2">
              <MessageSquare className="w-8 h-8 mx-auto opacity-30" />
              <p className="text-sm font-semibold">No hay consultas en esta sección.</p>
              <p className="text-xs">Los mensajes de tus alumnos matriculados aparecerán aquí en tiempo real.</p>
            </div>
          ) : (
            filteredMessages.map((msg) => {
              const isTargeted = targetMessageId && String(msg.id) === String(targetMessageId);
              return (
              <div
                key={msg.id}
                id={`chat-msg-${msg.id}`}
                className={`p-4 rounded-xl border space-y-3 transition-all ${
                  isTargeted
                    ? "border-blue-500 ring-2 ring-blue-500/30 bg-blue-50/40 dark:bg-blue-950/20"
                    : "border-slate-200/90 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 hover:border-blue-300 dark:hover:border-blue-700/60"
                }`}
              >
                {/* Cabecera del Mensaje */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center space-x-2.5 min-w-0">
                    <div className="w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-black flex items-center justify-center shrink-0 shadow-xs">
                      {msg.estudianteNombre
                        .split(" ")
                        .filter(Boolean)
                        .slice(0, 2)
                        .map((w) => w[0].toUpperCase())
                        .join("")}
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-xs font-extrabold text-slate-900 dark:text-white truncate">
                        {msg.estudianteNombre}
                      </h4>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 flex items-center gap-1.5 flex-wrap">
                        <span className="inline-flex items-center gap-1 text-indigo-600 dark:text-indigo-400 font-bold">
                          <GraduationCap className="w-3 h-3" />
                          {msg.estudianteCarrera}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 font-medium">
                          <BookOpen className="w-3 h-3 text-slate-400" />
                          {msg.curso}
                        </span>
                      </p>
                    </div>
                  </div>

                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border shrink-0 ${
                      msg.estado === "Pendiente"
                        ? "bg-amber-100 dark:bg-amber-950/50 text-amber-800 dark:text-amber-300 border-amber-300"
                        : "bg-emerald-100 dark:bg-emerald-950/50 text-emerald-800 dark:text-emerald-300 border-emerald-300"
                    }`}
                  >
                    {msg.estado}
                  </span>
                </div>

                {/* Contenido de la Consulta */}
                <div className="p-3 bg-white dark:bg-slate-800/80 rounded-xl border border-slate-200/60 dark:border-white/5 text-xs text-slate-800 dark:text-slate-200 leading-relaxed shadow-2xs">
                  {msg.mensaje}
                  <span className="text-[10px] text-slate-400 font-mono block mt-1.5 text-right">
                    {msg.fecha}
                  </span>
                </div>

                {/* Respuesta ya enviada (si existe) */}
                {msg.respuesta ? (
                  <div className="ml-4 p-3 bg-blue-50 dark:bg-blue-950/30 rounded-xl border border-blue-200 dark:border-blue-900/50 space-y-1">
                    <div className="flex items-center justify-between text-[11px] font-bold text-blue-700 dark:text-blue-300">
                      <span className="flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
                        Tu respuesta enviada
                      </span>
                      <span className="text-[10px] font-mono text-slate-400">
                        {msg.fechaRespuesta}
                      </span>
                    </div>
                    <p className="text-xs text-slate-700 dark:text-slate-200">
                      {msg.respuesta}
                    </p>
                  </div>
                ) : (
                  /* Formulario de Respuesta para consultas pendientes */
                  <div className="space-y-2 pt-1">
                    <textarea
                      rows={2}
                      value={replyText[msg.id] || ""}
                      onChange={(e) =>
                        setReplyText({ ...replyText, [msg.id]: e.target.value })
                      }
                      placeholder="Escribe aquí tu respuesta pedagógica o aclaración para el estudiante..."
                      className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-white/10 bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-100 text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden"
                    />
                    <div className="flex justify-end">
                      <button
                        type="button"
                        disabled={sendingId === msg.id}
                        onClick={() => handleSendReply(msg.id)}
                        className="px-3.5 py-1.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-xs font-bold shadow-xs flex items-center gap-1.5 cursor-pointer disabled:opacity-50"
                      >
                        <Send className="w-3.5 h-3.5" />
                        <span>{sendingId === msg.id ? "Enviando..." : "Responder al Alumno"}</span>
                      </button>
                    </div>
                  </div>
                )}
              </div>
              );
            })
          )}
        </div>

        {/* FOOTER */}
        <div className="p-4 border-t border-slate-100 dark:border-white/10 flex justify-end bg-slate-50/50 dark:bg-white/5 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 dark:bg-white/10 text-slate-700 dark:text-slate-200 text-xs font-bold hover:bg-slate-300 dark:hover:bg-white/20 cursor-pointer"
          >
            Cerrar Ventana
          </button>
        </div>

      </div>
    </div>
  );
}
