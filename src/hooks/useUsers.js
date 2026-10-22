import { useEffect, useState } from "react";
import { userService, roleService } from "../services/api";

export const createInitialUserForm = () => ({
  apellidos: "",
  nombres: "",
  dni: "",
  fechaNacimiento: "",
  correo: "",
  celular: "",
  areaAcademica: "",
  carreraObjetivo: "",
  cicloVirtual: "Semestral",
  rol: "Estudiante",
  estado: "Activo"
});

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(() => roleService.getRoles());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    userService.getUsers()
      .then(setUsers)
      .catch((err) => {
        console.error("Error al cargar usuarios:", err);
        setError(err.message);
      })
      .finally(() => setLoading(false));
  }, []);

  const saveRolesToStorage = (updatedRoles) => {
    setRoles(updatedRoles);
    roleService.saveRoles(updatedRoles);
  };

  const addRole = (newRole) => {
    if (!newRole || roles.includes(newRole)) return;
    saveRolesToStorage([...roles, newRole]);
  };

  const editRole = (index, updatedRole) => {
    const oldRole = roles[index];
    const updatedRoles = [...roles];
    updatedRoles[index] = updatedRole;
    saveRolesToStorage(updatedRoles);

    // Actualiza los usuarios que tenían asignado el rol antiguo
    const updatedUsers = users.map((user) =>
      user.rol === oldRole ? { ...user, rol: updatedRole } : user
    );
    setUsers(updatedUsers);
    userService.saveUsers(updatedUsers).catch((err) => setError(err.message));
  };

  const deleteRole = (roleToDelete) => {
    const updatedRoles = roles.filter((role) => role !== roleToDelete);
    saveRolesToStorage(updatedRoles);
  };

  const resetUsers = async () => {
    setLoading(true);
    setError("");
    try {
      setUsers(await userService.resetUsers());
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const deleteUser = async (id) => {
    setError("");
    await userService.deleteUser(id);
    setUsers((current) => current.filter((user) => user.id !== id));
  };

  const saveUser = async (formData, editingUserId) => {
    setError("");
    const user = editingUserId
      ? { ...users.find((item) => item.id === editingUserId), ...formData }
      : { id: `USR-${Date.now().toString().slice(-4)}`, ...formData };
    const savedUser = await userService.saveUser(user);
    setUsers((current) => editingUserId
      ? current.map((item) => item.id === editingUserId ? savedUser : item)
      : [savedUser, ...current]);
  };

  return {
    users,
    roles,
    loading,
    error,
    setError,
    addRole,
    editRole,
    deleteRole,
    resetUsers,
    deleteUser,
    saveUser
  };
}
