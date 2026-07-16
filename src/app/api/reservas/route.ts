import { NextRequest, NextResponse } from "next/server";
import { createReservation } from "@/application/reservations/create-reservation";
import { reservationRepository, tripRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";
import { createReservationBodySchema } from "@/lib/schemas";
import { getSessionUserId } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = createReservationBodySchema.parse(await request.json());
    const userId = getSessionUserId(request);

    const reservation = await createReservation(
      { tripRepository, reservationRepository },
      { ...body, userId },
    );

    return NextResponse.json(reservation, { status: 201 });
  } catch (error) {
    return handleApiError(error);
  }
}
