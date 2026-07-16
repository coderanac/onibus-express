import type { Reservation, ReservationWithTrip } from "@/domain/entities";

export interface CreateReservationInput {
  code: string;
  tripId: string;
  userId?: string | null;
  seatNumber: number;
  passengerName: string;
  passengerCpf: string;
  passengerEmail: string;
}

export interface ReservationRepository {
  isSeatTaken(tripId: string, seatNumber: number): Promise<boolean>;
  isCodeInUse(code: string): Promise<boolean>;
  create(input: CreateReservationInput): Promise<Reservation>;
  findByCode(code: string): Promise<ReservationWithTrip | null>;
  findByUserId(userId: string): Promise<ReservationWithTrip[]>;
  cancel(id: string): Promise<Reservation>;
}
