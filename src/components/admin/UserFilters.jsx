import { Search, Filter } from "lucide-react";

export default function UserFilters({
  searchTerm,
  roleFilter,
  statusFilter,
  roles = [],
  onSearchChange,
  onRoleChange,
  onStatusChange,
  showRoleFilter = true
}) {
  return (
    <div className="flex flex-col md:flex-row items-center gap-3 mt-4 pt-4 border-t border-slate-100">
      <div className="relative flex-1 w-full">
        <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => onSearchChange(e.target.value)}
          placeholder="Buscar por apellidos, nombres, DNI, carrera o correo..."
          className="w-full pl-9 pr-4 py-2 border border-slate-200 rounded-lg text-xs focus:outline-hidden focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
      </div>

      <div className="flex items-center gap-2 w-full md:w-auto">
        <Filter className="w-4 h-4 text-slate-400 hidden sm:block" />
        {showRoleFilter && <select
          value={roleFilter}
          onChange={(e) => onRoleChange(e.target.value)}
          className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="TODOS">Todos los Roles</option>
          {roles.map((rol) => (
            <option key={rol} value={rol}>
              {rol}
            </option>
          ))}
        </select>}

        <select
          value={statusFilter}
          onChange={(e) => onStatusChange(e.target.value)}
          className="w-full md:w-auto px-3 py-2 border border-slate-200 rounded-lg text-xs bg-white text-slate-700 font-medium focus:outline-hidden focus:ring-2 focus:ring-blue-500 cursor-pointer"
        >
          <option value="TODOS">Todos los Estados</option>
          <option value="Activo">Activo</option>
          <option value="Inactivo">Inactivo</option>
        </select>
      </div>
    </div>
  );
}