import React, { useState, useEffect } from 'react';

interface CursoDetalleProps {
  cursoId?: string;
  onVolver: () => void;
}

interface Alumno {
  id: number;
  nombre: string;
  codigo: string;
  estado: 'Presente' | 'Tarde' | 'Ausente';
}

export default function CursoDetalleView({ onVolver }: CursoDetalleProps) {
  const [tabActiva, setTabActiva] = useState<'materiales' | 'asistencia'>('materiales');

  // Fecha objetivo de la siguiente clase en vivo
  const [tiempoRestante, setTiempoRestante] = useState({
    dias: 0,
    horas: 0,
    minutos: 0,
    segundos: 0,
  });

  useEffect(() => {
    const fechaProximaClase = new Date();
    fechaProximaClase.setDate(fechaProximaClase.getDate() + 2);
    fechaProximaClase.setHours(8, 0, 0, 0);

    const intervalo = setInterval(() => {
      const ahora = new Date().getTime();
      const diferencia = fechaProximaClase.getTime() - ahora;

      if (diferencia > 0) {
        setTiempoRestante({
          dias: Math.floor(diferencia / (1000 * 60 * 60 * 24)),
          horas: Math.floor((diferencia % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
          minutos: Math.floor((diferencia % (1000 * 60 * 60)) / (1000 * 60)),
          segundos: Math.floor((diferencia % (1000 * 60)) / 1000),
        });
      } else {
        clearInterval(intervalo);
      }
    }, 1000);

    return () => clearInterval(intervalo);
  }, []);

  const [alumnos, setAlumnos] = useState<Alumno[]>([
    { id: 1, nombre: 'Juan Pérez', codigo: 'U2021102', estado: 'Presente' },
    { id: 2, nombre: 'Maria Gómez', codigo: 'U2021105', estado: 'Tarde' },
    { id: 3, nombre: 'Carlos Ruiz', codigo: 'U2021109', estado: 'Ausente' },
    { id: 4, nombre: 'Ana Torres', codigo: 'U2021112', estado: 'Presente' },
  ]);

  const cursoInfo = {
    nombre: 'Introducción al Cálculo Avanzado',
    codigo: 'MAT-301',
    seccion: 'Sección A1',
    profesor: 'Dra. Elena Ramírez',
    horario: 'Mar / Jue - 08:00 AM a 10:00 AM',
    alumnosInscritos: 45,
    capacidadMaxima: 50,
  };

  const materiales = [
    { id: 5, titulo: 'Clase 5: Integrales Múltiples y Aplicaciones', fecha: '28 Feb 2026', tipo: 'PDF' },
    { id: 4, titulo: 'Clase 4: Derivadas Parciales y Regla de la Cadena', fecha: '21 Feb 2026', tipo: 'PDF' },
    { id: 3, titulo: 'Clase 3: Límites y Continuidad Multivariable', fecha: '14 Feb 2026', tipo: 'ZIP' },
    { id: 2, titulo: 'Clase 2: Funciones de Varias Variables', fecha: '07 Feb 2026', tipo: 'PDF' },
    { id: 1, titulo: 'Clase 1: Introducción y Sílabo del Curso', fecha: '01 Feb 2026', tipo: 'PDF' },
  ];

  const toggleEstadoAsistencia = (id: number) => {
    setAlumnos((prevAlumnos) =>
      prevAlumnos.map((alumno) => {
        if (alumno.id === id) {
          const siguienteEstado =
            alumno.estado === 'Presente'
              ? 'Tarde'
              : alumno.estado === 'Tarde'
              ? 'Ausente'
              : 'Presente';
          return { ...alumno, estado: siguienteEstado };
        }
        return alumno;
      })
    );
  };

  return (
    <div className="space-y-6 text-slate-100">
      {/* Botón Volver */}
      <button
        type="button"
        onClick={onVolver}
        className="inline-flex items-center text-xs font-semibold text-slate-400 hover:text-white transition-colors cursor-pointer bg-slate-900 px-3 py-2 rounded-lg border border-slate-800"
      >
        ← Volver a Cursos
      </button>

      {/* Header Info */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col lg:flex-row lg:items-center justify-between gap-6">
        <div>
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-bold text-white">{cursoInfo.nombre}</h2>
            <span className="px-2.5 py-0.5 rounded bg-indigo-950/60 text-indigo-400 border border-indigo-800/50 text-xs font-semibold">
              {cursoInfo.seccion}
            </span>
          </div>
          <p className="text-xs text-slate-400 mt-1.5">
            {cursoInfo.codigo} • <span className="text-slate-300">{cursoInfo.profesor}</span>
          </p>
        </div>

        <div className="flex flex-wrap gap-4 pt-4 lg:pt-0 border-t lg:border-t-0 border-slate-800">
          <div className="bg-slate-800/50 px-4 py-2.5 rounded-lg border border-slate-800">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Inscritos</span>
            <span className="text-xs font-bold text-white mt-0.5 block">👥 {cursoInfo.alumnosInscritos} / {cursoInfo.capacidadMaxima}</span>
          </div>
          <div className="bg-slate-800/50 px-4 py-2.5 rounded-lg border border-slate-800">
            <span className="block text-[10px] font-semibold text-slate-400 uppercase tracking-wider">Horario</span>
            <span className="text-xs font-bold text-white mt-0.5 block">🕒 {cursoInfo.horario}</span>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-800 space-x-4">
        <button
          type="button"
          className={`pb-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
            tabActiva === 'materiales'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setTabActiva('materiales')}
        >
          📂 Material del Curso
        </button>
        <button
          type="button"
          className={`pb-3 text-xs font-semibold transition-colors cursor-pointer border-b-2 ${
            tabActiva === 'asistencia'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
          onClick={() => setTabActiva('asistencia')}
        >
          📋 Toma de Asistencia
        </button>
      </div>

      {/* Contenido */}
      <div>
        {tabActiva === 'materiales' ? (
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h3 className="font-bold text-white text-sm">Recursos y Clases (Descendente)</h3>
              
              <div className="flex flex-wrap items-center gap-3">
                <div className="bg-slate-800 text-indigo-300 border border-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium">
                  🎥 La clase empieza en: <span className="font-bold text-white">{tiempoRestante.dias}d {tiempoRestante.horas}h {tiempoRestante.minutos}m {tiempoRestante.segundos}s</span>
                </div>
                <button
                  type="button"
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
                >
                  + Subir Material
                </button>
              </div>
            </div>
            
            <div className="space-y-3">
              {materiales.map((item) => (
                <div key={item.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex items-center space-x-3">
                    <span className="text-xl bg-slate-800 p-2 rounded-lg border border-slate-700">
                      {item.tipo === 'PDF' ? '📄' : '📦'}
                    </span>
                    <div>
                      <h4 className="font-semibold text-white text-sm">{item.titulo}</h4>
                      <span className="text-[11px] text-slate-400">Publicado el {item.fecha}</span>
                    </div>
                  </div>
                  <button
                    type="button"
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
                  >
                    Descargar
                  </button>
                </div>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between bg-slate-900 p-5 rounded-xl border border-slate-800">
              <h3 className="font-bold text-white text-sm">Control de Asistencia - Sesión Actual</h3>
              <button
                type="button"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm"
              >
                Guardar Cambios
              </button>
            </div>
            
            <div className="space-y-2.5">
              {alumnos.map((alumno) => {
                let badgeStyle = 'bg-emerald-950/60 text-emerald-400 border-emerald-800/50';
                if (alumno.estado === 'Tarde') badgeStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/50';
                if (alumno.estado === 'Ausente') badgeStyle = 'bg-rose-950/60 text-rose-400 border-rose-800/50';

                return (
                  <div key={alumno.id} className="bg-slate-900 p-4 rounded-xl border border-slate-800 flex items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <span className="text-xs font-mono bg-slate-800 px-2.5 py-1 rounded border border-slate-700 text-slate-300">
                        {alumno.codigo}
                      </span>
                      <span className="text-sm font-medium text-white">{alumno.nombre}</span>
                    </div>

                    <button
                      type="button"
                      className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${badgeStyle}`}
                      onClick={() => toggleEstadoAsistencia(alumno.id)}
                    >
                      {alumno.estado === 'Presente' && '✓ Presente'}
                      {alumno.estado === 'Tarde' && '⏳ Tarde'}
                      {alumno.estado === 'Ausente' && '✕ Ausente'}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}