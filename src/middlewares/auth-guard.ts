import { Elysia } from "elysia";
import { auth } from "../lib/auth";
import { AppError } from "./error-handler";

export const authGuard = new Elysia().derive(async ({ request }) => {
  const result = await auth.api.getSession({ headers: request.headers });
  if (!result) {
    throw new AppError(401, "UNAUTHORIZED", "Authentication required");
  }
  return { user: result.user, session: result.session };
});
