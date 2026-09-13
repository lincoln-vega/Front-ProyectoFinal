const mockUsers = [
  { 
    id: 1, iniciales: 'AM', colorClass: 'avatar-purple', 
    apellido: 'Martínez', nombre: 'Ana', documento: '70123456', 
    fechaNacimiento: '15/04/1998', correo: 'ana.martinez@eduadmin.com', 
    celular: '987654321', carrera: 'Ingeniería de Sistemas', ciclo: 'Ciclo 5', 
    rol: 'ADMINISTRADOR', estado: 'Activo' 
  },
  { 
    id: 2, iniciales: 'CG', colorClass: 'avatar-orange', 
    apellido: 'Gómez', nombre: 'Carlos', documento: '45678912', 
    fechaNacimiento: '22/08/1990', correo: 'cgomez.prof@escuela.edu', 
    celular: '912345678', carrera: 'Ingeniería de Software', ciclo: 'Docencia', 
    rol: 'DOCENTE', estado: 'Activo' 
  },
  { 
    id: 3, iniciales: 'LR', colorClass: 'avatar-gray', 
    apellido: 'Rodríguez', nombre: 'Laura', documento: '74185296', 
    fechaNacimiento: '10/11/2004', correo: 'lrodriguez@alumnos.edu', 
    celular: '998877665', carrera: 'Ingeniería de Sistemas', ciclo: 'Ciclo 3', 
    rol: 'ESTUDIANTE', estado: 'Inactivo' 
  },
  { 
    id: 4, iniciales: 'JP', colorClass: 'avatar-gray', 
    apellido: 'Pérez', nombre: 'Javier', documento: '78945612', 
    fechaNacimiento: '05/01/2003', correo: 'javier.perez@alumnos.edu', 
    celular: '955443322', carrera: 'Ingeniería de Sistemas', ciclo: 'Ciclo 4', 
    rol: 'ESTUDIANTE', estado: 'Activo' 
  },
];

export default function UsuariosView() {
  return (
    <div className="space-y-6 text-slate-100">
      
      {/* Header */}
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900 p-6 rounded-xl border border-slate-800 shadow-sm">
        <div className="space-y-1">
          <h2 className="text-xl font-bold text-white">Gestión de Usuarios</h2>
          <p className="text-xs text-slate-400">Administra el acceso, roles y estados de todos los usuarios de la plataforma.</p>
        </div>
        <button
          type="button"
          className="inline-flex items-center justify-center space-x-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer shadow-sm shrink-0"
        >
          <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4"></path>
          </svg>
          <span>Nuevo Usuario</span>
        </button>
      </header>

      {/* Card principal */}
      <div className="bg-slate-900 rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        
        {/* Barra de filtros */}
        <div className="p-4 sm:p-5 border-b border-slate-800 flex flex-col lg:flex-row lg:items-center justify-between gap-4 bg-slate-950/40">
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full lg:w-auto">
            <div className="relative flex-1 sm:w-80">
              <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                </svg>
              </span>
              <input
                type="text"
                placeholder="Buscar por nombre o correo..."
                className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-400 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>
            <select className="px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-xs text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors cursor-pointer">
              <option>Todos los Roles</option>
              <option>Administrador</option>
              <option>Docente</option>
              <option>Estudiante</option>
            </select>
          </div>

          <div className="flex items-center gap-2 self-end lg:self-auto">
            <button
              type="button"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              Más filtros
            </button>
            <button
              type="button"
              className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-lg text-xs font-medium transition-colors cursor-pointer"
            >
              ↓
            </button>
          </div>
        </div>

        {/* Tabla contenedora */}
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse min-w-[1100px]">
            <thead>
              <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/20">
                <th className="p-4">Apellido</th>
                <th className="p-4">Nombre</th>
                <th className="p-4">Documento de identidad</th>
                <th className="p-4">Fecha de nacimiento</th>
                <th className="p-4">Correo</th>
                <th className="p-4">Número celular</th>
                <th className="p-4">Carrera</th>
                <th className="p-4">Ciclo virtual</th>
                <th className="p-4">Rol</th>
                <th className="p-4">Estado</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs">
              {mockUsers.map((user) => {
                let badgeRolStyle = 'bg-slate-800 text-slate-300 border-slate-700';
                if (user.rol === 'ADMINISTRADOR') {
                  badgeRolStyle = 'bg-indigo-950/60 text-indigo-400 border-indigo-800/50';
                } else if (user.rol === 'DOCENTE') {
                  badgeRolStyle = 'bg-amber-950/60 text-amber-400 border-amber-800/50';
                } else if (user.rol === 'ESTUDIANTE') {
                  badgeRolStyle = 'bg-slate-800/80 text-slate-300 border-slate-700';
                }

                let avatarBg = 'bg-purple-600 text-white';
                if (user.colorClass === 'avatar-orange') avatarBg = 'bg-amber-600 text-white';
                if (user.colorClass === 'avatar-gray') avatarBg = 'bg-slate-700 text-slate-200';

                return (
                  <tr key={user.id} className="hover:bg-slate-800/30 transition-colors">
                    <td className="p-4 font-semibold text-white">{user.apellido}</td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2.5">
                        <span className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-[10px] shrink-0 shadow-sm ${avatarBg}`}>
                          {user.iniciales}
                        </span>
                        <span className="font-medium text-slate-200">{user.nombre}</span>
                      </div>
                    </td>
                    <td className="p-4 font-mono text-slate-300">{user.documento}</td>
                    <td className="p-4 text-slate-300">{user.fechaNacimiento}</td>
                    <td className="p-4 text-slate-300 font-mono text-[11px]">{user.correo}</td>
                    <td className="p-4 font-mono text-slate-300">{user.celular}</td>
                    <td className="p-4 text-slate-300">{user.carrera}</td>
                    <td className="p-4 text-slate-300">{user.ciclo}</td>
                    <td className="p-4">
                      <span className={`inline-block px-2.5 py-0.5 rounded text-[10px] font-bold border tracking-wide ${badgeRolStyle}`}>
                        {user.rol}
                      </span>
                    </td>
                    <td className="p-4">
                      <div className="flex items-center space-x-2">
                        <span className={`w-2 h-2 rounded-full ${user.estado === 'Activo' ? 'bg-emerald-500 shadow-sm shadow-emerald-500/50' : 'bg-rose-500 shadow-sm shadow-rose-500/50'}`}></span>
                        <span className={`font-medium ${user.estado === 'Activo' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {user.estado}
                        </span>
                      </div>
                    </td>
                    <td className="p-4 text-right">
                      <button
                        type="button"
                        className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 rounded text-xs transition-colors cursor-pointer"
                        style={{ padding: '0.2rem 0.5rem' }}
                      >
                        ⋮
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        <div className="p-4 sm:p-5 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 bg-slate-950/20 text-xs text-slate-400">
          <span>Mostrando <b className="text-white">1</b> a <b className="text-white">4</b> de <b className="text-white">4</b> usuarios</span>
          <div className="flex items-center space-x-1">
            <button type="button" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
              &lt;
            </button>
            <button type="button" className="px-3 py-1.5 bg-indigo-600 text-white font-semibold rounded-lg shadow-sm cursor-pointer">
              1
            </button>
            <button type="button" className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 border border-slate-700 rounded-lg transition-colors cursor-pointer disabled:opacity-50">
              &gt;
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}