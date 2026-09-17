// Cliente para la API tp_parte3.
//
// Por defecto pega a "/api" y depende del proxy de vite.config.js para
// llegar al backend PHP sin problemas de CORS (la API no manda headers
// CORS). Si se define VITE_API_BASE_URL, se usa esa URL directamente.
const BASE_URL = import.meta.env.VITE_API_BASE_URL || "/api";

export class ApiError extends Error {
  constructor(message, status) {
    super(message);
    this.status = status;
  }
}

async function request(path, { method = "GET", body, token, headers = {} } = {}) {
  const finalHeaders = { ...headers };
  if (body !== undefined) finalHeaders["Content-Type"] = "application/json";
  if (token) finalHeaders["Authorization"] = `Bearer ${token}`;

  let res;
  try {
    res = await fetch(`${BASE_URL}/${path.replace(/^\//, "")}`, {
      method,
      headers: finalHeaders,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch (networkErr) {
    throw new ApiError(
      "No se pudo conectar con la API. ¿Está corriendo el contenedor Docker?",
      0
    );
  }

  const text = await res.text();
  let data = null;
  if (text) {
    try {
      data = JSON.parse(text);
    } catch {
      data = text;
    }
  }

  if (!res.ok) {
    const message =
      typeof data === "string"
        ? data
        : data?.message || `Error ${res.status}`;
    throw new ApiError(message, res.status);
  }

  return data;
}

export const api = {
  // --- Auth ---
  login(usuario, contrasena) {
    const basic = btoa(`${usuario}:${contrasena}`);
    return request("auth/login", {
      headers: { Authorization: `Basic ${basic}` },
    });
  },

  // --- Categorías (géneros) ---
  getCategorias(nombre) {
    const qs = nombre ? `?nombre=${encodeURIComponent(nombre)}` : "";
    return request(`categoria${qs}`);
  },
  getCategoria(id) {
    return request(`categoria/${id}`);
  },
  crearCategoria({ nombre, descripcion }, token) {
    return request("categoria", {
      method: "POST",
      body: { nombre, descripcion },
      token,
    });
  },

  // --- Películas ---
  getPeliculas({ sort, order } = {}) {
    const params = new URLSearchParams();
    if (sort) params.set("sort", sort);
    if (order) params.set("order", order);
    const qs = params.toString() ? `?${params.toString()}` : "";
    return request(`peliculas${qs}`);
  },
  actualizarPelicula(id, { nombre, estudio, id_genero }, token) {
    return request(`peliculas/${id}`, {
      method: "PUT",
      body: { nombre, estudio, id_genero },
      token,
    });
  },
};
