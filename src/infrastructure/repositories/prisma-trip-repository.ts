import type { Prisma, PrismaClient } from "@prisma/client";
import type {
  TripRepository,
  TripSearchFilters,
} from "@/application/ports/trip-repository";
import { hasTripDeparted, type Trip } from "@/domain/entities";

type TripWithRoute = Prisma.TripGetPayload<{ include: { route: true } }>;
type TripWithRoundAndReservations = Prisma.TripGetPayload<{
  include: { route: true; reservations: true };
}>;

function toTrip(trip: TripWithRoute): Trip {
  return {
    id: trip.id,
    routeId: trip.routeId,
    departureAt: trip.departureAt,
    basePrice: trip.basePrice,
    totalSeats: trip.totalSeats,
    route: {
      id: trip.route.id,
      origin: trip.route.origin,
      destination: trip.route.destination,
      durationMinutes: trip.route.durationMinutes,
    },
  };
}

function matchesLocation(value: string, filter?: string): boolean {
  if (!filter?.trim()) {
    return true;
  }
  return value.toLowerCase().includes(filter.trim().toLowerCase());
}

function dayRange(isoDate: string): { gte: Date; lte: Date } {
  const start = new Date(`${isoDate}T00:00:00`);
  const end = new Date(`${isoDate}T23:59:59.999`);
  return { gte: start, lte: end };
}

export function createPrismaTripRepository(client: PrismaClient): TripRepository {
  return {
    async search(filters: TripSearchFilters) {
      const where: Prisma.TripWhereInput = {};
      if (filters.date) {
        where.departureAt = dayRange(filters.date);
      }

      const trips = await client.trip.findMany({
        where,
        include: { route: true, reservations: { where: { status: "CONFIRMED" } } },
        orderBy: { departureAt: "asc" },
      });

      const now = new Date();
      return (trips as TripWithRoundAndReservations[])
        .filter(
          (trip) =>
            matchesLocation(trip.route.origin, filters.origin) &&
            matchesLocation(trip.route.destination, filters.destination) &&
            !hasTripDeparted(trip, now),
        )
        .map((trip) => ({
          ...toTrip(trip),
          availableSeats: trip.totalSeats - trip.reservations.length,
        }));
    },

    async findById(id: string) {
      const trip = await client.trip.findUnique({
        where: { id },
        include: { route: true },
      });
      return trip ? toTrip(trip) : null;
    },

    async findWithSeatMap(id: string) {
      const trip = await client.trip.findUnique({
        where: { id },
        include: { route: true, reservations: { where: { status: "CONFIRMED" } } },
      });

      if (!trip) {
        return null;
      }

      return {
        ...toTrip(trip),
        occupiedSeats: trip.reservations.map((reservation) => reservation.seatNumber),
      };
    },
  };
}
