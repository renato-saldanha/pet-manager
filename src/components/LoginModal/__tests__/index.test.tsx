import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import LoginModal from "../index";
import { AuthService } from "@/services/authService";
import toast from "react-hot-toast";

jest.mock("@/services/authService");
jest.mock("react-hot-toast", () => ({
  __esModule: true,
  default: {
    success: jest.fn(),
    error: jest.fn(),
  },
}));

describe("LoginModal", () => {
  const mockOnLoginSuccess = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("deve renderizar o formulário de login", () => {
    render(<LoginModal onLoginSuccess={mockOnLoginSuccess} />);

    expect(screen.getByLabelText(/usuário/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/senha/i)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /acessar sistema/i })).toBeInTheDocument();
  });

  it("deve ter valores padrão nos campos", () => {
    render(<LoginModal onLoginSuccess={mockOnLoginSuccess} />);

    const usuarioInput = screen.getByLabelText(/usuário/i) as HTMLInputElement;
    const senhaInput = screen.getByLabelText(/senha/i) as HTMLInputElement;

    expect(usuarioInput.value).toBe("admin");
    expect(senhaInput.value).toBe("admin");
  });

  it("deve permitir editar os campos", () => {
    render(<LoginModal onLoginSuccess={mockOnLoginSuccess} />);

    const usuarioInput = screen.getByLabelText(/usuário/i) as HTMLInputElement;
    const senhaInput = screen.getByLabelText(/senha/i) as HTMLInputElement;

    fireEvent.change(usuarioInput, { target: { value: "novoUsuario" } });
    fireEvent.change(senhaInput, { target: { value: "novaSenha" } });

    expect(usuarioInput.value).toBe("novoUsuario");
    expect(senhaInput.value).toBe("novaSenha");
  });

  it("deve chamar AuthService.login ao submeter o formulário", async () => {
    (AuthService.login as jest.Mock).mockResolvedValue({
      access_token: "token",
      refresh_token: "refresh",
      expires_in: 3600,
    });
    (AuthService.getToken as jest.Mock).mockReturnValue("token");

    render(<LoginModal onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: /acessar sistema/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(AuthService.login).toHaveBeenCalledWith("admin", "admin");
    });
  });

  it("deve chamar onLoginSuccess após login bem-sucedido", async () => {
    (AuthService.login as jest.Mock).mockResolvedValue({
      access_token: "token",
      refresh_token: "refresh",
      expires_in: 3600,
    });
    (AuthService.getToken as jest.Mock).mockReturnValue("token");

    render(<LoginModal onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: /acessar sistema/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnLoginSuccess).toHaveBeenCalled();
    });
  });

  it("deve mostrar estado de loading durante o login", async () => {
    (AuthService.login as jest.Mock).mockImplementation(
      () => new Promise((resolve) => setTimeout(() => resolve({ access_token: "token", refresh_token: "refresh", expires_in: 3600 }), 100))
    );
    (AuthService.getToken as jest.Mock).mockReturnValue("token");

    render(<LoginModal onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: /acessar sistema/i });
    fireEvent.click(submitButton);

    expect(screen.getByText(/entrando/i)).toBeInTheDocument();
  });

  it("deve mostrar mensagem de erro quando login falha", async () => {
    jest.spyOn(toast, "error");
    (AuthService.login as jest.Mock).mockRejectedValue(new Error("Login failed"));

    render(<LoginModal onLoginSuccess={mockOnLoginSuccess} />);

    const submitButton = screen.getByRole("button", { name: /acessar sistema/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(toast.error).toHaveBeenCalledWith("Usuário ou senha inválidos.");
    });
  });
});
