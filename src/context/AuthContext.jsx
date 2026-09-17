import { createContext, useContext, useEffect, useState } from "react";
import { api } from "../api/client";

const AuthContext = createContext(null);
const STORAGE_KEY = "cartelera_token";

// El JWT lo arma libs/jwt/jwt.php a mano (header.payload.firma en base64url).
// Client-side solo necesitamos leer el payload para saber quién está
// logueado y qué roles tiene; la firma la valida el backend en cada request.
function decodePayload(token) {
  try {
    const [, payload] = token.split(".");
    const base64 = payload.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem(STORAGE_KEY));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    return saved ? decodePayload(saved) : null;
  });

  useEffect(() => {
    if (token) {
      localStorage.setItem(STORAGE_KEY, token);
      setUser(decodePayload(token));
    } else {
      localStorage.removeItem(STORAGE_KEY);
      setUser(null);
    }
  }, [token]);

  // Si el token expiró (exp en segundos, payload de jwt.php) cerramos sesión sola
  useEffect(() => {
    if (!user?.exp) return;
    const msRestantes = user.exp * 1000 - Date.now();
    if (msRestantes <= 0) {
      setToken(null);
      return;
    }
    const timer = setTimeout(() => setToken(null), msRestantes);
    return () => clearTimeout(timer);
  }, [user]);

  async function login(usuario, contrasena) {
    const data = await api.login(usuario, contrasena);
    setToken(data.token);
  }

  function logout() {
    setToken(null);
  }

  return (
    <AuthContext.Provider
      value={{ token, user, isAuthenticated: !!token, login, logout }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth debe usarse dentro de <AuthProvider>");
  return ctx;
}
