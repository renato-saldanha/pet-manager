import { render, screen, waitFor, fireEvent, act } from "@testing-library/react";
import { AuthProvider, useAuth } from "../AuthContext";
import { authStore } from "@/stores/authStore";

jest.mock("@/stores/authStore");
jest.mock("@/components/LoginModal", () => {
  return function MockLoginModal({ onLoginSuccess }: { onLoginSuccess: () => void }) {
    return (
      <div data-testid="login-modal">
        <button onClick={onLoginSuccess}>Mock Login</button>
      </div>
    );
  };
});

function TestComponent() {
  const { isAuthenticated, logout } = useAuth();
  return (
    <div>
      <div data-testid="auth-status">{isAuthenticated ? "authenticated" : "not-authenticated"}</div>
      <button onClick={logout}>Logout</button>
    </div>
  );
}

describe("AuthContext", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
  });

  it("deve mostrar login modal quando não autenticado", () => {
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
    });
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        callback({ isAuthenticated: false, token: null, refreshToken: null });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("login-modal")).toBeInTheDocument();
  });

  it("deve verificar token no mount", async () => {
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: "token",
      refreshToken: "refresh",
    });
    (authStore.refreshToken as jest.Mock).mockResolvedValue("new-token");
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        callback({ isAuthenticated: true, token: "token", refreshToken: "refresh" });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authStore.refreshToken).toHaveBeenCalled();
    });
  });

  it("deve fazer logout e mostrar modal", async () => {
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: "token",
      refreshToken: "refresh",
    });
    (authStore.refreshToken as jest.Mock).mockResolvedValue("new-token");
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        callback({ isAuthenticated: true, token: "token", refreshToken: "refresh" });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("login-modal")).not.toBeInTheDocument();
    });

    const logoutButton = screen.getByText("Logout");
    fireEvent.click(logoutButton);

    expect(authStore.logout).toHaveBeenCalled();
  });

  it("deve lidar com evento auth:unauthorized", async () => {
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: true,
      token: "token",
      refreshToken: "refresh",
    });
    (authStore.refreshToken as jest.Mock).mockResolvedValue("new-token");
    let stateCallback: any;
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        stateCallback = callback;
        callback({ isAuthenticated: true, token: "token", refreshToken: "refresh" });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(screen.queryByTestId("login-modal")).not.toBeInTheDocument();
    });

    // Disparar evento auth:unauthorized
    act(() => {
      window.dispatchEvent(new Event("auth:unauthorized"));
    });

    // Simular mudança de estado após logout
    act(() => {
      if (stateCallback) {
        stateCallback({ isAuthenticated: false, token: null, refreshToken: null });
      }
    });

    await waitFor(() => {
      expect(authStore.logout).toHaveBeenCalled();
      expect(screen.getByTestId("login-modal")).toBeInTheDocument();
    });
  });

  it("deve fazer logout quando refresh token retorna null", async () => {
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      token: "token",
      refreshToken: "refresh",
    });
    (authStore.refreshToken as jest.Mock).mockResolvedValue(null);
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        callback({ isAuthenticated: false, token: null, refreshToken: null });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authStore.logout).toHaveBeenCalled();
      expect(screen.getByTestId("login-modal")).toBeInTheDocument();
    });
  });

  it("deve fazer logout quando refresh token falha", async () => {
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      token: "token",
      refreshToken: "refresh",
    });
    (authStore.refreshToken as jest.Mock).mockRejectedValue(new Error("Refresh failed"));
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        callback({ isAuthenticated: false, token: null, refreshToken: null });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authStore.logout).toHaveBeenCalled();
      expect(screen.getByTestId("login-modal")).toBeInTheDocument();
    });
  });

  it("deve fazer logout quando não há token nem refreshToken", async () => {
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
    });
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        callback({ isAuthenticated: false, token: null, refreshToken: null });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(authStore.logout).toHaveBeenCalled();
      expect(screen.getByTestId("login-modal")).toBeInTheDocument();
    });
  });

  it("deve fechar modal quando login é bem-sucedido", async () => {
    const consoleSpy = jest.spyOn(console, "log").mockImplementation();
    let stateCallback: any;
    (authStore.getState as jest.Mock).mockReturnValue({
      isAuthenticated: false,
      token: null,
      refreshToken: null,
    });
    (authStore.state$ as any) = {
      subscribe: jest.fn((callback) => {
        stateCallback = callback;
        // Primeiro callback mostra modal
        callback({ isAuthenticated: false, token: null, refreshToken: null });
        return { unsubscribe: jest.fn() };
      }),
    };

    render(
      <AuthProvider>
        <TestComponent />
      </AuthProvider>
    );

    expect(screen.getByTestId("login-modal")).toBeInTheDocument();

    // Simular login bem-sucedido
    const loginButton = screen.getByText("Mock Login");
    fireEvent.click(loginButton);

    // Simular mudança de estado após login
    act(() => {
      if (stateCallback) {
        stateCallback({ isAuthenticated: true, token: "token", refreshToken: "refresh" });
      }
    });

    await waitFor(() => {
      expect(consoleSpy).toHaveBeenCalledWith("[AUTH] loginSuccess chamado");
    });

    consoleSpy.mockRestore();
  });
});
