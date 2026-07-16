import type { ReservationWithTrip } from "@/domain/entities";
import type { ReservationRepository } from "@/application/ports/reservation-repository";
import { cancelReservation } from "./cancel-reservation";

function buildReservation(
  overrides: Partial<ReservationWithTrip> = {},
): ReservationWithTrip {
  return {
    id: "reservation-1",
    code: "ABC-12345",
    tripId: "trip-1",
    seatNumber: 3,
    passengerName: "Maria Silva",
    passengerCpf: "52998224725",
    passengerEmail: "maria@example.com",
    status: "CONFIRMED",
    createdAt: new Date(),
    cancelledAt: null,
    trip: {
      id: "trip-1",
      routeId: "route-1",
      departureAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      basePrice: 150,
      totalSeats: 40,
      route: {
        id: "route-1",
        origin: "São Paulo",
        destination: "Rio de Janeiro",
        durationMinutes: 360,
      },
    },
    ...overrides,
  };
}

function createFakeReservationRepository(
  reservation: ReservationWithTrip | null,
): ReservationRepository & { cancelledId: string | null } {
  const state: { cancelledId: string | null } = { cancelledId: null };

  return {
    get cancelledId() {
      return state.cancelledId;
    },

    async isSeatTaken() {
      return false;
    },

    async isCodeInUse() {
      return false;
    },

    async create(): Promise<never> {
      throw new Error("not implemented in this fake");
    },

    async findByCode() {
      return reservation;
    },

    async findByUserId() {
      return [];
    },

    async cancel(id: string) {
      state.cancelledId = id;
      return { ...reservation!, status: "CANCELLED" as const, cancelledAt: new Date() };
    },
  };
}

describe("cancelReservation", () => {
  it("cancels a reservation when more than 2 hours remain until departure", async () => {
    const reservation = buildReservation({
      trip: buildReservation().trip,
    });
    const repository = createFakeReservationRepository(reservation);

    const result = await cancelReservation(repository, "ABC-12345");

    expect(result.status).toBe("CANCELLED");
    expect(repository.cancelledId).toBe("reservation-1");
  });

  it("rejects cancellation when the reservation does not exist", async () => {
    const repository = createFakeReservationRepository(null);

    await expect(cancelReservation(repository, "ZZZ-99999")).rejects.toMatchObject({
      name: "ReservationNotFoundError",
    });
  });

  it("rejects cancellation when it is already cancelled", async () => {
    const reservation = buildReservation({ status: "CANCELLED" });
    const repository = createFakeReservationRepository(reservation);

    await expect(cancelReservation(repository, "ABC-12345")).rejects.toMatchObject({
      name: "ReservationAlreadyCancelledError",
    });
  });

  it("rejects cancellation within 2 hours of departure", async () => {
    const departureInOneHour = new Date(Date.now() + 1000 * 60 * 60);
    const reservation = buildReservation({
      trip: { ...buildReservation().trip, departureAt: departureInOneHour },
    });
    const repository = createFakeReservationRepository(reservation);

    await expect(cancelReservation(repository, "ABC-12345")).rejects.toMatchObject({
      name: "CancellationWindowExpiredError",
    });
  });

  it("rejects cancellation for a trip that has already departed", async () => {
    const departedTrip = {
      ...buildReservation().trip,
      departureAt: new Date(Date.now() - 1000 * 60 * 60),
    };
    const reservation = buildReservation({ trip: departedTrip });
    const repository = createFakeReservationRepository(reservation);

    await expect(cancelReservation(repository, "ABC-12345")).rejects.toMatchObject({
      name: "CancellationWindowExpiredError",
    });
  });
});
