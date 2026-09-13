import React from 'react';
import { useNavigate } from 'react-router-dom';

interface HeaderProfesorProps {
  title?: string;
  userName?: string;
  userRole?: string;
}

export default function HeaderProfesor({ 
  title = 'Panel Académico', 
  userName = 'Dra. Elena Ramírez', 
  userRole = 'Docente Principal' 
}: HeaderProfesorProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    // Aquí puedes limpiar tokens de autenticación o localStorage si usas:
    // localStorage.removeItem('token');
    navigate('/login'); // Redirige a la ruta de inicio de sesión
  };

  return (
    <header className="h-16 bg-slate-900 border-b border-slate-800 px-6 flex items-center justify-between sticky top-0 z-30 shadow-sm">
      
      {/* Izquierda: Título o sección actual */}
      <div className="flex items-center space-x-3">
        <h1 className="text-sm font-bold text-white tracking-wide">{title}</h1>
      </div>

      {/* Derecha: Acciones, notificaciones, perfil y cerrar sesión */}
      <div className="flex items-center space-x-4">
        
        {/* Botón de Notificaciones */}
        <button
          type="button"
          className="relative p-2 text-slate-400 hover:text-white bg-slate-800/50 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-colors cursor-pointer"
          title="Notificaciones"
        >
          <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-indigo-500 rounded-full ring-2 ring-slate-900"></span>
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
          </svg>
        </button>

        {/* Separador vertical */}
        <div className="h-6 w-px bg-slate-800"></div>

        {/* Perfil del profesor */}
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-full bg-indigo-600 text-white font-bold text-xs flex items-center justify-center shadow-sm">
            {userName.split(' ').map(n => n[0]).join('').substring(0, 2)}
          </div>
          <div className="hidden md:block text-left">
            <strong className="text-xs font-semibold text-white block leading-none">{userName}</strong>
            <span className="text-[10px] text-slate-400 mt-1 block">{userRole}</span>
          </div>
        </div>

        {/* Separador vertical */}
        <div className="h-6 w-px bg-slate-800"></div>

        {/* Botón Cerrar Sesión */}
        <button
          type="button"
          onClick={handleLogout}
          className="p-2 text-slate-400 hover:text-rose-400 bg-slate-800/50 hover:bg-rose-950/30 border border-slate-700/60 hover:border-rose-800/50 rounded-lg transition-colors cursor-pointer"
          title="Cerrar Sesión"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
          </svg>
        </button>

      </div>
    </header>
  );
}