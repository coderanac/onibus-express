import { NextResponse } from "next/server";
import { cancelReservation } from "@/application/reservations/cancel-reservation";
import { getReservation } from "@/application/reservations/get-reservation";
import { reservationRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";
import { reservationCodeParamSchema } from "@/lib/schemas";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ codigo: string }> },
) {
  try {
    const { codigo } = await params;
    const code = reservationCodeParamSchema.parse(codigo.toUpperCase());
    const reservation = await getReservation(reservationRepository, code);
    return NextResponse.json(reservation);
  } catch (error) {
    return handleApiError(error);
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ codigo: string }> },
) {
  try {
    const { codigo } = await params;
    const code = reservationCodeParamSchema.parse(codigo.toUpperCase());
    const reservation = await cancelReservation(reservationRepository, code);
    return NextResponse.json(reservation);
  } catch (error) {
    return handleApiError(error);
  }
}
