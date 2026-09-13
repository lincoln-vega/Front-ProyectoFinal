import React from "react";
import { Video, ExternalLink } from "lucide-react";

export default function MeetModalPage({ course, onClose }) {
  if (!course) return null;

  const handleOpenMeet = () => {
    const now = new Date();
    
    // 1. Formato de fecha desglosado
    const day = String(now.getDate()).padStart(2, '0');
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const year = now.getFullYear();
    
    // 2. Formato de hora en 24 horas desglosado
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');

    // Obtener el usuario actual
    const usuarioActual = localStorage.getItem("userName") || "Juan Carlos Flores";

    // 3. Crear el objeto con la estructura exacta que necesitas
    const nuevoRegistroAsistencia = {
      usuario: usuarioActual,
      curso: course.materia,
      docente: course.docente,
      fecha: {
        dia: day,
        mes: month,
        anio: year,
        formatoCompleto: `${day}/${month}/${year}`
      },
      tiempo: {
        horas: hours,
        minutos: minutes,
        segundos: seconds,
        formatoCompleto: `${hours}:${minutes}:${seconds}`
      },
      timestamp: now.getTime()
    };

    console.log("[ACCESO MEET] Registrando asistencia:", nuevoRegistroAsistencia);

    // 4. Guardar en localStorage
    const asistenciasGuardadas = JSON.parse(localStorage.getItem("db_studentAttendance_extra") || "[]");
    asistenciasGuardadas.unshift(nuevoRegistroAsistencia);
    localStorage.setItem("db_studentAttendance_extra", JSON.stringify(asistenciasGuardadas));

    // 5. Cerrar modal
    onClose();

    // 6. Abrir Google Meet en una pestaña nueva
    window.open(course.meetUrl, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full border border-slate-200 overflow-hidden animate-fade-in text-center p-6 space-y-4">
        <div className="w-14 h-14 bg-emerald-100 rounded-full flex items-center justify-center mx-auto text-emerald-700">
          <Video className="w-7 h-7" />
        </div>

        <div>
          <h3 className="text-lg font-bold text-slate-900">
            Conectando a Sala Virtual
          </h3>
          <p className="text-sm font-semibold text-[#1E3A8A] mt-1">
            {course.materia}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Docente a cargo: <strong>{course.docente}</strong>
          </p>
          <p className="text-xs text-slate-500">
            Horario: {course.horario}
          </p>
        </div>

        <div className="bg-slate-50 p-3 rounded-xl border border-slate-200 text-xs font-mono text-slate-600 flex items-center justify-between">
          <span className="truncate mr-2">{course.meetUrl}</span>
          <span className="text-[10px] bg-emerald-600 text-white font-sans px-2 py-0.5 rounded font-bold shrink-0">
            Activa
          </span>
        </div>

        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <button
            type="button"
            onClick={onClose}
            className="w-full py-2.5 px-4 border border-slate-300 text-slate-700 font-medium rounded-xl text-xs hover:bg-slate-50 cursor-pointer"
          >
            Regresar al Panel
          </button>
          
          <button
            type="button"
            onClick={handleOpenMeet}
            className="w-full py-2.5 px-4 bg-emerald-600 hover:bg-emerald-705 text-white font-bold rounded-xl text-xs flex items-center justify-center space-x-1.5 shadow-md cursor-pointer"
          >
            <span>Abrir Google Meet</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
}