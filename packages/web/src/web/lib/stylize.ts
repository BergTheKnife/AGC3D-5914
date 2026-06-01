import { api } from "./api";

// Calls the backend AI stylizer. Returns the public URL of the processed image.
export async function stylizeImage(imageUrl: string, prompt?: string): Promise<string> {
  const res = await (api as any).stylize.$post({
    json: { imageUrl, prompt: prompt?.trim() ? prompt : undefined },
  });
  if (!res.ok) {
    let msg = "Elaborazione fallita";
    try {
      const body = await res.json();
      msg = body.message ?? msg;
    } catch {
      /* ignore */
    }
    throw new Error(msg);
  }
  const { url } = await res.json();
  return url as string;
}
