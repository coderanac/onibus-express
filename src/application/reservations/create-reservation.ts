import { isValidCpf, sanitizeCpf } from "@/domain/cpf";
import { hasTripDeparted } from "@/domain/entities";
import {
  invalidCpfError,
  invalidSeatNumberError,
  seatAlreadyTakenError,
  tripAlreadyDepartedError,
  tripNotFoundError,
} from "@/domain/errors";
import { generateReservationCode } from "@/domain/reservation-code";
import type { ReservationRepository } from "@/application/ports/reservation-repository";
import type { TripRepository } from "@/application/ports/trip-repository";

export interface CreateReservationRequest {
  tripId: string;
  userId?: string | null;
  seatNumber: number;
  passengerName: string;
  passengerCpf: string;
  passengerEmail: string;
}

const MAX_CODE_GENERATION_ATTEMPTS = 5;

async function generateUniqueReservationCode(
  reservationRepository: ReservationRepository,
): Promise<string> {
  for (let attempt = 0; attempt < MAX_CODE_GENERATION_ATTEMPTS; attempt += 1) {
    const code = generateReservationCode();
    const codeInUse = await reservationRepository.isCodeInUse(code);
    if (!codeInUse) {
      return code;
    }
  }
  throw new Error("Não foi possível gerar um código de reserva único.");
}

export async function createReservation(
  dependencies: {
    tripRepository: TripRepository;
    reservationRepository: ReservationRepository;
  },
  request: CreateReservationRequest,
  now: Date = new Date(),
) {
  const { tripRepository, reservationRepository } = dependencies;

  if (!isValidCpf(request.passengerCpf)) {
    throw invalidCpfError();
  }

  const trip = await tripRepository.findById(request.tripId);
  if (!trip) {
    throw tripNotFoundError();
  }

  if (hasTripDeparted(trip, now)) {
    throw tripAlreadyDepartedError();
  }

  if (request.seatNumber < 1 || request.seatNumber > trip.totalSeats) {
    throw invalidSeatNumberError(request.seatNumber, trip.totalSeats);
  }

  const seatTaken = await reservationRepository.isSeatTaken(trip.id, request.seatNumber);
  if (seatTaken) {
    throw seatAlreadyTakenError(request.seatNumber);
  }

  const code = await generateUniqueReservationCode(reservationRepository);

  return reservationRepository.create({
    code,
    tripId: trip.id,
    userId: request.userId ?? null,
    seatNumber: request.seatNumber,
    passengerName: request.passengerName.trim(),
    passengerCpf: sanitizeCpf(request.passengerCpf),
    passengerEmail: request.passengerEmail.trim().toLowerCase(),
  });
}
