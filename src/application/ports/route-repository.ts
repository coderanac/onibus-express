import type { Route } from "@/domain/entities";

export interface RouteRepository {
  findAll(): Promise<Route[]>;
}
