import { Hono } from "hono";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { s3 } from "../lib/s3";
import { requireAuth } from "../middleware/auth";

export const upload = new Hono()
  .post("/presign", requireAuth, async (c) => {
    const { filename, contentType } = await c.req.json();
    const key = `products/${Date.now()}-${filename.replace(/[^a-zA-Z0-9.\-_]/g, "_")}`;

    const url = await getSignedUrl(s3, new PutObjectCommand({
      Bucket: process.env.S3_BUCKET,
      Key: key,
      ContentType: contentType,
    }), { expiresIn: 600 });

    // Public URL for the object
    const publicUrl = `${process.env.S3_PUBLIC_URL ?? process.env.S3_ENDPOINT?.replace("https://", `https://${process.env.S3_BUCKET}.`)}/${key}`;

    return c.json({ url, key, publicUrl }, 200);
  });
