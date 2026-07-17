export const CANCELLATION_WINDOW_HOURS = 2;

export type ReservationStatus = "CONFIRMED" | "CANCELLED";

export interface Route {
  id: string;
  origin: string;
  destination: string;
  durationMinutes: number;
}

export interface Trip {
  id: string;
  routeId: string;
  departureAt: Date;
  basePrice: number;
  totalSeats: number;
  route: Route;
}

export interface Reservation {
  id: string;
  code: string;
  tripId: string;
  userId?: string | null;
  seatNumber: number;
  passengerName: string;
  passengerCpf: string;
  passengerEmail: string;
  status: ReservationStatus;
  createdAt: Date;
  cancelledAt: Date | null;
}

export interface User {
  id: string;
  name: string;
  cpf: string;
  email: string;
  birthDate: Date;
  createdAt: Date;
}

export function isValidBirthDate(birthDate: Date, now: Date = new Date()): boolean {
  return !Number.isNaN(birthDate.getTime()) && birthDate.getTime() < now.getTime();
}

export interface TripWithSeatMap extends Trip {
  occupiedSeats: number[];
}

export interface TripWithAvailability extends Trip {
  availableSeats: number;
}

export interface ReservationWithTrip extends Reservation {
  trip: Trip;
}

export function hasTripDeparted(trip: Pick<Trip, "departureAt">, now: Date): boolean {
  return trip.departureAt.getTime() <= now.getTime();
}

export function isWithinCancellationWindow(departureAt: Date, now: Date): boolean {
  const hoursUntilDeparture = (departureAt.getTime() - now.getTime()) / (1000 * 60 * 60);
  return hoursUntilDeparture < CANCELLATION_WINDOW_HOURS;
}
