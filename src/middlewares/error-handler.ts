import type { Elysia } from "elysia";

export interface ErrorResponse {
  success: false;
  message: string;
  code: string;
}

export class AppError extends Error {
  constructor(
    public status: number,
    public code: string,
    message: string,
  ) {
    super(message);
    this.name = "AppError";
  }
}

export const errorHandler = (app: Elysia) =>
  app.onError(({ error, code }) => {
    if (error instanceof AppError) {
      return {
        success: false as const,
        message: error.message,
        code: error.code,
      };
    }

    if (code === "VALIDATION") {
      return {
        success: false as const,
        message: error.message,
        code: "VALIDATION_ERROR",
      };
    }

    if (code === "NOT_FOUND") {
      return {
        success: false as const,
        message: "Not found",
        code: "NOT_FOUND",
      };
    }

    console.error("Unhandled error:", error);
    return {
      success: false as const,
      message: "Internal server error",
      code: "INTERNAL_ERROR",
    };
  });
