# Running Allo-Services with Docker

The whole stack runs with a single command. Everything is containerized:

| Service    | Description                          | URL / Port (host)         |
|------------|--------------------------------------|---------------------------|
| `frontend` | React (CRA) app served by nginx      | http://localhost:3000     |
| `backend`  | Laravel 12 API (Apache + PHP 8.2)    | http://localhost:8000     |
| `queue`    | Laravel queue worker                 | —                         |
| `db`       | MySQL 8                              | localhost:3307 (→ 3306)   |

## Prerequisites

- Docker Desktop (Docker Engine + Compose v2)

## Start everything

```bash
docker compose up --build
```

On the **first** boot the backend container will:

1. wait for MySQL to be ready,
2. run `php artisan migrate --force`,
3. seed the database once (`RUN_SEED=true`, tracked by a `storage/.seeded` marker),
4. create the `storage` symlink for uploaded avatars.

When you see Apache and the queue worker running, open **http://localhost:3000**.

Run detached (in the background):

```bash
docker compose up --build -d
```

Stop:

```bash
docker compose down          # keep data
docker compose down -v       # also wipe the MySQL + storage volumes (fresh start + re-seed)
```

## How configuration works

- The backend image bundles your existing `.env` (for `APP_KEY` and the Google
  OAuth keys). The **database** settings are overridden by `docker-compose.yml`
  (`DB_HOST=db`, user `allo`, password `secret`) — Laravel keeps real
  environment variables over the `.env` file, so no edits to `.env` are needed.
- The frontend talks to the backend via `REACT_APP_API_URL`, baked in at build
  time. It defaults to `http://localhost:8000` (see the `frontend.build.args` in
  `docker-compose.yml`). CRA inlines this at build time, so change it there and
  rebuild if your API lives elsewhere.

## Common commands

```bash
# Tail logs
docker compose logs -f backend

# Open a shell in the API container
docker compose exec backend bash

# Re-run migrations / seeders manually
docker compose exec backend php artisan migrate
docker compose exec backend php artisan db:seed

# Rebuild just the frontend after changing REACT_APP_API_URL
docker compose build frontend && docker compose up -d frontend
```

## Notes

- **Google OAuth**: `GOOGLE_REDIRECT_URI` in `.env` still points at your ngrok
  URL. Email/password auth works out of the box; for Google login locally,
  update the redirect URI in `.env` (and the Google console) to
  `http://localhost:8000/api/auth/google/callback`, then rebuild the backend.
- The MySQL host port is **3307** to avoid clashing with a MySQL you may already
  run locally. Inside the network, services still use `db:3306`.
- This setup builds the app code into the images (no bind mounts), so it runs
  consistently regardless of host OS. After changing PHP/JS source, re-run
  `docker compose up --build`.
- **Avast / TLS-intercepting antivirus**: building on a machine whose antivirus
  inspects HTTPS breaks npm/Composer (`unable to verify ... certificate`). The
  `docker/certs/` and `allo-frontend/certs/` folders let you drop the proxy's
  root CA (a `.crt` file) so the build trusts it. These `.crt` files are
  git-ignored and machine-specific; on a normal network the folders are empty
  and the step is a no-op.

---

# Sharing the app so someone else can run it (without you)

Your friend needs **only Docker + one compose file** — no source code, no `.env`,
and no involvement from you. Pick one of the methods below.

## Method A — Docker Hub (recommended)

Publish the two images once; your friend pulls and runs them.

**You (one time):**

```bash
docker login                                   # free Docker Hub account
DOCKERHUB_USER=yourname TAG=1.0 ./docker/publish.sh
```

That builds, tags and pushes `yourname/allo-backend:1.0` and
`yourname/allo-frontend:1.0`. (MySQL is the public `mysql:8.0` image — no need to
publish it.)

**Send your friend just two things:** the file `docker-compose.dist.yml` and your
Docker Hub username + tag. They run:

```bash
# macOS/Linux
DOCKERHUB_USER=yourname TAG=1.0 docker compose -f docker-compose.dist.yml up -d

# Windows PowerShell
$env:DOCKERHUB_USER="yourname"; $env:TAG="1.0"
docker compose -f docker-compose.dist.yml up -d
```

Docker pulls all three images and starts the stack. App at
**http://localhost:3000**, API at **http://localhost:8000**.

> ⚠️ **Security:** the backend image bundles your `.env`, which includes
> `GOOGLE_CLIENT_SECRET`. **Push to a _private_ Docker Hub repository**, or remove/
> rotate that secret before publishing publicly. Anyone who can pull the image can
> read it.

## Method B — Offline file (no Docker Hub account)

Export the built images to a single file and send it (USB / cloud — it's ~1 GB):

```bash
# You — tag with the same names the dist compose expects, then export
docker compose build
docker tag allo-services-backend  yourname/allo-backend:1.0
docker tag allo-services-frontend yourname/allo-frontend:1.0
docker save yourname/allo-backend:1.0 yourname/allo-frontend:1.0 mysql:8.0 -o allo-images.tar
```

```bash
# Friend (after copying allo-images.tar + docker-compose.dist.yml next to it)
docker load -i allo-images.tar
DOCKERHUB_USER=yourname TAG=1.0 docker compose -f docker-compose.dist.yml up -d
```

## Method C — Share the repository

If your friend is OK building it themselves, push this repo and they run
`docker compose up --build`. They'll need their own `.env` (copy `.env.example`,
run `docker compose exec backend php artisan key:generate`).
