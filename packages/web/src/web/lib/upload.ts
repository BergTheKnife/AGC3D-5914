import { api } from "./api";

export async function uploadImage(file: File): Promise<string> {
  const res = await api.upload.presign.$post({
    json: { filename: file.name, contentType: file.type },
  });
  const { url, publicUrl } = await res.json();

  await fetch(url, {
    method: "PUT",
    body: file,
    headers: { "Content-Type": file.type },
  });

  return publicUrl;
}
