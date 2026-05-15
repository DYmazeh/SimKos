#!/bin/sh
# Entrypoint untuk container SIMKOS
# - Set SERVER_NAME dari $PORT (Render kasih port dinamis)
# - Optimize Laravel cache di runtime (config/route/view)
# - Optionally jalankan migrate kalau RUN_MIGRATIONS=true
set -e

if [ -n "$PORT" ]; then
    export SERVER_NAME=":${PORT}"
fi

cd /app

# Buat .env dari environment variables jika belum ada.
# Render menyimpan env vars di env, bukan di file .env.
# Laravel butuh .env untuk key:generate, tapi config:cache pakai env langsung.
if [ ! -f .env ]; then
    touch .env
fi

# Generate APP_KEY kalau belum ada (safety net)
# WARNING: APP_KEY harus diset via env var di production supaya konsisten antar restart.
# Kalau tiap restart APP_KEY berubah, semua session & encrypted cookie jadi invalid.
if [ -z "$APP_KEY" ]; then
    echo "[entrypoint] WARNING: APP_KEY env var kosong/tidak diset!" >&2
    echo "[entrypoint] Set APP_KEY di Render dashboard supaya konsisten antar deploy." >&2
    echo "[entrypoint] Generating temporary key (akan invalidate sessions saat restart)..." >&2
    # Write placeholder supaya key:generate punya line untuk di-replace
    echo "APP_KEY=" >> .env
    php artisan key:generate --force --no-interaction || true
fi

# Clear stale caches from previous deploys, then re-cache
php artisan config:clear --no-interaction
php artisan route:clear --no-interaction
php artisan view:clear --no-interaction

php artisan config:cache --no-interaction
php artisan route:cache --no-interaction
php artisan view:cache --no-interaction

# Storage symlink (kalau pakai local disk; Supabase storage tidak butuh)
php artisan storage:link --no-interaction || true

# Optional migrate saat boot (set RUN_MIGRATIONS=true di env Render)
if [ "$RUN_MIGRATIONS" = "true" ]; then
    echo "[entrypoint] Running migrations..."
    php artisan migrate --force --no-interaction
fi

# Optional seed saat boot (set RUN_SEEDER=true di env Render).
# Seeder ini idempotent (firstOrCreate/updateOrCreate) — aman dipanggil berulang.
# Disarankan: enable saat first deploy, lalu set false untuk deploy berikutnya
# supaya boot lebih cepat & tidak ada risiko overwrite data.
if [ "$RUN_SEEDER" = "true" ]; then
    echo "[entrypoint] Running database seeders..."
    php artisan db:seed --force --no-interaction
fi

exec "$@"
