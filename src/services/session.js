import { insforge } from "../lib/insforge";
import { userService } from "./api";

const SESSION_KEYS = ["userRole", "userName", "userEmail", "userId", "user", "usuarioLogueado"];

export async function signOutFromApp() {
  const { error } = await insforge.auth.signOut();
  if (error) {
    console.error("[InsForge] Error al cerrar sesión:", error);
    throw new Error(error.message || "No se pudo cerrar sesión.");
  }

  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}

export async function getCurrentSessionProfile() {
  const { data, error } = await insforge.auth.getCurrentUser();
  if (error) {
    console.error("[InsForge] Error al recuperar la sesión:", error);
    throw new Error("La sesión expiró. Inicia sesión nuevamente.");
  }

  const authUser = data?.user;
  if (!authUser?.email) {
    throw new Error("La sesión expiró. Inicia sesión nuevamente.");
  }

  const profile = await userService.getUserByEmail(authUser.email);
  if (!profile) {
    throw new Error("La cuenta no tiene un perfil docente en InsForge.");
  }
  if (String(profile.estado || "").toLowerCase() !== "activo") {
    throw new Error("La cuenta docente se encuentra inactiva.");
  }
  if (!["docente", "profesor", "profesora"].includes(String(profile.rol || profile.role || "").toLowerCase())) {
    throw new Error("El usuario autenticado no tiene permisos de docente.");
  }

  return { authUser, profile };
}
