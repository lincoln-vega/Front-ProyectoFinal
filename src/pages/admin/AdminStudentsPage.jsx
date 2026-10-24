import { useState } from "react";
import Notification from "../../components/admin/Notification";
import UserFilters from "../../components/admin/UserFilters";
import UserFormModal from "../../components/admin/UserFormModal";
import UsersTable from "../../components/admin/UsersTable";
import useUsers, { createInitialUserForm } from "../../hooks/useUsers";

const STUDENT_ROLE = "estudiante";

export default function AdminStudentsPage() {
  const { users, deleteUser, saveUser, error, loading, setError } = useUsers();
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

  const handleDelete = async (student) => {
    const fullName = `${student.nombres} ${student.apellidos}`;
    if (window.confirm(`¿Estás seguro de eliminar a ${fullName}?`)) {
      try {
        await deleteUser(student.id);
        showNotification(`Estudiante "${fullName}" eliminado.`);
      } catch (err) {
        showNotification(`No se pudo eliminar el estudiante: ${err.message}`);
      }
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.apellidos || !formData.nombres || !formData.dni) {
      showNotification("Completa nombres, apellidos y DNI.");
      return;
    }

    try {
      await saveUser({ ...formData, rol: STUDENT_ROLE }, editingUserId);
      showNotification(editingUserId ? "Estudiante actualizado." : "Perfil guardado. Crea también su cuenta en InsForge Auth para que pueda iniciar sesión.");
      closeModal();
    } catch (err) {
      setError(err.message);
    }
  };

  const students = users.filter((user) => String(user.rol).toLowerCase() === STUDENT_ROLE);
  const filteredStudents = students.filter((student) => {
    const term = searchTerm.toLowerCase();
    const matchesSearch = [
      student.apellidos,
      student.nombres,
      student.dni,
      student.correo,
      student.carreraObjetivo,
      student.cicloVirtual,
      student.ciclovirtual
    ].some((field) => String(field || "").toLowerCase().includes(term));
    return matchesSearch && (statusFilter === "TODOS" || student.estado === statusFilter);
  });

  return (
    <div className="space-y-5">
      {notification && <Notification message={notification} onClose={() => setNotification(null)} />}
      {error && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {loading && <p className="text-sm text-slate-500">Consultando estudiantes en InsForge...</p>}

      <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <p className="text-xs font-bold uppercase tracking-wider text-emerald-700">Expediente académico</p>
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
