import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { renderWithQueryClient } from "@/test/render-with-query-client";
import { api } from "@/lib/api-client";
import { RegisterForm } from "./register-form";

const pushMock = jest.fn();

jest.mock("next/navigation", () => ({
  useRouter: () => ({ push: pushMock }),
}));

jest.mock("@/lib/api-client", () => ({
  api: {
    register: jest.fn(),
  },
}));

async function fillValidForm(user: ReturnType<typeof userEvent.setup>) {
  await user.type(screen.getByLabelText("Nome completo"), "Maria Silva");
  await user.type(screen.getByLabelText("CPF"), "529.982.247-25");
  await user.type(screen.getByLabelText("Data de nascimento"), "01011990");
  await user.type(screen.getByLabelText("E-mail"), "maria@example.com");
  await user.type(screen.getByLabelText("Senha"), "senha1234");
  await user.type(screen.getByLabelText("Confirmar senha"), "senha1234");
}

describe("RegisterForm", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("shows validation errors and blocks submission with empty fields", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<RegisterForm />);

    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("Informe seu nome completo.")).toBeInTheDocument();
    expect(screen.getByText("CPF inválido.")).toBeInTheDocument();
    expect(
      screen.getByText("Informe uma data de nascimento válida."),
    ).toBeInTheDocument();
    expect(screen.getByText("E-mail inválido.")).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it("blocks submission when password confirmation does not match", async () => {
    const user = userEvent.setup();
    renderWithQueryClient(<RegisterForm />);

    await fillValidForm(user);
    await user.clear(screen.getByLabelText("Confirmar senha"));
    await user.type(screen.getByLabelText("Confirmar senha"), "outrasenha");
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    expect(await screen.findByText("As senhas não coincidem.")).toBeInTheDocument();
    expect(api.register).not.toHaveBeenCalled();
  });

  it("creates the account with valid data and redirects", async () => {
    const user = userEvent.setup();
    (api.register as jest.Mock).mockResolvedValue({
      id: "user-1",
      name: "Maria Silva",
      cpf: "52998224725",
      email: "maria@example.com",
      birthDate: "1990-01-01T00:00:00.000Z",
      createdAt: new Date().toISOString(),
    });

    renderWithQueryClient(<RegisterForm redirectTo="/minhas-reservas" />);

    await fillValidForm(user);
    await user.click(screen.getByRole("button", { name: "Criar conta" }));

    await waitFor(() => expect(pushMock).toHaveBeenCalledWith("/minhas-reservas"));
    expect(api.register).toHaveBeenCalledWith({
      name: "Maria Silva",
      cpf: "529.982.247-25",
      birthDate: "1990-01-01",
      email: "maria@example.com",
      password: "senha1234",
      confirmPassword: "senha1234",
    });
  });
});
