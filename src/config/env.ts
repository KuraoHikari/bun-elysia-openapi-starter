const required = ["DATABASE_URL", "BETTER_AUTH_SECRET"] as const;

interface Env {
  PORT: number;
  DATABASE_URL: string;
  BETTER_AUTH_SECRET: string;
  BETTER_AUTH_URL: string;
}

export function parseEnv(): Env {
  for (const key of required) {
    if (!process.env[key]) {
      throw new Error(`Missing required environment variable: ${key}`);
    }
  }

  return {
    PORT: Number(process.env.PORT) || 3000,
    DATABASE_URL: process.env.DATABASE_URL!,
    BETTER_AUTH_SECRET: process.env.BETTER_AUTH_SECRET!,
    BETTER_AUTH_URL:
      process.env.BETTER_AUTH_URL ??
      `http://localhost:${process.env.PORT || 3000}`,
  };
}
