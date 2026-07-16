import type { Prisma, PrismaClient } from "@prisma/client";
import { seatAlreadyTakenError } from "@/domain/errors";
import type {
  CreateReservationInput,
  ReservationRepository,
} from "@/application/ports/reservation-repository";
import type { Reservation } from "@/domain/entities";

type ReservationWithTripAndRoute = Prisma.ReservationGetPayload<{
  include: { trip: { include: { route: true } } };
}>;

function toReservation(reservation: Prisma.ReservationGetPayload<object>): Reservation {
  return {
    id: reservation.id,
    code: reservation.code,
    tripId: reservation.tripId,
    userId: reservation.userId,
    seatNumber: reservation.seatNumber,
    passengerName: reservation.passengerName,
    passengerCpf: reservation.passengerCpf,
    passengerEmail: reservation.passengerEmail,
    status: reservation.status,
    createdAt: reservation.createdAt,
    cancelledAt: reservation.cancelledAt,
  };
}

function toReservationWithTrip(reservation: ReservationWithTripAndRoute) {
  return {
    ...toReservation(reservation),
    trip: {
      id: reservation.trip.id,
      routeId: reservation.trip.routeId,
      departureAt: reservation.trip.departureAt,
      basePrice: reservation.trip.basePrice,
      totalSeats: reservation.trip.totalSeats,
      route: {
        id: reservation.trip.route.id,
        origin: reservation.trip.route.origin,
        destination: reservation.trip.route.destination,
        durationMinutes: reservation.trip.route.durationMinutes,
      },
    },
  };
}

export function createPrismaReservationRepository(
  client: PrismaClient,
): ReservationRepository {
  return {
    async isSeatTaken(tripId: string, seatNumber: number) {
      const existing = await client.reservation.findFirst({
        where: { tripId, seatNumber, status: "CONFIRMED" },
        select: { id: true },
      });
      return existing !== null;
    },

    async isCodeInUse(code: string) {
      const existing = await client.reservation.findUnique({
        where: { code },
        select: { id: true },
      });
      return existing !== null;
    },

    async create(input: CreateReservationInput) {
      return client.$transaction(async (tx) => {
        const seatTaken = await tx.reservation.findFirst({
          where: {
            tripId: input.tripId,
            seatNumber: input.seatNumber,
            status: "CONFIRMED",
          },
          select: { id: true },
        });

        if (seatTaken) {
          throw seatAlreadyTakenError(input.seatNumber);
        }

        const reservation = await tx.reservation.create({
          data: { ...input, status: "CONFIRMED" },
        });

        return toReservation(reservation);
      });
    },

    async findByCode(code: string) {
      const reservation = await client.reservation.findUnique({
        where: { code },
        include: { trip: { include: { route: true } } },
      });

      return reservation ? toReservationWithTrip(reservation) : null;
    },

    async findByUserId(userId: string) {
      const reservations = await client.reservation.findMany({
        where: { userId },
        include: { trip: { include: { route: true } } },
        orderBy: { createdAt: "desc" },
      });

      return reservations.map(toReservationWithTrip);
    },

    async cancel(id: string) {
      const reservation = await client.reservation.update({
        where: { id },
        data: { status: "CANCELLED", cancelledAt: new Date() },
      });

      return toReservation(reservation);
    },
  };
}
