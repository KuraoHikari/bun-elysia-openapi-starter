import { Elysia, t } from "elysia";
import { jwt } from "@elysiajs/jwt";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../../middlewares/error-handler";
import { config } from "../../config";

export const authController = new Elysia({ prefix: "/auth" })
  .use(jwt({ name: "jwt", secret: config.jwtSecret }))
  .post(
    "/register",
    async ({ body, jwt }) => {
      const [existing] = await db.select().from(users).where(eq(users.email, body.email));
      if (existing) {
        throw new AppError(409, "CONFLICT", "Email already registered");
      }

      const passwordHash = await Bun.password.hash(body.password);
      const [user] = await db
        .insert(users)
        .values({ email: body.email, passwordHash })
        .$returningId();

      if (!user) {
        throw new AppError(500, "INTERNAL_ERROR", "Failed to create user");
      }

      const token = await jwt.sign({ sub: String(user.id), email: body.email });

      return {
        success: true,
        data: { id: user.id, email: body.email, token },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
      detail: { summary: "Register a new user", tags: ["Auth"] },
    },
  )
  .post(
    "/login",
    async ({ body, jwt }) => {
      const [user] = await db.select().from(users).where(eq(users.email, body.email));
      if (!user) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid credentials");
      }

      const valid = await Bun.password.verify(body.password, user.passwordHash);
      if (!valid) {
        throw new AppError(401, "UNAUTHORIZED", "Invalid credentials");
      }

      const token = await jwt.sign({ sub: String(user.id), email: user.email });

      return {
        success: true,
        data: { id: user.id, email: user.email, token },
      };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String(),
      }),
      detail: { summary: "Login and get a JWT", tags: ["Auth"] },
    },
  );
