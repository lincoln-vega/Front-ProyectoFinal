# Proyecto Final – Herramientas de Desarrollo

Este repositorio contiene el **frontend** (React / Vite). La autenticación, los datos y las funciones de asistencia docente se gestionan exclusivamente en el proyecto **InsForge** `Portal-backend`.

- Código del cliente en la raíz, con despliegue en **Vercel**.
- InsForge: `https://rbxki34t.us-east.insforge.app`.

## Cómo iniciar el proyecto

```bash
# Instalar dependencias del frontend
npm install

# Ejecutar frontend en modo desarrollo
npm run dev
```

## Flujo de trabajo

1. Crear una rama `feature-<nombre>` a partir de `dev`.
2. Hacer commits siguiendo **Conventional Commits** (ej. `feat: añadir login`).
3. Abrir un Pull Request contra `dev`.
4. Cuando CI pase, mergear a `dev` (despliegue de pre‑producción).
5. Cuando se desea una versión, mergear `dev → main`; se generará automáticamente una versión semántica y se publicará la Release.

## Despliegue automático

- **Frontend** → Vercel (workflow `deploy-frontend.yml`).
- **Backend** → InsForge (funciones `meet-entrada`, `meet-salida` y `meet-auditoria`).

Los secretos `VERCEL_TOKEN` y `INSFORGE_API_KEY` deben estar configurados en los Settings → Secrets of this repository.
