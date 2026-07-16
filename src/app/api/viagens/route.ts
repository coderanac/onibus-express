import { NextRequest, NextResponse } from "next/server";
import { searchTrips } from "@/application/trips/search-trips";
import { tripRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";
import { searchTripsQuerySchema } from "@/lib/schemas";

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams;
    const filters = searchTripsQuerySchema.parse({
      origin: searchParams.get("origem") ?? undefined,
      destination: searchParams.get("destino") ?? undefined,
      date: searchParams.get("data") ?? undefined,
    });

    const trips = await searchTrips(tripRepository, filters);
    return NextResponse.json(trips);
  } catch (error) {
    return handleApiError(error);
  }
}
