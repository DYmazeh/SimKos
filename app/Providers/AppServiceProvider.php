<?php

namespace App\Providers;

use App\Listeners\LogSuccessfulLogin;
use App\Models\Komplain;
use App\Models\Pembayaran;
use App\Models\Penyewa;
use App\Models\Tagihan;
use App\Observers\PenyewaObserver;
use App\Observers\SidebarCountsInvalidator;
use Illuminate\Auth\Events\Login;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Event;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use App\Mail\Transport\GmailApiTransport;
use Symfony\Component\Mailer\Bridge\Brevo\Transport\BrevoApiTransport;
use Symfony\Component\Mailer\Bridge\Sendgrid\Transport\SendgridApiTransport;
use Symfony\Component\HttpClient\HttpClient;

class AppServiceProvider extends ServiceProvider
{
    /**
     * Register any application services.
     */
    public function register(): void
    {
        //
    }

    /**
     * Bootstrap any application services.
     */
    public function boot(): void
    {
        // FR-006: Log login activity
        Event::listen(Login::class, LogSuccessfulLogin::class);

        // Brevo HTTP API mailer (port 443) — workaround Render free tier
        // yang block outbound SMTP. Mapped ke MAIL_MAILER=brevo + BREVO_API_KEY.
        Mail::extend('brevo', function (array $config) {
            return new BrevoApiTransport(
                (string) ($config['key'] ?? ''),
                HttpClient::create(),
            );
        });

        // SendGrid HTTP API mailer (port 443) — alternatif Brevo tanpa
        // manual activation. Mapped ke MAIL_MAILER=sendgrid + SENDGRID_API_KEY.
        Mail::extend('sendgrid', function (array $config) {
            return new SendgridApiTransport(
                (string) ($config['key'] ?? ''),
                HttpClient::create(),
            );
        });

        // Gmail API via OAuth2 (port 443) — paling resmi Google, gratis,
        // bypass SMTP. Mapped ke MAIL_MAILER=gmail.
        // Kredensial dari config services.google (GOOGLE_CLIENT_ID/SECRET/REFRESH_TOKEN).
        Mail::extend('gmail', function () {
            return new GmailApiTransport(
                (string) config('services.google.client_id'),
                (string) config('services.google.client_secret'),
                (string) config('services.google.refresh_token'),
                HttpClient::create(),
            );
        });

        // FR-012 + FR-021: Auto-expire sewa & kontrak reminder (run daily)
        $this->app->booted(function () {
            /** @var Schedule $schedule */
            $schedule = $this->app->make(Schedule::class);
            $schedule->command('sewa:update-expired')->daily();
        });

        // Cache invalidation untuk sidebar_counts saat data-source berubah.
        Tagihan::observe(SidebarCountsInvalidator::class);
        Pembayaran::observe(SidebarCountsInvalidator::class);
        Komplain::observe(SidebarCountsInvalidator::class);

        // Cleanup orphan tagihan saat penyewa nonaktif/dihapus + invalidate
        // cache sidebar. Lihat App\Observers\PenyewaObserver untuk detail.
        Penyewa::observe(PenyewaObserver::class);

        // Rate limit: upload bukti transfer max 5 per menit per user (anti-spam).
        // Sertakan header Retry-After (RFC 6585) supaya client tahu kapan boleh retry.
        RateLimiter::for('upload-bukti', fn (Request $request) =>
            Limit::perMinute(5)->by($request->user()?->id ?: $request->ip())
                ->response(function (Request $request, array $headers) {
                    $retryAfter = $headers['Retry-After'] ?? 60;
                    return response()->json([
                        'message' => "Terlalu banyak upload. Coba lagi dalam {$retryAfter} detik.",
                        'retry_after' => (int) $retryAfter,
                    ], 429, $headers);
                })
        );
    }
}

