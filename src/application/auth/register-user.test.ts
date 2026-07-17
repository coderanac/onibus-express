import { verifyPassword } from "@/domain/password";
import type { User } from "@/domain/entities";
import type {
  CreateUserInput,
  UserCredentials,
  UserRepository,
} from "@/application/ports/user-repository";
import { registerUser, type RegisterUserRequest } from "./register-user";

const VALID_CPF = "529.982.247-25";
const SANITIZED_CPF = "52998224725";

function createFakeUserRepository(existingUser: User | null = null): UserRepository & {
  createdUsers: CreateUserInput[];
} {
  const createdUsers: CreateUserInput[] = [];

  return {
    createdUsers,

    async findByCpf(cpf: string) {
      return existingUser && existingUser.cpf === cpf ? existingUser : null;
    },

    async findByEmail(email: string) {
      return existingUser && existingUser.email === email ? existingUser : null;
    },

    async findById(id: string) {
      return existingUser && existingUser.id === id ? existingUser : null;
    },

    async findCredentialsByEmail(): Promise<UserCredentials | null> {
      return null;
    },

    async create(input: CreateUserInput) {
      createdUsers.push(input);
      return {
        id: "user-1",
        createdAt: new Date(),
        name: input.name,
        cpf: input.cpf,
        email: input.email,
        birthDate: input.birthDate,
      };
    },
  };
}

function buildRequest(overrides: Partial<RegisterUserRequest> = {}): RegisterUserRequest {
  return {
    name: "Maria Silva",
    cpf: VALID_CPF,
    email: "maria@example.com",
    birthDate: "1990-01-01",
    password: "senha1234",
    confirmPassword: "senha1234",
    ...overrides,
  };
}

describe("registerUser", () => {
  it("creates a new account with a hashed password", async () => {
    const userRepository = createFakeUserRepository();

    const user = await registerUser({ userRepository }, buildRequest());

    expect(user.cpf).toBe(SANITIZED_CPF);
    expect(user.email).toBe("maria@example.com");
    expect(userRepository.createdUsers).toHaveLength(1);

    const passwordHash = userRepository.createdUsers[0]?.passwordHash;
    expect(passwordHash).toBeDefined();
    expect(verifyPassword("senha1234", passwordHash as string)).toBe(true);
  });

  it("rejects an incomplete name", async () => {
    const userRepository = createFakeUserRepository();

    await expect(
      registerUser({ userRepository }, buildRequest({ name: "Jo" })),
    ).rejects.toMatchObject({ name: "InvalidNameError" });
  });

  it("rejects an invalid CPF", async () => {
    const userRepository = createFakeUserRepository();

    await expect(
      registerUser({ userRepository }, buildRequest({ cpf: "123.456.789-00" })),
    ).rejects.toMatchObject({ name: "InvalidCpfError" });
  });

  it("rejects an invalid birth date", async () => {
    const userRepository = createFakeUserRepository();

    await expect(
      registerUser({ userRepository }, buildRequest({ birthDate: "invalid-date" })),
    ).rejects.toMatchObject({ name: "InvalidBirthDateError" });
  });

  it("rejects a birth date in the future", async () => {
    const userRepository = createFakeUserRepository();
    const futureDate = new Date(Date.now() + 1000 * 60 * 60 * 24 * 365).toISOString();

    await expect(
      registerUser({ userRepository }, buildRequest({ birthDate: futureDate })),
    ).rejects.toMatchObject({ name: "InvalidBirthDateError" });
  });

  it("rejects passwords that do not match", async () => {
    const userRepository = createFakeUserRepository();

    await expect(
      registerUser({ userRepository }, buildRequest({ confirmPassword: "outrasenha" })),
    ).rejects.toMatchObject({ name: "PasswordsDoNotMatchError" });
  });

  it("rejects passwords shorter than 8 characters", async () => {
    const userRepository = createFakeUserRepository();

    await expect(
      registerUser(
        { userRepository },
        buildRequest({ password: "123", confirmPassword: "123" }),
      ),
    ).rejects.toMatchObject({ name: "InvalidPasswordError" });
  });

  it("rejects a CPF that already has an account", async () => {
    const existingUser: User = {
      id: "user-1",
      name: "Maria Silva",
      cpf: SANITIZED_CPF,
      email: "outra@example.com",
      birthDate: new Date("1990-01-01"),
      createdAt: new Date(),
    };
    const userRepository = createFakeUserRepository(existingUser);

    await expect(
      registerUser({ userRepository }, buildRequest()),
    ).rejects.toMatchObject({ name: "CpfAlreadyRegisteredError" });
  });

  it("rejects an email that already has an account", async () => {
    const existingUser: User = {
      id: "user-1",
      name: "Maria Silva",
      cpf: "98765432100",
      email: "maria@example.com",
      birthDate: new Date("1990-01-01"),
      createdAt: new Date(),
    };
    const userRepository = createFakeUserRepository(existingUser);

    await expect(
      registerUser({ userRepository }, buildRequest()),
    ).rejects.toMatchObject({ name: "EmailAlreadyRegisteredError" });
  });
});
