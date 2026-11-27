import {
  getApiAccessToken,
  setApiAccessToken
} from "../lib/supabase";
import { userService } from "./api";

const SESSION_KEYS = [
  "userRole",
  "userName",
  "userEmail",
  "userId",
  "user",
  "usuarioLogueado"
];

export async function signOutFromApp() {
  setApiAccessToken(null);
  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}

export async function getCurrentSessionProfile() {
  const email = localStorage.getItem("userEmail");
  if (!email || !getApiAccessToken()) {
    throw new Error("La sesión expiró. Inicia sesión nuevamente.");
  }

  const profile = await userService.getUserByEmail(email);
  if (!profile) {
    throw new Error("La cuenta no tiene un perfil docente registrado en la plataforma.");
  }
  if (String(profile.estado || "").toLowerCase() !== "activo") {
    throw new Error("La cuenta docente se encuentra inactiva.");
  }
  if (!["docente", "profesor", "profesora"].includes(String(profile.rol || profile.role || "").toLowerCase())) {
    throw new Error("El usuario autenticado no tiene permisos de docente.");
  }

  return { authUser: { email }, profile };
}

export async function getAuthenticatedAdminAccessToken() {
  if (String(localStorage.getItem("userRole") || "").trim().toLowerCase() !== "admin") {
    throw new Error("Solo un administrador puede registrar usuarios.");
  }

  const accessToken = getApiAccessToken();
  if (!accessToken) {
    throw new Error("La sesión de administrador expiró. Inicia sesión nuevamente.");
  }

  return accessToken;
}
