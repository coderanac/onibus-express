import { isValidCpf, sanitizeCpf } from "@/domain/cpf";
import { isValidBirthDate } from "@/domain/entities";
import {
  cpfAlreadyRegisteredError,
  emailAlreadyRegisteredError,
  invalidBirthDateError,
  invalidCpfError,
  invalidNameError,
  invalidPasswordError,
  passwordsDoNotMatchError,
} from "@/domain/errors";
import { hashPassword, isValidPassword } from "@/domain/password";
import type { UserRepository } from "@/application/ports/user-repository";

export interface RegisterUserRequest {
  name: string;
  cpf: string;
  email: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}

export async function registerUser(
  dependencies: { userRepository: UserRepository },
  request: RegisterUserRequest,
) {
  const { userRepository } = dependencies;

  const name = request.name.trim();
  if (name.length < 3) {
    throw invalidNameError();
  }

  if (!isValidCpf(request.cpf)) {
    throw invalidCpfError();
  }

  const birthDate = new Date(request.birthDate);
  if (!isValidBirthDate(birthDate)) {
    throw invalidBirthDateError();
  }

  if (request.password !== request.confirmPassword) {
    throw passwordsDoNotMatchError();
  }

  if (!isValidPassword(request.password)) {
    throw invalidPasswordError();
  }

  const cpf = sanitizeCpf(request.cpf);
  const email = request.email.trim().toLowerCase();

  if (await userRepository.findByCpf(cpf)) {
    throw cpfAlreadyRegisteredError();
  }

  if (await userRepository.findByEmail(email)) {
    throw emailAlreadyRegisteredError();
  }

  return userRepository.create({
    name,
    cpf,
    email,
    birthDate,
    passwordHash: hashPassword(request.password),
  });
}
