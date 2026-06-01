import { Hono } from "hono";
import { generateText } from "ai";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { s3 } from "../lib/s3";
import { gateway, IMAGE_MODEL } from "../lib/gateway";
import { requireAuth } from "../middleware/auth";

export const DEFAULT_STYLIZE_PROMPT = `Agisci come un art director di product photography di fascia altissima e come un retoucher e-commerce luxury.

Prendi l'immagine che ho caricato e trasformala in una fotografia da catalogo premium, moderna, pulita, iper-definita e commercialmente perfetta, come se fosse stata scattata in studio con una fotocamera full frame top di gamma e ottiche professionali di altissimo livello.

OBIETTIVO:
Creare una rielaborazione super premium del prodotto, mantenendo però fedelmente ogni sua caratteristica reale. Il prodotto deve restare assolutamente riconoscibile e coerente con l'originale.

REGOLE FONDAMENTALI:
- Non alterare la forma del prodotto.
- Non cambiare proporzioni, silhouette, volumi, spessori o geometrie.
- Non semplificare né attenuare i dettagli fini.
- Mantieni perfettamente texture, trama superficiale, pattern, stratificazioni, micro-rilievi, giunzioni, bordi, finitura del materiale e ogni dettaglio visibile.
- Mantieni colori realistici e fedeli all'originale, migliorandone solo precisione, profondità e pulizia.
- Mantieni l'aspetto autentico del materiale stampato in 3D, senza farlo sembrare plastica generica o rendering CGI artificiale.
- Aumenta nitidezza e definizione solo in modo professionale, senza aloni, oversharpening o effetto finto.
- Non perdere dettagli nelle alte luci né nelle ombre.
- Mantieni una resa estremamente realistica, fotografica e non illustrativa.

LOOK DESIDERATO:
- Stile catalogo luxury / premium product photography.
- Qualità da campagna commerciale di brand design contemporaneo.
- Immagine molto pulita, elegante, sofisticata, moderna.
- Sensazione di scatto realizzato con attrezzatura fotografica top di gamma, illuminazione da studio controllata e post-produzione professionale.
- Profondità, tridimensionalità, contrasto raffinato, micro-contrasto accurato e separazione eccellente tra soggetto e sfondo.

LUCE E ATMOSFERA:
- Usa un'illuminazione morbida ma scolpente, con ombre controllate e transizioni graduali.
- Mantieni o ricrea uno sfondo premium con luce LED soffusa, coerente con il soggetto e con i colori presenti nell'immagine originale.
- L'effetto LED deve essere elegante, diffuso, moderno, mai eccessivo o pacchiano.
- Puoi variare il glow luminoso sullo sfondo in modo creativo, ma sempre in tono con il prodotto.
- Lo sfondo deve valorizzare il soggetto senza rubargli attenzione.
- Evita riflessi sporchi, dominanti casuali, flare invadenti o effetti speciali artificiosi.

RESA DEL PRODOTTO:
- Il soggetto deve essere il protagonista assoluto.
- Migliora leggibilità visiva, volume, presenza scenica e percezione premium.
- Evidenzia la qualità della superficie e la precisione della lavorazione.
- Fai emergere texture, colore, materiale e design con realismo estremo.
- Se presenti parti lucide, opache o satinate, differenziale correttamente.
- Se la foto mostra una superficie d'appoggio, rendila pulita, elegante e coerente con un set fotografico professionale.

COMPOSIZIONE:
- Mantieni inquadratura e posa del prodotto coerenti con l'originale, salvo piccoli miglioramenti eleganti.
- Correggi eventuali imperfezioni prospettiche o distrazioni visive.
- Migliora equilibrio, pulizia e centralità della composizione.
- Lascia una percezione da scatto editoriale di fascia alta, adatto a catalogo, e-commerce premium o ADV prodotto.

QUALITÀ FINALE:
- Ultra high definition.
- Dettaglio finissimo e realistico.
- Colori premium, puliti e ricchi.
- Nessun effetto cartoon, pittorico o CGI.
- Nessuna deformazione.
- Nessuna perdita di dettaglio.
- Nessun cambiamento arbitrario del design.

OUTPUT:
Genera una versione finale che sembri fotografata con una Sony A1 II o Canon EOS R5 Mark II o Nikon Z8, con ottica professionale macro/product photography, luce da studio di lusso e post-produzione high-end.

RIFERIMENTO VISIVO:
La resa finale deve sembrare ottenuta con una fotocamera flagship contemporanea, sensore full frame ad altissima risoluzione, nitidezza impeccabile, gamma tonale ricca, dettaglio microstrutturale elevatissimo e qualità ottica da lente professionale top tier.

TARGET ESTETICO:
Fotografia prodotto da catalogo di lusso, perfetta per e-commerce premium, scheda prodotto, advertising, hero image, social ADV e presentazione commerciale high-end.

Per lo sfondo, crea un'illuminazione LED soft e moderna, coerente con il prodotto e con l'immagine di partenza: glow diffuso, elegante, contemporaneo, con variazioni cromatiche raffinate e mai aggressive. Mantieni uno stile premium minimal, con atmosfera tecnologica e design-forward, simile a un set fotografico di alto livello.`;

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms));

