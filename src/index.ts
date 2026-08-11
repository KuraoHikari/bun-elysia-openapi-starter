import { Elysia } from "elysia";
import { openapi } from "@elysia/openapi";
import { corsPlugin } from "./plugins/cors";
import { errorHandler } from "./middlewares/error-handler";
import { rateLimiter } from "./middlewares/rate-limiter";
import { authController } from "./modules/auth/auth.controller";
import { usersController } from "./modules/users/users.controller";
import { config } from "./config";
import {
  getAuthOpenAPIPaths,
  getAuthOpenAPIComponents,
} from "./lib/auth";

const app = new Elysia()
  .use(corsPlugin)
  .use(errorHandler)
  .use(
    openapi({
      path: "/docs",
      documentation: {
        info: {
          title: "Bun Elysia OpenAPI Starter",
          version: "1.0.0",
          description: [
            "## Authentication Flow",
            "",
            "1. **Sign up** — `POST /api/auth/sign-up/email` with `{ email, password, name }`",
            "2. **Sign in** — `POST /api/auth/sign-in/email` with `{ email, password }`",
            "3. The response sets a session cookie automatically.",
            "   Use that cookie for all authenticated requests.",
            "",
            "## Session",
            "- `GET /api/auth/get-session` returns the current user & session.",
            "- Sessions expire after 2 hours of inactivity.",
            "- Only one active session per user is allowed.",
          ].join("\n"),
        },
        // Better Auth's component/schema types differ slightly from
        // openapi-types; cast through any to satisfy the compiler.
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        components: (await getAuthOpenAPIComponents()) as any,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        paths: (await getAuthOpenAPIPaths()) as any,
      },
    }),
  )
  // Rate-limit auth endpoints: 5 requests per 60 seconds per IP
  .use(rateLimiter(5, 60_000))
  .use(authController)
  .use(usersController)
  .get("/", () => ({ success: true, message: "API is running" }))
  .listen(config.port);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);
console.log(
  `📖 API docs at http://localhost:${app.server?.port}/docs`,
);
