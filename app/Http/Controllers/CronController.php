<?php

namespace App\Http\Controllers;

use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Log;

/**
 * Webhook untuk trigger Laravel scheduler dari external pinger.
 *
 * Render free tier tidak support cron, jadi kita pakai pendekatan webhook:
 * external service (UptimeRobot / cron-job.org) ping endpoint ini tiap 1–5 menit
 * dengan token rahasia, lalu kita panggil `schedule:run` internally.
 *
 * Setup di Render dashboard → Environment:
 *   SIMKOS_CRON_TOKEN=<random-string>
 *
 * Setup di UptimeRobot:
 *   - Monitor type: HTTP(s)
 *   - URL: https://<your-app>.onrender.com/cron/run?token=<your-token>
 *   - Interval: 5 menit (free tier)
 */
class CronController extends Controller
{
    public function run(Request $request): JsonResponse
    {
        $expected = (string) config('simkos.cron_token');
        $provided = (string) ($request->query('token') ?? $request->header('X-Cron-Token', ''));

        if ($expected === '' || ! hash_equals($expected, $provided)) {
            abort(403, 'Invalid cron token');
        }

        Artisan::call('schedule:run');
        $output = trim(Artisan::output());

        Log::info('cron.run executed', ['output' => $output]);

        return response()->json([
            'ok' => true,
            'ts' => now()->toIso8601String(),
            'output' => $output ?: 'no due tasks',
        ]);
    }
}
