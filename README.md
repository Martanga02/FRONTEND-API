# Cartelera — frontend

[![Build](https://github.com/Martanga02/FRONTEND-API/actions/workflows/build.yml/badge.svg)](https://github.com/Martanga02/FRONTEND-API/actions/workflows/build.yml)

Frontend en React (Vite) que consume la API REST PHP del repositorio backend (https://github.com/Martanga02/API): categorías/géneros y películas, con login por JWT.

Para levantar **todo el proyecto** (frontend, API y base de datos) con Docker, ver el README del repo del backend. Este README cubre solo el frontend.

## Cómo correrlo

### Opción A — modo desarrollo (hot reload)

1. Con el backend levantado en Docker (`docker compose up`, API en `http://localhost:8081`):
   ```bash
   npm install
   npm run dev
   ```
2. Abrí `http://localhost:5173`.

### Opción B — en Docker (build de producción con nginx)

```bash
docker compose up --build
```

Esto arma una imagen multi-stage (Vite build, después nginx sirviendo `dist/`) y publica el contenedor en `http://localhost:5173`.

Ojo con un detalle: Vite "hornea" `VITE_API_BASE_URL` en el bundle **en tiempo de build**, no la lee en runtime como haría un server Node. Si necesitás apuntar a otra URL de API, cambiá `args.VITE_API_BASE_URL` en `docker-compose.yml` (o pasalo con `docker build --build-arg VITE_API_BASE_URL=...`) y volvé a buildear: reiniciar el contenedor sin rebuildear no alcanza.

En ambas opciones, el navegador es quien habla con el backend directamente (por `localhost:8081`), así que da igual que frontend y backend corran desde `docker compose` distintos, en repos distintos, o uno en Docker y el otro con `npm run dev`: no hace falta que compartan red de Docker.

La app le habla directo al backend (sin proxy) usando `VITE_API_BASE_URL`, definida en `.env` como `http://localhost:8081/api`. Dentro de Docker la API responde en `/api` (la ruta `/tp_parte3/api` es la de XAMPP). Esto funciona porque `api_router.php` ya manda los headers CORS necesarios. Si el backend corre en otro host o puerto, ajustá esa variable en `.env` (para `npm run dev`) o en `docker-compose.yml` (para la imagen).

**Usuarios de prueba** (seed de `peliculas_db.sql`): `admin` / `admin123` (rol ADMIN) y `demo` / `demo123` (rol USER).

## Tests y calidad de código

```bash
npm install
npm test               # tests (Vitest + Testing Library)
npm run test:coverage  # tests midiendo el coverage
npm run lint           # análisis estático con oxlint
```

Hay 13 tests: de `api/client.js` (headers de autenticación, query strings, manejo de errores), de `AuthContext` (login, logout, token expirado) y de `ProtectedRoute` (redirección a `/login`).

## Integración continua y despliegue (GitHub Actions)

**Workflow `Build`** (`.github/workflows/build.yml`), en cada push a `main`, en cada tag `x.y.z` y en cada pull request:

1. **test:** Vitest con **coverage** y build de producción. El reporte queda como artefacto del run y, si existe el secret `CODECOV_TOKEN`, se sube a Codecov.
2. **quality:** análisis estático con oxlint (informativo).
3. **docker:** construye la imagen (`linux/amd64`). En un pull request solo se valida; en push a `main` se publica en Docker Hub (`martinaflorestosini/cartelera-frontend`) con los tags `main`, `latest` y `sha-<commit completo>`. La URL de la API que se "hornea" en la imagen sale de la **variable del repo** `VITE_API_BASE_URL` (por defecto `http://localhost:8081/api`; para Render, la URL pública de la API terminada en `/api`). No se publica nada si los tests fallan.

**Workflow `Deploy Render`** (`.github/workflows/deploy-render.yml`): se lanza a mano (Actions, Deploy Render, Run workflow). Hace un GET al deploy hook de Render: sin tag, Render vuelve a bajar la imagen configurada en el servicio (`latest`); con un tag opcional (`sha-<commit>`) pide esa versión.

**Secrets del repo:** `DOCKERHUB_USERNAME`, `DOCKERHUB_TOKEN` y `DEPLOY_URL` (el deploy hook del servicio del frontend en Render). Opcional: `CODECOV_TOKEN`. **Variable del repo:** `VITE_API_BASE_URL`.

**Dependencias:** `.github/dependabot.yml` abre pull requests semanales con versiones nuevas (npm, GitHub Actions y Docker).

## Qué hace cada pantalla

* **Login** (`/login`): manda Basic Auth a `GET /auth/login`, guarda el JWT que devuelve la API en `localStorage` y lo adjunta como `Authorization: Bearer <token>` en las peticiones protegidas.
* **Películas** (`/peliculas`, pública): lista con orden por nombre, estudio, ID o género (`GET /peliculas?sort=&order=`). Si estás logueado aparece un botón "Editar" por película (`PUT /peliculas/:id`).
* **Categorías** (`/categorias`, pública): lista con filtro por nombre (`GET /categoria?nombre=`) y, si estás logueado, un formulario para crear una nueva (`POST /categoria`).

## Sobre el backend

Este frontend está pensado para el backend del repo https://github.com/Martanga02/API (PostgreSQL, tabla `usuarios` con rol, CORS habilitado). Si te pasan una copia vieja sin esos arreglos, el login y la creación de categorías no van a funcionar.

## Estructura

```
src/
  api/client.js        # fetch wrapper para la API
  context/AuthContext.jsx
  components/Navbar.jsx
  components/ProtectedRoute.jsx
  pages/Login.jsx
  pages/Categorias.jsx
  pages/Peliculas.jsx
```
