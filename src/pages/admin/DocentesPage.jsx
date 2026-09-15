import React, { useState, useEffect } from "react";
import { 
  Search, 
  Plus, 
  User, 
  Briefcase, 
  CreditCard,
  AlertTriangle,
  Edit2, 
  Trash2,
  DollarSign
} from "lucide-react";
import { userService } from "../../services/api";

const TEACHER_PROFILE_KEY = "academia_teacher_profiles";

const splitFullName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    nombres: parts.slice(0, -1).join(" ") || parts[0] || "",
    apellidos: parts.at(-1) || ""
  };
};

export default function DocentesPage() {
  const [docentes, setDocentes] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocente, setCurrentDocente] = useState(null);
  
  // Form states
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [salario, setSalario] = useState("");
  const [incidenciaDesc, setIncidenciaDesc] = useState("");

  useEffect(() => {
    const savedProfiles = JSON.parse(localStorage.getItem(TEACHER_PROFILE_KEY) || "{}");
    const teacherUsers = userService.getUsers().filter((user) => String(user.rol).toLowerCase() === "docente");
    const initialData = teacherUsers.map((user) => ({
      id: user.id,
      userId: user.id,
      nombre: `${user.nombres} ${user.apellidos}`.trim(),
      documento: user.dni,
      especialidad: user.carreraObjetivo || "Sin especialidad asignada",
      salario: Number(savedProfiles[user.id]?.salario || 0),
      incidencias: savedProfiles[user.id]?.incidencias || [],
      estado: user.estado
    }));
    setDocentes(initialData);
    localStorage.setItem(TEACHER_PROFILE_KEY, JSON.stringify(
      Object.fromEntries(initialData.map(({ id, userId, salario, incidencias }) => [userId || id, { salario, incidencias }]))
    ));
  }, []);

  const saveToStorage = (data) => {
    setDocentes(data);
    localStorage.setItem(TEACHER_PROFILE_KEY, JSON.stringify(
      Object.fromEntries(data.map((docente) => [docente.userId || docente.id, {
        salario: docente.salario,
        incidencias: docente.incidencias
      }]))
    ));
  };

  const handleOpenModal = (docente = null) => {
    if (docente) {
      setCurrentDocente(docente);
      setNombre(docente.nombre);
      setDocumento(docente.documento);
      setEspecialidad(docente.especialidad);
      setSalario(docente.salario);
      setIncidenciaDesc("");
    } else {
      setCurrentDocente(null);
      setNombre("");
      setDocumento("");
      setEspecialidad("");
      setSalario("");
      setIncidenciaDesc("");
    }
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setCurrentDocente(null);
  };

  const handleSaveDocente = (e) => {
    e.preventDefault();
    let updatedDocentes;
    
    if (currentDocente) {
      // Editar
      updatedDocentes = docentes.map(d => {
        if (d.id === currentDocente.id) {
          const nuevasIncidencias = [...d.incidencias];
          if (incidenciaDesc.trim() !== "") {
            nuevasIncidencias.push({
              id: Date.now().toString(),
              fecha: new Date().toLocaleDateString(),
              descripcion: incidenciaDesc
            });
          }
          const user = userService.getUsers().find((item) => item.id === d.userId);
          if (user) {
            const name = splitFullName(nombre);
            userService.saveUsers(userService.getUsers().map((item) => item.id === d.userId
              ? { ...item, nombres: name.nombres, apellidos: name.apellidos, dni: documento, estado: d.estado }
              : item));
          }
          return {
            ...d,
            userId: d.userId,
            nombre,
            documento,
            especialidad,
            salario: Number(salario),
            incidencias: nuevasIncidencias
          };
        }
        return d;
      });
    } else {
      const newUserId = `USR-${Date.now().toString().slice(-6)}`;
      const name = splitFullName(nombre);
      const newUser = {
        id: newUserId,
        ...name,
        dni: documento,
        correo: `${newUserId.toLowerCase()}@academia.edu.pe`,
        password: "docente123",
        celular: "",
        carreraObjetivo: especialidad,
        rol: "docente",
        estado: "Activo"
      };
      userService.saveUsers([newUser, ...userService.getUsers()]);
      const nuevoDocente = {
        id: newUserId,
        userId: newUserId,
        nombre,
        documento,
        especialidad,
        salario: Number(salario),
        incidencias: incidenciaDesc.trim() !== "" ? [{
          id: Date.now().toString(),
          fecha: new Date().toLocaleDateString(),
          descripcion: incidenciaDesc
        }] : [],
        estado: "Activo"
      };
      updatedDocentes = [nuevoDocente, ...docentes];
    }
    
    saveToStorage(updatedDocentes);
    handleCloseModal();
  };

  const handleDelete = (id) => {
    if (window.confirm("¿Seguro que deseas eliminar a este docente?")) {
      const updated = docentes.filter(d => d.id !== id);
      saveToStorage(updated);
      const docente = docentes.find((item) => item.id === id);
      if (docente?.userId) {
        userService.saveUsers(userService.getUsers().filter((user) => user.id !== docente.userId));
      }
    }
  };

  const filteredDocentes = docentes.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.documento.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {/* HEADER */}
      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 text-amber-800 text-xs font-bold uppercase tracking-wider">
                Nóminas e Incidencias
              </span>
              <h2 className="text-xl font-bold text-slate-800">
                Gestión de Docentes
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Control de información de docentes, salarios y registro de incidencias laborales.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleOpenModal()}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E3A8A] text-white hover:bg-blue-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4 text-white" />
              <span>Nuevo Docente</span>
            </button>
          </div>
        </div>

        {/* SEARCH */}
        <div className="mt-5 grid grid-cols-1 gap-3 pt-4 border-t border-slate-100">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar docente por nombre o documento..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg bg-slate-50 focus:bg-white focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all"
            />
          </div>
        </div>
      </div>

      {/* LIST OF DOCENTES */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filteredDocentes.map((docente) => (
          <div key={docente.id} className="bg-white border border-slate-200 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50/50 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold border border-blue-200">
                  {docente.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 line-clamp-1">
                    {docente.nombre}
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 mt-0.5">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {docente.especialidad}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${docente.estado === 'Activo' ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                {docente.estado}
              </span>
            </div>
            
            <div className="p-4 flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-500 flex items-center"><User className="w-3.5 h-3.5 mr-1"/> Documento:</span>
                <span className="font-semibold text-slate-700">{docente.documento}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs border-b border-dashed border-slate-200 pb-2">
                <span className="text-slate-500 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1"/> Nómina/Salario:</span>
                <span className="font-bold text-emerald-600">S/ {docente.salario.toFixed(2)}</span>
              </div>

              <div className="pt-1">
                <span className="text-xs text-slate-500 flex items-center mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500"/> Incidencias ({docente.incidencias.length}):
                </span>
                {docente.incidencias.length > 0 ? (
                  <ul className="text-[11px] space-y-1 mt-2">
                    {docente.incidencias.map((inc) => (
                      <li key={inc.id} className="bg-amber-50 text-amber-800 p-1.5 rounded flex gap-1 border border-amber-100">
                        <span className="font-bold">{inc.fecha}:</span> {inc.descripcion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-[11px] text-slate-400 italic">Sin incidencias registradas.</p>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 bg-slate-50 flex gap-2 justify-end">
              <button 
                onClick={() => handleOpenModal(docente)}
                className="p-1.5 text-blue-600 hover:bg-blue-100 rounded transition-colors"
                title="Editar docente e incidencias"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(docente.id)}
                className="p-1.5 text-red-600 hover:bg-red-100 rounded transition-colors"
                title="Eliminar docente"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          </div>
        ))}
      </div>

      {/* MODAL FORM */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh]">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50">
              <h3 className="font-bold text-slate-800 flex items-center">
                {currentDocente ? "Editar Docente" : "Nuevo Docente"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600">
                ✕
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form id="docente-form" onSubmit={handleSaveDocente} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Nombre Completo</label>
                  <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Documento</label>
                    <input required type="text" value={documento} onChange={e => setDocumento(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">Salario (S/)</label>
                    <input required type="number" step="0.01" min="0" value={salario} onChange={e => setSalario(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Especialidad</label>
                  <input required type="text" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden" />
                </div>

                <div className="border-t border-slate-100 pt-4 mt-4">
                  <label className="block text-xs font-semibold text-slate-700 mb-1 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500"/>
                    Registrar Nueva Incidencia (Opcional)
                  </label>
                  <textarea 
                    value={incidenciaDesc} 
                    onChange={e => setIncidenciaDesc(e.target.value)}
                    placeholder="Ej. Lleganza tardía, falta justificada, etc."
                    className="w-full px-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden h-20 resize-none"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-5 py-4 border-t border-slate-100 bg-slate-50 flex justify-end gap-2">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-xs font-semibold text-slate-600 bg-white border border-slate-300 rounded-lg hover:bg-slate-50">
                Cancelar
              </button>
              <button type="submit" form="docente-form" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 rounded-lg hover:bg-blue-700">
                Guardar Docente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
