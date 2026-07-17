import { hashPassword } from "@/domain/password";
import type { User } from "@/domain/entities";
import type { UserCredentials, UserRepository } from "@/application/ports/user-repository";
import { loginWithEmail } from "./login-with-email";

const EXISTING_USER: User = {
  id: "user-1",
  name: "Maria Silva",
  cpf: "52998224725",
  email: "maria@example.com",
  birthDate: new Date("1990-01-01"),
  createdAt: new Date(),
};

function createFakeUserRepository(passwordHash: string): UserRepository {
  return {
    async findByCpf() {
      return null;
    },

    async findByEmail(email: string) {
      return email === EXISTING_USER.email ? EXISTING_USER : null;
    },

    async findById(id: string) {
      return id === EXISTING_USER.id ? EXISTING_USER : null;
    },

    async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
      return email === EXISTING_USER.email
        ? { id: EXISTING_USER.id, passwordHash }
        : null;
    },

    async create(): Promise<User> {
      throw new Error("not implemented");
    },
  };
}

describe("loginWithEmail", () => {
  it("returns the user when the email and password match", async () => {
    const userRepository = createFakeUserRepository(hashPassword("senha1234"));

    const user = await loginWithEmail(
      { userRepository },
      { email: "maria@example.com", password: "senha1234" },
    );

    expect(user).toEqual(EXISTING_USER);
  });

  it("rejects an unknown email", async () => {
    const userRepository = createFakeUserRepository(hashPassword("senha1234"));

    await expect(
      loginWithEmail(
        { userRepository },
        { email: "desconhecido@example.com", password: "senha1234" },
      ),
    ).rejects.toMatchObject({ name: "InvalidCredentialsError" });
  });

  it("rejects an incorrect password", async () => {
    const userRepository = createFakeUserRepository(hashPassword("senha1234"));

    await expect(
      loginWithEmail(
        { userRepository },
        { email: "maria@example.com", password: "senha-errada" },
      ),
    ).rejects.toMatchObject({ name: "InvalidCredentialsError" });
  });
});
