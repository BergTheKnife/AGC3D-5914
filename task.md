# Task: Stilizzatore Immagini (AI Photo Studio) — Admin

## Steps
- [x] 1. bun add ai (packages/web)
- [x] 2. gateway.ts helper
- [x] 3. backend route stylize.ts (POST /api/stylize, requireAuth, retry, S3 save)
- [x] 4. register route in api/index.ts
- [x] 5. frontend lib stylizeImage()
- [x] 6. page stilizzatore.tsx (batch upload, prompt default+custom, results, storico, scarica, ripeti, carica catalogo)
- [x] 7. sessionStorage prefill in prodotti-form.tsx (only when isNew)
- [x] 8. sidebar navItem in layout.tsx
- [x] 9. route in app.tsx
- [x] 10. build + restart DONE. Backend tested end-to-end via curl (success, premium image). Frontend code verified complete; mb browser daemon has sandbox perm issue, UI verified by code review.

## Notes
- Model: google/gemini-3-pro-image via generateText, responseModalities TEXT,IMAGE
- DEFAULT_STYLIZE_PROMPT = full premium prompt from user
- Never return base64 — save to S3, return /api/upload/file/<key>
- .env: NO quotes (loadEnv bug). pm2 file is ecosystem.config.cjs, port 4200
- Verify SDK image input signature first (file vs data URL)
