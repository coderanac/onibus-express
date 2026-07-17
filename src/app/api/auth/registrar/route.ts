import { NextRequest, NextResponse } from "next/server";
import { registerUser } from "@/application/auth/register-user";
import { userRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";
import { registerBodySchema } from "@/lib/schemas";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = registerBodySchema.parse(await request.json());

    const user = await registerUser({ userRepository }, body);

    const response = NextResponse.json(user, { status: 201 });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
