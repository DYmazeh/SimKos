<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Http\Response;
use Symfony\Component\HttpClient\HttpClient;

/**
 * One-time OAuth2 flow untuk dapat refresh_token Gmail API.
 *
 * Flow:
 * 1. Admin visit /auth/google/setup?token=<SETUP_TOKEN>
 * 2. Redirect ke Google consent screen
 * 3. Google redirect balik ke /auth/google/callback dgn ?code=...
 * 4. Exchange code → refresh_token, tampilkan ke admin utk di-tempel
 *    ke Render env (GOOGLE_REFRESH_TOKEN).
 *
 * Endpoint ini di-protect dgn token rahasia (SIMKOS_OAUTH_SETUP_TOKEN)
 * supaya bukan public. Sekali setup, refresh token disimpan di env Render.
 */
class GoogleOAuthSetupController extends Controller
{
    private const SCOPE = 'https://www.googleapis.com/auth/gmail.send';

    public function redirect(Request $request): RedirectResponse
    {
        $this->authorize($request);

        $params = http_build_query([
            'client_id' => (string) config('services.google.client_id'),
            'redirect_uri' => route('google.oauth.callback'),
            'scope' => self::SCOPE,
            'response_type' => 'code',
            'access_type' => 'offline',
            'prompt' => 'consent', // wajib utk force refresh_token muncul setiap kali
            'include_granted_scopes' => 'true',
        ]);

        return redirect("https://accounts.google.com/o/oauth2/v2/auth?{$params}");
    }

    public function callback(Request $request): Response
    {
        $this->authorize($request);

        if ($error = $request->query('error')) {
            return response("OAuth error: {$error}", 400);
        }

        $code = (string) $request->query('code');
        if ($code === '') {
            return response('Missing authorization code', 400);
        }

        $client = HttpClient::create();
        $response = $client->request('POST', 'https://oauth2.googleapis.com/token', [
            'body' => [
                'client_id' => (string) config('services.google.client_id'),
                'client_secret' => (string) config('services.google.client_secret'),
                'code' => $code,
                'grant_type' => 'authorization_code',
                'redirect_uri' => route('google.oauth.callback'),
            ],
            'timeout' => 30,
        ]);

        $status = $response->getStatusCode();
        $data = $response->toArray(false);

        if ($status !== 200) {
            return response('Token exchange failed: '.json_encode($data), 500);
        }

        $refreshToken = $data['refresh_token'] ?? null;
        if (! $refreshToken) {
            return response(
                "Google tidak return refresh_token. Solusi: revoke akses di https://myaccount.google.com/permissions, "
                ."lalu setup ulang dgn ?prompt=consent. Data response: ".json_encode($data),
                500
            );
        }

        $html = '<!DOCTYPE html><html><head><title>Gmail OAuth Setup · SIMKOS</title>'
            .'<style>body{font-family:system-ui;max-width:720px;margin:40px auto;padding:0 20px;line-height:1.6}'
            .'code{background:#f1f5f9;padding:2px 6px;border-radius:4px;font-size:13px}'
            .'pre{background:#0f172a;color:#e2e8f0;padding:16px;border-radius:8px;overflow-x:auto;word-break:break-all;white-space:pre-wrap}'
            .'.warn{background:#fef3c7;border-left:4px solid #f59e0b;padding:12px;margin:16px 0;border-radius:4px}'
            .'</style></head><body>'
            .'<h1>✅ Refresh Token Berhasil Didapat</h1>'
            .'<p>Tempel string di bawah ke Render env sebagai <code>GOOGLE_REFRESH_TOKEN</code>:</p>'
            .'<pre>'.htmlspecialchars($refreshToken).'</pre>'
            .'<div class="warn"><strong>⚠️ Jaga rahasia.</strong> Refresh token = akses kirim email dari akun Gmail kamu '
            .'sampai di-revoke. Jangan share/commit ke git.</div>'
            .'<h2>Langkah selanjutnya:</h2>'
            .'<ol>'
            .'<li>Buka <a href="https://dashboard.render.com/" target="_blank">Render dashboard</a> → SIMKOS service → Environment</li>'
            .'<li>Add var: <code>GOOGLE_REFRESH_TOKEN</code> = paste string di atas</li>'
            .'<li>Add: <code>MAIL_MAILER=gmail</code></li>'
            .'<li>Add: <code>MAIL_FROM_ADDRESS=&lt;email Gmail kamu&gt;</code></li>'
            .'<li>Save Changes → Render restart ~2 menit</li>'
            .'<li>Test <code>/forgot-password</code></li>'
            .'</ol>'
            .'</body></html>';

        return response($html, 200, ['Content-Type' => 'text/html; charset=utf-8']);
    }

    private function authorize(Request $request): void
    {
        $expected = (string) config('simkos.oauth_setup_token');
        $provided = (string) $request->query('token', '');

        if ($expected === '' || ! hash_equals($expected, $provided)) {
            abort(403, 'Invalid setup token. Set SIMKOS_OAUTH_SETUP_TOKEN di env + ?token= di URL.');
        }
    }
}
