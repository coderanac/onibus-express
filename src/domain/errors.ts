export interface DomainError extends Error {
  readonly isDomainError: true;
  readonly statusCode: number;
}

function createDomainError(
  name: string,
  message: string,
  statusCode: number,
): DomainError {
  return Object.assign(new Error(message), {
    name,
    statusCode,
    isDomainError: true as const,
  });
}

export function isDomainError(error: unknown): error is DomainError {
  return error instanceof Error && (error as Partial<DomainError>).isDomainError === true;
}

export function invalidCpfError(): DomainError {
  return createDomainError("InvalidCpfError", "CPF inválido.", 400);
}

export function invalidNameError(): DomainError {
  return createDomainError(
    "InvalidNameError",
    "Informe seu nome completo para criar sua conta.",
    400,
  );
}

export function invalidBirthDateError(): DomainError {
  return createDomainError(
    "InvalidBirthDateError",
    "Informe uma data de nascimento válida.",
    400,
  );
}

export function invalidPasswordError(): DomainError {
  return createDomainError(
    "InvalidPasswordError",
    "A senha deve ter pelo menos 8 caracteres.",
    400,
  );
}

export function passwordsDoNotMatchError(): DomainError {
  return createDomainError(
    "PasswordsDoNotMatchError",
    "As senhas informadas não coincidem.",
    400,
  );
}

export function emailAlreadyRegisteredError(): DomainError {
  return createDomainError(
    "EmailAlreadyRegisteredError",
    "Este e-mail já possui uma conta cadastrada.",
    409,
  );
}

export function cpfAlreadyRegisteredError(): DomainError {
  return createDomainError(
    "CpfAlreadyRegisteredError",
    "Este CPF já possui uma conta cadastrada.",
    409,
  );
}

export function invalidCredentialsError(): DomainError {
  return createDomainError("InvalidCredentialsError", "E-mail ou senha inválidos.", 401);
}

export function tripNotFoundError(): DomainError {
  return createDomainError("TripNotFoundError", "Viagem não encontrada.", 404);
}

export function reservationNotFoundError(): DomainError {
  return createDomainError("ReservationNotFoundError", "Reserva não encontrada.", 404);
}

export function seatAlreadyTakenError(seatNumber: number): DomainError {
  return createDomainError(
    "SeatAlreadyTakenError",
    `O assento ${seatNumber} já está ocupado.`,
    409,
  );
}

export function invalidSeatNumberError(
  seatNumber: number,
  totalSeats: number,
): DomainError {
  return createDomainError(
    "InvalidSeatNumberError",
    `O assento ${seatNumber} não existe nesta viagem (1 a ${totalSeats}).`,
    400,
  );
}

export function tripAlreadyDepartedError(): DomainError {
  return createDomainError(
    "TripAlreadyDepartedError",
    "Não é possível reservar uma viagem que já partiu.",
    409,
  );
}

export function cancellationWindowExpiredError(): DomainError {
  return createDomainError(
    "CancellationWindowExpiredError",
    "O cancelamento só é permitido até 2 horas antes da partida.",
    409,
  );
}

export function reservationAlreadyCancelledError(): DomainError {
  return createDomainError(
    "ReservationAlreadyCancelledError",
    "Esta reserva já foi cancelada.",
    409,
  );
}
