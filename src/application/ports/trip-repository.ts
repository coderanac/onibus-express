import type { Trip, TripWithAvailability, TripWithSeatMap } from "@/domain/entities";

export interface TripSearchFilters {
  origin?: string;
  destination?: string;
  date?: string;
}

export interface TripRepository {
  search(filters: TripSearchFilters): Promise<TripWithAvailability[]>;
  findById(id: string): Promise<Trip | null>;
  findWithSeatMap(id: string): Promise<TripWithSeatMap | null>;
}
