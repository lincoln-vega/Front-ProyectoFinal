import React, { useState } from "react";
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
import { ACADEMIC_AREAS } from "../../data/academicCatalog";

export default function CursoPage() {
  const { courses: coursesList, addCourse, updateCourse } = useCurse();
  const [searchTerm, setSearchTerm] = useState("");
  const [areaFilter, setAreaFilter] = useState("Todas las Áreas Académicas");
  const [statusFilter, setStatusFilter] = useState("Todos los Estados");

  // Estado para controlar el modal de registro de cursos
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [courseToEdit, setCourseToEdit] = useState(null);

  const handleAddCourse = (newCourse) => {
    addCourse(newCourse);
  };

  const handleEditCourse = (course) => {
    setCourseToEdit(course);
    setIsModalOpen(true);
  };

  const handleUpdateCourse = (updatedCourse) => {
    updateCourse(updatedCourse);
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
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
          </div>

          <div className="flex flex-wrap items-center gap-2">
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
        <div className="mt-5 grid grid-cols-1 md:grid-cols-12 gap-3 pt-4 border-t border-slate-100">
          <div className="md:col-span-6 relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar por materia, código o docente titular..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all"
            />
          </div>

          <div className="md:col-span-3">
            <select
              value={areaFilter}
              onChange={(e) => setAreaFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] cursor-pointer"
            >
              <option value="Todas las Áreas Académicas">Todas las Áreas</option>
              {ACADEMIC_AREAS.map((area) => <option key={area} value={area}>{area}</option>)}
            </select>
          </div>

          <div className="md:col-span-3">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] cursor-pointer"
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
              className="bg-white rounded-xl border border-slate-200 shadow-sm p-5 flex flex-col hover:shadow-md hover:border-blue-200 transition-all duration-200"
            >
              {/* Encabezado con Título y Estado alineados */}
              <div className="flex items-start justify-between gap-3 mb-4">
                <h3 className="text-lg font-bold text-slate-800 leading-tight">
                  {curso.asignatura}
                </h3>
                <span
                  className={`inline-flex items-center px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border shrink-0 ${curso.estado === "Activo"
                      ? "bg-emerald-50 text-emerald-600 border-emerald-100"
                      : "bg-amber-50 text-amber-600 border-amber-100"
                    }`}
                >
                  <span
                    className={`w-1.5 h-1.5 rounded-full mr-1.5 ${curso.estado === "Activo" ? "bg-emerald-500 animate-pulse" : "bg-amber-500"
                      }`}
                  />
                  {curso.estado}
                </span>
              </div>

              {/* Información Administrativa */}
              <div className="space-y-2 mb-5">
                <div className="flex items-center text-sm text-slate-600 bg-slate-50/50 p-1.5 rounded">
                  <User className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span className="truncate"><strong>Titular:</strong> {curso.docente}</span>
                </div>
                <div className="flex items-center text-sm text-slate-600 bg-slate-50/50 p-1.5 rounded">
                  <Clock className="w-4 h-4 text-slate-400 mr-2 shrink-0" />
                  <span className="truncate">{curso.horario}</span>
                </div>
              </div>

              {/* Caja de Área Académica */}
              <div className="bg-slate-50 p-3.5 rounded-lg border border-slate-100 mb-5 flex-grow">
                <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                  Área / Bloque Académico
                </span>
                <p className="text-xs text-slate-700 font-medium leading-snug">
                  {curso.area}
                </p>
              </div>

              {/* Botones de Acción */}
              <div className="space-y-3 mt-auto pt-2 border-t border-slate-100">
                <button
                  className="w-full bg-[#0F9D58] hover:bg-emerald-700 text-white font-medium py-2.5 rounded-lg flex items-center justify-center gap-2 text-sm transition-colors shadow-sm cursor-pointer"
                  title="Acceder como Host/Co-host"
                >
                  <Video className="w-4 h-4" />
                  Monitorear Sala 
                </button>

                <div className="grid grid-cols-2 gap-3">
                  <button
                    type="button"
                    onClick={() => handleEditCourse(curso)}
                    className="w-full py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    Editar Curso
                  </button>
                  <a
                    href={`https://${curso.repositorio}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full py-2 text-xs font-semibold text-[#1E3A8A] bg-blue-50 border border-blue-100 rounded-lg hover:bg-blue-100 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <FolderOpen className="w-3.5 h-3.5" />
                    Materiales
                  </a>
                </div>
              </div>
            </div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500">No se encontraron cursos con los filtros actuales.</p>
          </div>
        )}
      </div>

      {/* COMPONENTE MODAL DE REGISTRO */}
      <CursoRegistroModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setCourseToEdit(null);
        }}
        onAddCourse={handleAddCourse}
        onUpdateCourse={handleUpdateCourse}
        courseToEdit={courseToEdit}
      />
    </div>
  );
}