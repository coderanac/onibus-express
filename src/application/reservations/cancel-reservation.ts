import { isWithinCancellationWindow } from "@/domain/entities";
import {
  cancellationWindowExpiredError,
  reservationAlreadyCancelledError,
  reservationNotFoundError,
} from "@/domain/errors";
import type { ReservationRepository } from "@/application/ports/reservation-repository";

export async function cancelReservation(
  reservationRepository: ReservationRepository,
  code: string,
  now: Date = new Date(),
) {
  const reservation = await reservationRepository.findByCode(code);

  if (!reservation) {
    throw reservationNotFoundError();
  }

  if (reservation.status === "CANCELLED") {
    throw reservationAlreadyCancelledError();
  }

  if (isWithinCancellationWindow(reservation.trip.departureAt, now)) {
    throw cancellationWindowExpiredError();
  }

  return reservationRepository.cancel(reservation.id);
}
