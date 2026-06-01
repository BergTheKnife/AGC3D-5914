import { Hono } from "hono";
import { PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/s3";
import { requireAuth } from "../middleware/auth";

export const upload = new Hono()
  .post("/presign", requireAuth, async (c) => {
    const { filename, contentType } = await c.req.json();
    const safeName = String(filename || "file").replace(/[^a-zA-Z0-9.\-_]/g, "_");
    const key = `products/${Date.now()}-${Math.random().toString(36).slice(2, 8)}-${safeName}`;

    const url = await getSignedUrl(
      s3,
      new PutObjectCommand({
        Bucket: process.env.S3_BUCKET,
        Key: key,
        ContentType: contentType,
      }),
      { expiresIn: 600 }
    );

    // Always serve through our own backend endpoint so the URL is guaranteed public.
    const publicUrl = `/api/upload/file/${encodeURIComponent(key)}`;

    return c.json({ url, key, publicUrl }, 200);
  })
  // Public file proxy — streams the object from the bucket.
  .get("/file/:key{.+}", async (c) => {
    const key = decodeURIComponent(c.req.param("key"));
    try {
      const obj = await s3.send(
        new GetObjectCommand({ Bucket: process.env.S3_BUCKET, Key: key })
      );
      if (!obj.Body) return c.json({ message: "Not found" }, 404);

      const headers = new Headers();
      if (obj.ContentType) headers.set("Content-Type", obj.ContentType);
      if (obj.ContentLength) headers.set("Content-Length", String(obj.ContentLength));
      headers.set("Cache-Control", "public, max-age=31536000, immutable");

      // @ts-expect-error Body is a web ReadableStream in the Bun/Workers runtime
      return new Response(obj.Body as ReadableStream, { headers });
    } catch {
      return c.json({ message: "File non trovato" }, 404);
    }
  });
