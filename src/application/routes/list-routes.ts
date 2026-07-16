import type { RouteRepository } from "@/application/ports/route-repository";

export function listRoutes(routeRepository: RouteRepository) {
  return routeRepository.findAll();
}
