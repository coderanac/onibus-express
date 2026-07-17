import { invalidCredentialsError } from "@/domain/errors";
import { verifyPassword } from "@/domain/password";
import type { UserRepository } from "@/application/ports/user-repository";

export interface LoginWithEmailRequest {
  email: string;
  password: string;
}

export async function loginWithEmail(
  dependencies: { userRepository: UserRepository },
  request: LoginWithEmailRequest,
) {
  const { userRepository } = dependencies;
  const email = request.email.trim().toLowerCase();

  const credentials = await userRepository.findCredentialsByEmail(email);
  if (!credentials || !verifyPassword(request.password, credentials.passwordHash)) {
    throw invalidCredentialsError();
  }

  const user = await userRepository.findById(credentials.id);
  if (!user) {
    throw invalidCredentialsError();
  }

  return user;
}
