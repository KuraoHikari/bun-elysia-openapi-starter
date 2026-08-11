import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { eq } from "drizzle-orm";
import { db } from "../db/client";
import * as schema from "../db/schema";
import { config } from "../config";

export const auth = betterAuth({
  secret: config.betterAuthSecret,
  baseURL: config.betterAuthUrl,
  database: drizzleAdapter(db, {
    provider: "mysql",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    autoSignIn: true,
  },
  session: {
    // 2-hour expiry (value is in seconds)
    expiresIn: 60 * 60 * 2,
    // Refresh the session record every 30 minutes of activity
    updateAge: 60 * 30,
  },
  // Enforce a single active session per user.
  // On each new login, delete every other session that belongs to this user.
  databaseHooks: {
    session: {
      create: {
        before: async (newSession) => {
          await db
            .delete(schema.session)
            .where(eq(schema.session.userId, newSession.userId));
        },
      },
    },
  },
});
