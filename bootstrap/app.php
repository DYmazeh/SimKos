<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\URL;
use Inertia\Inertia;
use Spatie\Permission\Middleware\PermissionMiddleware;
use Spatie\Permission\Middleware\RoleMiddleware;
use Spatie\Permission\Middleware\RoleOrPermissionMiddleware;
use Symfony\Component\HttpFoundation\Response;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->web(append: [
            \App\Http\Middleware\HandleInertiaRequests::class,
        ]);

        $middleware->alias([
            'role' => RoleMiddleware::class,
            'permission' => PermissionMiddleware::class,
            'role_or_permission' => RoleOrPermissionMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        // Render branded Inertia error pages untuk 403/404/419/500/503.
        // Di local/testing biarkan default Laravel error page biar lebih informatif.
        $exceptions->respond(function (Response $response, \Throwable $exception, Request $request) {
            // Saat debug aktif (APP_DEBUG=true) atau di local/testing, biarkan
            // default Laravel exception renderer jalan supaya stack trace lengkap
            // ke-expose untuk troubleshooting. Branded Inertia Error page hanya
            // aktif di production dengan debug=false.
            if (config('app.debug') || app()->environment(['local', 'testing'])) {
                return $response;
            }
            $status = $response->getStatusCode();
            if (in_array($status, [403, 404, 419, 500, 503], true)) {
                return Inertia::render('Error', ['status' => $status])
                    ->toResponse($request)
                    ->setStatusCode($status);
            }
            return $response;
        });
    })
    ->booted(function () {
        if (app()->environment('production')) {
            URL::forceScheme('https');
        }
    })
    ->create();
