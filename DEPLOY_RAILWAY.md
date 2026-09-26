# Déploiement Railway — FTDAP

## Architecture sur Railway (3 services)

```
[web]  nginx + frontend buildé  ──proxy /api──▶  [api]  Express (PORT Railway)
                                                     │
                                              [postgres]  base de données
```

- **postgres** : base PostgreSQL (Railway la crée en 1 clic, variable `DATABASE_URL` incluse)
- **api** : `server/` (Dockerfile fourni, écoute sur `PORT`)
- **web** : frontend buildé + nginx qui proxifie `/api/*` vers l'API en réseau privé

Le même repo sert pour les 3 services (Railway détecte les 2 Dockerfiles).

---

## Étapes exactes

### 1. Pousser le code sur GitHub
```bash
git add -A && git commit -m "Prepare Railway deployment" && git push origin main
```
Railway déploie depuis un repo GitHub (ou `railway up` en CLI).

### 2. Créer le projet
- <https://railway.com/new> → **Deploy from GitHub repo** → choisir le repo.
- Railway propose « empty service » — on ajoutera les services un par un.

### 3. Ajouter PostgreSQL
- `+ Create` → **Database** → **Add PostgreSQL**.
- Onglet **Variables** du service postgres : copier la valeur de
  `DATABASE_URL` (format `postgres://postgres:***@<host>.railway.internal:5432/railway`).

### 4. Créer le service API
- `+ Create` → **GitHub Repo** (le même repo).
- **Settings → Root Directory** : `server`
- **Settings → Networking** : laisser **privé** (pas de domaine public nécessaire ;
  le web y accède via le réseau interne). Noter le nom du service, ex. `api`.
- **Variables** :
  ```
  DATABASE_URL = <celle du postgres (railway.internal)>
  JWT_SECRET   = <chaîne aléatoire longue, ex: openssl rand -hex 32>
  ADMIN_EMAIL  = votre email admin réel
  ADMIN_PASSWORD = <mot de passe admin réel>
  FRONTEND_URL   = https://<domaine-du-web>.up.railway.app
  FRONTEND_ORIGIN = https://<domaine-du-web>.up.railway.app
  SMTP_HOST      = smtp.gmail.com
  SMTP_PORT      = 465
  SMTP_SECURE    = true
  SMTP_USER      = baderdinemechri@gmail.com
  SMTP_PASS      = <mot de passe d'application Gmail>
  SMTP_FROM      = FTDAP <baderdinemechri@gmail.com>
  ```
  ⚠️ Ne jamais commiter `.env` : les variables se mettent dans Railway.
- **Deploy** — le serveur crée les tables automatiquement au démarrage
  (`initializeDatabase`) et génère l'admin.

### 5. Créer le service Web (frontend)
- `+ Create` → **GitHub Repo** (même repo, racine du projet).
- **Variables** :
  ```
  API_HOST = <nom-du-service-api>.railway.internal
  VITE_API_URL =   (vide — le proxy nginx route /api)
  ```
  `API_HOST` doit être le **nom exact du service API** + `.railway.internal`
  (ex. `api.railway.internal` ; le nom privé exact est affiché dans
  Settings → Networking de l'API).
- **Settings → Networking → Generate Domain** → c'est l'URL publique du site.

### 6. Volumes persistants (obligatoire pour les uploads)
Les documents uploadés (CIN, reçus, logos…) sont stockés dans
`server/data/uploads/`. Sans volume, ils disparaissent à chaque redéploiement.
- Service **api** → Settings → **Volumes** → monter sur `/app/data/uploads`
  (le serveur écrit `data/uploads/...` relatif à `/app`).

### 7. Vérifier
- Ouvrir `https://<web>.up.railway.app` → le site s'affiche.
- `https://<web>.up.railway.app/api/health` → `{"ok":true}`.
- Se connecter admin avec `ADMIN_EMAIL` / `ADMIN_PASSWORD` définis plus haut.
- Tester « Mot de passe oublié » (vérifie SMTP) et l'upload d'un document
  (vérifie le volume).

---

## Option CLI (alternative au dashboard)

```bash
npm i -g @railway/cli
railway login
railway init                      # dans le dossier du repo
railway add --database postgres
railway up --service api --root server
railway up --service web
railway variables --service api --set "JWT_SECRET=$(openssl rand -hex 32)"
```

## Coût estimé
Hobby plan (~5 $/mois, crédits inclus) suffisant pour démarrer ; les 3 services +
Postgres consomment peu. Les uploads comptent dans le stockage du volume.

## Points d'attention
- **SMTP** : le mot de passe d'application Gmail doit être régénéré si révoqué.
- **CORS** : `FRONTEND_ORIGIN` doit correspondre exactement au domaine Railway
  (sinon l'API refuse les requêtes du navigateur).
- **HTTPS** : géré automatiquement par Railway (`*.up.railway.app` + domaine
  custom possible dans Settings → Networking).
- **Seed admin** : au premier démarrage, l'admin est créé avec
  `ADMIN_EMAIL`/`ADMIN_PASSWORD` — changez-les immédiatement dans Railway.
