import React from 'react';
import { NavLink } from 'react-router-dom';

export default function SidebarProfesor() {
  return (
    <aside className="w-64 bg-slate-900 border-r border-slate-800 flex flex-col h-full">
      {/* Encabezado del Menú */}
      <div className="p-6 border-b border-slate-800">
        <h2 className="text-xl font-bold text-white">AM Academy</h2>
        <p className="text-xs text-slate-400">Panel de Docente</p>
      </div>

      {/* Menú de Navegación Principal */}
      <nav className="flex-1 p-4 space-y-2">
        <NavLink
          to="/docente/panel"
          className={({ isActive }) =>
            `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          Panel Principal
        </NavLink>

        <NavLink
          to="/docente/cursos"
          className={({ isActive }) =>
            `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          Cursos
        </NavLink>

        <NavLink
          to="/docente/asistencia"
          className={({ isActive }) =>
            `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          Asistencia
        </NavLink>

        <NavLink
          to="/docente/programacion"
          className={({ isActive }) =>
            `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          Programación
        </NavLink>

        <NavLink
          to="/docente/perfil"
          className={({ isActive }) =>
            `block px-4 py-2.5 rounded-lg text-sm font-medium transition-colors ${
              isActive ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:bg-slate-800 hover:text-white'
            }`
          }
        >
          Perfil
        </NavLink>
      </nav>
    </aside>
  );
}