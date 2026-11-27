import { useEffect, useRef, useState } from "react";
import { Navigate } from "react-router-dom";
import { RotateCcw, UserPlus, ShieldCheck, FileSpreadsheet } from "lucide-react";
import Notification from "../../components/admin/Notification";
import UserFilters from "../../components/admin/UserFilters";
import UserFormModal from "../../components/admin/UserFormModal";
import RolesModal from "../../components/admin/RolesModal";
import UsersTable from "../../components/admin/UsersTable";
import ReportViewerModal from "../../components/shared/ReportViewerModal";
import { exportToCSV } from "../../utils/exportUtils";
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
  const [reportTarget, setReportTarget] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [editingUserId, setEditingUserId] = useState(null);
  const [formData, setFormData] = useState(createInitialUserForm);
  
  const PENDING_AUTH_KEY = "academia_pending_auth_account";
  const [pendingAuthAccount, setPendingAuthAccountState] = useState(() => {
    try {
      const stored = sessionStorage.getItem(PENDING_AUTH_KEY);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  });

  const setPendingAuthAccount = (pending) => {
    setPendingAuthAccountState(pending);
    try {
      if (pending) {
        sessionStorage.setItem(PENDING_AUTH_KEY, JSON.stringify(pending));
      } else {
        sessionStorage.removeItem(PENDING_AUTH_KEY);
      }
    } catch (err) {
      console.warn("Error persistiendo pending auth account:", err);
    }
  };

  const submissionLock = useRef(false);

  const showNotification = (message) => {
    setNotification(message);
    window.setTimeout(() => setNotification(null), 4000);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingUserId(null);
    setError(null);
    if (!pendingAuthAccount) {
      setFormData(createInitialUserForm());
    }
  };

  const openNewUserModal = () => {
    setEditingUserId(null);
    if (pendingAuthAccount) {
      setError("La cuenta de acceso ya existe. Reintenta guardar su perfil para completar el registro.");
      setFormData({
        ...pendingAuthAccount.profile,
        cicloVirtual:
          pendingAuthAccount.profile.cicloVirtual ||
          pendingAuthAccount.profile.ciclovirtual ||
          "Semestral",
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

  const handleDiscardPendingAccount = () => {
    setPendingAuthAccount(null);
    setError(null);
    setFormData(createInitialUserForm());
    showNotification("Cuenta pendiente descartada. Puedes registrar un nuevo usuario.");
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
      showNotification("Usuarios actualizados desde la base de datos.");
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

    if (!formData.fechaNacimiento) {
      setError("La fecha de nacimiento es obligatoria.");
      return;
    }

    if (!formData.carreraObjetivo?.trim()) {
      setError("Seleccione una carrera objetivo del área académica.");
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
        await resetUsers().catch(() => {});
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
          pending.authUserId
        );
        pending = { ...pending, profile };
        setPendingAuthAccount(pending);

        const adminAccessToken = await getAuthenticatedAdminAccessToken();
        const savedUser = await adminUserRegistrationService.saveProfile(profile, adminAccessToken);
        addCreatedUser(savedUser);
        await resetUsers().catch(() => {});
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
          `La cuenta de Supabase Auth ya fue creada, pero no se pudo guardar su perfil. ` +
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
      user.areaAcademica,
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
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={() => {
                if (!filteredUsers.length) {
                  showNotification("No hay usuarios en el filtro actual para exportar.");
                  return;
                }
                exportToCSV(filteredUsers, "padron_general_usuarios", [
                  { key: "id", label: "CODIGO" },
                  { key: "apellidos", label: "APELLIDOS" },
                  { key: "nombres", label: "NOMBRES" },
                  { key: "tipoDocumento", label: "TIPO DOC" },
                  { key: "dni", label: "NRO DOCUMENTO" },
                  { key: "correo", label: "CORREO" },
                  { key: "celular", label: "CELULAR" },
                  { key: "rol", label: "ROL" },
                  { key: "carreraObjetivo", label: "CARRERA / ESPECIALIDAD" },
                  { key: "cicloVirtual", label: "CICLO" },
                  { key: "estado", label: "ESTADO" }
                ]);
                showNotification("Padrón de usuarios exportado exitosamente a Excel (.csv).");
              }}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 rounded-lg text-xs font-semibold shadow-2xs transition-colors cursor-pointer"
            >
              <FileSpreadsheet className="w-3.5 h-3.5" />
              <span>Exportar Padrón (Excel)</span>
            </button>

            <button
              type="button"
              onClick={handleResetData}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
              title="Volver a consultar usuarios en Supabase"
            >
              <RotateCcw className="w-3.5 h-3.5 text-slate-500 dark:text-slate-400" />
              <span>Actualizar usuarios</span>
            </button>

            <button
              type="button"
              onClick={() => setIsRolesModalOpen(true)}
              className="inline-flex items-center space-x-1.5 px-3 py-2 border border-slate-300 dark:border-white/10 text-slate-700 dark:text-slate-200 bg-white dark:bg-white/5 hover:bg-slate-50 dark:hover:bg-white/10 rounded-lg text-xs font-medium shadow-2xs transition-colors cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-slate-600 dark:text-slate-400" />
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

        {pendingAuthAccount && !isModalOpen && (
          <div className="mt-4 p-3 rounded-lg border border-amber-300 bg-amber-50 dark:bg-amber-950/40 text-amber-900 dark:text-amber-200 text-xs flex items-center justify-between gap-3">
            <div>
              <p className="font-semibold">Registro pendiente de perfil</p>
              <p className="text-[11px] text-amber-700 dark:text-amber-300">
                La cuenta Auth para <strong>{pendingAuthAccount.profile?.correo}</strong> ya fue creada. Falta guardar su perfil en la base de datos.
              </p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <button
                type="button"
                onClick={openNewUserModal}
                className="px-3 py-1.5 bg-[#1E3A8A] text-white rounded-lg font-semibold hover:bg-blue-800 transition-colors cursor-pointer"
              >
                Completar Perfil
              </button>
              <button
                type="button"
                onClick={handleDiscardPendingAccount}
                className="px-3 py-1.5 border border-slate-300 text-slate-700 dark:text-slate-200 bg-white dark:bg-white/10 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Descartar
              </button>
            </div>
          </div>
        )}

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
        onOpenReport={(user) => {
          const isDoc = ["docente", "profesor", "profesora"].includes(
            String(user.rol || "").toLowerCase()
          );
          const fullName = `${user.nombres || ""} ${user.apellidos || ""}`.trim();
          setReportTarget(
            isDoc
              ? {
                  title: `Récord y Liquidación Docente — ${fullName}`,
                  subtitle: "Auditoría oficial de cátedras, sesiones Meet, incidencias y haberes",
                  endpointPath: "/reportes/docentes",
                  params: { docente_id: user.id },
                  csvFilename: `record_docente_${user.id}`
                }
              : {
                  title: `Kardex Académico Individual — ${fullName}`,
                  subtitle: "Récord oficial de asignaturas, evaluaciones vigesimales y asistencia",
                  endpointPath: `/reportes/kardex-alumno/${encodeURIComponent(user.id)}`,
                  params: {},
                  csvFilename: `kardex_alumno_${user.id}`
                }
          );
        }}
      />
      {loading && <p className="text-sm text-slate-500">Consultando usuarios en Supabase...</p>}

      <ReportViewerModal
        isOpen={Boolean(reportTarget)}
        onClose={() => setReportTarget(null)}
        title={reportTarget?.title}
        subtitle={reportTarget?.subtitle}
        endpointPath={reportTarget?.endpointPath}
        params={reportTarget?.params}
        csvFilename={reportTarget?.csvFilename}
      />

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