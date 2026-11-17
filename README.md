# Academia Preuniversitaria — Portal de Gestión Académica

Plataforma web integral para la gestión y seguimiento académico de una academia preuniversitaria. Conecta en tiempo real la administración institucional, la plana docente y los estudiantes, integrando autenticación segura, control de asistencias, monitoreo de sesiones sincrónicas (Google Meet), gestión de matrículas y control de cursos.

---

## 🚀 Tecnologías

- **Frontend:** React 19, Vite 6, Tailwind CSS v4, Lucide React, React Router DOM v7.
- **Backend (BaaS):** [InsForge](https://insforge.dev) (PostgreSQL, Auth, Edge Functions, Storage, Realtime).
- **Control de Versiones & CI/CD:** GitHub Actions / Vercel.

---

## 👥 Cuentas de Acceso

Las cuentas de prueba deben configurarse en **InsForge Auth** y contar con un perfil asociado en el backend. No se publican credenciales de acceso en este repositorio. Cada rol se redirige a su panel correspondiente tras autenticarse.

---

## 💻 Instalación y Ejecución Local

### Prerrequisitos
- **Node.js** (v18 o superior)
- **npm** (v9 o superior)

### Pasos

1. **Clonar el repositorio:**
   ```bash
   git clone https://github.com/lincoln-vega/Front-ProyectoFinal.git
   cd Front-ProyectoFinal
   ```

2. **Instalar dependencias:**
   ```bash
   npm install
   ```

3. **Configurar variables de entorno:**
   Crea `.env.local` tomando como referencia `.env.example`. Para Vercel, configura `VITE_API_URL` en **Project Settings → Environment Variables** con la URL nueva del backend y vuelve a desplegar el frontend. No incluyas archivos `.env` en Git.

4. **Iniciar en modo desarrollo:**
   ```bash
   npm run dev
   ```

5. **Construir para producción:**
   ```bash
   npm run build
   ```

---

## 📁 Módulos y Funcionalidades

### 1. Panel de Administración (`/admin`)
- **Gestión de Usuarios:** Padrón general de directores, docentes y estudiantes con filtros de búsqueda, gestión de estados y creación/edición de perfiles.
- **Cursos y Materias:** Catálogo institucional de cursos virtuales, asignación de docentes, control de vacantes y registro de nuevas materias.
- **Docentes y Nóminas:** Directorio de la plana docente, especialidades, salarios y registro de incidencias laborales.
- **Control de Asistencias:** Auditoría de incidencias (tardanzas, inasistencias), validación de justificaciones y visor de certificados médicos o documentos oficiales adjuntos.
- **Matrículas y Pagos / Reportes / Configuración:** Secciones modulares en expansión institucional.

### 2. Portal Docente (`/docente`)
- **Mi Panel:** Resumen del docente conectado, carga horaria, alumnos asignados y enlaces rápidos a clases.
- **Mis Cursos:** Vista detallada de las materias impartidas y enlaces directos a salas sincrónicas.
- **Horarios:** Programación semanal y calendario de clases virtuales.

### 3. Portal del Estudiante (`/estudiante`)
- **Panel del Estudiante:** Bienvenida personalizada, meta académica y cálculo de puntualidad general.
- **Mis Cursos Matriculados:** Listado de cursos activos con información del docente, horario asignado y botón de ingreso directo a salas de Google Meet.

---

## 📄 Licencia

Desarrollado para el proyecto institucional de Herramientas de Desarrollo. Todos los derechos reservados © 2026.
