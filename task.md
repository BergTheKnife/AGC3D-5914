# AGC 3D Studios - Build Progress

## Status: IN PROGRESS

## Completed
- [x] app_init
- [x] Assets copied to public/
- [x] design.md written
- [x] Dependencies installed (better-auth, s3, resend)
- [x] DB schema (categories, products, contactMessages + auth)
- [x] auth.ts
- [x] db:push
- [x] s3.ts
- [x] email service
- [x] auth middleware

## Next Steps
- [ ] API routes (categories, products, upload, contact)
- [ ] Seed default categories
- [ ] Auth client (web)
- [ ] API index.ts (full)
- [ ] Web pages: Home, Chi siamo, Catalogo, Contatti
- [ ] Admin pages: Login, Dashboard, Products CRUD, Categories CRUD
- [ ] App.tsx routes
- [ ] Styles / global CSS
- [ ] Create admin user script
- [ ] Build check

## Key Decisions
- Auth: better-auth email/password, admin only
- Images: R2 upload via presigned URL
- Email: Resend (need API key from user)
- Categories: managed table in DB
- Colors: black #111111, red #CC2222, white, grey
- Font: Space Grotesk (display) + Inter (body)
