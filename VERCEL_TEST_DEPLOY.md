# Vercel test deployment

This copy is prepared to serve the Vite frontend and Express API from the same Vercel project.

## Before deploying

1. Create a hosted PostgreSQL database (for example, Neon) and copy its pooled `DATABASE_URL`.
2. Create a document-storage service account. Vercel Functions do not provide persistent disk storage, so the current local document-upload implementation must be replaced with Cloudinary, Supabase Storage, or Vercel Blob before document uploads are tested online.
3. Push this copy to a new private GitHub repository. Do not commit `.env` or `server/.env`.

## Vercel project settings

- Framework preset: `Vite`
- Build command: `npm run build`
- Output directory: `dist`

Add the following production environment variables in Vercel:

```env
DATABASE_URL=<hosted PostgreSQL pooled URL>
JWT_SECRET=<long random secret>
ADMIN_EMAIL=<admin email>
ADMIN_PASSWORD=<strong admin password>
FRONTEND_URL=https://<your-vercel-project>.vercel.app
FRONTEND_ORIGIN=https://<your-vercel-project>.vercel.app
SMTP_HOST=smtp.gmail.com
SMTP_PORT=465
SMTP_SECURE=true
SMTP_USER=<Gmail sender>
SMTP_PASS=<Gmail app password>
SMTP_FROM=FTDAP <<Gmail sender>>
```

Do not set `VITE_API_URL` in Vercel. The deployed frontend uses its own `/api` route.

After adding or changing an environment variable, redeploy the project.
