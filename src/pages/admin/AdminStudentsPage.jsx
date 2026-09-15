import { useState } from "react";
import Notification from "../../components/admin/Notification";
import UserFilters from "../../components/admin/UserFilters";
import UserFormModal from "../../components/admin/UserFormModal";
import UsersTable from "../../components/admin/UsersTable";
import useUsers, { createInitialUserForm } from "../../hooks/useUsers";

const STUDENT_ROLE = "estudiante";

export default function AdminStudentsPage() {
  const { users, deleteUser, saveUser } = useUsers();
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [notification, setNotification] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState({ ...createInitialUserForm(), rol: STUDENT_ROLE });

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 3500);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setFormData({ ...createInitialUserForm(), rol: STUDENT_ROLE });
  };

  const handleEdit = (student) => {
    setEditingUserId(student.id);
    setFormData({ ...student, rol: STUDENT_ROLE });
    setIsModalOpen(true);
  };

  const handleDelete = (student) => {
    const fullName = `${student.nombres} ${student.apellidos}`;
    if (window.confirm(`¿Estás seguro de eliminar a ${fullName}?`)) {
      deleteUser(student.id);
      showNotification(`Estudiante "${fullName}" eliminado.`);
    }
  };

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!formData.apellidos || !formData.nombres || !formData.dni) {
      window.alert("Completa nombres, apellidos y DNI.");
      return;
    }

    saveUser({ ...formData, rol: STUDENT_ROLE }, editingUserId);
    showNotification(editingUserId ? "Estudiante actualizado." : "Estudiante registrado.");
    closeModal();
  };

  const students = users.filter((user) => String(user.rol).toLowerCase() === STUDENT_ROLE);
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [student.apellidos, student.nombres, student.dni, student.correo, student.carreraObjetivo]
      .some((field) => String(field || "").toLowerCase().includes(term));
    return matchesSearch && (statusFilter === "TODOS" || student.estado === statusFilter);
  });

  return (
    <div className="space-y-5">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-emerald-700">Expediente académico</p>
            <h2 className="text-xl font-bold text-slate-800">Gestión de Estudiantes</h2>
            <p className="text-xs text-slate-500 mt-1">Administra los datos personales y académicos de los alumnos.</p>
          </div>
        </div>

        <UserFilters
          searchTerm={searchTerm}
          roleFilter={STUDENT_ROLE}
          statusFilter={statusFilter}
          onSearchChange={setSearchTerm}
          onStatusChange={setStatusFilter}
          showRoleFilter={false}
        />
      </div>

      <UsersTable
        users={filteredStudents}
        totalUsers={students.length}
        activeUsers={students.filter((user) => user.estado === "Activo").length}
        inactiveUsers={students.filter((user) => user.estado === "Inactivo").length}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />

      {isModalOpen && (
        <UserFormModal
          isEditing={Boolean(editingUserId)}
          formData={formData}
          roles={[STUDENT_ROLE]}
          showRole={false}
          onChange={setFormData}
          onSubmit={handleSubmit}
          onClose={closeModal}
        />
      )}
    </div>
  );
}
