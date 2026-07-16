import type {
  TripRepository,
  TripSearchFilters,
} from "@/application/ports/trip-repository";

export function searchTrips(
  tripRepository: TripRepository,
  filters: TripSearchFilters,
) {
  return tripRepository.search(filters);
}
