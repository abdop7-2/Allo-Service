#!/bin/sh
set -e

cd /var/www/html

# ── Storage structure + permissions ───────────────────────────
# The storage directory is a named volume and may start out empty.
mkdir -p \
    storage/framework/cache \
    storage/framework/sessions \
    storage/framework/views \
    storage/logs \
    storage/app/public \
    bootstrap/cache
chown -R www-data:www-data storage bootstrap/cache
chmod -R 775 storage bootstrap/cache

# ── Environment file + application key ─────────────────────────
if [ ! -f .env ]; then
    cp .env.example .env
fi
if ! grep -q "^APP_KEY=base64:" .env; then
    php artisan key:generate --force
fi

# The queue worker (and any other side-car) skips the one-time init below.
if [ "${SKIP_INIT}" = "true" ]; then
    echo "SKIP_INIT=true — waiting for database, then running: $*"
fi

# ── Wait for the database to accept connections ────────────────
echo "Waiting for database at ${DB_HOST}:${DB_PORT}..."
until php -r "exit(@fsockopen(getenv('DB_HOST'), (int) getenv('DB_PORT')) ? 0 : 1);" 2>/dev/null; do
    sleep 2
done
echo "Database is up."

if [ "${SKIP_INIT}" != "true" ]; then
    # ── Migrations ─────────────────────────────────────────────
    php artisan migrate --force

    # ── Seed only when the database is empty (idempotent) ──────
    if [ "${RUN_SEED}" = "true" ]; then
        HAS_USERS=$(php -r '
            try {
                $pdo = new PDO(
                    "mysql:host=".getenv("DB_HOST").";port=".(getenv("DB_PORT") ?: "3306").";dbname=".getenv("DB_DATABASE"),
                    getenv("DB_USERNAME"), getenv("DB_PASSWORD")
                );
                echo $pdo->query("SELECT COUNT(*) FROM users")->fetchColumn() > 0 ? "1" : "0";
            } catch (Throwable $e) { echo "0"; }
        ')
        if [ "$HAS_USERS" = "0" ]; then
            echo "Seeding database (empty)..."
            php artisan db:seed --force
        else
            echo "Database already populated — skipping seed."
        fi
    fi

    # ── Public storage symlink (avatars / uploads) ─────────────
    php artisan storage:link 2>/dev/null || true
fi

exec "$@"
