<?php

/**
 * Sentry Laravel config. Aktif kalau SENTRY_LARAVEL_DSN ada di .env.
 *
 * Setup:
 * 1. Buat project di sentry.io (free tier 5k events/month).
 * 2. Copy DSN ke .env: SENTRY_LARAVEL_DSN=https://...@sentry.io/...
 * 3. Composer install -> auto-discover service provider.
 * 4. Run: php artisan sentry:test untuk verify.
 */
return [
    'dsn' => env('SENTRY_LARAVEL_DSN'),

    // Sampling rate untuk error events. 1.0 = capture semua.
    'sample_rate' => env('SENTRY_SAMPLE_RATE', 1.0),

    // Performance tracing (slower, optional). 0.0 = off.
    'traces_sample_rate' => env('SENTRY_TRACES_SAMPLE_RATE', 0.1),

    // Profiling (slower lagi, optional)
    'profiles_sample_rate' => env('SENTRY_PROFILES_SAMPLE_RATE', 0.0),

    // Send default PII (user info, IP) — turn ON kalau user consent.
    'send_default_pii' => env('SENTRY_SEND_DEFAULT_PII', false),

    // Environment tag — production / staging / local.
    'environment' => env('APP_ENV', 'production'),

    // Release versioning (commit SHA / app version).
    'release' => env('SENTRY_RELEASE'),

    // Ignore exception types yang gak perlu di-track.
    'ignore_exceptions' => [
        \Symfony\Component\HttpKernel\Exception\HttpException::class,
        \Illuminate\Auth\AuthenticationException::class,
        \Illuminate\Auth\Access\AuthorizationException::class,
        \Illuminate\Validation\ValidationException::class,
        \Illuminate\Database\Eloquent\ModelNotFoundException::class,
        \Illuminate\Session\TokenMismatchException::class,
    ],

    // Breadcrumbs untuk context kaya saat error.
    'breadcrumbs' => [
        'logs' => true,
        'cache' => false,
        'sql_queries' => true,
        'sql_bindings' => false,  // PII-sensitive, off
        'queue_info' => true,
        'command_info' => true,
    ],

    // Performance monitoring config
    'tracing' => [
        'queue_job_transactions' => env('SENTRY_TRACE_QUEUE_ENABLED', false),
        'queue_jobs' => env('SENTRY_TRACE_QUEUE_JOBS_ENABLED', false),
        'sql_queries' => env('SENTRY_TRACE_SQL_QUERIES_ENABLED', true),
        'redis_commands' => env('SENTRY_TRACE_REDIS_COMMANDS', false),
        'http_client_requests' => env('SENTRY_TRACE_HTTP_CLIENT_REQUESTS_ENABLED', true),
        'views' => env('SENTRY_TRACE_VIEWS_ENABLED', true),
    ],
];
