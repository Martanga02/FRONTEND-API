import { useEffect, useMemo, useState } from "react";
import { api } from "../api/client";
import { useAuth } from "../context/AuthContext";

const SORT_OPTIONS = [
  { value: "", label: "Sin orden" },
  { value: "nombre", label: "Nombre" },
  { value: "estudio", label: "Estudio" },
  { value: "id_pelicula", label: "ID" },
  { value: "id_genero", label: "Género" },
];

export function Peliculas() {
  const { token, isAuthenticated } = useAuth();
  const [peliculas, setPeliculas] = useState([]);
  const [categorias, setCategorias] = useState([]);
  const [sort, setSort] = useState("");
  const [order, setOrder] = useState("asc");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [editId, setEditId] = useState(null);
  const [editForm, setEditForm] = useState({ nombre: "", estudio: "", id_genero: "" });
  const [savingId, setSavingId] = useState(null);
  const [editError, setEditError] = useState(null);

  const nombreGenero = useMemo(() => {
    const map = {};
    categorias.forEach((c) => (map[c.id] = c.nombre));
    return map;
  }, [categorias]);

  async function cargarPeliculas() {
    setLoading(true);
    setError(null);
    try {
      const data = await api.getPeliculas({ sort: sort || undefined, order: sort ? order : undefined });
      setPeliculas(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    api.getCategorias().then(setCategorias).catch(() => {});
  }, []);

  useEffect(() => {
    cargarPeliculas();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sort, order]);

  function empezarEdicion(p) {
    setEditId(p.id_pelicula);
    setEditForm({ nombre: p.nombre, estudio: p.estudio, id_genero: String(p.id_genero) });
    setEditError(null);
  }

  function cancelarEdicion() {
    setEditId(null);
    setEditError(null);
  }

  async function guardarEdicion(id) {
    setSavingId(id);
    setEditError(null);
    try {
      await api.actualizarPelicula(
        id,
        {
          nombre: editForm.nombre,
          estudio: editForm.estudio,
          id_genero: Number(editForm.id_genero),
        },
        token
      );
      setEditId(null);
      cargarPeliculas();
    } catch (err) {
      setEditError(err.message);
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div>
      <h1>Películas</h1>

      <div className="controls-row">
        <select value={sort} onChange={(e) => setSort(e.target.value)}>
          {SORT_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              Ordenar por: {opt.label}
            </option>
          ))}
        </select>
        {sort && (
          <select value={order} onChange={(e) => setOrder(e.target.value)}>
            <option value="asc">Ascendente</option>
            <option value="desc">Descendente</option>
          </select>
        )}
      </div>

      {error && <div className="alert error">{error}</div>}

      {loading ? (
        <p className="meta">Cargando…</p>
      ) : peliculas.length === 0 ? (
        <p className="empty">No hay películas para mostrar.</p>
      ) : (
        peliculas.map((p) => (
          <div className="card" key={p.id_pelicula}>
            {editId === p.id_pelicula ? (
              <div>
                {editError && <div className="alert error">{editError}</div>}
                <div className="field">
                  <label>Nombre</label>
                  <input
                    type="text"
                    value={editForm.nombre}
                    onChange={(e) => setEditForm({ ...editForm, nombre: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="field">
                  <label>Estudio</label>
                  <input
                    type="text"
                    value={editForm.estudio}
                    onChange={(e) => setEditForm({ ...editForm, estudio: e.target.value })}
                    style={{ width: "100%" }}
                  />
                </div>
                <div className="field">
                  <label>Género</label>
                  <select
                    value={editForm.id_genero}
                    onChange={(e) => setEditForm({ ...editForm, id_genero: e.target.value })}
                  >
                    {categorias.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.nombre}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-actions">
                  <button
                    className="primary"
                    onClick={() => guardarEdicion(p.id_pelicula)}
                    disabled={savingId === p.id_pelicula}
                  >
                    {savingId === p.id_pelicula ? "Guardando…" : "Guardar"}
                  </button>
                  <button className="ghost" onClick={cancelarEdicion}>
                    Cancelar
                  </button>
                </div>
              </div>
            ) : (
              <div className="list-item">
                <div>
                  <h3>{p.nombre}</h3>
                  <p className="meta">{p.estudio}</p>
                  <span className="tag">
                    {nombreGenero[p.id_genero] || `Género #${p.id_genero}`}
                  </span>
                </div>
                {isAuthenticated && (
                  <button className="ghost" onClick={() => empezarEdicion(p)}>
                    Editar
                  </button>
                )}
              </div>
            )}
          </div>
        ))
      )}

      {!isAuthenticated && (
        <p className="meta" style={{ marginTop: "1rem" }}>
          Iniciá sesión para poder editar una película.
        </p>
      )}
    </div>
  );
}
