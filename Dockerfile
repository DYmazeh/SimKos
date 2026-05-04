# syntax=docker/dockerfile:1.6
#
# SIMKOS — Multi-stage build
#
# Stage 1 (vendor)   : install composer deps tanpa scripts
# Stage 2 (frontend) : build asset Vite (Tailwind + JS)
# Stage 3 (runtime)  : FrankenPHP serving Laravel
#
# FrankenPHP dipilih karena single binary (Caddy + PHP), hemat RAM
# di Render free tier (vs nginx + php-fpm + supervisor).

# ---------------- Stage 1: PHP vendor ----------------
FROM composer:2 AS vendor
WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \
    --no-dev \
    --no-scripts \
    --no-autoloader \
    --prefer-dist \
    --no-interaction \
    --no-progress

# ---------------- Stage 2: Frontend assets ----------------
FROM node:22-alpine AS frontend
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund
COPY vite.config.js tailwind.config.js* postcss.config.js* ./
COPY resources/ ./resources/
COPY public/ ./public/
RUN npm run build

# ---------------- Stage 3: Runtime ----------------
FROM dunglas/frankenphp:1-php8.4-alpine AS runtime

WORKDIR /app

# Install ekstensi PHP yang dibutuhkan SIMKOS
RUN install-php-extensions \
        pdo_pgsql \
        pgsql \
        gd \
        intl \
        zip \
        opcache \
        bcmath \
        sodium

# Strip file capabilities dari binary frankenphp.
# Image dunglas/frankenphp set cap_net_bind_service supaya bisa bind port < 1024,
# tapi setcap binary konflik saat dijalankan oleh user non-root (USER 1000) di Render
# → kernel reject exec dengan "Operation not permitted".
# Karena kita pakai port 8080 (>1024), capability ini tidak dibutuhkan.
RUN apk add --no-cache --virtual .setcap-deps libcap \
    && setcap -r /usr/local/bin/frankenphp 2>/dev/null || true \
    && apk del .setcap-deps

# Copy composer binary dari vendor stage (lebih reliable daripada langsung dari composer:2
# karena path binary bisa berubah antar versi image).
COPY --from=vendor /usr/bin/composer /usr/local/bin/composer

# Copy aplikasi
COPY . .
COPY --from=vendor /app/vendor ./vendor
COPY --from=frontend /app/public/build ./public/build

# Re-generate optimized autoloader (sekarang full source code ada)
# Gunakan full path untuk menghindari masalah PATH di Alpine
RUN /usr/local/bin/composer dump-autoload --optimize --no-dev --classmap-authoritative \
    && rm /usr/local/bin/composer

# Buat directory yang dibutuhkan Laravel dan set permission
# FrankenPHP di Render harus jalan non-root, jadi semua dir harus writable
RUN mkdir -p storage/app/public \
        storage/framework/cache/data \
        storage/framework/sessions \
        storage/framework/testing \
        storage/framework/views \
        storage/logs \
        bootstrap/cache \
        /data/caddy \
        /config/caddy \
    && chown -R 1000:1000 /app storage bootstrap/cache /data/caddy /config/caddy \
    && chmod -R 775 storage bootstrap/cache

# Default untuk Laravel production
ENV APP_ENV=production \
    APP_DEBUG=false \
    LOG_CHANNEL=stderr \
    SESSION_SECURE_COOKIE=true

# Caddy listens on PORT env (Render sets it dynamically)
# Gunakan port tinggi agar tidak butuh CAP_NET_BIND_SERVICE
ENV SERVER_NAME=":8080"
EXPOSE 8080

COPY docker/Caddyfile /etc/caddy/Caddyfile
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
RUN chmod +x /usr/local/bin/entrypoint.sh

# Jalankan sebagai non-root user agar tidak butuh capabilities khusus.
# Render free tier tidak mengizinkan CAP_NET_BIND_SERVICE dll.
USER 1000

ENTRYPOINT ["entrypoint.sh"]
CMD ["frankenphp", "run", "--config", "/etc/caddy/Caddyfile"]
