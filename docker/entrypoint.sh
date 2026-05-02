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

# Generate APP_KEY kalau belum ada (safety net)
if [ -z "$APP_KEY" ]; then
    php artisan key:generate --force --no-interaction || true
fi

# Optimize cache (idempotent, aman dipanggil tiap boot)
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

exec "$@"
