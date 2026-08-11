import { cors } from "@elysiajs/cors";
import { config } from "../config";

export const corsPlugin = cors({
  origin: config.corsOrigin,
  credentials: true,
  methods: ["GET", "POST", "PATCH", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
});
