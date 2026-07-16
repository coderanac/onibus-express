/**
 * @jest-environment node
 */
import { execSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { PrismaClient } from "@prisma/client";
import { isDomainError } from "@/domain/errors";
import type { ReservationRepository } from "@/application/ports/reservation-repository";
import { createPrismaReservationRepository } from "./prisma-reservation-repository";

const testDatabasePath = path.join(process.cwd(), "prisma", "test-integration.db");
const testDatabaseUrl = `file:${testDatabasePath}`;

function removeDatabaseFiles() {
  for (const suffix of ["", "-journal"]) {
    const filePath = `${testDatabasePath}${suffix}`;
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath);
    }
  }
}

let prisma: PrismaClient;
let repository: ReservationRepository;
let tripId: string;

beforeAll(() => {
  removeDatabaseFiles();
  execSync("npx prisma db push --skip-generate", {
    env: { ...process.env, DATABASE_URL: testDatabaseUrl },
    stdio: "ignore",
  });
  prisma = new PrismaClient({ datasources: { db: { url: testDatabaseUrl } } });
  repository = createPrismaReservationRepository(prisma);
});

afterAll(async () => {
  await prisma.$disconnect();
  removeDatabaseFiles();
});

beforeEach(async () => {
  await prisma.reservation.deleteMany();
  await prisma.user.deleteMany();
  await prisma.trip.deleteMany();
  await prisma.route.deleteMany();

  const route = await prisma.route.create({
    data: { origin: "São Paulo", destination: "Rio de Janeiro", durationMinutes: 360 },
  });
  const trip = await prisma.trip.create({
    data: {
      routeId: route.id,
      departureAt: new Date(Date.now() + 1000 * 60 * 60 * 24),
      basePrice: 200,
      totalSeats: 10,
    },
  });
  tripId = trip.id;
});

describe("PrismaReservationRepository (integration)", () => {
  it("persists a reservation and marks the seat as taken", async () => {
    await repository.create({
      code: "ABC-12345",
      tripId,
      seatNumber: 5,
      passengerName: "Maria Silva",
      passengerCpf: "52998224725",
      passengerEmail: "maria@example.com",
    });

    await expect(repository.isSeatTaken(tripId, 5)).resolves.toBe(true);
    await expect(repository.isSeatTaken(tripId, 6)).resolves.toBe(false);
  });

  it("prevents two reservations for the same seat on the same trip", async () => {
    await repository.create({
      code: "ABC-12345",
      tripId,
      seatNumber: 5,
      passengerName: "Maria Silva",
      passengerCpf: "52998224725",
      passengerEmail: "maria@example.com",
    });

    let thrownError: unknown;
    try {
      await repository.create({
        code: "DEF-67890",
        tripId,
        seatNumber: 5,
        passengerName: "João Souza",
        passengerCpf: "98765432100",
        passengerEmail: "joao@example.com",
      });
    } catch (error) {
      thrownError = error;
    }

    expect(isDomainError(thrownError)).toBe(true);
  });

  it("frees the seat again after cancelling a reservation", async () => {
    const reservation = await repository.create({
      code: "ABC-12345",
      tripId,
      seatNumber: 5,
      passengerName: "Maria Silva",
      passengerCpf: "52998224725",
      passengerEmail: "maria@example.com",
    });

    const cancelled = await repository.cancel(reservation.id);

    expect(cancelled.status).toBe("CANCELLED");
    await expect(repository.isSeatTaken(tripId, 5)).resolves.toBe(false);
  });

  it("finds a reservation by its code together with trip details", async () => {
    await repository.create({
      code: "ABC-12345",
      tripId,
      seatNumber: 5,
      passengerName: "Maria Silva",
      passengerCpf: "52998224725",
      passengerEmail: "maria@example.com",
    });

    const found = await repository.findByCode("ABC-12345");

    expect(found?.trip.id).toBe(tripId);
    expect(found?.seatNumber).toBe(5);
  });

  it("finds all reservations belonging to a user", async () => {
    const user = await prisma.user.create({
      data: {
        name: "Maria Silva",
        cpf: "52998224725",
        email: "maria@example.com",
        birthDate: new Date("1990-01-01"),
        passwordHash: "test-hash",
      },
    });

    await repository.create({
      code: "ABC-12345",
      tripId,
      userId: user.id,
      seatNumber: 5,
      passengerName: "Maria Silva",
      passengerCpf: "52998224725",
      passengerEmail: "maria@example.com",
    });
    await repository.create({
      code: "DEF-67890",
      tripId,
      seatNumber: 6,
      passengerName: "João Souza",
      passengerCpf: "98765432100",
      passengerEmail: "joao@example.com",
    });

    const reservations = await repository.findByUserId(user.id);

    expect(reservations).toHaveLength(1);
    expect(reservations[0]?.code).toBe("ABC-12345");
  });
});
