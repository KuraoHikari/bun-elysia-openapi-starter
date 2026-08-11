import { Elysia } from "elysia";
import { db } from "../../db/client";
import { user } from "../../db/schema";
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
      const result = await db.select().from(user);
      return { success: true, data: result };
    },
    { detail: { summary: "List all users", tags: ["Users"] } },
  )
  .get(
    "/:id",
    async ({ params }) => {
      const [found] = await db.select().from(user).where(eq(user.id, params.id));
      if (!found) throw new AppError(404, "NOT_FOUND", "User not found");
      return { success: true, data: found };
    },
    { detail: { summary: "Get a user by ID", tags: ["Users"] } },
  )
  .patch(
    "/:id",
    async ({ params, body }) => {
      const data = validate(updateUserSchema, body);
      const updates: Record<string, unknown> = {};
      if (data.email) updates.email = data.email;
      if (data.name) updates.name = data.name;
      // NOTE: password changes should go through Better Auth, not here.

      if (Object.keys(updates).length === 0) {
        throw new AppError(400, "BAD_REQUEST", "Nothing to update");
      }

      await db.update(user).set(updates).where(eq(user.id, params.id));
      const [updated] = await db.select().from(user).where(eq(user.id, params.id));
      if (!updated) throw new AppError(404, "NOT_FOUND", "User not found");
      return { success: true, data: updated };
    },
    { detail: { summary: "Update a user", tags: ["Users"] } },
  )
  .delete(
    "/:id",
    async ({ params }) => {
      await db.delete(user).where(eq(user.id, params.id));
      return { success: true, message: "User deleted" };
    },
    { detail: { summary: "Delete a user", tags: ["Users"] } },
  );
