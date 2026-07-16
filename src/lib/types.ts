export interface RouteDto {
  id: string;
  origin: string;
  destination: string;
  durationMinutes: number;
}

export interface TripDto {
  id: string;
  routeId: string;
  departureAt: string;
  basePrice: number;
  totalSeats: number;
  route: RouteDto;
}

export interface TripSearchResultDto extends TripDto {
  availableSeats: number;
}

export interface TripSeatMapDto extends TripDto {
  occupiedSeats: number[];
}

export type ReservationStatusDto = "CONFIRMED" | "CANCELLED";

export interface ReservationDto {
  id: string;
  code: string;
  tripId: string;
  userId?: string | null;
  seatNumber: number;
  passengerName: string;
  passengerCpf: string;
  passengerEmail: string;
  status: ReservationStatusDto;
  createdAt: string;
  cancelledAt: string | null;
}

export interface ReservationWithTripDto extends ReservationDto {
  trip: TripDto;
}

export interface TripSearchFiltersInput {
  origin?: string;
  destination?: string;
  date?: string;
}

export interface CreateReservationInput {
  tripId: string;
  seatNumber: number;
  passengerName: string;
  passengerCpf: string;
  passengerEmail: string;
}

export interface UserDto {
  id: string;
  name: string;
  cpf: string;
  email: string;
  birthDate: string;
  createdAt: string;
}

export interface LoginInput {
  email: string;
  password: string;
}

export interface RegisterInput {
  name: string;
  cpf: string;
  email: string;
  birthDate: string;
  password: string;
  confirmPassword: string;
}
