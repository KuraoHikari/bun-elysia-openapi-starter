import { betterAuth } from "better-auth";
import { openAPI } from "better-auth/plugins";
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
  plugins: [openAPI()],
});

// Cache the OpenAPI schema so it's only generated once.
let _schema: Awaited<ReturnType<typeof auth.api.generateOpenAPISchema>>;

async function getSchema() {
  return (_schema ??= await auth.api.generateOpenAPISchema());
}

/**
 * Returns Better Auth's OpenAPI paths with a configurable prefix.
 * All paths are tagged with "Auth" for the OpenAPI docs.
 */
export async function getAuthOpenAPIPaths(prefix = "/api/auth") {
  const { paths } = await getSchema();
  const prefixed: Record<string, Record<string, Record<string, unknown>>> = Object.create(null);
  for (const path of Object.keys(paths)) {
    const key = prefix + path;
    const entry = paths[path];
    if (!entry) continue;
    prefixed[key] = entry as Record<string, Record<string, unknown>>;
    for (const method of Object.keys(entry)) {
      const operation = (prefixed[key] as Record<string, Record<string, unknown>>)[method] as Record<string, unknown>;
      if (operation) {
        operation.tags = ["Auth"];
      }
    }
  }
  return prefixed;
}

/**
 * Returns Better Auth's OpenAPI components (schemas, security schemes).
 */
export async function getAuthOpenAPIComponents() {
  const { components } = await getSchema();
  return components;
}
