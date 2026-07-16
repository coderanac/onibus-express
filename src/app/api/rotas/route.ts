import { NextResponse } from "next/server";
import { listRoutes } from "@/application/routes/list-routes";
import { routeRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";

export async function GET() {
  try {
    const routes = await listRoutes(routeRepository);
    return NextResponse.json(routes);
  } catch (error) {
    return handleApiError(error);
  }
}
