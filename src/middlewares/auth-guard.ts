import { jwt } from "@elysiajs/jwt";
import { Elysia } from "elysia";
import { AppError } from "../middlewares/error-handler";
import { config } from "../config";

export interface JwtPayload {
  sub: string;
  email: string;
}

export const authGuard = new Elysia()
  .use(jwt({ name: "jwt", secret: config.jwtSecret }))
  .derive(async ({ headers, jwt }) => {
    const authHeader = headers["authorization"];
    if (!authHeader?.startsWith("Bearer ")) {
      throw new AppError(401, "UNAUTHORIZED", "Missing or invalid token");
    }

    const token = authHeader.slice(7);
    const payload = (await jwt.verify(token)) as unknown as JwtPayload | null;
    if (!payload) {
      throw new AppError(401, "UNAUTHORIZED", "Invalid or expired token");
    }

    return { user: payload };
  });
