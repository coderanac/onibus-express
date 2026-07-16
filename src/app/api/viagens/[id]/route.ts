import { NextResponse } from "next/server";
import { getTripDetails } from "@/application/trips/get-trip-details";
import { tripRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const trip = await getTripDetails(tripRepository, id);
    return NextResponse.json(trip);
  } catch (error) {
    return handleApiError(error);
  }
}
