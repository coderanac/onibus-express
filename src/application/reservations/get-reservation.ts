import { reservationNotFoundError } from "@/domain/errors";
import type { ReservationRepository } from "@/application/ports/reservation-repository";

export async function getReservation(
  reservationRepository: ReservationRepository,
  code: string,
) {
  const reservation = await reservationRepository.findByCode(code);

  if (!reservation) {
    throw reservationNotFoundError();
  }

  return reservation;
}
