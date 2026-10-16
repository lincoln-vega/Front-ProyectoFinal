# Proyecto Final – Herramientas de Desarrollo

Este repositorio contiene el **frontend** (React / Vite) y el **backend** (FastAPI) de la aplicación desarrollada en el curso. Cada parte está en su propia carpeta:

- `front/` – Código del cliente, despliegue en **Vercel**.
- `back/`  – API en **InsForge**, ejecutada con Python 3.14.

## Cómo iniciar el proyecto

```bash
# Instalar dependencias (frontend y backend)
./scripts/install.sh

# Ejecutar frontend en modo desarrollo
cd front && npm run dev

# Ejecutar backend en modo desarrollo
cd back && uvicorn main:app --reload
```

## Flujo de trabajo

1. Crear una rama `feature-<nombre>` a partir de `dev`.
2. Hacer commits siguiendo **Conventional Commits** (ej. `feat: añadir login`).
3. Abrir un Pull Request contra `dev`.
4. Cuando CI pase, mergear a `dev` (despliegue de pre‑producción).
5. Cuando se desea una versión, mergear `dev → main`; se generará automáticamente una versión semántica y se publicará la Release.

## Despliegue automático

- **Frontend** → Vercel (workflow `deploy-frontend.yml`).
- **Backend** → InsForge (workflow `deploy-backend.yml`).

Los secretos `VERCEL_TOKEN` y `INSFORGE_API_KEY` deben estar configurados en los Settings → Secrets of this repository.
