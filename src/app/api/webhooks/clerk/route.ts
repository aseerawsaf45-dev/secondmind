/**
 * Clerk Webhook Handler
 * ─────────────────────
 * Listens for "user.created" events from Clerk and automatically provisions
 * a dedicated Neon database branch for each new user.
 *
 * Setup required in Clerk Dashboard:
 *   1. Go to Webhooks → Add Endpoint
 *   2. URL: https://your-domain.com/api/webhooks/clerk
 *   3. Events: check "user.created"
 *   4. Copy the Signing Secret → add as CLERK_WEBHOOK_SECRET in .env.local
 */

import { NextRequest, NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createBranchForUser, getBranchUrl } from '@/lib/neon-branch';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  if (!webhookSecret) {
    console.error('[clerk-webhook] CLERK_WEBHOOK_SECRET is not set.');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  // ── Verify webhook signature ─────────────────────────────────────────────
  const svixId        = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers' }, { status: 400 });
  }

  const body = await req.text();

  let event: any;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    });
  } catch (err) {
    console.error('[clerk-webhook] Signature verification failed:', err);
    return NextResponse.json({ error: 'Invalid signature' }, { status: 401 });
  }

  // ── Handle user.created ──────────────────────────────────────────────────
  if (event.type === 'user.created') {
    const userId: string = event.data.id;
    const email: string =
      event.data.email_addresses?.[0]?.email_address ?? `${userId}@unknown.user`;

    console.log(`[clerk-webhook] New user created: ${userId} (${email})`);

    try {
      // Idempotency: skip if branch was already provisioned
      const existing = await getBranchUrl(userId);
      if (existing) {
        console.log(`[clerk-webhook] Branch already exists for ${userId}, skipping.`);
        return NextResponse.json({ ok: true, status: 'already_provisioned' });
      }

      await createBranchForUser(userId, email);
      console.log(`[clerk-webhook] Branch provisioned for ${userId}`);

      return NextResponse.json({ ok: true, status: 'branch_created' });
    } catch (err) {
      console.error(`[clerk-webhook] Failed to provision branch for ${userId}:`, err);
      // Return 200 so Clerk doesn't retry (provisioning will happen lazily on first use)
      return NextResponse.json({ ok: false, status: 'provision_failed', error: String(err) });
    }
  }

  // Acknowledge other event types
  return NextResponse.json({ ok: true, status: 'ignored' });
}
