import { createApiError } from "@/lib/api-error";
import type {
  CreateReservationInput,
  LoginInput,
  RegisterInput,
  ReservationDto,
  ReservationWithTripDto,
  RouteDto,
  TripSearchFiltersInput,
  TripSearchResultDto,
  TripSeatMapDto,
  UserDto,
} from "@/lib/types";

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(path, {
    ...init,
    headers: { "Content-Type": "application/json", ...init?.headers },
  });

  const body = await response.json().catch(() => null);

  if (!response.ok) {
    throw createApiError(body?.message ?? "Erro inesperado.", response.status);
  }

  return body as T;
}

function buildSearchParams(filters: TripSearchFiltersInput): string {
  const params = new URLSearchParams();
  if (filters.origin) params.set("origem", filters.origin);
  if (filters.destination) params.set("destino", filters.destination);
  if (filters.date) params.set("data", filters.date);
  return params.toString();
}

export const api = {
  listRoutes: () => request<RouteDto[]>("/api/rotas"),

  searchTrips: (filters: TripSearchFiltersInput) =>
    request<TripSearchResultDto[]>(`/api/viagens?${buildSearchParams(filters)}`),

  getTripDetails: (tripId: string) =>
    request<TripSeatMapDto>(`/api/viagens/${tripId}`),

  createReservation: (input: CreateReservationInput) =>
    request<ReservationDto>("/api/reservas", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  getReservationByCode: (code: string) =>
    request<ReservationWithTripDto>(`/api/reservas/${code}`),

  cancelReservation: (code: string) =>
    request<ReservationDto>(`/api/reservas/${code}`, { method: "DELETE" }),

  login: (input: LoginInput) =>
    request<UserDto>("/api/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  register: (input: RegisterInput) =>
    request<UserDto>("/api/auth/registrar", {
      method: "POST",
      body: JSON.stringify(input),
    }),

  logout: () => request<{ success: boolean }>("/api/auth/logout", { method: "POST" }),

  getCurrentUser: () => request<{ user: UserDto | null }>("/api/auth/me"),

  listMyReservations: () => request<ReservationWithTripDto[]>("/api/minhas-reservas"),
};
