import { AuthService } from "../authService";
import axios from "axios";

// Mock do módulo api
const mockApiPost = jest.fn();

jest.mock("../api", () => ({
  api: {
    post: jest.fn(),
    get: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
    interceptors: {
      request: { use: jest.fn() },
      response: { use: jest.fn() },
    },
  },
}));

jest.mock("axios");

// Importar api após mock
import { api } from "../api";

describe("AuthService", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    localStorage.clear();
    (api.post as jest.Mock).mockClear();
  });

  describe("login", () => {
    it("deve fazer login e salvar tokens no localStorage", async () => {
      const mockResponse = {
        data: {
          access_token: "test-access-token",
          refresh_token: "test-refresh-token",
          expires_in: 3600,
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.login("admin", "admin");

      expect(api.post).toHaveBeenCalledWith("/autenticacao/login", {
        username: "admin",
        password: "admin",
      });
      expect(localStorage.getItem("access_token")).toBe("test-access-token");
      expect(localStorage.getItem("refresh_token")).toBe("test-refresh-token");
      expect(result).toEqual(mockResponse.data);
    });

    it("deve lançar erro quando login falha", async () => {
      (api.post as jest.Mock).mockRejectedValue(new Error("Login failed"));

      await expect(AuthService.login("admin", "wrong")).rejects.toThrow("Login failed");
    });

    it("deve logar erro quando access_token não existe na resposta", async () => {
      const consoleSpy = jest.spyOn(console, "error").mockImplementation();
      const mockResponse = {
        data: {
          refresh_token: "test-refresh-token",
          expires_in: 3600,
          // access_token ausente
        },
      };

      (api.post as jest.Mock).mockResolvedValue(mockResponse);

      await AuthService.login("admin", "admin");

      expect(consoleSpy).toHaveBeenCalledWith("[AUTH_SERVICE] Token não encontrado na resposta da API!");
      consoleSpy.mockRestore();
    });
  });

  describe("refresh_token", () => {
    it("deve renovar o token usando refresh_token", async () => {
      localStorage.setItem("refresh_token", "test-refresh-token");
      const mockResponse = {
        data: {
          access_token: "new-access-token",
        },
      };

      (axios.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.refresh_token();

      expect(axios.put).toHaveBeenCalledWith(
        expect.stringContaining("/autenticacao/refresh"),
        {},
        expect.objectContaining({
          headers: expect.objectContaining({
            Authorization: "Bearer test-refresh-token",
          }),
        })
      );
      expect(localStorage.getItem("access_token")).toBe("new-access-token");
      expect(result).toBe("new-access-token");
    });

    it("deve retornar null quando não há refresh_token", async () => {
      const result = await AuthService.refresh_token();
      expect(result).toBeNull();
    });

    it("deve fazer logout quando refresh falha", async () => {
      localStorage.setItem("refresh_token", "invalid-token");
      (axios.put as jest.Mock).mockRejectedValue(new Error("Refresh failed"));

      const result = await AuthService.refresh_token();

      expect(result).toBeNull();
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });

    it("deve fazer logout quando token não é encontrado na resposta do refresh", async () => {
      localStorage.setItem("refresh_token", "test-refresh-token");
      const mockResponse = {
        data: {
          // token e access_token ausentes
        },
      };

      (axios.put as jest.Mock).mockResolvedValue(mockResponse);

      const result = await AuthService.refresh_token();

      expect(result).toBeNull();
      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });

  describe("logout", () => {
    it("deve remover tokens do localStorage", () => {
      localStorage.setItem("access_token", "token");
      localStorage.setItem("refresh_token", "refresh");

      AuthService.logout();

      expect(localStorage.getItem("access_token")).toBeNull();
      expect(localStorage.getItem("refresh_token")).toBeNull();
    });
  });

  describe("getToken", () => {
    it("deve retornar o token do localStorage", () => {
      localStorage.setItem("access_token", "test-token");
      expect(AuthService.getToken()).toBe("test-token");
    });

    it("deve retornar null quando não há token", () => {
      expect(AuthService.getToken()).toBeNull();
    });
  });

  describe("isAuthenticated", () => {
    it("deve retornar true quando há token", () => {
      localStorage.setItem("access_token", "token");
      expect(AuthService.isAuthenticated()).toBe(true);
    });

    it("deve retornar false quando não há token", () => {
      expect(AuthService.isAuthenticated()).toBe(false);
    });
  });
});
