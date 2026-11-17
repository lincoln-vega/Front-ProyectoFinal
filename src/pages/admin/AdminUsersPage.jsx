import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { RotateCcw, UserPlus, ShieldCheck } from "lucide-react";
import Notification from "../../components/admin/Notification";
import UserFilters from "../../components/admin/UserFilters";
import UserFormModal from "../../components/admin/UserFormModal";
import RolesModal from "../../components/admin/RolesModal";
import UsersTable from "../../components/admin/UsersTable";
import useUsers, { createInitialUserForm } from "../../hooks/useUsers";
import { adminUserRegistrationService } from "../../services/api";
import { getAuthenticatedAdminAccessToken } from "../../services/session";

export default function AdminUsersPage() {
  const [accessStatus, setAccessStatus] = useState("checking");

  useEffect(() => {
    let active = true;
    getAuthenticatedAdminAccessToken()
      .then(() => {
        if (active) setAccessStatus("allowed");
      })
      .catch(() => {
        if (active) setAccessStatus("denied");
      });

    return () => {
      active = false;
    };
  }, []);

  if (accessStatus === "checking") {
    return <p className="p-5 text-sm text-slate-500">Verificando la sesión de administrador...</p>;
  }
  if (accessStatus === "denied") {
    return <Navigate to="/login" replace />;
  }

  return <AdminUsersContent />;
}

