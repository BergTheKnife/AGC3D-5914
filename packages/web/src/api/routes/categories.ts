import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

export const categories = new Hono()
  .get("/", async (c) => {
    const cats = await db.select().from(schema.categories).orderBy(schema.categories.ordine);
    return c.json({ categories: cats }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const body = await c.req.json();
    const { nome, descrizione, ordine } = body;
    if (!nome) return c.json({ message: "Il nome è obbligatorio" }, 400);
    const slug = nome.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    try {
      const [cat] = await db.insert(schema.categories).values({ nome, slug, descrizione, ordine: ordine ?? 0 }).returning();
      return c.json({ category: cat }, 201);
    } catch (e: any) {
      if (e?.message?.includes("UNIQUE")) return c.json({ message: "Categoria già esistente" }, 409);
      throw e;
    }
  })
  .put("/:id", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { nome, descrizione, ordine } = body;
    if (!nome) return c.json({ message: "Il nome è obbligatorio" }, 400);
    const slug = nome.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    const [cat] = await db.update(schema.categories).set({ nome, slug, descrizione, ordine: ordine ?? 0 }).where(eq(schema.categories.id, id)).returning();
    if (!cat) return c.json({ message: "Categoria non trovata" }, 404);
    return c.json({ category: cat }, 200);
  })
  .delete("/:id", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    // Check if any products use this category
    const productsInCat = await db.select({ id: schema.products.id }).from(schema.products).where(eq(schema.products.categoriaId, id)).limit(1);
    if (productsInCat.length > 0) {
      return c.json({ message: "Impossibile eliminare: ci sono prodotti in questa categoria" }, 409);
    }
    await db.delete(schema.categories).where(eq(schema.categories.id, id));
    return c.json({ success: true }, 200);
  });
