import type { ZodType } from "zod";
import { AppError } from "../middlewares/error-handler";

/**
 * Validate `value` against a Zod schema.
 * Throws AppError(422, VALIDATION_ERROR, ...) on failure so the global
 * errorHandler can format the response consistently.
 */
export function validate<T>(schema: ZodType<T>, value: unknown): T {
  const result = schema.safeParse(value);
  if (!result.success) {
    const message = result.error.issues
      .map((e) => `${e.path.join(".")}: ${e.message}`)
      .join("; ");
    throw new AppError(422, "VALIDATION_ERROR", message);
  }
  return result.data;
}
