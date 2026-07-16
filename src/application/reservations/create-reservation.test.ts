import type { Reservation, Trip } from "@/domain/entities";
import type { TripRepository } from "@/application/ports/trip-repository";
import type {
  CreateReservationInput,
  ReservationRepository,
} from "@/application/ports/reservation-repository";
import { createReservation } from "./create-reservation";

const VALID_CPF = "529.982.247-25";

function buildTrip(overrides: Partial<Trip> = {}): Trip {
  return {
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
    ...overrides,
  };
}

function createFakeTripRepository(trip: Trip | null): TripRepository {
  return {
    async search() {
      return [];
    },

    async findById() {
      return trip;
    },

    async findWithSeatMap() {
      return null;
    },
  };
}

function createFakeReservationRepository(
  occupiedSeats: number[] = [],
  usedCodes: string[] = [],
): ReservationRepository & { created: CreateReservationInput[] } {
  const created: CreateReservationInput[] = [];

  return {
    created,

    async isSeatTaken(_tripId: string, seatNumber: number) {
      return occupiedSeats.includes(seatNumber);
    },

    async isCodeInUse(code: string) {
      return usedCodes.includes(code);
    },

    async create(input: CreateReservationInput) {
      created.push(input);
      return {
        id: "reservation-1",
        status: "CONFIRMED" as const,
        createdAt: new Date(),
        cancelledAt: null,
        ...input,
      };
    },

    async findByCode() {
      return null;
    },

    async findByUserId() {
      return [];
    },

    async cancel(): Promise<Reservation> {
      throw new Error("not implemented in this fake");
    },
  };
}

function buildRequest(overrides: Partial<Parameters<typeof createReservation>[1]> = {}) {
  return {
    tripId: "trip-1",
    seatNumber: 3,
    passengerName: "Maria Silva",
    passengerCpf: VALID_CPF,
    passengerEmail: "maria@example.com",
    ...overrides,
  };
}

describe("createReservation", () => {
  it("creates a reservation when the seat is free and the trip has not departed", async () => {
    const tripRepository = createFakeTripRepository(buildTrip());
    const reservationRepository = createFakeReservationRepository();

    const reservation = await createReservation(
      { tripRepository, reservationRepository },
      buildRequest(),
    );

    expect(reservation.seatNumber).toBe(3);
    expect(reservationRepository.created).toHaveLength(1);
  });

  it("rejects an invalid CPF", async () => {
    const tripRepository = createFakeTripRepository(buildTrip());
    const reservationRepository = createFakeReservationRepository();

    await expect(
      createReservation(
        { tripRepository, reservationRepository },
        buildRequest({ passengerCpf: "123.456.789-00" }),
      ),
    ).rejects.toMatchObject({ name: "InvalidCpfError" });
  });

  it("rejects a reservation for a trip that does not exist", async () => {
    const tripRepository = createFakeTripRepository(null);
    const reservationRepository = createFakeReservationRepository();

    await expect(
      createReservation(
        { tripRepository, reservationRepository },
        buildRequest({ tripId: "missing" }),
      ),
    ).rejects.toMatchObject({ name: "TripNotFoundError" });
  });

  it("rejects a reservation for a seat that is already taken", async () => {
    const tripRepository = createFakeTripRepository(buildTrip());
    const reservationRepository = createFakeReservationRepository([3]);

    await expect(
      createReservation({ tripRepository, reservationRepository }, buildRequest()),
    ).rejects.toMatchObject({ name: "SeatAlreadyTakenError" });
  });

  it("rejects a reservation for a seat number outside the trip's range", async () => {
    const tripRepository = createFakeTripRepository(buildTrip({ totalSeats: 10 }));
    const reservationRepository = createFakeReservationRepository();

    await expect(
      createReservation(
        { tripRepository, reservationRepository },
        buildRequest({ seatNumber: 99 }),
      ),
    ).rejects.toMatchObject({ name: "InvalidSeatNumberError" });
  });

  it("rejects a reservation for a trip that has already departed", async () => {
    const departedTrip = buildTrip({
      departureAt: new Date(Date.now() - 1000 * 60 * 60),
    });
    const tripRepository = createFakeTripRepository(departedTrip);
    const reservationRepository = createFakeReservationRepository();

    await expect(
      createReservation({ tripRepository, reservationRepository }, buildRequest()),
    ).rejects.toMatchObject({ name: "TripAlreadyDepartedError" });
  });
});
