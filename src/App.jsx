import React, { Suspense, lazy } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import ProtectedRoute from "./components/ProtectedRoute";
import AdminLayout from "./components/AdminLayout";
import DocenteLayout from "./components/DocenteLayout";
import StudentLayout from "./components/StudentLayout";

// Carga diferida por rutas (Code-Splitting) para optimizar el bundle inicial en producción
const AdminDashboardPage = lazy(() => import("./pages/admin/AdminDashboardPage"));
const AdminUsersPage = lazy(() => import("./pages/admin/AdminUsersPage"));
const CursoPage = lazy(() => import("./pages/admin/CursoPage"));
const HorariosSalonesPage = lazy(() => import("./pages/admin/HorariosSalonesPage"));
const DocentesPage = lazy(() => import("./pages/admin/DocentesPage"));
const ControlAsistenciasPage = lazy(() => import("./pages/admin/ControIncidenciasPage"));
const AdminMatriculasPage = lazy(() => import("./pages/admin/AdminMatriculasPage"));
const AdminReportesPage = lazy(() => import("./pages/admin/AdminReportesPage"));
const AdminConfiguracionPage = lazy(() => import("./pages/admin/AdminConfiguracionPage"));

const DocenteDashboardPage = lazy(() => import("./pages/docente/DocenteDashboardPage"));
const DocenteCursosPage = lazy(() => import("./pages/docente/DocenteCursosPage"));
const DocenteHorariosPage = lazy(() => import("./pages/docente/DocenteHorariosPage"));
const DocenteEstudiantesPage = lazy(() => import("./pages/docente/DocenteEstudiantesPage"));
const DocenteAulaVivoPage = lazy(() => import("./pages/docente/DocenteAulaVivoPage"));

const StudentDashboardPage = lazy(() => import("./pages/student/StudentDashboardPage"));
const StudentHorariosPage = lazy(() => import("./pages/student/StudentHorariosPage"));
const StudentPagosPage = lazy(() => import("./pages/student/StudentPagosPage"));

function PageRouteFallback() {
  return (
    <div className="min-h-[45vh] w-full flex flex-col items-center justify-center gap-3 text-slate-500 dark:text-slate-400">
      <div className="w-8 h-8 rounded-full border-3 border-blue-600/25 border-t-blue-600 dark:border-blue-400/20 dark:border-t-blue-400 animate-spin" />
      <span className="text-xs font-bold tracking-wide">Cargando módulo académico...</span>
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<PageRouteFallback />}>
      <Routes>
        {/* 1. Ruta de Autenticación */}
        <Route path="/login" element={<Login />} />

        {/* Redirección por defecto de la raíz */}
        <Route
          path="/"
          element={
            <Navigate
              to={
                localStorage.getItem("userRole") === "admin"
                  ? "/admin/inicio"
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
            <Route index element={<Navigate to="/admin/inicio" replace />} />
            <Route path="inicio" element={<AdminDashboardPage />} />
            <Route path="usuarios" element={<AdminUsersPage />} />
            <Route path="cursos" element={<CursoPage />} />
            <Route path="horarios" element={<HorariosSalonesPage />} />
            <Route path="docentes" element={<DocentesPage />} />
            <Route path="incidentes" element={<ControlAsistenciasPage />} />
            <Route path="matriculas" element={<AdminMatriculasPage />} />
            <Route path="reportes" element={<AdminReportesPage />} />
            <Route path="configuracion" element={<AdminConfiguracionPage />} />
          </Route>
        </Route>

        {/* Cabina Dedicada de Clase en Vivo a Pantalla Completa (Sin barra lateral) */}
        <Route element={<ProtectedRoute allowedRoles={["docente", "admin"]} />}>
          <Route path="/docente/aula-vivo/:cursoId" element={<DocenteAulaVivoPage />} />
        </Route>

        {/* Rutas de Docente Protegidas (Solo rol "docente") */}
        <Route element={<ProtectedRoute allowedRoles={["docente"]} />}>
          <Route path="/docente" element={<DocenteLayout />}>
            <Route index element={<Navigate to="/docente/panel" replace />} />
            <Route path="panel" element={<DocenteDashboardPage />} />
            <Route path="cursos" element={<DocenteCursosPage />} />
            <Route path="estudiantes" element={<DocenteEstudiantesPage />} />
            <Route path="horarios" element={<DocenteHorariosPage />} />
          </Route>
        </Route>

        {/* 3. Rutas de Estudiante Protegidas (Solo rol "estudiante") */}
        <Route element={<ProtectedRoute allowedRoles={["estudiante"]} />}>
          <Route path="/estudiante" element={<StudentLayout />}>
            <Route index element={<Navigate to="/estudiante/panel" replace />} />
            <Route path="panel" element={<StudentDashboardPage />} />
            <Route path="horarios" element={<StudentHorariosPage />} />
            <Route path="pagos" element={<StudentPagosPage />} />
          </Route>
        </Route>

        {/* Ruta comodín de fallback */}
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </Suspense>
  );
}
