import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { eq, like, and, gte, lte, asc, desc, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

export const products = new Hono()
  .get("/", async (c) => {
    const { search, categoria, minPrezzo, maxPrezzo, personalizzabile, inEvidenza, sortBy } = c.req.query();

    let query = db
      .select({
        id: schema.products.id,
        nome: schema.products.nome,
        categoriaId: schema.products.categoriaId,
        categoriaNome: schema.categories.nome,
        prezzo: schema.products.prezzo,
        colori: schema.products.colori,
        materiali: schema.products.materiali,
        dimensioni: schema.products.dimensioni,
        descrizioneBreve: schema.products.descrizioneBreve,
        descrizioneCompleta: schema.products.descrizioneCompleta,
        personalizzabile: schema.products.personalizzabile,
        inEvidenza: schema.products.inEvidenza,
        immagineUrl: schema.products.immagineUrl,
        createdAt: schema.products.createdAt,
      })
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.products.categoriaId, schema.categories.id));

    const conditions = [];

    if (search) {
      conditions.push(like(schema.products.nome, `%${search}%`));
    }
    if (categoria) {
      const catId = parseInt(categoria);
      if (!isNaN(catId)) conditions.push(eq(schema.products.categoriaId, catId));
    }
    if (minPrezzo) {
      const min = parseFloat(minPrezzo);
      if (!isNaN(min)) conditions.push(gte(schema.products.prezzo, min));
    }
    if (maxPrezzo) {
      const max = parseFloat(maxPrezzo);
      if (!isNaN(max)) conditions.push(lte(schema.products.prezzo, max));
    }
    if (personalizzabile === "true") {
      conditions.push(eq(schema.products.personalizzabile, true));
    }
    if (inEvidenza === "true") {
      conditions.push(eq(schema.products.inEvidenza, true));
    }

    let results;
    if (conditions.length > 0) {
      results = await query.where(and(...conditions));
    } else {
      results = await query;
    }

    // Sort in JS (easier with dynamic columns)
    if (sortBy === "prezzo_asc") {
      results.sort((a, b) => (a.prezzo ?? 0) - (b.prezzo ?? 0));
    } else if (sortBy === "prezzo_desc") {
      results.sort((a, b) => (b.prezzo ?? 0) - (a.prezzo ?? 0));
    } else if (sortBy === "az") {
      results.sort((a, b) => a.nome.localeCompare(b.nome, "it"));
    } else if (sortBy === "za") {
      results.sort((a, b) => b.nome.localeCompare(a.nome, "it"));
    } else {
      results.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }

    return c.json({ products: results, total: results.length }, 200);
  })
  .get("/:id", async (c) => {
    const id = parseInt(c.req.param("id"));
    const [product] = await db
      .select({
        id: schema.products.id,
        nome: schema.products.nome,
        categoriaId: schema.products.categoriaId,
        categoriaNome: schema.categories.nome,
        prezzo: schema.products.prezzo,
        colori: schema.products.colori,
        materiali: schema.products.materiali,
        dimensioni: schema.products.dimensioni,
        descrizioneBreve: schema.products.descrizioneBreve,
        descrizioneCompleta: schema.products.descrizioneCompleta,
        personalizzabile: schema.products.personalizzabile,
        inEvidenza: schema.products.inEvidenza,
        immagineUrl: schema.products.immagineUrl,
        createdAt: schema.products.createdAt,
      })
      .from(schema.products)
      .leftJoin(schema.categories, eq(schema.products.categoriaId, schema.categories.id))
      .where(eq(schema.products.id, id));
    if (!product) return c.json({ message: "Prodotto non trovato" }, 404);
    return c.json({ product }, 200);
  })
  .post("/", requireAuth, async (c) => {
    const body = await c.req.json();
    const { nome, categoriaId, prezzo, colori, materiali, dimensioni, descrizioneBreve, descrizioneCompleta, personalizzabile, inEvidenza, immagineUrl } = body;
    if (!nome) return c.json({ message: "Il nome del prodotto è obbligatorio" }, 400);
    const [product] = await db.insert(schema.products).values({
      nome,
      categoriaId: categoriaId ?? null,
      prezzo: prezzo ?? null,
      colori: colori ? JSON.stringify(colori) : null,
      materiali: materiali ?? null,
      dimensioni: dimensioni ?? null,
      descrizioneBreve: descrizioneBreve ?? null,
      descrizioneCompleta: descrizioneCompleta ?? null,
      personalizzabile: personalizzabile ?? false,
      inEvidenza: inEvidenza ?? false,
      immagineUrl: immagineUrl ?? null,
    }).returning();
    return c.json({ product }, 201);
  })
  .put("/:id", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    const body = await c.req.json();
    const { nome, categoriaId, prezzo, colori, materiali, dimensioni, descrizioneBreve, descrizioneCompleta, personalizzabile, inEvidenza, immagineUrl } = body;
    if (!nome) return c.json({ message: "Il nome del prodotto è obbligatorio" }, 400);
    const [product] = await db.update(schema.products).set({
      nome,
      categoriaId: categoriaId ?? null,
      prezzo: prezzo ?? null,
      colori: colori ? JSON.stringify(colori) : null,
      materiali: materiali ?? null,
      dimensioni: dimensioni ?? null,
      descrizioneBreve: descrizioneBreve ?? null,
      descrizioneCompleta: descrizioneCompleta ?? null,
      personalizzabile: personalizzabile ?? false,
      inEvidenza: inEvidenza ?? false,
      immagineUrl: immagineUrl ?? null,
    }).where(eq(schema.products.id, id)).returning();
    if (!product) return c.json({ message: "Prodotto non trovato" }, 404);
    return c.json({ product }, 200);
  })
  .delete("/:id", requireAuth, async (c) => {
    const id = parseInt(c.req.param("id"));
    const [deleted] = await db.delete(schema.products).where(eq(schema.products.id, id)).returning();
    if (!deleted) return c.json({ message: "Prodotto non trovato" }, 404);
    return c.json({ success: true }, 200);
  });
