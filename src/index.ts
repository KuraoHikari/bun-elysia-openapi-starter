import { Elysia } from "elysia";
import { swagger } from "@elysiajs/swagger";
import { corsPlugin } from "./plugins/cors";
import { errorHandler } from "./middlewares/error-handler";
import { authController } from "./modules/auth/auth.controller";
import { usersController } from "./modules/users/users.controller";
import { config } from "./config";

const app = new Elysia()
  .use(corsPlugin)
  .use(errorHandler)
  .use(swagger({ path: "/docs" }))
  .use(authController)
  .use(usersController)
  .get("/", () => ({ success: true, message: "API is running" }))
  .listen(config.port);

console.log(`🦊 Server running at http://localhost:${app.server?.port}`);
console.log(`📖 Swagger docs at http://localhost:${app.server?.port}/docs`);
