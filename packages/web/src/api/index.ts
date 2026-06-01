import { Hono } from "hono";
import { cors } from "hono/cors";
import { auth } from "./auth";
import { authMiddleware } from "./middleware/auth";
import { categories } from "./routes/categories";
import { products } from "./routes/products";
import { upload } from "./routes/upload";
import { contact } from "./routes/contact";
import { stylize } from "./routes/stylize";

const app = new Hono()
  .use(cors({ origin: (origin) => origin ?? "*", credentials: true, exposeHeaders: ["set-auth-token"] }))
  .on(["GET", "POST"], "/api/auth/*", (c) => auth.handler(c.req.raw))
  .basePath("api")
  .use("*", authMiddleware)
  .route("/categories", categories)
  .route("/products", products)
  .route("/upload", upload)
  .route("/contact", contact)
  .route("/stylize", stylize)
  .get("/health", (c) => c.json({ status: "ok" }, 200));

export type AppType = typeof app;
export default app;
