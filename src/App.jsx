import { Navigate, Route, Routes } from "react-router-dom";
import { Navbar } from "./components/Navbar";
import { Login } from "./pages/Login";
import { Categorias } from "./pages/Categorias";
import { Peliculas } from "./pages/Peliculas";

// Nota: /peliculas y /categoria (GET) son públicas en la API —el
// middleware JWT no bloquea si no hay token, solo deja request.user en
// null—. Por eso ninguna ruta de lectura usa <ProtectedRoute>; el control
// de acceso para crear/editar pasa dentro de cada página, chequeando
// isAuthenticated antes de mostrar el botón correspondiente.
export default function App() {
  return (
    <>
      <Navbar />
      <div className="shell">
        <Routes>
          <Route path="/" element={<Navigate to="/peliculas" replace />} />
          <Route path="/login" element={<Login />} />
          <Route path="/categorias" element={<Categorias />} />
          <Route path="/peliculas" element={<Peliculas />} />
          <Route path="*" element={<p>Página no encontrada.</p>} />
        </Routes>
      </div>
    </>
  );
}
