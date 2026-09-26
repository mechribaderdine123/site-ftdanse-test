# Self-hosted federation backend

## Run locally

1. Copy `.env.example` to `.env`
2. Install dependencies:
   `npm install`
3. Start the API:
   `npm run dev`

The API uses PostgreSQL for users, account requests and approved directory entries. It creates the tables at startup and seeds the administrator from `ADMIN_EMAIL` and `ADMIN_PASSWORD`.

## Run with Docker Compose

```bash
docker compose up --build
```

This starts:
- PostgreSQL on port 5432
- API on port 4000 (or the next free port when dev.mjs detects the docker `api` service is using 4000)
- Frontend on port 80
