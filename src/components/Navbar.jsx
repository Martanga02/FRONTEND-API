import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export function Navbar() {
  const { isAuthenticated, user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/");
  }

  return (
    <header className="topbar">
      <div className="topbar-inner">
        <NavLink to="/" className="brand">
          CARTE<span>LERA</span>
        </NavLink>
        <nav className="links">
          <NavLink to="/peliculas" className={({ isActive }) => (isActive ? "active" : "")}>
            Películas
          </NavLink>
          <NavLink to="/categorias" className={({ isActive }) => (isActive ? "active" : "")}>
            Categorías
          </NavLink>
          {isAuthenticated ? (
            <>
              <span className="user-pill">{user?.usuario}</span>
              <button onClick={handleLogout}>Salir</button>
            </>
          ) : (
            <NavLink to="/login" className={({ isActive }) => (isActive ? "active" : "")}>
              Ingresar
            </NavLink>
          )}
        </nav>
      </div>
    </header>
  );
}
