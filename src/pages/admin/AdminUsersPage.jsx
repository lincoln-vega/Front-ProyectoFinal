import { useState } from "react";
import { RotateCcw, UserPlus, ShieldCheck } from "lucide-react";
import Notification from "../../components/admin/Notification";
import UserFilters from "../../components/admin/UserFilters";
import UserFormModal from "../../components/admin/UserFormModal";
import RolesModal from "../../components/admin/RolesModal";
import UsersTable from "../../components/admin/UsersTable";
import useUsers, { createInitialUserForm } from "../../hooks/useUsers";

export default function AdminUsersPage() {
  const {
    users,
    roles,
    addRole,
    editRole,
    deleteRole,
    resetUsers,
    deleteUser,
    saveUser
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [notification, setNotification] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(createInitialUserForm);

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 3500);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData(createInitialUserForm());
  };

  const openNewUserModal = () => {
    setEditingUserId(null);
    setFormData(createInitialUserForm());
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    setEditingUserId(user.id);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDelete = (user) => {
    const fullName = `${user.nombres} ${user.apellidos}`;
    if (window.confirm(`¿Estás seguro de eliminar el registro de ${fullName}?`)) {
      deleteUser(user.id);
      showNotification(`Usuario "${fullName}" eliminado del registro.`);
    }
  };

  const handleResetData = () => {
    resetUsers();
    showNotification("Se han restaurado los datos iniciales de prueba.");
  };

  const handleSubmitForm = (event) => {
    event.preventDefault();
    if (!formData.apellidos || !formData.nombres || !formData.dni) {
      window.alert("Por favor complete los campos obligatorios (Nombres, Apellidos, DNI).");
      return;
    }

    const isEditing = Boolean(editingUserId);
    saveUser(formData, editingUserId);
    showNotification(isEditing ? "Usuario actualizado correctamente." : "Nuevo usuario registrado con éxito.");
    closeModal();
  };

  const normalizedSearchTerm = searchTerm.toLowerCase();
  const filteredUsers = users.filter((user) => {
    const searchableFields = [
      user.apellidos,
      user.nombres,
      user.dni,
      user.correo,
      user.carreraObjetivo
    ];
    const matchesSearch = searchableFields.some((field) =>
      String(field || "").toLowerCase().includes(normalizedSearchTerm)
    );
    const matchesRole = roleFilter === "TODOS" || user.rol === roleFilter;
    const matchesStatus = statusFilter === "TODOS" || user.estado === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              title="Restaurar datos JSON simulados por defecto"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Restablecer Mock</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRolesModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600" />
              <span>Gestionar Roles</span>
            </button>

            <button
              type="button"
              onClick={openNewUserModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E3A8A] text-white hover:bg-blue-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>Nuevo Usuario</span>
            </button>
          </div>
        </div>

        <UserFilters
          searchTerm={searchTerm}
          roleFilter={roleFilter}
          statusFilter={statusFilter}
          roles={roles}
          onSearchChange={setSearchTerm}
          onRoleChange={setRoleFilter}
          onStatusChange={setStatusFilter}
        />
      </div>

      <UsersTable
        users={filteredUsers}
        totalUsers={users.length}
        activeUsers={users.filter((user) => user.estado === "Activo").length}
        inactiveUsers={users.filter((user) => user.estado === "Inactivo").length}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isModalOpen && (
        <UserFormModal
          isEditing={Boolean(editingUserId)}
          formData={formData}
          roles={roles}
          onChange={setFormData}
          onSubmit={handleSubmitForm}
          onClose={closeModal}
        />
      )}

      {isRolesModalOpen && (
        <RolesModal
          roles={roles}
          onAddRole={addRole}
          onEditRole={editRole}
          onDeleteRole={deleteRole}
          onClose={() => setIsRolesModalOpen(false)}
        />
      )}
    </div>
  );
}