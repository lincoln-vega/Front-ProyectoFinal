import React from 'react';
import { Outlet } from 'react-router-dom';
import SidebarProfesor from './SidebarProfesor';
import HeaderProfesor from './HeaderProfesor'; // 1. Importas tu header

export default function ProfesorLayout() {
  return (
    <div className="flex h-screen bg-slate-950 text-white overflow-hidden">
      {/* Sidebar fijo a la izquierda */}
      <SidebarProfesor />

      {/* Contenedor derecho que apila el Header y el contenido */}
      <div className="flex-1 flex flex-col min-w-0">
        
        {/* 2. El Header se queda fijo arriba en todas las subrutas */}
        <HeaderProfesor 
          userName="Dra. Elena Ramírez" 
          userRole="Docente Principal" 
        />

        {/* 3. El contenido de cada vista se renderiza aquí y hace scroll de forma independiente */}
        <main className="flex-1 overflow-y-auto p-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
}