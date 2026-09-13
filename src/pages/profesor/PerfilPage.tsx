import React, { useState } from 'react';

export const PerfilView: React.FC = () => {
  const [tabActiva, setTabActiva] = useState<'datos' | 'seguridad' | 'notificaciones'>('datos');

  // Estado formulario datos personales
  const [perfil, setPerfil] = useState({
    nombre: 'Dra. Elena Ramírez',
    email: 'elena.ramirez@academy.edu',
    telefono: '+51 987 654 321',
    especialidad: 'Matemática Aplicada & Cálculo',
    departamento: 'Ingeniería y Ciencias Básicas',
  });

  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Header Perfil */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-14 h-14 rounded-full bg-indigo-600 text-white font-bold text-lg flex items-center justify-center shrink-0 shadow-md">
            ER
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">{perfil.nombre}</h2>
            <p className="text-xs text-slate-400 mt-0.5">Docente Principal • Campus Virtual</p>
            <span className="inline-flex items-center space-x-1.5 mt-2 px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/50">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50"></span>
              <span>Cuenta Activa</span>
            </span>
          </div>
        </div>
        <button
          type="button"
          className="px-4 py-2 bg-indigo-600 hover:bg-indigo-750 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm self-start sm:self-auto"
        >
          Guardar Cambios
        </button>
      </div>

      {/* Navegación por pestañas */}
      <div className="flex border-b border-slate-800 gap-2 overflow-x-auto">
        <button
          type="button"
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            tabActiva === 'datos'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setTabActiva('datos')}
        >
          👤 Información Personal
        </button>
        <button
          type="button"
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            tabActiva === 'seguridad'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setTabActiva('seguridad')}
        >
          🔒 Seguridad & Contraseña
        </button>
        <button
          type="button"
          className={`px-4 py-3 text-xs font-semibold border-b-2 transition-colors cursor-pointer whitespace-nowrap ${
            tabActiva === 'notificaciones'
              ? 'border-indigo-500 text-indigo-400 bg-slate-900/50 rounded-t-lg'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setTabActiva('notificaciones')}
        >
          🔔 Preferencias
        </button>
      </div>

      {/* Contenido según pestaña */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm p-6">
        {tabActiva === 'datos' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Datos Académicos y de Contacto
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Nombre Completo</label>
                <input
                  type="text"
                  value={perfil.nombre}
                  onChange={(e) => setPerfil({ ...perfil, nombre: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Correo Institucional</label>
                <input
                  type="email"
                  value={perfil.email}
                  onChange={(e) => setPerfil({ ...perfil, email: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Teléfono de Contacto</label>
                <input
                  type="text"
                  value={perfil.telefono}
                  onChange={(e) => setPerfil({ ...perfil, telefono: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors font-mono"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Especialidad / Áreas</label>
                <input
                  type="text"
                  value={perfil.especialidad}
                  onChange={(e) => setPerfil({ ...perfil, especialidad: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>

              <div className="space-y-1.5 sm:col-span-2">
                <label className="text-xs font-medium text-slate-300">Departamento Académico</label>
                <input
                  type="text"
                  value={perfil.departamento}
                  onChange={(e) => setPerfil({ ...perfil, departamento: e.target.value })}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'seguridad' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Cambiar Contraseña
            </h3>
            <div className="max-w-md space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Contraseña Actual</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Mínimo 8 caracteres"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-300">Confirmar Nueva Contraseña</label>
                <input
                  type="password"
                  placeholder="Repite la nueva contraseña"
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
                />
              </div>
            </div>
          </div>
        )}

        {tabActiva === 'notificaciones' && (
          <div className="space-y-5">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider border-b border-slate-800 pb-3">
              Notificaciones del Sistema
            </h3>
            <div className="space-y-4">
              <label className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <strong className="text-xs font-bold text-white block">Avisos de entregas de estudiantes</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5">Recibir alertas cuando los alumnos suban tareas a la plataforma.</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  defaultChecked
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <strong className="text-xs font-bold text-white block">Recordatorios de clases virtuales</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5">Alertas 15 minutos antes del inicio de la sesión en vivo.</p>
                </div>
              </label>

              <label className="flex items-start space-x-3 p-3 rounded-lg hover:bg-slate-800/40 transition-colors cursor-pointer">
                <input
                  type="checkbox"
                  className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-950 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                />
                <div>
                  <strong className="text-xs font-bold text-white block">Resumen semanal al correo</strong>
                  <p className="text-[11px] text-slate-400 mt-0.5">Informe automático con métricas de asistencia y rendimiento.</p>
                </div>
              </label>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PerfilView;