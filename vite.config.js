import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// api_router.php ahora manda headers CORS, así que el frontend le habla
// directo al backend (ver VITE_API_BASE_URL en .env) y no necesita proxy.
// Esto también deja todo listo para el día que front y back vivan en
// repos/imágenes separadas: no hay ningún acoplamiento acá, solo una URL.
//
// Si en algún momento preferís volver a un proxy de un solo origen en dev,
// descomentá esto (y quitá VITE_API_BASE_URL del .env para que se use "/api"):
//
// server: {
//   proxy: {
//     "/api": {
//       target: "http://localhost:8081",
//       changeOrigin: true,
//       rewrite: (path) => path.replace(/^\/api/, "/tp_parte3/api"),
//     },
//   },
// },
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
  },
});
