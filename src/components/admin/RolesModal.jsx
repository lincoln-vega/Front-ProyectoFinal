import { useState } from "react";
import { ShieldCheck, Plus, Pencil, Trash2, X, Check } from "lucide-react";

export default function RolesModal({ roles, onAddRole, onEditRole, onDeleteRole, onClose }) {
  const [newRole, setNewRole] = useState("");
  const [editingIndex, setEditingIndex] = useState(null);
  const [editingText, setEditingText] = useState("");

  const handleAdd = (e) => {
    e.preventDefault();
    if (!newRole.trim()) return;
    onAddRole(newRole.trim());
    setNewRole("");
  };

  const handleStartEdit = (index, role) => {
    setEditingIndex(index);
    setEditingText(role);
  };

  const handleSaveEdit = (index) => {
    if (!editingText.trim()) return;
    onEditRole(index, editingText.trim());
    setEditingIndex(null);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white dark:bg-white/5 dark:backdrop-blur-2xl rounded-xl shadow-xl w-full max-w-md overflow-hidden border border-slate-200 dark:border-white/10">
        
        {/* Header */}
        <div className="flex items-center justify-between px-5 py-4 bg-slate-50 dark:bg-white/5 border-b border-slate-200 dark:border-white/10">
          <div className="flex items-center space-x-2">
            <ShieldCheck className="w-5 h-5 text-[#1E3A8A] dark:text-blue-400" />
            <h3 className="font-bold text-slate-800 dark:text-white text-base">Gestionar Roles del Sistema</h3>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg p-1 hover:bg-slate-100 dark:hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Formulario Agregar Rol */}
          <form onSubmit={handleAdd} className="flex gap-2">
            <input
              type="text"
              placeholder="Nombre del nuevo rol..."
              value={newRole}
              onChange={(e) => setNewRole(e.target.value)}
              className="flex-1 px-3 py-2 border border-slate-300 dark:border-white/10 rounded-lg text-xs focus:ring-2 focus:ring-blue-500 focus:outline-hidden bg-white dark:bg-white/5 dark:text-white"
            />
            <button
              type="submit"
              className="inline-flex items-center space-x-1 px-3 py-2 bg-[#1E3A8A] dark:bg-white/10 dark:hover:bg-white/20 border border-transparent dark:border-white/10 text-white hover:bg-blue-800 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Agregar</span>
            </button>
          </form>

          {/* Lista de Roles */}
          <div className="border border-slate-200 dark:border-white/10 rounded-lg divide-y divide-slate-100 dark:divide-white/5 max-h-60 overflow-y-auto">
            {roles.map((role, index) => (
              <div key={index} className="flex items-center justify-between p-3 hover:bg-slate-50 dark:hover:bg-white/5 transition-colors">
                {editingIndex === index ? (
                  <input
                    type="text"
                    value={editingText}
                    onChange={(e) => setEditingText(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleSaveEdit(index); }}
                    className="flex-1 px-2 py-1 border border-blue-400 rounded text-xs focus:outline-hidden mr-2 bg-white dark:bg-white/10 dark:text-white"
                    autoFocus
                  />
                ) : (
                  <span className="text-xs font-medium text-slate-700 dark:text-slate-300">{role}</span>
                )}

                <div className="flex items-center space-x-1">
                  {editingIndex === index ? (
                    <button
                      onClick={() => handleSaveEdit(index)}
                      className="p-1 text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-500/10 rounded transition-colors cursor-pointer"
                      title="Guardar"
                    >
                      <Check className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => handleStartEdit(index, role)}
                      className="p-1 text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
                      title="Editar"
                    >
                      <Pencil className="w-3.5 h-3.5" />
                    </button>
                  )}

                  <button
                    onClick={() => onDeleteRole(role)}
                    className="p-1 text-slate-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-white/10 rounded transition-colors cursor-pointer"
                    title="Eliminar"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end px-5 py-3 bg-slate-50 dark:bg-white/5 border-t border-slate-200 dark:border-white/10">
          <button
            onClick={onClose}
            className="px-4 py-1.5 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-300 bg-white dark:bg-transparent hover:bg-slate-100 dark:hover:bg-white/10 rounded-lg text-xs font-medium transition-colors cursor-pointer"
          >
            Cerrar
          </button>
        </div>

      </div>
    </div>
  );
}