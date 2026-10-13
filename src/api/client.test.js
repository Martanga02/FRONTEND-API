import { describe, it, expect, vi, afterEach } from "vitest";
import { api, ApiError } from "./client";

// Reemplaza fetch por un mock que devuelve la respuesta indicada
function mockFetch(body, { status = 200 } = {}) {
  const fn = vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    text: () => Promise.resolve(body === undefined ? "" : JSON.stringify(body)),
  });
  vi.stubGlobal("fetch", fn);
  return fn;
}

afterEach(() => {
  vi.unstubAllGlobals();
});

describe("api client", () => {
  it("login envía Basic Auth con usuario:contraseña en base64", async () => {
    const fetchMock = mockFetch({ token: "abc.def.ghi" });

    const data = await api.login("admin", "admin123");

    const [url, options] = fetchMock.mock.calls[0];
    expect(url).toContain("auth/login");
    expect(options.method).toBe("GET");
    expect(options.headers.Authorization).toBe(`Basic ${btoa("admin:admin123")}`);
    expect(data).toEqual({ token: "abc.def.ghi" });
  });

  it("getCategorias codifica el filtro por nombre en la URL", async () => {
    const fetchMock = mockFetch([]);

    await api.getCategorias("ciencia ficción");

    const [url] = fetchMock.mock.calls[0];
    expect(url).toContain(`categoria?nombre=${encodeURIComponent("ciencia ficción")}`);
  });

  it("getCategorias sin filtro no agrega query string", async () => {
    const fetchMock = mockFetch([]);

    await api.getCategorias();

    const [url] = fetchMock.mock.calls[0];
    expect(url.endsWith("categoria")).toBe(true);
  });

  it("crearCategoria hace POST con body JSON y token Bearer", async () => {
    const fetchMock = mockFetch({ id: 7, nombre: "Terror", descripcion: "Miedo" });

    await api.crearCategoria({ nombre: "Terror", descripcion: "Miedo" }, "mi-token");

    const [, options] = fetchMock.mock.calls[0];
    expect(options.method).toBe("POST");
    expect(options.headers["Content-Type"]).toBe("application/json");
    expect(options.headers.Authorization).toBe("Bearer mi-token");
    expect(JSON.parse(options.body)).toEqual({ nombre: "Terror", descripcion: "Miedo" });
  });

  it("lanza ApiError con el status y el mensaje cuando la API responde error", async () => {
    mockFetch("La categoría con el id=99 no existe", { status: 404 });

    await expect(api.getCategoria(99)).rejects.toBeInstanceOf(ApiError);
    await expect(api.getCategoria(99)).rejects.toMatchObject({
      status: 404,
      message: "La categoría con el id=99 no existe",
    });
  });

  it("lanza ApiError con status 0 si no hay conexión con la API", async () => {
    vi.stubGlobal("fetch", vi.fn().mockRejectedValue(new TypeError("Failed to fetch")));

    await expect(api.getPeliculas()).rejects.toMatchObject({ status: 0 });
  });
});
