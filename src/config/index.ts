import { parseEnv } from "./env";

const env = parseEnv();

export const config = {
  port: env.PORT,
  databaseUrl: env.DATABASE_URL,
  jwtSecret: env.JWT_SECRET,
} as const;
