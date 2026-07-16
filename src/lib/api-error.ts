export interface ApiError extends Error {
  readonly isApiError: true;
  readonly status: number;
}

export function createApiError(message: string, status: number): ApiError {
  return Object.assign(new Error(message), {
    name: "ApiError",
    status,
    isApiError: true as const,
  });
}

export function isApiError(error: unknown): error is ApiError {
  return error instanceof Error && (error as Partial<ApiError>).isApiError === true;
}
