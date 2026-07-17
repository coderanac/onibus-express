import { NextRequest, NextResponse } from "next/server";
import { userRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";
import { getSessionUserId } from "@/lib/session";

export async function GET(request: NextRequest) {
  try {
    const userId = getSessionUserId(request);
    const user = userId ? await userRepository.findById(userId) : null;

    return NextResponse.json({ user });
  } catch (error) {
    return handleApiError(error);
  }
}
