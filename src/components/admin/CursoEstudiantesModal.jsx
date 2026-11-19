import React, { useState } from "react";
import {
  X,
  Users,
  Search,
  Mail,
  Phone,
  GraduationCap,
  BookOpen,
  Calendar,
  CheckCircle2,
  Clock,
  UserCheck
} from "lucide-react";

export default function CursoEstudiantesModal({
  isOpen,
  curso,
  estudiantes = [],
  onClose
}) {
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");

  if (!isOpen || !curso) return null;

  const normalizedSearch = searchTerm.trim().toLowerCase();
  const filteredEstudiantes = estudiantes.filter((est) => {
    const fullName = `${est.nombres || ""} ${est.apellidos || ""}`.toLowerCase();
    const matchesSearch =
      fullName.includes(normalizedSearch) ||
      String(est.dni || "").includes(normalizedSearch) ||
      String(est.correo || "").toLowerCase().includes(normalizedSearch) ||
      String(est.carreraObjetivo || "").toLowerCase().includes(normalizedSearch) ||
      String(est.celular || "").includes(normalizedSearch);

    const matchesStatus =
      statusFilter === "TODOS" ||
      String(est.estado || "").toLowerCase() === statusFilter.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-4 overflow-y-auto animate-fade-in">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-slate-200 dark:border-white/10 w-full max-w-3xl overflow-hidden my-6 flex flex-col max-h-[90vh]">
        {/* Encabezado del Modal */}
        <div className="p-5 border-b border-slate-100 dark:border-white/10 bg-slate-50/70 dark:bg-white/5 flex items-start justify-between gap-3">
          <div className="flex items-start gap-3">
            <div className="w-10 h-10 rounded-xl bg-blue-600/10 text-blue-600 dark:text-blue-400 flex items-center justify-center shrink-0 mt-0.5 border border-blue-600/20 dark:border-white/10">
              <GraduationCap className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="text-[11px] font-bold text-blue-700 dark:text-blue-400 uppercase tracking-wider bg-blue-50 dark:bg-blue-900/30 px-2 py-0.5 rounded">
                  {curso.aula || "Aula Virtual"}
                </span>
                <span className="text-xs text-slate-500 dark:text-slate-400">
                  Código: <strong className="font-mono">{curso.codigo || curso.id}</strong>
                </span>
              </div>
              <h3 className="text-lg font-bold text-slate-800 dark:text-white mt-1 leading-snug">
                Nómina de Estudiantes • {curso.asignatura}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Docente Titular: <strong className="text-slate-700 dark:text-slate-300">{curso.docente || "No asignado"}</strong>
                {curso.horario ? ` · Horario: ${curso.horario}` : ""}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-lg hover:bg-slate-200/50 dark:hover:bg-white/10 transition-colors cursor-pointer"
            title="Cerrar modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Barra de Filtros y Búsqueda */}
        <div className="p-4 bg-slate-50/40 dark:bg-white/5 border-b border-slate-100 dark:border-white/10 grid grid-cols-1 sm:grid-cols-12 gap-3">
          <div className="sm:col-span-8 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar estudiante por nombre, DNI, correo o celular..."
              className="w-full pl-9 pr-3 py-1.5 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 transition-all"
            />
          </div>

          <div className="sm:col-span-4">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-1.5 px-3 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-white dark:bg-slate-800 text-slate-800 dark:text-white focus:outline-hidden focus:border-blue-500 cursor-pointer"
            >
              <option value="TODOS">Todos los Estados</option>
              <option value="Activo">Solo Activos</option>
              <option value="Inactivo">Solo Inactivos</option>
            </select>
          </div>
        </div>

        {/* Contenido / Listado de Estudiantes */}
        <div className="overflow-y-auto flex-1 p-4">
          {filteredEstudiantes.length === 0 ? (
            <div className="py-12 px-4 text-center">
              <div className="w-12 h-12 mx-auto rounded-full bg-slate-100 dark:bg-white/5 text-slate-400 flex items-center justify-center mb-3">
                <Users className="w-6 h-6" />
              </div>
              <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">
                {searchTerm ? "No se encontraron estudiantes" : "Sin estudiantes inscritos"}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-sm mx-auto">
                {searchTerm
                  ? "Prueba cambiando el término de búsqueda o el filtro de estado."
                  : `Actualmente no hay estudiantes matriculados con inscripción registrada en "${curso.asignatura}".`}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto rounded-xl border border-slate-200 dark:border-white/10">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-100/70 dark:bg-white/5 text-slate-600 dark:text-slate-300 uppercase tracking-wider text-[11px] font-bold border-b border-slate-200 dark:border-white/10">
                  <tr>
                    <th className="py-3 px-3.5">Estudiante</th>
                    <th className="py-3 px-3.5">Documento</th>
                    <th className="py-3 px-3.5">Contacto</th>
                    <th className="py-3 px-3.5">Carrera / Área</th>
                    <th className="py-3 px-3.5 text-center">Estado</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-white/5">
                  {filteredEstudiantes.map((est, index) => {
                    const fullName = `${est.nombres || ""} ${est.apellidos || ""}`.trim() || "Estudiante";
                    const isActivo = String(est.estado || "Activo").toLowerCase() === "activo";
                    return (
                      <tr
                        key={est.id || est.dni || index}
                        className="hover:bg-slate-50/80 dark:hover:bg-white/5 transition-colors"
                      >
                        {/* Columna Estudiante */}
                        <td className="py-3 px-3.5">
                          <div className="flex items-center space-x-2.5">
                            <div className="w-7 h-7 rounded-full bg-blue-600/10 text-blue-600 dark:text-blue-400 font-bold flex items-center justify-center text-xs shrink-0">
                              {fullName.charAt(0).toUpperCase()}
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-slate-800 dark:text-white truncate">
                                {fullName}
                              </p>
                              {est.correo && (
                                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate flex items-center gap-1 mt-0.5">
                                  <Mail className="w-3 h-3 shrink-0" />
                                  <span>{est.correo}</span>
                                </p>
                              )}
                            </div>
                          </div>
                        </td>

                        {/* Columna Documento */}
                        <td className="py-3 px-3.5 whitespace-nowrap">
                          <span className="font-mono text-slate-700 dark:text-slate-300 font-semibold">
                            {est.dni || "—"}
                          </span>
                          <span className="block text-[10px] text-slate-400">
                            {est.tipoDocumento || "DNI"}
                          </span>
                        </td>

                        {/* Columna Contacto */}
                        <td className="py-3 px-3.5 whitespace-nowrap text-slate-600 dark:text-slate-300">
                          {est.celular ? (
                            <span className="inline-flex items-center gap-1 font-mono">
                              <Phone className="w-3 h-3 text-slate-400" />
                              {est.celular}
                            </span>
                          ) : (
                            <span className="text-slate-400 italic">No registrado</span>
                          )}
                        </td>

                        {/* Columna Carrera y Área */}
                        <td className="py-3 px-3.5">
                          <p className="font-medium text-slate-800 dark:text-slate-200 truncate max-w-[200px]">
                            {est.carreraObjetivo || "General"}
                          </p>
                          <p className="text-[10px] text-slate-500 dark:text-slate-400 truncate max-w-[200px]">
                            {est.areaAcademica || est.cicloVirtual || "Semestral"}
                          </p>
                        </td>

                        {/* Columna Estado */}
                        <td className="py-3 px-3.5 text-center whitespace-nowrap">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              isActivo
                                ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800/40"
                                : "bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800/40"
                            }`}
                          >
                            <span
                              className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                                isActivo ? "bg-emerald-500" : "bg-rose-500"
                              }`}
                            />
                            {est.estado || "Activo"}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pie del Modal */}
        <div className="p-4 bg-slate-50/70 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Total inscritos: <strong className="text-slate-800 dark:text-white font-bold">{estudiantes.length}</strong> estudiante(s)
            {filteredEstudiantes.length !== estudiantes.length && (
              <span> (filtrados: {filteredEstudiantes.length})</span>
            )}
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 hover:bg-slate-100 dark:hover:bg-white/20 rounded-lg transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>
      </div>
    </div>
  );
}
