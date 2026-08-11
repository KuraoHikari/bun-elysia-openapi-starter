import { Elysia, t } from "elysia";
import { db } from "../../db/client";
import { users } from "../../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../../middlewares/error-handler";
import { authGuard } from "../../middlewares/auth-guard";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .get(
    "/",
    async () => {
      const result = await db.select().from(users);
      return { success: true, data: result };
    },
    {
      detail: { summary: "List all users", tags: ["Users"] },
    },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const [user] = await db.select().from(users).where(eq(users.id, Number(params.id)));
      if (!user) throw new AppError(404, "NOT_FOUND", "User not found");
      return { success: true, data: user };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Get a user by ID", tags: ["Users"] },
    },
  )
  .post(
    "/",
    async ({ body }) => {
      const passwordHash = await Bun.password.hash(body.password);
      const [user] = await db
        .insert(users)
        .values({ email: body.email, passwordHash })
        .$returningId();

      if (!user) {
        throw new AppError(500, "INTERNAL_ERROR", "Failed to create user");
      }

      return { success: true, data: { id: user.id, email: body.email } };
    },
    {
      body: t.Object({
        email: t.String({ format: "email" }),
        password: t.String({ minLength: 6 }),
      }),
      detail: { summary: "Create a user", tags: ["Users"] },
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const updates: Record<string, unknown> = {};
      if (body.email) updates.email = body.email;
      if (body.password) updates.passwordHash = await Bun.password.hash(body.password);

      if (Object.keys(updates).length === 0) {
        throw new AppError(400, "BAD_REQUEST", "Nothing to update");
      }

      await db.update(users).set(updates).where(eq(users.id, Number(params.id)));
      const [updated] = await db.select().from(users).where(eq(users.id, Number(params.id)));
      if (!updated) throw new AppError(404, "NOT_FOUND", "User not found");
      return { success: true, data: updated };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        email: t.Optional(t.String({ format: "email" })),
        password: t.Optional(t.String({ minLength: 6 })),
      }),
      detail: { summary: "Update a user", tags: ["Users"] },
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await db.delete(users).where(eq(users.id, Number(params.id)));
      return { success: true, message: "User deleted" };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Delete a user", tags: ["Users"] },
    },
  );
