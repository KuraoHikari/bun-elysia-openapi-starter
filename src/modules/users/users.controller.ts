import { Elysia } from "elysia";
import { db } from "../../db/client";
import { user as userTable } from "../../db/schema";
import { eq } from "drizzle-orm";
import { AppError } from "../../middlewares/error-handler";
import { authGuard } from "../../middlewares/auth-guard";
import { validate } from "../../lib/validate";
import { createUserSchema, updateUserSchema } from "./users.schema";

export const usersController = new Elysia({ prefix: "/users" })
  .use(authGuard)
  .get(
    "/",
    async () => {
      const result = await db.select().from(userTable);
      return { success: true, data: result };
    },
    { detail: { summary: "List all users", tags: ["Users"] } },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const [row] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, params.id));

      if (!row) throw new AppError(404, "NOT_FOUND", "User not found");
      return { success: true, data: row };
    },
    {
      params: t.Object({ id: t.String() }),
      detail: { summary: "Get a user by ID", tags: ["Users"] },
    },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const data = validate(updateUserSchema, body);
      const updates: Record<string, unknown> = {};
      if (body.name) updates.name = body.name;
      if (body.email) updates.email = body.email;

      if (Object.keys(updates).length === 0) {
        throw new AppError(400, "BAD_REQUEST", "Nothing to update");
      }

      await db
        .update(userTable)
        .set(updates)
        .where(eq(userTable.id, params.id));

      const [updated] = await db
        .select()
        .from(userTable)
        .where(eq(userTable.id, params.id));

      if (!updated) throw new AppError(404, "NOT_FOUND", "User not found");
      return { success: true, data: updated };
    },
    {
      params: t.Object({ id: t.String() }),
      body: t.Object({
        name: t.Optional(t.String({ minLength: 1 })),
        email: t.Optional(t.String({ format: "email" })),
      }),
      detail: { summary: "Update a user", tags: ["Users"] },
    },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await db.delete(userTable).where(eq(userTable.id, params.id));
      return { success: true, message: "User deleted" };
    },
    { detail: { summary: "Delete a user", tags: ["Users"] } },
  );
