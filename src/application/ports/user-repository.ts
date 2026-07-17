import type { User } from "@/domain/entities";

export interface CreateUserInput {
  name: string;
  cpf: string;
  email: string;
  birthDate: Date;
  passwordHash: string;
}

export interface UserCredentials {
  id: string;
  passwordHash: string;
}

export interface UserRepository {
  findByCpf(cpf: string): Promise<User | null>;
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  findCredentialsByEmail(email: string): Promise<UserCredentials | null>;
  create(input: CreateUserInput): Promise<User>;
}
