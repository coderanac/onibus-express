import type { PrismaClient, User as PrismaUser } from "@prisma/client";
import type {
  CreateUserInput,
  UserCredentials,
  UserRepository,
} from "@/application/ports/user-repository";
import type { User } from "@/domain/entities";

function toUser(row: PrismaUser): User {
  return {
    id: row.id,
    name: row.name,
    cpf: row.cpf,
    email: row.email,
    birthDate: row.birthDate,
    createdAt: row.createdAt,
  };
}

export function createPrismaUserRepository(client: PrismaClient): UserRepository {
  return {
    async findByCpf(cpf: string) {
      const row = await client.user.findUnique({ where: { cpf } });
      return row ? toUser(row) : null;
    },

    async findByEmail(email: string) {
      const row = await client.user.findUnique({ where: { email } });
      return row ? toUser(row) : null;
    },

    async findById(id: string) {
      const row = await client.user.findUnique({ where: { id } });
      return row ? toUser(row) : null;
    },

    async findCredentialsByEmail(email: string): Promise<UserCredentials | null> {
      const row = await client.user.findUnique({ where: { email } });
      return row ? { id: row.id, passwordHash: row.passwordHash } : null;
    },

    async create(input: CreateUserInput) {
      const row = await client.user.create({ data: input });
      return toUser(row);
    },
  };
}
