import { useEffect, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

export function Categorias() {
  const { token, isAuthenticated } = useAuth();
  const [categorias, setCategorias] = useState([]);
  const [filtro, setFiltro] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [nuevoNombre, setNuevoNombre] = useState("");
  const [nuevaDescripcion, setNuevaDescripcion] = useState("");
  const [creando, setCreando] = useState(false);
  const [createError, setCreateError] = useState(null);
  const [createOk, setCreateOk] = useState(false);

  async function cargar(nombre) {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getCategorias(nombre || undefined);
      setCategorias(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    cargar();
  }, []);

  function handleFiltroSubmit(e) {
    e.preventDefault();
    cargar(filtro);
  }

  async function handleCrear(e) {
    e.preventDefault();
    setCreateError(null);
    setCreateOk(false);
    setCreando(true);
    try {
      await api.crearCategoria(
        { nombre: nuevoNombre, descripcion: nuevaDescripcion },
        token
      );
      setNuevoNombre("");
      setNuevaDescripcion("");
      setCreateOk(true);
      cargar(filtro);
    } catch (err) {
      setCreateError(err.message);
    } finally {
      setCreando(false);
    }
  }

  return (
    <div>
      <h1>Categorías</h1>

      <form className="controls-row" onSubmit={handleFiltroSubmit}>
        <input
          type="text"
          placeholder="Buscar por nombre…"
          value={filtro}
          onChange={(e) => setFiltro(e.target.value)}
        />
        <button className="ghost" type="submit">
          Filtrar
        </button>
        {filtro && (
          <button
            className="ghost"
            type="button"
            onClick={() => {
              setFiltro("");
              cargar();
            }}
          >
            Limpiar
          </button>
        )}
      </form>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p className="meta">Cargando…</p>
      ) : categorias.length === 0 ? (
        <p className="empty">No hay categorías para mostrar.</p>
      ) : (
        categorias.map((cat) => (
          <div className="card" key={cat.id}>
            <div className="list-item">
              <div>
                <h3>{cat.nombre}</h3>
                {cat.descripcion && <p className="meta">{cat.descripcion}</p>}
              </div>
              <span className="tag">#{cat.id}</span>
            </div>
          </div>
        ))
      )}

      <h2 style={{ marginTop: "2.5rem" }}>Nueva categoría</h2>
      {!isAuthenticated ? (
        <p className="meta">Necesitás iniciar sesión para crear una categoría.</p>
      ) : (
        <form className="card" onSubmit={handleCrear}>
          {createError && <div className="alert error">{createError}</div>}
          {createOk && <div className="alert ok">Categoría creada.</div>}
          <div className="field">
            <label htmlFor="nombre">Nombre</label>
            <input
              id="nombre"
              type="text"
              value={nuevoNombre}
              onChange={(e) => setNuevoNombre(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>
          <div className="field">
            <label htmlFor="descripcion">Descripción</label>
            <textarea
              id="descripcion"
              rows={3}
              value={nuevaDescripcion}
              onChange={(e) => setNuevaDescripcion(e.target.value)}
              required
              style={{ width: "100%" }}
            />
          </div>
          <button className="primary" type="submit" disabled={creando}>
            {creando ? "Creando…" : "Crear categoría"}
          </button>
          <p className="meta" style={{ marginTop: "0.8rem" }}>
            Este endpoint exige rol ADMIN en el backend. Con el usuario de
            prueba <strong>admin</strong> funciona; con <strong>demo</strong>{" "}
            (rol USER) te va a devolver 403.
          </p>
        </form>
      )}
    </div>
  );
}
