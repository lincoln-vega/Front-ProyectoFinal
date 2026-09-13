export default function PrincipalView() {
  return (
    <div className="space-y-6 text-slate-100">
      {/* Encabezado de Bienvenida */}
      <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <h2 className="text-xl font-bold text-white">Vista General del Panel</h2>
        <p className="text-xs text-slate-400 mt-1">
          Bienvenido de nuevo. Esto es lo que sucede en la academia hoy.
        </p>
      </div>

      {/* Cuadrícula de Métricas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Métrica 1 */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Alumnos inscritos
          </span>
          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white">4,285</h3>
            <span className="inline-block mt-1 text-[11px] font-medium text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-800/50">
              +12% desde el mes pasado
            </span>
          </div>
        </div>

        {/* Métrica 2 */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Profesores activos
          </span>
          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white">12</h3>
          </div>
        </div>

        {/* Métrica 3 */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Cursos activados
          </span>
          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-white">45</h3>
          </div>
        </div>

        {/* Métrica 4 */}
        <div className="bg-slate-900 p-5 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
            Incidentes por atender
          </span>
          <div className="my-2">
            <h3 className="text-2xl font-extrabold text-amber-400">10</h3>
          </div>
        </div>
      </div>

      {/* Cuadrícula de Detalles (Tareas y Actividad) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Tareas Administrativas */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <h3 className="font-bold text-white text-base">Tareas Administrativas</h3>
              <button 
                type="button" 
                className="text-xs font-medium text-indigo-400 hover:text-indigo-300 transition-colors cursor-pointer"
              >
                Ver Todo
              </button>
            </div>

            <ul className="divide-y divide-slate-800/60 my-2">
              <li className="py-2.5 flex items-center space-x-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 accent-indigo-600 cursor-pointer" />
                <span><strong className="text-white">SCRM-5</strong> Editar usuarios</span>
              </li>
              <li className="py-2.5 flex items-center space-x-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 accent-indigo-600 cursor-pointer" />
                <span><strong className="text-white">SCRM-4</strong> Listar usuarios</span>
              </li>
              <li className="py-2.5 flex items-center space-x-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 accent-indigo-600 cursor-pointer" />
                <span><strong className="text-white">SCRM-3</strong> Eliminar usuarios</span>
              </li>
              <li className="py-2.5 flex items-center space-x-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 accent-indigo-600 cursor-pointer" />
                <span><strong className="text-white">SCRM-2</strong> Registrar usuarios</span>
              </li>
              <li className="py-2.5 flex items-center space-x-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 accent-indigo-600 cursor-pointer" />
                <span><strong className="text-white">SCRM-10</strong> Editar roles</span>
              </li>
              <li className="py-2.5 flex items-center space-x-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 accent-indigo-600 cursor-pointer" />
                <span><strong className="text-white">SCRM-9</strong> Listar roles</span>
              </li>
              <li className="py-2.5 flex items-center space-x-3 text-sm text-slate-300">
                <input type="checkbox" defaultChecked className="w-4 h-4 text-indigo-600 rounded border-slate-700 bg-slate-800 accent-indigo-600 cursor-pointer" />
                <span><strong className="text-white">SCRM-8</strong> Asignar permisos y vistas por roles</span>
              </li>
            </ul>
          </div>

          <div className="pt-4 border-t border-slate-800 text-xs text-slate-500">
            Mostrando 7 de 21 tareas pendientes
          </div>
        </div>

        {/* Actividad Reciente */}
        <div className="bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div>
            <h3 className="font-bold text-white text-base pb-4 border-b border-slate-800">
              Actividad Reciente
            </h3>

            <ul className="space-y-4 my-4">
              <li className="border-l-2 border-indigo-500 pl-3">
                <small className="text-[11px] font-semibold text-indigo-400">10:45 AM, Hoy</small>
                <p className="text-xs text-slate-300 mt-0.5">Nuevo registro de estudiante completado para el curso de Preparación Médica.</p>
              </li>
              <li className="border-l-2 border-slate-700 pl-3">
                <small className="text-[11px] font-semibold text-slate-400">09:15 AM, Hoy</small>
                <p className="text-xs text-slate-300 mt-0.5">Horario actualizado para 'Física Avanzada' por el Instructor M. Smith.</p>
              </li>
              <li className="border-l-2 border-amber-500 pl-3">
                <small className="text-[11px] font-semibold text-amber-400">Ayer</small>
                <p className="text-xs text-slate-300 mt-0.5">Alerta del sistema: El umbral de asistencia cayó por debajo del 85% en el Aula 302.</p>
              </li>
              <li className="border-l-2 border-emerald-500 pl-3">
                <small className="text-[11px] font-semibold text-emerald-400">Ayer</small>
                <p className="text-xs text-slate-300 mt-0.5">Copia de seguridad de datos completada con éxito.</p>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}