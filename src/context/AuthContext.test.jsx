import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { AuthProvider, useAuth } from "./AuthContext";
import { api } from "../api/client";

// No queremos pegarle a la API real: se mockea solo el login
vi.mock("../api/client", () => ({ api: { login: vi.fn() } }));

const STORAGE_KEY = "cartelera_token";

// Arma un JWT con el mismo formato que libs/jwt/jwt.php (header.payload.firma en base64url)
function base64url(text) {
  return btoa(text).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/, "");
}
function makeToken(payload) {
  return `${base64url('{"typ":"JWT","alg":"HS256"}')}.${base64url(JSON.stringify(payload))}.firma`;
}
const inOneHour = () => Math.floor(Date.now() / 1000) + 3600;

const wrapper = ({ children }) => <AuthProvider>{children}</AuthProvider>;

beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
});

describe("AuthContext", () => {
  it("arranca sin sesión cuando no hay token guardado", () => {
    const { result } = renderHook(() => useAuth(), { wrapper });

    expect(result.current.isAuthenticated).toBe(false);
    expect(result.current.user).toBeNull();
  });

  it("login guarda el token y decodifica el usuario del payload", async () => {
    const token = makeToken({ usuario: "admin", roles: ["ADMIN"], exp: inOneHour() });
    api.login.mockResolvedValue({ token });
    const { result } = renderHook(() => useAuth(), { wrapper });

    await act(async () => {
      await result.current.login("admin", "admin123");
    });

    expect(api.login).toHaveBeenCalledWith("admin", "admin123");
    expect(result.current.isAuthenticated).toBe(true);
    expect(result.current.user.usuario).toBe("admin");
    expect(result.current.user.roles).toEqual(["ADMIN"]);
    expect(localStorage.getItem(STORAGE_KEY)).toBe(token);
  });

  it("logout borra el token y cierra la sesión", async () => {
    const token = makeToken({ usuario: "demo", roles: ["USER"], exp: inOneHour() });
    api.login.mockResolvedValue({ token });
    const { result } = renderHook(() => useAuth(), { wrapper });
    await act(async () => {
      await result.current.login("demo", "demo123");
    });

    act(() => {
      result.current.logout();
    });

    expect(result.current.isAuthenticated).toBe(false);
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("cierra la sesión sola si el token guardado ya expiró", async () => {
    const expired = makeToken({ usuario: "admin", roles: ["ADMIN"], exp: 1 });
    localStorage.setItem(STORAGE_KEY, expired);

    const { result } = renderHook(() => useAuth(), { wrapper });

    await waitFor(() => expect(result.current.isAuthenticated).toBe(false));
    expect(localStorage.getItem(STORAGE_KEY)).toBeNull();
  });

  it("si el login falla, el error se propaga y no queda sesión", async () => {
    api.login.mockRejectedValue(new Error("Usuario o contraseña incorrecta"));
    const { result } = renderHook(() => useAuth(), { wrapper });

    await expect(
      act(async () => {
        await result.current.login("admin", "mala");
      })
    ).rejects.toThrow("Usuario o contraseña incorrecta");

    expect(result.current.isAuthenticated).toBe(false);
  });
});
