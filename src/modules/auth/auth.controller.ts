import { Elysia } from "elysia";
import { auth } from "../../lib/auth";

export const authController = new Elysia({ prefix: "/api/auth" }).all(
  "/*",
  async ({ request }) => {
    return auth.handler(request);
  },
  { detail: { summary: "Better Auth", tags: ["Auth"] } },
);
