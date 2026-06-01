import { createGateway } from "ai";

// AI Gateway — single point of configuration.
// To migrate off Runable: swap these two env vars for another provider's
// gateway/base URL + API key. No other code changes needed.
export const gateway = createGateway({
  baseURL: process.env.AI_GATEWAY_BASE_URL,
  apiKey: process.env.AI_GATEWAY_API_KEY,
});

export const IMAGE_MODEL = "google/gemini-3-pro-image";
