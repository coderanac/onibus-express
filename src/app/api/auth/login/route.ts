import { NextRequest, NextResponse } from "next/server";
import { loginWithEmail } from "@/application/auth/login-with-email";
import { userRepository } from "@/infrastructure/container";
import { handleApiError } from "@/lib/http";
import { loginBodySchema } from "@/lib/schemas";
import { setSessionCookie } from "@/lib/session";

export async function POST(request: NextRequest) {
  try {
    const body = loginBodySchema.parse(await request.json());

    const user = await loginWithEmail({ userRepository }, body);

    const response = NextResponse.json(user, { status: 200 });
    setSessionCookie(response, user.id);
    return response;
  } catch (error) {
    return handleApiError(error);
  }
}
