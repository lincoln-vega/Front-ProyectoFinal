import React, { useState, useEffect } from "react";
import { 
  Search, 
  RefreshCcw, 
  Plus, 
  User, 
  Clock, 
  Video, 
  Edit2, 
  FolderOpen 
} from "lucide-react";
import useCurse from "../../hooks/useCurse";
import CursoRegistroModal from "../../components/admin/CursoRegistroModal";

export default function CursoPage() {
  const { courses: initialCourses } = useCurse();
  const [coursesList, setCoursesList] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("Todas las Áreas Académicas");
  const [statusFilter, setStatusFilter] = useState("Todos los Estados");

  // Estado para controlar el modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Inicializar el estado de cursos desde el hook o datos base
  useEffect(() => {
    if (initialCourses && initialCourses.length > 0) {
      setCoursesList(initialCourses);
    }
  }, [initialCourses]);

  // Agregar nuevo curso a la lista en tiempo real
  const handleAddCourse = (newCourse) => {
    setCoursesList((prevList) => [newCourse, ...prevList]);
  };

  // Filtrado dinámico
  const filteredCourses = coursesList.filter((curso) => {
    const matchesSearch = curso.asignatura.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          curso.docente.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesArea = areaFilter === "Todas las Áreas Académicas" || curso.area.includes(areaFilter);
    const matchesStatus = statusFilter === "Todos los Estados" || curso.estado === statusFilter;
    
    return matchesSearch && matchesArea && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* TARJETA DE ENCABEZADO Y FILTROS */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-400 text-xs font-bold uppercase tracking-wider">
                Requerimiento SCRM-5
              </span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Catálogo Institucional de Cursos Virtuales
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Administración de aulas, monitoreo de salas síncronas y gestión de recursos académicos.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <RefreshCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Sincronizar Aulas</span>
            </button>
            <button
              type="button"
              onClick={() => setIsModalOpen(true)}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E3A8A] text-white hover:bg-blue-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Nuevo Curso</span>
            </button>
          </div>
        </div>

        {/* Barra de Búsqueda y Filtros */}
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por materia, código o docente titular..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A] cursor-pointer"
            >
              <option value="Todas las Áreas Académicas">Todas las Áreas</option>
              <option value="Ciencias Exactas">Ciencias Exactas</option>
              <option value="Ciencias Médicas">Ciencias Médicas</option>
              <option value="Humanidades y Letras">Humanidades y Letras</option>
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A] cursor-pointer"
            >
              <option value="Todos los Estados">Todos los Estados</option>
              <option value="Activo">Activos</option>
              <option value="En Revisión">En Revisión</option>
            </select>
          </div>
        </div>
      </div>

      {/* CUADRÍCULA (GRID) DE CURSOS */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {filteredCourses.length > 0 ? (
          filteredCourses.map((curso) => (
            <div
              key={curso.id}
              className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-slate-200 dark:border-white/10 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-blue-200 dark:hover:border-white/20 transition-all duration-200"
            >
              {/* Encabezado de Tarjeta: Código/Aula y Estado */}
              <div className="flex items-center justify-between mb-4">
                <span className="text-xs font-bold text-blue-700 dark:text-blue-400 tracking-wide uppercase bg-blue-50 dark:bg-blue-900/30 px-2.5 py-1 rounded">
                  {curso.codigo} • {curso.aula}
                </span>
                <span
                  className={`inline-flex items-center px-2.5 py-1 rounded-full text-xs font-bold uppercase tracking-wider border ${
                    curso.estado === "Activo"
                      ? "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-600 dark:text-emerald-400 border-emerald-100 dark:border-emerald-900/50"
                      : "bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 border-amber-100 dark:border-amber-900/50"
                  }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                      curso.estado === "Activo" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                    }`}
                  />
                  {curso.estado}
                </span>
              </div>

              {/* Título de la Materia */}
              <h3 className="text-xl font-bold text-slate-800 dark:text-white mb-4 leading-tight">
                {curso.asignatura}
              </h3>

              {/* Información Administrativa */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center text-sm text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-white/5 p-2 rounded-lg font-medium">
                  <User className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
                  <span className="truncate"><strong>Titular:</strong> {curso.docente}</span>
                </div>
                <div className="flex items-center text-sm text-slate-700 dark:text-slate-200 bg-slate-50/50 dark:bg-white/5 p-2 rounded-lg font-medium">
                  <Clock className="w-4.5 h-4.5 text-slate-400 mr-2 shrink-0" />
                  <span className="truncate">{curso.horario}</span>
                </div>
              </div>

              {/* Caja de Área Académica */}
              <div className="bg-slate-50 dark:bg-white/5 p-3.5 rounded-lg border border-slate-100 dark:border-white/5 mb-5 flex-grow">
                <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider block mb-1">
                  Área / Bloque Académico
                </span>
                <p className="text-sm text-slate-800 dark:text-slate-200 font-semibold leading-snug">
                  {curso.area}
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3 mt-auto pt-2 border-t border-slate-100 dark:border-white/10">
                <button 
                  className="w-full bg-[#0F9D58] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors shadow-sm cursor-pointer"
                  title="Acceder como Host/Co-host"
                >
                  <Video className="w-4.5 h-4.5" />
                  Monitorear Sala ({curso.tipoSala === 'zoom' ? 'Zoom' : 'Meet'})
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button className="w-full py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer">
                    <Edit2 className="w-4 h-4" />
                    Editar Curso
                  </button>
                  <a 
                    href={`https://${curso.repositorio}`} 
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="w-full py-2.5 text-sm font-semibold text-[#1E3A8A] dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30 border border-blue-100 dark:border-blue-900/50 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Materiales
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-slate-200 dark:border-white/10">
            <p className="text-slate-500 dark:text-slate-400">No se encontraron cursos con los filtros actuales.</p>
          </div>
        )}
      </div>

      {/* COMPONENTE MODAL MODULARIZADO */}
      <CursoRegistroModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddCourse={handleAddCourse}
      />
    </div>
  );
}