# Local development setup

## 1. Install required tools
- Node.js 20+
- npm
- Docker Desktop (optional, for running PostgreSQL locally)

## 2. Install the project once
```bash
npm install
cd server
npm install
```

Copy `server/.env.example` to `server/.env` and set a secure `JWT_SECRET`, `ADMIN_EMAIL`, and `ADMIN_PASSWORD`.

## 3. Start frontend and backend together
From the project root, run:
```bash
npm run dev
```

This starts the website at `http://localhost:8080` and the API on the first free port from 4000 upward (4000, or 4001+ if the Docker `api` service already owns 4000). The frontend proxy follows the chosen port automatically. Stop both with `Ctrl+C`.
It also starts the local PostgreSQL container automatically, so Docker Desktop must be open.

## 4. Run PostgreSQL locally
The account, approval and public directory data are stored in PostgreSQL, not in browser storage.
If you want the full self-hosted stack locally, use Docker:
```bash
docker compose up db -d
```

Set `DATABASE_URL`, `JWT_SECRET`, `ADMIN_EMAIL` and `ADMIN_PASSWORD` in `server/.env`.
The API creates and updates the required tables automatically at startup. `server/init.sql` is also available for manual database initialization.

The administrator signs in at `/admin/login`. New users sign up at `/member/login`, remain pending until reviewed, and appear in `/annuaire` only after approval.

## 5. Later for hosting
When you are ready to host, the same Docker Compose setup can be deployed on your server with minimal changes.
