import { AlertCircle, Edit2, Trash2 } from "lucide-react";

export default function UsersTable({ users, totalUsers, activeUsers, inactiveUsers, onEdit, onDelete }) {
  return (
    <div className="bg-white dark:bg-white/5 rounded-xl border border-slate-200 dark:border-white/10 shadow-xs overflow-hidden">
      <div className="px-5 py-3 border-b border-slate-200 dark:border-white/10 bg-slate-50/80 dark:bg-white/5 flex items-center justify-between text-xs text-slate-600 dark:text-slate-400">
        <span className="font-semibold text-slate-800 dark:text-slate-300">
          Mostrando {users.length} de {totalUsers} registros cargados
        </span>
        <span className="text-xs text-slate-400 dark:text-slate-500">
          * 11 columnas reglamentarias de usuario
        </span>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="bg-[#1E3A8A] dark:bg-blue-950/40 text-white border-b border-blue-950 dark:border-white/10 font-semibold tracking-wider uppercase text-xs select-none">
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">1. Apellidos</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">2. Nombres</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">3. DNI</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">4. F. Nacimiento</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">5. Correo</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">6. Celular</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">7. Carrera / Objetivo</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap">8. Ciclo Virtual</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap text-center">9. Rol</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap text-center">10. Estado</th>
              <th scope="col" className="py-3 px-3.5 whitespace-nowrap text-center">11. Acciones</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100 dark:divide-white/5 text-slate-700 dark:text-slate-300">
            {users.length === 0 ? (
              <tr>
                <td colSpan={11} className="py-8 text-center text-slate-400 dark:text-slate-500">
                  <AlertCircle className="w-6 h-6 mx-auto mb-2 text-slate-300 dark:text-slate-600" />
                  No se encontraron usuarios con los criterios de búsqueda seleccionados.
                </td>
              </tr>
            ) : (
              users.map((user) => (
                <tr
                  key={user.id}
                  className="hover:bg-blue-50/70 dark:hover:bg-white/5 transition-colors duration-150 group"
                >
                  <td className="py-2.5 px-3.5 font-semibold text-slate-900 dark:text-slate-100 whitespace-nowrap">{user.apellidos}</td>
                  <td className="py-2.5 px-3.5 text-slate-800 dark:text-slate-200 whitespace-nowrap">{user.nombres}</td>
                  <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{user.dni}</td>
                  <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap">{user.fechaNacimiento || "-"}</td>
                  <td className="py-2.5 px-3.5 text-slate-600 dark:text-slate-400 whitespace-nowrap font-sans">
                    <a href={`mailto:${user.correo}`} className="text-blue-700 dark:text-blue-400 hover:underline">{user.correo}</a>
                  </td>
                  <td className="py-2.5 px-3.5 font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap">{user.celular || "-"}</td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap">
                    <span className="inline-block max-w-[200px] truncate text-slate-800 dark:text-slate-200 font-medium" title={user.carreraObjetivo}>
                      {user.carreraObjetivo}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-400">
                    <span className="px-2 py-0.5 rounded bg-slate-100 dark:bg-white/10 border border-slate-200 dark:border-white/10 text-xs font-medium">
                      {user.cicloVirtual || user.ciclovirtual || "Semestral"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold tracking-wide ${
                      String(user.rol).toLowerCase() === "admin"
                        ? "bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-300 border border-purple-200 dark:border-purple-800/50"
                        : ["docente", "profesor"].includes(String(user.rol).toLowerCase())
                        ? "bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-300 border border-amber-200 dark:border-amber-800/50"
                        : "bg-blue-100 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-300 border border-blue-200 dark:border-blue-800/50"
                    }`}>
                      {String(user.rol).toLowerCase() === "admin" ? "Admin" : ["docente", "profesor"].includes(String(user.rol).toLowerCase()) ? "Docente" : "Estudiante"}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                    <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${
                      user.estado === "Activo"
                        ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/50"
                        : "bg-rose-50 dark:bg-rose-900/20 text-rose-700 dark:text-rose-400 border border-rose-200 dark:border-rose-800/50"
                    }`}>
                      <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${user.estado === "Activo" ? "bg-emerald-500" : "bg-rose-500"}`} />
                      {user.estado}
                    </span>
                  </td>
                  <td className="py-2.5 px-3.5 whitespace-nowrap text-center">
                    <div className="flex items-center justify-center space-x-1.5">
                      <button
                        type="button"
                        onClick={() => onEdit(user)}
                        title="Editar usuario"
                        aria-label={`Editar usuario ${user.nombres} ${user.apellidos}`}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-blue-700 dark:hover:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900/40 rounded transition-colors cursor-pointer"
                      >
                        <Edit2 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => onDelete(user)}
                        title="Eliminar usuario"
                        aria-label={`Eliminar usuario ${user.nombres} ${user.apellidos}`}
                        className="p-1 text-slate-500 dark:text-slate-400 hover:text-red-600 dark:hover:text-red-300 hover:bg-red-100 dark:hover:bg-red-900/40 rounded transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="p-3 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 dark:text-slate-400 gap-2">
        <div>Total en base de datos: <strong className="dark:text-slate-300">{totalUsers}</strong> registros.</div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500 inline-block" /> Activos: {activeUsers}</span>
          <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-rose-500 inline-block" /> Inactivos: {inactiveUsers}</span>
        </div>
      </div>
    </div>
  );
}
