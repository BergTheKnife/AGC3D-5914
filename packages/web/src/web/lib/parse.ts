// Robustly parse a possibly double/triple JSON-encoded list field into a string array.
export function parseList(raw: unknown): string[] {
  if (raw == null) return [];
  let val: any = raw;
  for (let i = 0; i < 5; i++) {
    if (Array.isArray(val)) break;
    if (typeof val !== "string") break;
    const trimmed = val.trim();
    if (!trimmed) return [];
    try {
      val = JSON.parse(trimmed);
    } catch {
      // plain "Rosso, Bianco" string
      return trimmed.split(",").map((s) => s.trim()).filter(Boolean);
    }
  }
  if (Array.isArray(val)) return val.map((x) => String(x).trim()).filter(Boolean);
  if (typeof val === "string") return val.split(",").map((s) => s.trim()).filter(Boolean);
  return [];
}
