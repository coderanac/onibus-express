import { prisma } from "@/infrastructure/prisma/client";
import { createPrismaRouteRepository } from "@/infrastructure/repositories/prisma-route-repository";
import { createPrismaTripRepository } from "@/infrastructure/repositories/prisma-trip-repository";
import { createPrismaReservationRepository } from "@/infrastructure/repositories/prisma-reservation-repository";
import { createPrismaUserRepository } from "@/infrastructure/repositories/prisma-user-repository";

export const routeRepository = createPrismaRouteRepository(prisma);
export const tripRepository = createPrismaTripRepository(prisma);
export const reservationRepository = createPrismaReservationRepository(prisma);
export const userRepository = createPrismaUserRepository(prisma);