function AdminUsersContent() {
  const {
    users,
    roles,
    addRole,
    editRole,
    deleteRole,
    resetUsers,
    deleteUser,
    saveUser,
    addCreatedUser,
    loading,
    error,
    setError
  } = useUsers();

  const [searchTerm, setSearchTerm] = useState("");
  const [roleFilter, setRoleFilter] = useState("TODOS");
  const [statusFilter, setStatusFilter] = useState("TODOS");
  const [notification, setNotification] = useState(null);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isRolesModalOpen, setIsRolesModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(createInitialUserForm);
  const [pendingAuthAccount, setPendingAuthAccount] = useState(null);
  const submissionLock = useRef(false);

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 4000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setError(null);
    setFormData(createInitialUserForm());
  };

  const openNewUserModal = () => {
    setEditingUserId(null);
    if (pendingAuthAccount) {
      setError("La cuenta de acceso ya existe. Reintenta guardar su perfil para completar el registro.");
      setFormData({
        ...pendingAuthAccount.profile,
        cicloVirtual: pendingAuthAccount.profile.ciclovirtual,
        rol: roles.find(
          (role) => String(role).toLowerCase() === pendingAuthAccount.profile.rol
        ) || pendingAuthAccount.profile.rol,
        password: ""
      });
    } else {
      setError(null);
      setFormData(createInitialUserForm());
    }
    setIsModalOpen(true);
  };

  const handleEdit = (user) => {
    if (pendingAuthAccount) {
      setError("Completa el guardado del perfil pendiente antes de editar otro usuario.");
      return;
    }
    setEditingUserId(user.id);
    setError(null);
    setFormData({ ...user });
    setIsModalOpen(true);
  };

  const handleDelete = async (user) => {
    const fullName = `${user.nombres} ${user.apellidos}`;
    if (window.confirm(`¿Estás seguro de eliminar el registro de ${fullName}?`)) {
      try {
        await deleteUser(user.id);
        showNotification(`Usuario "${fullName}" eliminado del registro.`);
      } catch (err) {
        showNotification(`No se pudo eliminar el usuario: ${err.message}`);
      }
    }
  };

  const handleResetData = async () => {
    try {
      await resetUsers();
      showNotification("Usuarios actualizados desde InsForge.");
    } catch (err) {
      showNotification(`No se pudieron cargar los usuarios: ${err.message}`);
    }
  };

  const handleSubmitForm = async (event) => {
    event.preventDefault();
    if (submissionLock.current) return;
    setError(null);

    if (!formData.apellidos || !formData.nombres || !formData.dni) {
      setError("Por favor complete los campos obligatorios (Nombres, Apellidos, Documento).");
      return;
    }

    const isEditing = Boolean(editingUserId);
    if (!isEditing && !pendingAuthAccount && (!formData.correo?.trim() || !formData.password)) {
      setError("El correo y la contraseña son obligatorios para crear la cuenta.");
      return;
    }

    setIsSubmitting(true);
    submissionLock.current = true;
    let pending = pendingAuthAccount;
    try {
      if (isEditing) {
        await saveUser(formData, editingUserId);
        closeModal();
        showNotification("Usuario actualizado correctamente.");
      } else {
        if (!pending) {
          const validationToken = await getAuthenticatedAdminAccessToken();
          await adminUserRegistrationService.validate(formData, validationToken);

          const authAccount = await adminUserRegistrationService.createAuthAccount(formData);
          pending = {
            ...authAccount,
            profile: adminUserRegistrationService.buildProfilePayload(
              formData,
              authAccount.authUserId
            )
          };
          setPendingAuthAccount(pending);
          setFormData((current) => ({ ...current, password: "" }));
        } else if (
          String(formData.correo || "").trim().toLowerCase() !== pending.profile.correo
        ) {
          throw new Error("No se puede cambiar el correo de una cuenta Auth ya creada.");
        }

        const profile = adminUserRegistrationService.buildProfilePayload(
          formData,
          pending.authUserId,
          pending.profile.id
        );
        pending = { ...pending, profile };
        setPendingAuthAccount(pending);

        const adminAccessToken = await getAuthenticatedAdminAccessToken();
        const savedUser = await adminUserRegistrationService.saveProfile(profile, adminAccessToken);
        addCreatedUser(savedUser);
        setPendingAuthAccount(null);
        closeModal();

        if (pending.requiresEmailVerification) {
          showNotification("Usuario registrado. Debe verificar su correo antes de iniciar sesión.");
        } else if (!pending.emailVerified) {
          showNotification("Usuario registrado; el correo todavía aparece sin verificar.");
        } else {
          showNotification("Usuario registrado correctamente.");
        }
      }
    } catch (err) {
      if (!isEditing && pending) {
        setPendingAuthAccount(pending);
        setError(
          `La cuenta de InsForge Auth ya fue creada, pero no se pudo guardar su perfil. ` +
          `Reintenta para enviar solo el perfil con la misma cuenta. ${err.message}`
        );
      } else {
        setError(err.message || "No se pudo completar el registro.");
      }
    } finally {
      submissionLock.current = false;
      setIsSubmitting(false);
    }
  };

  const normalizedSearchTerm = searchTerm.toLowerCase();
  const filteredUsers = users.filter((user) => {
    const searchableFields = [
      user.apellidos,
      user.nombres,
      user.dni,
      user.correo,
      user.carreraObjetivo,
      user.cicloVirtual,
      user.ciclovirtual
    ];
    const matchesSearch = searchableFields.some((field) =>
      String(field || "").toLowerCase().includes(normalizedSearchTerm)
    );
    const matchesRole = roleFilter === "TODOS" || String(user.rol).toLowerCase() === roleFilter.toLowerCase();
    const matchesStatus = statusFilter === "TODOS" || user.estado === statusFilter;

    return matchesSearch && matchesRole && matchesStatus;
  });

  return (
    <div className="space-y-5">
      {notification && (
        <Notification message={notification} onClose={() => setNotification(null)} />
      )}

      <div className="bg-white/60 dark:bg-white/5 backdrop-blur-2xl p-5 rounded-xl border border-slate-200 dark:border-white/10 shadow-2xs">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold text-slate-800 dark:text-white">
                Padrón General de Usuarios de la Academia
              </h2>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              Administración de matrículas, docentes y personal académico conectada a InsForge.
              Administración general de estudiantes, docentes y personal académico.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 text-slate-700 bg-white hover:bg-slate-50 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              title="Volver a consultar usuarios en InsForge"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500" />
              <span>Actualizar usuarios</span>
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

        {/* Solo mostramos el error aquí si el modal está cerrado */}
        {error && !isModalOpen && (
          <p role="alert" className="mt-4 rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700">
            {error}
          </p>
        )}

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
      {loading && <p className="text-sm text-slate-500">Consultando usuarios en InsForge...</p>}

      {isModalOpen && (
        <UserFormModal
          isEditing={Boolean(editingUserId)}
          formData={formData}
          roles={roles}
          serverError={error}
          isSubmitting={isSubmitting}
          onClearServerError={() => setError(null)}
          onChange={setFormData}
          onSubmit={handleSubmitForm}
          isPendingProfile={Boolean(pendingAuthAccount)}
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