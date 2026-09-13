import React, { useState } from 'react';
import CursoDetalleView from './CursoDetallePage';

interface Curso {
  id: string;
  nombre: string;
  codigo: string;
  modalidad: string;
  profesor: string;
  inscritos: number;
  capacidad: number;
  horario: string;
  estado: 'Publicado' | 'Borrador';
}

export default function CursosProfesorPage() {
  const [cursoSeleccionado, setCursoSeleccionado] = useState<Curso | null>(null);

  const listaCursos: Curso[] = [
    {
      id: '1',
      nombre: 'Introducción al Cálculo Avanzado',
      codigo: 'MAT-301',
      modalidad: 'Semestre A',
      profesor: 'Dra. Elena Ramírez',
      inscritos: 45,
      capacidad: 50,
      horario: 'Mar/Jue',
      estado: 'Publicado'
    },
    {
      id: '2',
      nombre: 'Desarrollo Web Full Stack',
      codigo: 'CS-405',
      modalidad: 'Bootcamp',
      profesor: 'Ing. Carlos Mendoza',
      inscritos: 0,
      capacidad: 30,
      horario: 'Por definir',
      estado: 'Borrador'
    },
    {
      id: '3',
      nombre: 'Historia Contemporánea',
      codigo: 'HUM-102',
      modalidad: 'Semestre B',
      profesor: 'Lic. Sofía Bernal',
      inscritos: 120,
      capacidad: 150,
      horario: 'Lun/Mie/Vie',
      estado: 'Publicado'
    }
  ];

  if (cursoSeleccionado) {
    return (
      <CursoDetalleView
        cursoId={cursoSeleccionado.id}
        onVolver={() => setCursoSeleccionado(null)}
      />
    );
  }

  return (
    <div className="space-y-6 text-slate-100">
      {/* Cabecera */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-white">Gestión de Cursos</h2>
          <p className="text-xs text-slate-400 mt-1">
            Administra los cursos, modalidades y asignaciones docentes de la plataforma.
          </p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-sm transition-colors cursor-pointer"
        >
          + Nuevo Curso
        </button>
      </div>

      {/* Tarjeta de Filtros */}
      <div className="bg-slate-900 p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col sm:flex-row gap-3 items-center justify-between">
        <div className="w-full sm:w-72">
          <input
            type="text"
            placeholder="Buscar curso..."
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 placeholder-slate-400 focus:outline-none focus:border-indigo-500"
          />
        </div>
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            defaultValue=""
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="" disabled>Todos los Estados</option>
            <option value="publicado">Publicado</option>
            <option value="borrador">Borrador</option>
          </select>
          <select
            defaultValue=""
            className="bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 cursor-pointer"
          >
            <option value="" disabled>Todas las Categorías</option>
          </select>
        </div>
      </div>

      {/* Cuadrícula de Cursos */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {listaCursos.map((curso) => (
          <div
            key={curso.id}
            onClick={() => setCursoSeleccionado(curso)}
            className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm hover:border-indigo-500/50 transition-all cursor-pointer flex flex-col justify-between group"
          >
            <div>
              <div className="flex items-start justify-between gap-2 pb-3 border-b border-slate-800">
                <h3 className="font-bold text-white text-sm group-hover:text-indigo-400 transition-colors">
                  {curso.nombre}
                </h3>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                  }}
                  className="text-slate-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-slate-800 cursor-pointer text-sm"
                >
                  ⋮
                </button>
              </div>

              <div className="my-3 space-y-1.5">
                <p className="text-xs text-slate-400 font-medium">
                  {curso.codigo} • <span className="text-indigo-400">{curso.modalidad}</span>
                </p>
                <p className="text-xs text-slate-300 flex items-center gap-1.5">
                  <span className="text-slate-500">👤</span> {curso.profesor}
                </p>
              </div>
            </div>

            <div className="pt-3 border-t border-slate-800 flex items-center justify-between text-xs">
              <span className="text-slate-400 flex items-center gap-1">
                👥 <span className="text-slate-200 font-semibold">{curso.inscritos}/{curso.capacidad}</span>
              </span>
              {curso.estado === 'Borrador' ? (
                <span className="px-2 py-0.5 rounded bg-amber-950/60 text-amber-400 border border-amber-800/50 text-[11px] font-medium">
                  📄 Borrador
                </span>
              ) : (
                <span className="text-emerald-400 font-medium flex items-center gap-1">
                  🕒 {curso.horario}
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}