import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import { api } from "@/lib/api-client";
import { LoginForm } from "./login-form";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/lib/api-client", () => ({
  api: {
    login: jest.fn(),
  },
}));

describe("LoginForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation errors and blocks submission with empty fields", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<LoginForm />);

    await user.click(screen.getByRole("button", { name: "Entrar" }));

    expect(await screen.findByText("E-mail inválido.")).toBeInTheDocument();
    expect(screen.getByText("Informe sua senha.")).toBeInTheDocument();
    expect(api.login).not.toHaveBeenCalled();
  });

  it("logs in with a valid email and password and redirects", async () => {
    const user = userEvent.setup();
    (api.login as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "Maria Silva",
      cpf: "52998224725",
      email: "maria@example.com",
      birthDate: "1990-01-01T00:00:00.000Z",
      createdAt: new Date().toISOString(),
    });

    renderWithQueryClient(<LoginForm redirectTo="/minhas-reservas" />);

    await user.type(screen.getByLabelText("E-mail"), "maria@example.com");
    await user.type(screen.getByLabelText("Senha"), "senha1234");
    await user.click(screen.getByRole("button", { name: "Entrar" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/minhas-reservas"));
    expect(api.login).toHaveBeenCalledWith({
      email: "maria@example.com",
      password: "senha1234",
    });
  });
});
