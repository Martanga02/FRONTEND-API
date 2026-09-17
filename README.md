# Cartelera — frontend para tp_parte3

Frontend en React (Vite) que consume la API REST PHP `tp_parte3`
(categorías/géneros y películas, con login por JWT).

## Cómo correrlo

### Opción A — modo desarrollo (hot reload)

1. Con el backend levantado en Docker (`docker compose up`, API en
   `http://localhost:8081`):
   ```bash
   npm install
   npm run dev
   ```
2. Abrí `http://localhost:5173`.

### Opción B — en Docker (build de producción con nginx)

```bash
docker compose up --build
```

Esto arma una imagen multi-stage (Vite build → nginx sirviendo `dist/`) y
publica el contenedor en `http://localhost:5173`. Ojo con un detalle: Vite
"hornea" `VITE_API_BASE_URL` en el bundle **en tiempo de build**, no la lee
en runtime como haría un server Node. Si necesitás apuntar a otra URL de
API, cambiá el `args.VITE_API_BASE_URL` en `docker-compose.yml` (o pasalo
con `docker build --build-arg VITE_API_BASE_URL=...`) y volvé a buildear —
reiniciar el contenedor sin rebuildear no alcanza.

En ambas opciones, el navegador es quien habla con el backend directamente
(por `localhost:8081`), así que da igual que frontend y backend corran
desde `docker compose` distintos, en repos distintos, o uno en Docker y
el otro con `npm run dev` — no hace falta que compartan red de Docker ni
`docker-compose.yml`.

La app le habla directo al backend (sin proxy) usando `VITE_API_BASE_URL`,
definida en `.env` como `http://localhost:8081/tp_parte3/api`. Esto funciona
porque `api_router.php` ya manda los headers CORS necesarios. Si el backend
corre en otro host o puerto, ajustá esa variable en `.env` (para `npm run
dev`) o en `docker-compose.yml` (para la imagen).

Usuarios de prueba (seed de `peliculas_db.sql`): `admin` / `admin123` (rol
ADMIN) y `demo` / `demo123` (rol USER).

## Qué hace cada pantalla

- **Login** (`/login`): manda Basic Auth a `GET /auth/login`, guarda el
  JWT que devuelve la API en `localStorage` y lo adjunta como
  `Authorization: Bearer <token>` en las peticiones protegidas.
- **Películas** (`/peliculas`, pública): lista con orden por nombre,
  estudio, ID o género (`GET /peliculas?sort=&order=`). Si estás logueado
  aparece un botón "Editar" por película (`PUT /peliculas/:id`).
- **Categorías** (`/categorias`, pública): lista con filtro por nombre
  (`GET /categoria?nombre=`) y, si estás logueado, un formulario para
  crear una nueva (`POST /categoria`).

## Sobre el backend

Este frontend está pensado para el `tp_parte3` ya corregido (tabla
`usuarios` con rol, CORS habilitado, ruta del init SQL arreglada en
`docker-compose.yml`). Si te pasan una copia vieja sin esos arreglos,
el login y la creación de categorías no van a funcionar — pedí la
versión actualizada del backend.

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
