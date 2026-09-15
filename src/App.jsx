import React from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute, { normalizeRole } from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import AdminUsersPage from "./pages/admin/AdminUsersPage";
import AdminStudentsPage from "./pages/admin/AdminStudentsPage";
import CursoPage from "./pages/admin/CursoPage";
import StudentLayout from "./components/StudentLayout";
import StudentDashboardPage from "./pages/student/StudentDashboardPage";
import ControlAsistenciasPage from "./pages/admin/ControIncidenciasPage";
import HorariosSalonesPage from "./pages/admin/HorariosSalonesPage";
import DocentesPage from "./pages/admin/DocentesPage";
import MatriculasPagosPage from "./pages/admin/MatriculasPagosPage";

import ProfesorLayout from "./components/ProfesorLayout";
import InterfazProfesorPage from "./pages/profesor/InterfazProfesorPage";
import CursosProfesorPage from "./pages/profesor/CursosPage";
import AsistenciaProfesorPage from "./pages/profesor/AsistenciaPage";
import ProgramacionProfesorPage from "./pages/profesor/ProgramacionPage";
import PerfilProfesorPage from "./pages/profesor/PerfilPage";

export default function App() {
  return (
    <Routes>
      {/* 1. Ruta de Autenticación / Login */}
      <Route path="/login" element={<Login />} />

      {/* Redirección por defecto de la raíz según el rol almacenado */}
      <Route
        path="/"
        element={
          <Navigate
            to={
              normalizeRole(localStorage.getItem("userRole")) === "admin"
                ? "/admin/usuarios"
                : normalizeRole(localStorage.getItem("userRole")) === "estudiante"
                ? "/estudiante/panel"
                : normalizeRole(localStorage.getItem("userRole")) === "docente"
                ? "/docente/panel"
                : "/login"
            }
            replace
          />
        }
      />

      {/* 2. Rutas de Administrador Protegidas */}
      <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
        <Route path="/admin" element={<AdminLayout />}>
          <Route index element={<Navigate to="/admin/usuarios" replace />} />
          <Route path="usuarios" element={<AdminUsersPage />} />
          <Route path="estudiantes" element={<AdminStudentsPage />} />
          <Route path="cursos" element={<CursoPage />} />
          <Route path="docentes" element={<DocentesPage />} />
          <Route path="incidentes" element={<ControlAsistenciasPage />} />
          <Route path="horarios" element={<HorariosSalonesPage />} />
          <Route path="matriculas" element={<MatriculasPagosPage />} />
          <Route path="pagos" element={<Navigate to="/admin/matriculas" replace />} />
        </Route>
      </Route>

      {/* 3. Rutas de Estudiante Protegidas */}
      <Route element={<ProtectedRoute allowedRoles={["estudiante"]} />}>
        <Route path="/estudiante" element={<StudentLayout />}>
          <Route index element={<Navigate to="/estudiante/panel" replace />} />
          <Route path="panel" element={<StudentDashboardPage />} />
        </Route>
      </Route>

      {/* 4. Rutas de Docente Protegidas */}
      <Route element={<ProtectedRoute allowedRoles={["docente", "admin"]} />}>
        <Route path="/docente" element={<ProfesorLayout />}>
          <Route index element={<Navigate to="/docente/panel" replace />} />
          <Route path="panel" element={<InterfazProfesorPage />} />
          <Route path="cursos" element={<CursosProfesorPage />} />
          <Route path="asistencia" element={<AsistenciaProfesorPage />} />
          <Route path="programacion" element={<ProgramacionProfesorPage />} />
          <Route path="perfil" element={<PerfilProfesorPage />} />
          <Route path="matriculas" element={<MatriculasPagosPage />} />
        </Route>
      </Route>

      {/* Ruta comodín de fallback */}
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}