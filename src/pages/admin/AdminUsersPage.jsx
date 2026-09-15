import { useState } from "react";
import { UserPlus, ShieldCheck, GraduationCap, BriefcaseBusiness } from "lucide-react";
import Notification from "../../components/admin/Notification";
import UserFilters from "../../components/admin/UserFilters";
import UserFormModal from "../../components/admin/UserFormModal";
import UsersTable from "../../components/admin/UsersTable";
import useUsers, { createInitialUserForm } from "../../hooks/useUsers";

export default function AdminUsersPage() {
  const {
    users,
    deleteUser,
    saveUser
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [notification, setNotification] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(createInitialUserForm);

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 3500);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData({ ...createInitialUserForm(), rol: "admin" });
  };

  const openNewUserModal = () => {
    setEditingUserId(null);
    setFormData({ ...createInitialUserForm(), rol: "admin" });
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
    const matchesRole = String(user.rol).toLowerCase() === "admin";
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
              onClick={openNewUserModal}
              className="inline-flex items-center space-x-2 px-4 py-2 bg-[#1E3A8A] text-white hover:bg-blue-800 rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <UserPlus className="w-4 h-4 text-amber-300" />
              <span>Nueva cuenta Admin</span>
            </button>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-1 md:grid-cols-3 gap-3 pt-4 border-t border-slate-100">
          <div className="rounded-lg border border-blue-100 bg-blue-50/60 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-[#1E3A8A]"><ShieldCheck className="w-4 h-4" />Cuentas y accesos</div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">Aquí se activan, bloquean o editan las cuentas administrativas. No se registran alumnos ni docentes.</p>
          </div>
          <div className="rounded-lg border border-emerald-100 bg-emerald-50/60 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-emerald-800"><GraduationCap className="w-4 h-4" />Matrículas</div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">El alta del estudiante comienza al crear una matrícula y genera su acceso automáticamente.</p>
          </div>
          <div className="rounded-lg border border-amber-100 bg-amber-50/60 p-3">
            <div className="flex items-center gap-2 text-xs font-bold text-amber-800"><BriefcaseBusiness className="w-4 h-4" />Docentes y nóminas</div>
            <p className="mt-1 text-[11px] leading-relaxed text-slate-600">El docente se registra en su módulo laboral, junto con especialidad, salario e incidencias.</p>
          </div>
        </div>

        <UserFilters
          searchTerm={searchTerm}
          roleFilter="admin"
          statusFilter={statusFilter}
          roles={[]}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          showRoleFilter={false}
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
          roles={["admin"]}
          showRole={false}
          onChange={setFormData}
          onSubmit={handleSubmitForm}
          onClose={closeModal}
        />
      )}

    </div>
  );
}