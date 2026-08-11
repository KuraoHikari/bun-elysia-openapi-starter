import type { Elysia } from "elysia";

export const corsPlugin = (app: Elysia) =>
  app.onRequest(({ set }) => {
    set.headers["access-control-allow-origin"] = "*";
    set.headers["access-control-allow-methods"] = "GET,POST,PATCH,DELETE,OPTIONS";
    set.headers["access-control-allow-headers"] = "Content-Type, Authorization";
  });
