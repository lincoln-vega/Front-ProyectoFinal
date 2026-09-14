import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import CursoPage from "./pages/admin/CursoPage";
import StudentLayout from "./components/StudentLayout";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import ControlAsistenciasPage from "./pages/admin/ControIncidenciasPage";
import DocentesPage from "./pages/admin/DocentesPage";

import DocenteLayout from "./components/DocenteLayout";
import DocenteDashboardPage from "./pages/docente/DocenteDashboardPage";

export default function App() {
  return (
    <Routes>
      {/* 1. Ruta de Autenticación / FakeLogin (SCRM-26) */}
      <Route path="/login" element={<Login />} />

      {/* Redirección por defecto de la raíz */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              localStorage.getItem("userRole") === "admin"
                ? "/admin/usuarios"
                : localStorage.getItem("userRole") === "docente"
                ? "/docente/panel"
                : localStorage.getItem("userRole") === "estudiante"
                ? "/estudiante/panel"
                : "/login"
            }
            replace
          />
        }
      />

      {/* 2. Rutas de Administrador Protegidas (Solo rol "admin") */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/usuarios" replace />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="cursos" element={<CursoPage />} />
          <Route path="docentes" element={<DocentesPage />} />
          <Route path="incidentes" element= {<ControlAsistenciasPage/>} />
        </Route>
      </Route>

      {/* Rutas de Docente Protegidas (Solo rol "docente") */}
      <Route element={<ProtectedRoute allowedRoles={["docente"]} />}>
        <Route path="/docente" element={<DocenteLayout />}>
          <Route index element={<Navigate to="/docente/panel" replace />} />
          <Route path="panel" element={<DocenteDashboardPage />} />
        </Route>
      </Route>

      {/* 3. Rutas de Estudiante Protegidas (Solo rol "estudiante") */}
      <Route element={<ProtectedRoute allowedRoles={["estudiante"]} />}>
        <Route path="/estudiante" element={<StudentLayout />}>
          <Route index element={<Navigate to="/estudiante/panel" replace />} />
          <Route path="panel" element={<StudentDashboardPage />} />
        </Route>
      </Route>

      {/* Ruta comodín de fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
