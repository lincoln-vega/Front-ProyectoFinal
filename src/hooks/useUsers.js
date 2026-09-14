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
  rol: "Estudiante",
  estado: "Activo"
});

export default function useUsers() {
  const [users, setUsers] = useState([]);
  const [roles, setRoles] = useState(() => roleService.getRoles());

  useEffect(() => {
    setUsers(userService.getUsers());
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
    userService.saveUsers(updatedUsers);
  };

  const deleteRole = (roleToDelete) => {
    const updatedRoles = roles.filter((role) => role !== roleToDelete);
    saveRolesToStorage(updatedRoles);
  };

  const resetUsers = () => {
    const initialUsers = userService.resetUsers();
    const initialRoles = roleService.resetRoles();
    setUsers(initialUsers);
    setRoles(initialRoles);
  };

  const deleteUser = (id) => {
    const updatedUsers = users.filter((user) => user.id !== id);
    setUsers(updatedUsers);
    userService.saveUsers(updatedUsers);
  };

  const saveUser = (formData, editingUserId) => {
    const updatedUsers = editingUserId
      ? users.map((user) =>
          user.id === editingUserId ? { ...user, ...formData } : user
        )
      : [
          {
            id: `USR-${Date.now().toString().slice(-4)}`,
            ...formData
          },
          ...users
        ];

    setUsers(updatedUsers);
    userService.saveUsers(updatedUsers);
  };

  return {
    users,
    roles,
    addRole,
    editRole,
    deleteRole,
    resetUsers,
    deleteUser,
    saveUser
  };
}