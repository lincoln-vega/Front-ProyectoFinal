import { insforge } from "../lib/insforge";

const SESSION_KEYS = ["userRole", "userName", "userEmail", "userId", "user", "usuarioLogueado"];

export async function signOutFromApp() {
  const { error } = await insforge.auth.signOut();
  if (error) {
    console.error("[InsForge] Error al cerrar sesión:", error);
    throw new Error(error.message || "No se pudo cerrar sesión.");
  }

  SESSION_KEYS.forEach((key) => localStorage.removeItem(key));
}
