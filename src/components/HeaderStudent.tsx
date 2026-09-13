import React from "react";
import { Sparkles } from "lucide-react";

export default function HeaderStudent({ studentName }) {
  return (
    <div className="bg-gradient-to-r from-[#1E3A8A] via-blue-900 to-indigo-900 rounded-2xl p-6 sm:p-8 text-white shadow-lg relative overflow-hidden">
      <div className="absolute right-0 top-0 translate-x-10 -translate-y-10 w-64 h-64 bg-white/5 rounded-full blur-2xl pointer-events-none" />
      <div className="relative z-10">
        <div className="inline-flex items-center space-x-2 px-3 py-1 rounded-full bg-blue-500/20 text-blue-200 border border-blue-400/30 text-xs font-semibold mb-3">
          <Sparkles className="w-3.5 h-3.5 text-amber-300" />
          <span>Panel del Estudiante • SCRM-30</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
          ¡Hola, {studentName}! 🚀
        </h1>
        <p className="text-blue-100 text-sm sm:text-base mt-2 max-w-2xl leading-relaxed">
          Bienvenido a tu plataforma de preparación preuniversitaria. Revisa tus asignaturas del día, únete a tus salas virtuales de Meet y monitorea tu registro de asistencia.
        </p>

        <div className="mt-6 flex flex-wrap gap-4 text-xs">
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
            <span className="text-blue-200 block">Ciclo Académico:</span>
            <strong className="text-white text-sm">Anual San Marcos 2026</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
            <span className="text-blue-200 block">Meta Universitaria:</span>
            <strong className="text-white text-sm">Medicina Humana (UNMSM)</strong>
          </div>
          <div className="bg-white/10 backdrop-blur-md px-3.5 py-2 rounded-xl border border-white/15">
            <span className="text-blue-200 block">Puntualidad General:</span>
            <strong className="text-emerald-300 text-sm">92.5% de Asistencia</strong>
          </div>
        </div>
      </div>
    </div>
  );
}