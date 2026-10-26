import { test, describe } from 'node:test';
import assert from 'node:assert/strict';
import { isYouTubeUrl } from '../src/lib/youtube';
import { isFacebookUrl } from '../src/lib/facebook';
import { isTwitterUrl } from '../src/lib/twitter';

describe('Security Hardening & Vulnerability Regression Suite', () => {

  describe('SSRF & Domain Spoofing Prevention', () => {
    test('isYouTubeUrl strictly validates YouTube domains and blocks path/subdomain spoofing', () => {
      // Legitimate URLs
      assert.equal(isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ'), true);
      assert.equal(isYouTubeUrl('https://youtu.be/dQw4w9WgXcQ'), true);
      assert.equal(isYouTubeUrl('https://m.youtube.com/shorts/dQw4w9WgXcQ'), true);

      // Malicious / Spoofed URLs
      assert.equal(isYouTubeUrl('https://attacker.com/youtube.com'), false);
      assert.equal(isYouTubeUrl('https://youtube.com.attacker.com/video'), false);
      assert.equal(isYouTubeUrl('https://attacker.com?url=https://youtube.com'), false);
      assert.equal(isYouTubeUrl('https://evil-youtu.be/exploit'), false);
    });

    test('isFacebookUrl strictly validates Meta domains and blocks host spoofing', () => {
      // Legitimate URLs
      assert.equal(isFacebookUrl('https://www.facebook.com/reel/123456789'), true);
      assert.equal(isFacebookUrl('https://fb.watch/xyz123'), true);
      assert.equal(isFacebookUrl('https://m.facebook.com/groups/tech'), true);

      // Malicious / Spoofed URLs
      assert.equal(isFacebookUrl('https://facebook.com.evil.com/phishing'), false);
      assert.equal(isFacebookUrl('https://evil.com/facebook.com'), false);
      assert.equal(isFacebookUrl('https://fake-fb.watch/redirect'), false);
      assert.equal(isFacebookUrl('http://169.254.169.254/facebook.com'), false);
    });

    test('isTwitterUrl strictly validates X/Twitter domains and blocks path injection', () => {
      // Legitimate URLs
      assert.equal(isTwitterUrl('https://x.com/username/status/123456789'), true);
      assert.equal(isTwitterUrl('https://twitter.com/username/status/123456789'), true);
      assert.equal(isTwitterUrl('https://mobile.twitter.com/i/spaces/123'), true);

      // Malicious / Spoofed URLs
      assert.equal(isTwitterUrl('https://x.com.attacker.com/payload'), false);
      assert.equal(isTwitterUrl('https://attacker.com/x.com/status/123'), false);
      assert.equal(isTwitterUrl('https://twitter.com.attacker.org'), false);
      assert.equal(isTwitterUrl('http://127.0.0.1/x.com'), false);
    });
  });

  describe('Webhook Svix Security Guardrails', () => {
    test('Clerk webhook route enforces svix signature verification headers', async () => {
      process.env.CLERK_WEBHOOK_SECRET = 'whsec_testsecret123';
      const { POST } = await import('../src/app/api/webhooks/clerk/route');
      const dummyReq = new Request('http://localhost:3000/api/webhooks/clerk', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ type: 'user.deleted', data: { id: 'victim-user-id' } }),
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const response = await POST(dummyReq as any);
      // Missing svix headers must be rejected immediately with 400 Bad Request
      assert.equal(response.status, 400);
      const json = await response.json();
      assert.equal(json.error, 'Missing svix headers');
    });
  });

  describe('SSRF IP Sanitization & Cloud Metadata Protection', () => {
    test('extract route blocks private IP spaces, cloud metadata, and internal TLDs', async () => {
      const { POST } = await import('../src/app/api/extract/route');

      const forbiddenUrls = [
        'http://169.254.169.254/latest/meta-data/',
        'http://metadata.google.internal/computeMetadata/v1/',
        'http://127.0.0.1:3000/api/admin',
        'http://localhost:8080/secret',
        'http://10.0.0.1/admin',
        'http://172.16.0.1/internal',
        'http://192.168.1.1/router',
        'http://service.internal/debug',
        'http://app.local/env',
        'http://2130706433', // Decimal representation of 127.0.0.1
        'http://example.com:22', // Non-standard SSH port
        'http://example.com:6379', // Redis port
      ];

      for (const forbiddenUrl of forbiddenUrls) {
        const req = new Request('http://localhost:3000/api/extract', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ url: forbiddenUrl }),
        });

        const res = await POST(req);
        assert.equal(
          res.status,
          400,
          `Expected ${forbiddenUrl} to be rejected with 400 status, got ${res.status}`
        );
        const json = await res.json();
        assert.equal(json.error, 'Invalid or restricted URL provided.');
      }
    });
  });

});
