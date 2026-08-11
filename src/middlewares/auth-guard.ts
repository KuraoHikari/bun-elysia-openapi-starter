import { Elysia } from "elysia";
import { auth } from "../lib/auth";
import { AppError } from "../middlewares/error-handler";

/**
 * Better Auth session guard.
 *
 * Validates the session via Better Auth's `auth.api.getSession`, which reads
 * the session cookie from the `headers` object. On success, the authenticated
 * user and session are exposed as `ctx.user` and `ctx.session`.
 *
 * Throws 401 if no valid session is found.
 */
export const authGuard = new Elysia().derive(
  async ({ headers }) => {
    const session = await auth.api.getSession({
      headers,
    });

    if (!session) {
      throw new AppError(401, "UNAUTHORIZED", "Missing or invalid session");
    }

    return {
      user: session.user,
      session: session.session,
    };
  },
);
