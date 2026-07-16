import { tripNotFoundError } from "@/domain/errors";
import type { TripRepository } from "@/application/ports/trip-repository";

export async function getTripDetails(
  tripRepository: TripRepository,
  tripId: string,
) {
  const trip = await tripRepository.findWithSeatMap(tripId);

  if (!trip) {
    throw tripNotFoundError();
  }

  return trip;
}
