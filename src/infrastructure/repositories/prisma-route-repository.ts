import type { PrismaClient } from "@prisma/client";
import type { RouteRepository } from "@/application/ports/route-repository";

export function createPrismaRouteRepository(client: PrismaClient): RouteRepository {
  return {
    async findAll() {
      return client.route.findMany({
        orderBy: [{ origin: "asc" }, { destination: "asc" }],
      });
    },
  };
}
