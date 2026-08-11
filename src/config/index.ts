import { parseEnv } from "./env";

const env = parseEnv();

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  betterAuthSecret: env.BETTER_AUTH_SECRET,
  betterAuthUrl: env.BETTER_AUTH_URL,
} as const;
