import type { NextRequest, NextResponse } from "next/server";

export const SESSION_COOKIE_NAME = "onibus_user_id";
const SESSION_MAX_AGE_SECONDS = 60 * 60 * 24 * 30;

export function getSessionUserId(request: NextRequest): string | null {
  return request.cookies.get(SESSION_COOKIE_NAME)?.value ?? null;
}

export function setSessionCookie(response: NextResponse, userId: string): void {
  response.cookies.set(SESSION_COOKIE_NAME, userId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_MAX_AGE_SECONDS,
  });
}

export function clearSessionCookie(response: NextResponse): void {
  response.cookies.set(SESSION_COOKIE_NAME, "", { path: "/", maxAge: 0 });
}
