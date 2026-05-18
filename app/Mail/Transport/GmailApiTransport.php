<?php

namespace App\Mail\Transport;

use Symfony\Component\Mailer\Envelope;
use Symfony\Component\Mailer\Exception\TransportException;
use Symfony\Component\Mailer\SentMessage;
use Symfony\Component\Mailer\Transport\AbstractTransport;
use Symfony\Component\Mime\Message;
use Symfony\Component\Mime\RawMessage;
use Symfony\Contracts\HttpClient\HttpClientInterface;

/**
 * Symfony Mailer transport untuk Gmail API via OAuth2.
 *
 * Workflow: refresh_token (long-lived) → exchange untuk access_token (1 jam) →
 * POST raw RFC822 message (base64url) ke gmail.googleapis.com/.../send.
 *
 * Pakai HTTP API (port 443) → Render-friendly, bypass SMTP blocking.
 */
class GmailApiTransport extends AbstractTransport
{
    private ?string $cachedAccessToken = null;
    private int $tokenExpiresAt = 0;

    public function __construct(
        private string $clientId,
        private string $clientSecret,
        private string $refreshToken,
        private HttpClientInterface $client,
    ) {
        parent::__construct();
    }

    public function __toString(): string
    {
        return 'gmail+api://';
    }

    protected function doSend(SentMessage $message): void
    {
        $accessToken = $this->getAccessToken();

        // Encode raw RFC822 message ke base64url (Gmail API spec).
        $raw = rtrim(strtr(base64_encode($message->toString()), '+/', '-_'), '=');

        $response = $this->client->request(
            'POST',
            'https://gmail.googleapis.com/gmail/v1/users/me/messages/send',
            [
                'auth_bearer' => $accessToken,
                'json' => ['raw' => $raw],
                'timeout' => 30,
            ]
        );

        $status = $response->getStatusCode();
        if ($status < 200 || $status >= 300) {
            $body = $response->getContent(false);
            throw new TransportException("Gmail API send failed (HTTP {$status}): {$body}");
        }
    }

    private function getAccessToken(): string
    {
        if ($this->cachedAccessToken && time() < $this->tokenExpiresAt - 30) {
            return $this->cachedAccessToken;
        }

        $response = $this->client->request('POST', 'https://oauth2.googleapis.com/token', [
            'body' => [
                'client_id' => $this->clientId,
                'client_secret' => $this->clientSecret,
                'refresh_token' => $this->refreshToken,
                'grant_type' => 'refresh_token',
            ],
            'timeout' => 30,
        ]);

        $status = $response->getStatusCode();
        if ($status !== 200) {
            $body = $response->getContent(false);
            throw new TransportException("Gmail OAuth refresh failed (HTTP {$status}): {$body}");
        }

        $data = $response->toArray();
        $this->cachedAccessToken = $data['access_token'] ?? throw new TransportException('Gmail OAuth response missing access_token');
        $this->tokenExpiresAt = time() + (int) ($data['expires_in'] ?? 3600);

        return $this->cachedAccessToken;
    }
}
