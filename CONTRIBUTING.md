# Contribuyendo a Proyecto Final

## Flujo de trabajo de ramas
- **feature-<nombre>** – rama de desarrollo individual.
- **dev** – rama de integración donde se agrupan los features y se despliega en entorno de preproducción.
- **main** – rama de producción. Cada merge a `main` genera una versión semántica (`vMAJOR.MINOR.PATCH`).

## Pull Request
1. Crea una rama `feature-<nombre>` desde `dev`.
2. Realiza commits siguiendo el formato *Conventional Commits* (e.g. `feat: agregar login`, `fix: corregir error`).
3. Abre un PR contra `dev` y asigna al menos una revisión.
4. Cuando el CI pase, mergea a `dev`.
5. Cuando se complete una versión, mergea `dev`→`main` (esto disparará el workflow de release).

## Herramientas
- **Node** (v20) y **npm** para el front.
- **Python 3.14** y **pip** para el back.
- **InsForge CLI** y **Vercel CLI** para despliegues.

---

## Documentación
- Usa los *issue templates* para reportar bugs o proponer nuevas funcionalidades.
- Actualiza el `README.md` y el `CHANGELOG.md` cuando sea necesario.
