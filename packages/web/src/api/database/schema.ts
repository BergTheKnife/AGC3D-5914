import { sqliteTable, text, integer, real } from "drizzle-orm/sqlite-core";

export const categories = sqliteTable("categories", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull().unique(),
  slug: text("slug").notNull().unique(),
  descrizione: text("descrizione"),
  ordine: integer("ordine").default(0),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const products = sqliteTable("products", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  categoriaId: integer("categoria_id").references(() => categories.id),
  prezzo: real("prezzo"),
  colori: text("colori"), // JSON array string
  materiali: text("materiali"),
  dimensioni: text("dimensioni"),
  descrizioneBreve: text("descrizione_breve"),
  descrizioneCompleta: text("descrizione_completa"),
  personalizzabile: integer("personalizzabile", { mode: "boolean" }).default(false),
  inEvidenza: integer("in_evidenza", { mode: "boolean" }).default(false),
  immagineUrl: text("immagine_url"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export const contactMessages = sqliteTable("contact_messages", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  nome: text("nome").notNull(),
  email: text("email").notNull(),
  telefono: text("telefono"),
  messaggio: text("messaggio").notNull(),
  tipoRichiesta: text("tipo_richiesta").default("info"),
  createdAt: integer("created_at", { mode: "timestamp" })
    .notNull()
    .$defaultFn(() => new Date()),
});

export * from "./auth-schema";
