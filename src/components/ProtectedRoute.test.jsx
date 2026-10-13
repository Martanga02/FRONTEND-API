import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";
import { ProtectedRoute } from "./ProtectedRoute";
import { useAuth } from "../context/AuthContext";

// Se controla a mano si hay sesión o no
vi.mock("../context/AuthContext", () => ({ useAuth: vi.fn() }));

function renderPrivateRoute() {
  return render(
    <MemoryRouter initialEntries={["/privada"]}>
      <Routes>
        <Route path="/login" element={<p>Pantalla de login</p>} />
        <Route
          path="/privada"
          element={
            <ProtectedRoute>
              <p>Contenido secreto</p>
            </ProtectedRoute>
          }
        />
      </Routes>
    </MemoryRouter>
  );
}

describe("ProtectedRoute", () => {
  it("redirige a /login cuando no hay sesión", () => {
    useAuth.mockReturnValue({ isAuthenticated: false });

    renderPrivateRoute();

    expect(screen.getByText("Pantalla de login")).toBeTruthy();
    expect(screen.queryByText("Contenido secreto")).toBeNull();
  });

  it("muestra el contenido cuando hay sesión", () => {
    useAuth.mockReturnValue({ isAuthenticated: true });

    renderPrivateRoute();

    expect(screen.getByText("Contenido secreto")).toBeTruthy();
    expect(screen.queryByText("Pantalla de login")).toBeNull();
  });
});
