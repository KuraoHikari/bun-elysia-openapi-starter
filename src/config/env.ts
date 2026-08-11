const required = ["DATABASE_URL", "JWT_SECRET"] as const;

interface Env {
  PORT: number;
  DATABASE_URL: string;
  JWT_SECRET: string;
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
    JWT_SECRET: process.env.JWT_SECRET!,
  };
}
