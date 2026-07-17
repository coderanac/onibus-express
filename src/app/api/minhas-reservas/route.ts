import { NextRequest, NextResponse } from "next/server";
import { reservationRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";
import { getSessionUserId } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);
    if (!userId) {
      return NextResponse.json(
        { message: "Faça login para ver suas reservas." },
        { status: 401 },
      );
    }

    const reservations = await reservationRepository.findByUserId(userId);
    return NextResponse.json(reservations);
  } catch (error) {
    return handleApiError(error);
  }
}
