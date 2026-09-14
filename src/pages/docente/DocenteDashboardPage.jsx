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
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs">
        <h2 className="text-2xl font-bold text-slate-800">¡Bienvenido(a), {userName}!</h2>
        <p className="text-sm text-slate-500 mt-1">
          Este es tu panel de control principal. Aquí podrás ver un resumen de tus clases, nómina e incidencias.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-blue-100 rounded-lg text-blue-600"><BookOpen className="w-6 h-6"/></div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Cursos Asignados</p>
            <p className="text-xl font-bold text-slate-800">3</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-emerald-100 rounded-lg text-emerald-600"><Users className="w-6 h-6"/></div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Total Estudiantes</p>
            <p className="text-xl font-bold text-slate-800">120</p>
          </div>
        </div>
        <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-xs flex items-center space-x-4">
          <div className="p-3 bg-amber-100 rounded-lg text-amber-600"><AlertCircle className="w-6 h-6"/></div>
          <div>
            <p className="text-xs font-semibold text-slate-500">Incidencias</p>
            <p className="text-xl font-bold text-slate-800">{docenteData ? docenteData.incidencias.length : 0}</p>
          </div>
        </div>
      </div>

      {docenteData && (
        <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-xs">
          <h3 className="font-bold text-lg text-slate-800 mb-4">Información de Nómina e Incidencias</h3>
          <div className="space-y-4">
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Especialidad</span>
              <span className="font-semibold">{docenteData.especialidad}</span>
            </div>
            <div className="flex justify-between items-center py-2 border-b border-slate-100">
              <span className="text-slate-600 font-medium">Nómina Base (S/)</span>
              <span className="font-bold text-emerald-600">S/ {docenteData.salario.toFixed(2)}</span>
            </div>
            <div className="py-2">
              <span className="text-slate-600 font-medium mb-2 block">Historial de Incidencias:</span>
              {docenteData.incidencias.length > 0 ? (
                <ul className="space-y-2">
                  {docenteData.incidencias.map(inc => (
                    <li key={inc.id} className="p-3 bg-amber-50 border border-amber-100 rounded text-sm text-amber-800">
                      <strong>{inc.fecha}:</strong> {inc.descripcion}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-sm text-slate-400 italic">No tienes incidencias registradas.</p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
