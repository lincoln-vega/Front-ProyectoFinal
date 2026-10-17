import React, { useEffect, useState } from "react";
import { BookOpen, Calendar, Users, AlertCircle } from "lucide-react";

export default function DocenteDashboardPage() {
  const userName = localStorage.getItem("userName") || "Docente";
  const [docenteData, setDocenteData] = useState(null);

  useEffect(() => {
    // Buscar la data del docente en localStorage basado en el nombre (como demo)
    const stored = localStorage.getItem("docentesData");
    if (stored) {
      const docentes = JSON.parse(stored);
      const mine = docentes.find(d => d.nombre === userName);
      if (mine) setDocenteData(mine);
    }
  }, [userName]);

  return (
    <div className="space-y-6">
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-white">¡Bienvenido(a), {userName}!</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Este es tu panel de control principal. Aquí podrás ver un resumen de tus clases, nómina e incidencias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-lg text-blue-600 dark:text-blue-400"><BookOpen className="w-6 h-6"/></div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Cursos Asignados</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">3</p>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/30 rounded-lg text-emerald-600 dark:text-emerald-400"><Users className="w-6 h-6"/></div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Total Estudiantes</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">120</p>
          </div>
        </div>
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-100 dark:bg-amber-900/30 rounded-lg text-amber-600 dark:text-amber-400"><AlertCircle className="w-6 h-6"/></div>
          <div>
            <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">Incidencias</p>
            <p className="text-2xl font-bold text-slate-800 dark:text-white">{docenteData ? docenteData.incidencias.length : 0}</p>
          </div>
        </div>
      </div>

      {docenteData && (
        <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-6 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs">
          <h3 className="font-bold text-lg text-slate-800 dark:text-white mb-4">Información de Nómina e Incidencias</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Especialidad</span>
              <span className="font-semibold dark:text-slate-200">{docenteData.especialidad}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100 dark:border-white/5">
              <span className="text-slate-600 dark:text-slate-400 font-medium">Nómina Base (S/)</span>
              <span className="font-bold text-emerald-600 dark:text-emerald-400">S/ {docenteData.salario.toFixed(2)}</span>
            </div>
            <div className="py-2">
              <span className="text-slate-600 dark:text-slate-400 font-medium mb-2 block">Historial de Incidencias:</span>
              {docenteData.incidencias.length > 0 ? (
                <ul className="space-y-2">
                  {docenteData.incidencias.map(inc => (
                    <li key={inc.id} className="p-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-100 dark:border-amber-900/30 rounded text-sm text-amber-800 dark:text-amber-400">
                      <strong>{inc.fecha}:</strong> {inc.descripcion}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 dark:text-slate-500 italic">No tienes incidencias registradas.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
