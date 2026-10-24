import React, { useState, useEffect } from "react";
import { 
  Search, 
  RefreshCcw, 
  Plus, 
  User, 
  Clock, 
  Video, 
  Edit2, 
  FolderOpen,
  X,
  MapPin,
  ExternalLink
} from "lucide-react";
import useCurse from "../../hooks/useCurse";
import CursoRegistroModal from "../../components/admin/CursoRegistroModal";

export default function CursoPage() {
  const { courses: initialCourses, loading, error, addCourse, refreshCourses } = useCurse();
  const [coursesList, setCoursesList] = useState([]);
  
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("Todas las Áreas Académicas");
  const [statusFilter, setStatusFilter] = useState("Todos los Estados");

  // Estado para controlar el modal de registro
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCourseDetail, setSelectedCourseDetail] = useState(null);

  // Inicializar el estado de cursos desde el hook o datos base
  useEffect(() => {
    setCoursesList(initialCourses || []);
  }, [initialCourses]);

  // Agregar nuevo curso a la lista en tiempo real
  const handleAddCourse = async (newCourse) => {
    await addCourse(newCourse);
  };

  // Filtrado dinámico
  const filteredCourses = coursesList.filter((curso) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = (curso.asignatura || "").toLowerCase().includes(term) || 
                          (curso.docente || "").toLowerCase().includes(term) ||
                          (curso.codigo || "").toLowerCase().includes(term) ||
                          (curso.aula || "").toLowerCase().includes(term) ||
                          (curso.id || "").toLowerCase().includes(term);
    const matchesArea = areaFilter === "Todas las Áreas Académicas" || (curso.area || "").includes(areaFilter);
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
              onClick={() => refreshCourses()}
              disabled={loading}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/5 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer disabled:opacity-50"
            >
              <RefreshCcw className={`w-3.5 h-3.5 text-slate-500 dark:text-slate-400 ${loading ? "animate-spin" : ""}`} />
              <span>{loading ? "Sincronizando..." : "Sincronizar Aulas"}</span>
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
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Consultando cursos en InsForge...</p>}
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
                  type="button"
                  onClick={() => {
                    if (curso.meetUrl) {
                      window.open(curso.meetUrl, "_blank", "noopener,noreferrer");
                    } else {
                      window.alert(`No hay enlace de sala síncrona configurado para ${curso.asignatura}.`);
                    }
                  }}
                  className="w-full bg-[#0F9D58] hover:bg-emerald-700 text-white font-bold py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors shadow-sm cursor-pointer"
                  title="Acceder a la sala sincrónica"
                >
                  <Video className="w-4.5 h-4.5" />
                  Monitorear Sala ({curso.tipoSala === 'zoom' ? 'Zoom' : 'Meet'})
                </button>
                
                <div className="grid grid-cols-2 gap-3">
                  <button 
                    type="button"
                    onClick={() => setSelectedCourseDetail(curso)}
                    className="w-full py-2.5 text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 border border-slate-200 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-4 h-4" />
                    Detalles
                  </button>
                  <a 
                    href={curso.repositorio?.startsWith("http") ? curso.repositorio : `https://${curso.repositorio || "drive.google.com"}`} 
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

      {/* MODAL DE DETALLES DEL CURSO */}
      {selectedCourseDetail && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 animate-fade-in">
          <div className="bg-white dark:bg-[#12121a] rounded-2xl shadow-2xl max-w-lg w-full border border-slate-200 dark:border-white/10 overflow-hidden">
            <div className="p-6 border-b border-slate-100 dark:border-white/10 flex items-start justify-between bg-slate-50/50 dark:bg-white/5">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {selectedCourseDetail.codigo || selectedCourseDetail.id}
                  </span>
                  <span className={`text-xs px-2 py-0.5 rounded-full font-semibold ${
                    selectedCourseDetail.estado === 'Activo' 
                      ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' 
                      : 'bg-rose-100 dark:bg-rose-900/30 text-rose-700 dark:text-rose-400'
                  }`}>
                    {selectedCourseDetail.estado || 'Activo'}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">
                  {selectedCourseDetail.asignatura}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-medium">
                  Área: {selectedCourseDetail.area || 'General'} • Ciclo: {selectedCourseDetail.ciclovirtual || selectedCourseDetail.cicloVirtual || 'Semestral'}
                </p>
              </div>
              <button 
                onClick={() => setSelectedCourseDetail(null)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-white/5 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Docente Asignado</span>
                  <div className="flex items-center gap-2 mt-1">
                    <User className="w-4 h-4 text-[#1E3A8A] dark:text-blue-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {selectedCourseDetail.docente}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Horario de Clase</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Clock className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCourseDetail.horario || 'Por definir'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Aula / Salón</span>
                  <div className="flex items-center gap-2 mt-1">
                    <MapPin className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200">
                      {selectedCourseDetail.aula || selectedCourseDetail.salon || 'Sala Virtual'}
                    </span>
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-slate-50 dark:bg-white/5 border border-slate-100 dark:border-white/5">
                  <span className="text-xs text-slate-500 dark:text-slate-400 block font-medium">Plataforma</span>
                  <div className="flex items-center gap-2 mt-1">
                    <Video className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 capitalize">
                      {selectedCourseDetail.tipoSala || 'Google Meet'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="pt-2 flex flex-col sm:flex-row gap-3">
                {selectedCourseDetail.meetUrl ? (
                  <a
                    href={selectedCourseDetail.meetUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 py-2.5 px-4 bg-[#0F9D58] hover:bg-emerald-700 text-white rounded-xl font-semibold flex items-center justify-center gap-2 text-xs transition-colors shadow-xs"
                  >
                    <Video className="w-4 h-4" />
                    Ingresar a Clase en Vivo
                  </a>
                ) : (
                  <span className="flex-1 py-2.5 px-4 bg-slate-100 dark:bg-white/5 text-slate-400 rounded-xl font-medium text-center text-xs">
                    Sin enlace síncrono
                  </span>
                )}

                {selectedCourseDetail.repositorio && (
                  <a
                    href={selectedCourseDetail.repositorio.startsWith("http") ? selectedCourseDetail.repositorio : `https://${selectedCourseDetail.repositorio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="py-2.5 px-4 bg-blue-50 dark:bg-blue-900/30 text-[#1E3A8A] dark:text-blue-300 hover:bg-blue-100 rounded-xl font-semibold flex items-center justify-center gap-2 text-xs transition-colors"
                  >
                    <FolderOpen className="w-4 h-4" />
                    Ver Materiales
                  </a>
                )}
              </div>
            </div>

            <div className="p-4 bg-slate-50 dark:bg-white/5 border-t border-slate-100 dark:border-white/10 flex justify-end">
              <button
                type="button"
                onClick={() => setSelectedCourseDetail(null)}
                className="px-5 py-2 text-xs font-semibold text-slate-700 dark:text-slate-300 bg-white dark:bg-white/10 border border-slate-200 dark:border-white/10 rounded-xl hover:bg-slate-100 dark:hover:bg-white/20 transition-colors cursor-pointer"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}