// Extract the S3 object key when the URL points to our own file proxy
// (/api/upload/file/<encoded-key>). Returns null for external URLs.
function extractS3Key(imageUrl: string): string | null {
  // Strip origin if present so both relative and absolute forms work.
  let pathPart = imageUrl;
  try {
    if (/^https?:\/\//i.test(imageUrl)) pathPart = new URL(imageUrl).pathname;
  } catch {
    /* keep as-is */
  }
  const marker = "/api/upload/file/";
  const idx = pathPart.indexOf(marker);
  if (idx === -1) return null;
  const encoded = pathPart.slice(idx + marker.length);
  try {
    return decodeURIComponent(encoded);
  } catch {
    return encoded;
  }
}

// Read source image bytes. Prefer reading directly from S3 (works behind any
// proxy / preview origin); fall back to HTTP fetch for truly external URLs.
async function loadSource(imageUrl: string): Promise<{ buf: Buffer; mediaType: string }> {
  const key = extractS3Key(imageUrl);
  if (key) {
    const obj = await s3.send(
      new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
    );
    if (!obj.Body) throw new Error("oggetto S3 vuoto");
    const bytes = await obj.Body.transformToByteArray();
    return {
      buf: Buffer.from(bytes),
      mediaType: obj.ContentType || "image/jpeg",
    };
  }
  // External absolute URL
  if (!/^https?:\/\//i.test(imageUrl)) throw new Error("URL immagine non valido");
  const src = await fetch(imageUrl);
  if (!src.ok) throw new Error("source fetch " + src.status);
  return {
    buf: Buffer.from(await src.arrayBuffer()),
    mediaType: src.headers.get("content-type") || "image/jpeg",
  };
}

export const stylize = new Hono().post("/", requireAuth, async (c) => {
  let body: { imageUrl?: string; prompt?: string };
  try {
    body = await c.req.json();
  } catch {
    return c.json({ message: "Body non valido" }, 400);
  }

  const imageUrl = body.imageUrl?.trim();
  if (!imageUrl) return c.json({ message: "imageUrl mancante" }, 400);

  const finalPrompt = body.prompt?.trim() || DEFAULT_STYLIZE_PROMPT;

  // 1. Load source image (directly from S3 when possible)
  let srcBuf: Buffer;
  let mediaType: string;
  try {
    const loaded = await loadSource(imageUrl);
    srcBuf = loaded.buf;
    mediaType = loaded.mediaType;
  } catch (err: any) {
    return c.json({ message: "Impossibile leggere l'immagine sorgente: " + (err?.message ?? "errore") }, 400);
  }

  // 2. Generate with retry (network flakiness mitigation)
  const maxAttempts = 3;
  let lastErr: any = null;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      const { files } = await generateText({
        model: gateway(IMAGE_MODEL),
        providerOptions: { google: { responseModalities: ["TEXT", "IMAGE"] } },
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: finalPrompt },
              { type: "file", data: srcBuf, mediaType },
            ],
          },
        ],
      });

      const file = files?.[0];
      if (!file) throw new Error("Nessuna immagine generata");

      // 3. Save to S3
      const ext = (file.mediaType || "image/png").includes("jpeg") ? "jpg" : "png";
      const key = `stylized/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
      await s3.send(
        new PutObjectCommand({
          Bucket: process.env.S3_BUCKET,
          Key: key,
          Body: Buffer.from(file.uint8Array),
          ContentType: file.mediaType || "image/png",
        })
      );

      const url = `/api/upload/file/${encodeURIComponent(key)}`;
      return c.json({ url }, 200);
    } catch (err: any) {
      lastErr = err;
      console.error(`Stylize attempt ${attempt}/${maxAttempts} failed:`, err?.message ?? err);
      if (attempt < maxAttempts) await sleep(attempt * 1500);
    }
  }

  return c.json({ message: "Elaborazione fallita: " + (lastErr?.message ?? "errore sconosciuto") }, 500);
});
