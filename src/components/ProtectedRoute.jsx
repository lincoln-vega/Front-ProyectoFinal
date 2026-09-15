import React from "react";
import { Navigate, Outlet } from "react-router-dom";

export const normalizeRole = (role) => {
  if (!role) return "";
  const r = String(role).toLowerCase().trim();
  if (["admin", "administrador", "administrativo", "super admin", "superadmin"].includes(r)) {
    return "admin";
  }
  if (["docente", "profesor", "profesora"].includes(r)) {
    return "docente";
  }
  if (["estudiante", "alumno", "alumna"].includes(r)) {
    return "estudiante";
  }
  return r;
};

export default function ProtectedRoute({ allowedRoles }) {
  const rawRole = localStorage.getItem("userRole");
  const currentRole = normalizeRole(rawRole);

  // Si no está autenticado
  if (!currentRole) {
    // Si existe sesión iniciada (userName) pero se perdió temporalmente el rol, restaurar rol admin por defecto
    const userName = localStorage.getItem("userName");
    if (userName) {
      localStorage.setItem("userRole", "admin");
      return <Outlet />;
    }
    return <Navigate to="/login" replace />;
  }

  // Normalizar lista de roles permitidos
  const normalizedAllowedRoles = allowedRoles?.map((r) => normalizeRole(r)) || [];

  // Si el rol actual no tiene permiso para la ruta
  if (allowedRoles && !normalizedAllowedRoles.includes(currentRole)) {
    // Redirigir siempre a su panel respectivo, NUNCA cerrar sesión al login
    if (currentRole === "estudiante") {
      return <Navigate to="/estudiante/panel" replace />;
    }
    if (currentRole === "docente") {
      return <Navigate to="/docente/panel" replace />;
    }
    if (currentRole === "admin") {
      return <Navigate to="/admin/usuarios" replace />;
    }
    return <Navigate to="/login" replace />;
  }

  return <Outlet />;
}
