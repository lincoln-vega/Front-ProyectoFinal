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

// Persistencia directa en InsForge (users.salario)

const splitFullName = (fullName) => {
  const parts = fullName.trim().split(/\s+/);
  return {
    nombres: parts.slice(0, -1).join(" ") || parts[0] || "",
    apellidos: parts.at(-1) || ""
  };
};

export default function DocentesPage() {
  const [docentes, setDocentes] = useState([]);
  const [users, setUsers] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentDocente, setCurrentDocente] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [feedback, setFeedback] = useState({ message: "", type: "" });
  
  // Form states
  const [nombre, setNombre] = useState("");
  const [documento, setDocumento] = useState("");
  const [especialidad, setEspecialidad] = useState("");
  const [salario, setSalario] = useState("");
  const [incidenciaDesc, setIncidenciaDesc] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function loadTeachers() {
      try {
        setLoading(true);
        setError("");
        const allUsers = await userService.getUsers();

        if (cancelled) return;

        const teacherUsers = (allUsers || []).filter((user) => {
          const r = String(user.rol || "").toLowerCase();
          return r === "docente" || r === "profesor" || r === "profesora";
        });

        const initialData = teacherUsers.map((user) => ({
          id: user.id,
          userId: user.id,
          nombre: `${user.nombres || ""} ${user.apellidos || ""}`.trim() || user.correo || "Docente",
          documento: user.dni || "N/A",
          especialidad: user.carreraObjetivo || user.areaAcademica || "Sin especialidad asignada",
          salario: Number(user.salario || 0),
          incidencias: [],
          estado: user.estado || "Activo"
        }));

        setUsers(allUsers || []);
        setDocentes(initialData);
        // Sincronizado con InsForge
      } catch (err) {
        if (!cancelled) {
          console.error("Error al cargar docentes desde InsForge:", err);
          setError(err.message || "No se pudieron cargar los docentes desde InsForge.");
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    }

    loadTeachers();
    return () => { cancelled = true; };
  }, []);

  const saveToStorage = (data) => { setDocentes(data); };

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

  const handleSaveDocente = async (e) => {
    e.preventDefault();
    let updatedDocentes;
    try {
      if (currentDocente) {
        const original = docentes.find((item) => item.id === currentDocente.id);
        const user = users.find((item) => item.id === original?.userId);
        if (user) {
          const name = splitFullName(nombre);
          const savedUser = await userService.saveUser({
            ...user,
            nombres: name.nombres,
            apellidos: name.apellidos,
            dni: documento,
            carreraObjetivo: especialidad,
            salario: Number(salario) || 0,
            estado: currentDocente.estado
          });
          setUsers((current) => current.map((item) => item.id === savedUser.id ? savedUser : item));
        }

        updatedDocentes = docentes.map((docente) => {
          if (docente.id !== currentDocente.id) return docente;
          const nuevasIncidencias = [...docente.incidencias];
          if (incidenciaDesc.trim()) {
            nuevasIncidencias.push({
              id: Date.now().toString(),
              fecha: new Date().toLocaleDateString(),
              descripcion: incidenciaDesc
            });
          }
          return {
            ...docente,
            nombre,
            documento,
            especialidad,
            salario: Number(salario),
            incidencias: nuevasIncidencias
          };
        });
      } else {
      const newUserId = `USR-${Date.now().toString().slice(-6)}`;
      const name = splitFullName(nombre);
      const newUser = {
        id: newUserId,
        ...name,
        dni: documento,
        correo: `${newUserId.toLowerCase()}@academia.edu.pe`,
        celular: "",
        carreraObjetivo: especialidad,
        salario: Number(salario) || 0,
        rol: "docente",
        estado: "Activo"
      };
      const savedUser = await userService.saveUser(newUser);
      setUsers((current) => [savedUser, ...current]);
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
      setFeedback({ message: "Docente y nómina guardados correctamente en InsForge.", type: "success" }); setTimeout(() => setFeedback({ message: "", type: "" }), 4000);
    } catch (error) {
      console.error("Error al guardar docente:", error); setError(error.message || "No se pudo guardar el docente.");
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que deseas eliminar a este docente?")) {
      try {
        const updated = docentes.filter(d => d.id !== id);
        const docente = docentes.find((item) => item.id === id);
        if (docente?.userId) {
          await userService.deleteUser(docente.userId);
          setUsers((current) => current.filter((user) => user.id !== docente.userId));
        }
        saveToStorage(updated);
      } catch (error) {
        console.error("Error al eliminar docente:", error); setError(error.message || "No se pudo eliminar el docente.");
      }
    }
  };

  const filteredDocentes = docentes.filter(d => 
    d.nombre.toLowerCase().includes(searchTerm.toLowerCase()) || 
    d.documento.includes(searchTerm)
  );

  return (
    <div className="space-y-6">
      {feedback.message && (
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 text-sm font-medium animate-fade-in flex items-center justify-between">
          <span>{feedback.message}</span>
          <button onClick={() => setFeedback({ message: "", type: "" })} className="text-emerald-700 dark:text-emerald-400 hover:opacity-80">✕</button>
        </div>
      )}
      {error && (
        <div className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/10 text-rose-700 dark:text-rose-400 text-sm font-medium animate-fade-in flex items-center justify-between">
          <span>{error}</span>
          <button onClick={() => setError("")} className="text-rose-700 dark:text-rose-400 hover:opacity-80">✕</button>
        </div>
      )}
      {/* HEADER */}
      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <span className="px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-900/30 text-amber-800 dark:text-amber-400 text-xs font-bold uppercase tracking-wider">
                Nóminas e Incidencias
              </span>
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Gestión de Docentes
              </h2>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
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
        <div className="mt-5 grid grid-cols-1 gap-3 pt-4 border-t border-slate-100 dark:border-white/10">
          <div className="relative">
            <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar docente por nombre o documento..."
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 dark:border-white/10 rounded-lg bg-slate-50 dark:bg-white/5 dark:text-white focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-[#1E3A8A] focus:ring-1 focus:ring-[#1E3A8A] transition-all"
            />
          </div>
        </div>
      </div>

      {/* LIST OF DOCENTES */}
      {error && (
        <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
          {error}
        </p>
      )}
      {loading && (
        <p className="text-sm text-slate-500">
          Consultando docentes en InsForge...
        </p>
      )}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {!loading && filteredDocentes.length === 0 && !error && (
          <div className="col-span-full py-12 text-center bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-xl border border-slate-200 dark:border-white/10">
            <p className="text-slate-500 dark:text-slate-400">No se encontraron docentes con los filtros actuales.</p>
          </div>
        )}
        {filteredDocentes.map((docente) => (
          <div key={docente.id} className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl border border-slate-200 dark:border-white/10 rounded-xl overflow-hidden shadow-xs hover:shadow-md transition-shadow flex flex-col">
            <div className="p-4 border-b border-slate-100 dark:border-white/10 bg-slate-50/50 dark:bg-white/5 flex items-start justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900/30 flex items-center justify-center text-blue-700 dark:text-blue-400 font-bold border border-blue-200 dark:border-blue-900/50">
                  {docente.nombre.charAt(0)}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-800 dark:text-white line-clamp-1">
                    {docente.nombre}
                  </h3>
                  <div className="flex items-center text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    <Briefcase className="w-3 h-3 mr-1" />
                    {docente.especialidad}
                  </div>
                </div>
              </div>
              <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${docente.estado === 'Activo' ? 'bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400' : 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'}`}>
                {docente.estado}
              </span>
            </div>
            
            <div className="p-4 flex-1 space-y-3">
              <div className="flex items-center justify-between text-xs border-b border-dashed border-slate-200 dark:border-white/10 pb-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center"><User className="w-3.5 h-3.5 mr-1"/> Documento:</span>
                <span className="font-semibold text-slate-700 dark:text-slate-300">{docente.documento}</span>
              </div>
              
              <div className="flex items-center justify-between text-xs border-b border-dashed border-slate-200 dark:border-white/10 pb-2">
                <span className="text-slate-500 dark:text-slate-400 flex items-center"><DollarSign className="w-3.5 h-3.5 mr-1"/> Nómina/Salario:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">S/ {docente.salario.toFixed(2)}</span>
              </div>

              <div className="pt-1">
                <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center mb-1">
                  <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500"/> Incidencias ({docente.incidencias.length}):
                </span>
                {docente.incidencias.length > 0 ? (
                  <ul className="text-xs space-y-1 mt-2">
                    {docente.incidencias.map((inc) => (
                      <li key={inc.id} className="bg-amber-50 dark:bg-amber-900/10 text-amber-800 dark:text-amber-400 p-1.5 rounded flex gap-1 border border-amber-100 dark:border-amber-900/30">
                        <span className="font-bold">{inc.fecha}:</span> {inc.descripcion}
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-slate-400 dark:text-slate-500 italic">Sin incidencias registradas.</p>
                )}
              </div>
            </div>

            <div className="p-3 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex gap-2 justify-end">
              <button 
                onClick={() => handleOpenModal(docente)}
                className="p-1.5 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/30 rounded transition-colors"
                title="Editar docente e incidencias"
              >
                <Edit2 className="w-4 h-4" />
              </button>
              <button 
                onClick={() => handleDelete(docente.id)}
                className="p-1.5 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-colors"
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
          <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl rounded-xl shadow-xl w-full max-w-md overflow-hidden flex flex-col max-h-[90vh] border dark:border-white/10">
            <div className="px-5 py-4 border-b border-slate-100 dark:border-white/10 flex items-center justify-between bg-slate-50 dark:bg-white/5">
              <h3 className="font-bold text-slate-800 dark:text-white flex items-center">
                {currentDocente ? "Editar Docente" : "Nuevo Docente"}
              </h3>
              <button onClick={handleCloseModal} className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                ✕
              </button>
            </div>
            
            <div className="p-5 overflow-y-auto flex-1">
              <form id="docente-form" onSubmit={handleSaveDocente} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Nombre Completo</label>
                  <input required type="text" value={nombre} onChange={e => setNombre(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white/60 dark:bg-white/5 backdrop-blur-2xl/50 dark:text-white" />
                </div>
                
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Documento</label>
                    <input required type="text" value={documento} onChange={e => setDocumento(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white/60 dark:bg-white/5 backdrop-blur-2xl/50 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Salario (S/)</label>
                    <input required type="number" step="0.01" min="0" value={salario} onChange={e => setSalario(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white/60 dark:bg-white/5 backdrop-blur-2xl/50 dark:text-white" />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1">Especialidad</label>
                  <input required type="text" value={especialidad} onChange={e => setEspecialidad(e.target.value)} className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden bg-white/60 dark:bg-white/5 backdrop-blur-2xl/50 dark:text-white" />
                </div>

                <div className="border-t border-slate-100 dark:border-white/10 pt-4 mt-4">
                  <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1 flex items-center">
                    <AlertTriangle className="w-3.5 h-3.5 mr-1 text-amber-500"/>
                    Registrar Nueva Incidencia (Opcional)
                  </label>
                  <textarea 
                    value={incidenciaDesc} 
                    onChange={e => setIncidenciaDesc(e.target.value)}
                    placeholder="Ej. Lleganza tardía, falta justificada, etc."
                    className="w-full px-3 py-2 text-sm border border-slate-200 dark:border-white/10 rounded-lg focus:ring-1 focus:ring-blue-500 focus:border-blue-500 outline-hidden h-20 resize-none bg-white/60 dark:bg-white/5 backdrop-blur-2xl/50 dark:text-white"
                  ></textarea>
                </div>
              </form>
            </div>
            
            <div className="px-5 py-4 border-t border-slate-100 dark:border-white/10 bg-slate-50 dark:bg-white/5 flex justify-end gap-2">
              <button type="button" onClick={handleCloseModal} className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 bg-white dark:bg-white/5 border border-slate-300 dark:border-white/10 rounded-lg hover:bg-slate-50 dark:hover:bg-white/5">
                Cancelar
              </button>
              <button type="submit" form="docente-form" className="px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg">
                Guardar Docente
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
