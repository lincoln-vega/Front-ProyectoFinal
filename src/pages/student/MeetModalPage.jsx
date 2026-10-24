import { saveAttendanceRecord } from '../../services/asistencia';
import React from "react";
import { Video, ExternalLink } from "lucide-react";

export default function MeetModalPage({ course, onClose }) {
  if (!course) return null;

  const handleOpenMeet = async () => {
    const now = new Date();
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');

    const usuarioActual = localStorage.getItem("userName") || "Estudiante";
    const userId = localStorage.getItem("userId") || "USR-005";

    try {
      await saveAttendanceRecord({
        cursoId: course.id || course.cursoId || "CRS-001",
        curso: course.materia || course.nombre || "Clase Virtual",
        docente: course.docente || "Docente a cargo",
        docenteId: course.docenteId || "USR-002",
        estudianteId: userId,
        estudiante: usuarioActual,
        horaRegistro: `${hours}:${minutes}`
      });
      console.log("[InsForge] Asistencia registrada exitosamente en backend para:", usuarioActual);
    } catch (err) {
      console.error("[InsForge] Error al registrar asistencia:", err);
    }

    onClose();
    window.open(course.meetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fade-in text-center p-6 space-y-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
          <Video className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-xl font-bold text-slate-900">
            Conectando a Sala Virtual
          </h3>
          <p className="text-base font-bold text-[#1E3A8A] mt-1">
            {course.materia}
          </p>
          <p className="text-sm text-slate-600 mt-2">
            Docente a cargo: <strong className="text-slate-900">{course.docente}</strong>
          </p>
          <p className="text-sm text-slate-600">
            Horario: {course.horario}
          </p>
        </div>

        <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-200 text-sm font-mono text-slate-700 flex items-center justify-between">
          <span className="truncate mr-2">{course.meetUrl}</span>
          <span className="text-xs bg-emerald-600 text-white font-sans px-2.5 py-1 rounded-md font-bold shrink-0">
            Activa
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-3">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-3 px-4 border border-slate-300 text-slate-700 font-semibold rounded-xl text-sm hover:bg-slate-50 cursor-pointer"
          >
            Regresar al Panel
          </button>
          
          <button
            type="button"
            onClick={handleOpenMeet}
            className="w-full py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl text-sm flex items-center justify-center space-x-2 shadow-md cursor-pointer"
          >
            <span>Abrir Google Meet</span>
            <ExternalLink className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}