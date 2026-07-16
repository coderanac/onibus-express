import { NextResponse } from "next/server";
import { ZodError } from "zod";
import { isDomainError } from "@/domain/errors";

export function handleApiError(error: unknown): NextResponse {
  if (error instanceof ZodError) {
    return NextResponse.json(
      { message: "Dados inválidos.", issues: error.issues },
      { status: 400 },
    );
  }

  if (isDomainError(error)) {
    return NextResponse.json({ message: error.message }, { status: error.statusCode });
  }

  console.error(error);
  return NextResponse.json(
    { message: "Erro interno do servidor." },
    { status: 500 },
  );
}
