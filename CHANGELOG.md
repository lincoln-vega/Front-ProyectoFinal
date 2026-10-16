# Registro de Cambios (Changelog) - Frontend

Todas las notas notables de cambios a este proyecto serán documentadas en este archivo siguiendo el formato de versiones semánticas (SemVer).

## [0.5.0] - 2026-10-16
### Añadido
- **Autenticación y Seguridad:** Vistas de Login con persistencia de sesión y control de acceso RBAC (Administrador, Docente, Estudiante).
- **Módulo de Docentes y Profesores:** Panel de control, programación académica, interfaz de profesor y vista de cursos asignados.
- **Módulo de Asistencia:** Interfaz para apertura y registro de sesiones de asistencia en tiempo real.
- **Integración Backend:** Conexión a InsForge PostgreSQL y Edge Functions mediante `@insforge/sdk`.
- **Diseño UI/UX:** Modo oscuro con estilo glassmorphism integral y diseño responsive con Tailwind CSS.
- **DevOps y Flujo Git:** Estandarización de ramas (`feature-*`, `Dev`, `main`), workflows de CI/CD para Vercel y plantillas de issues.
