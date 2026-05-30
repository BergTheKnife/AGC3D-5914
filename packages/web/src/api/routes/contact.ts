import { Hono } from "hono";
import { db } from "../database";
import * as schema from "../database/schema";
import { sendEmail } from "../services/email";

export const contact = new Hono()
  .post("/", async (c) => {
    const body = await c.req.json();
    const { nome, email, telefono, messaggio, tipoRichiesta } = body;

    if (!nome || !email || !messaggio) {
      return c.json({ message: "Nome, email e messaggio sono obbligatori" }, 400);
    }

    // Save to DB
    const [msg] = await db.insert(schema.contactMessages).values({
      nome,
      email,
      telefono: telefono ?? null,
      messaggio,
      tipoRichiesta: tipoRichiesta ?? "info",
    }).returning();

    // Send email notification
    try {
      await sendEmail({
        to: "agc3d@hotmail.com",
        subject: `Nuovo messaggio da ${nome} — AGC 3D Studios`,
        replyTo: email,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <div style="background: #111111; padding: 24px; text-align: center;">
              <h1 style="color: #ffffff; margin: 0; font-size: 20px; letter-spacing: 4px;">AGC 3D STUDIOS</h1>
            </div>
            <div style="padding: 32px; background: #ffffff; border: 1px solid #e0e0e0;">
              <h2 style="color: #111111; margin-top: 0;">Nuovo messaggio dal sito</h2>
              <table style="width: 100%; border-collapse: collapse;">
                <tr><td style="padding: 8px 0; color: #555; font-weight: bold; width: 120px;">Nome:</td><td style="padding: 8px 0;">${nome}</td></tr>
                <tr><td style="padding: 8px 0; color: #555; font-weight: bold;">Email:</td><td style="padding: 8px 0;"><a href="mailto:${email}">${email}</a></td></tr>
                ${telefono ? `<tr><td style="padding: 8px 0; color: #555; font-weight: bold;">Telefono:</td><td style="padding: 8px 0;">${telefono}</td></tr>` : ""}
                <tr><td style="padding: 8px 0; color: #555; font-weight: bold;">Tipo:</td><td style="padding: 8px 0;">${tipoRichiesta === "personalizzazione" ? "Richiesta personalizzazione" : "Richiesta informazioni"}</td></tr>
              </table>
              <div style="margin-top: 24px; padding: 16px; background: #f8f8f8; border-left: 3px solid #CC2222;">
                <p style="margin: 0; color: #333; white-space: pre-wrap;">${messaggio}</p>
              </div>
            </div>
            <div style="padding: 16px; text-align: center; color: #999; font-size: 12px;">
              Messaggio inviato tramite il sito AGC 3D Studios
            </div>
          </div>
        `,
      });
    } catch (e) {
      console.error("Email send failed:", e);
      // Don't fail the request if email fails
    }

    return c.json({ success: true, message: "Messaggio inviato con successo" }, 200);
  });
