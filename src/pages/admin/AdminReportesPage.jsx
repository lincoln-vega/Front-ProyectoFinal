import React from "react";
import { BarChart3 } from "lucide-react";

export default function AdminReportesPage() {
  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-slate-800 dark:text-white">Métricas y Reportes</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">Análisis de datos e informes</p>
        </div>
      </div>
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-white/40 dark:border-white/10 p-8 rounded-3xl shadow-2xl flex flex-col items-center justify-center min-h-[400px]">
        <BarChart3 className="w-16 h-16 text-slate-400 dark:text-slate-500 mb-4" />
        <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Módulo en Construcción</h3>
        <p className="text-slate-500 dark:text-slate-400 mt-2 text-center max-w-md">
          Este módulo está planeado para la siguiente fase del proyecto (SCRM).
        </p>
      </div>
    </div>
  );
}
