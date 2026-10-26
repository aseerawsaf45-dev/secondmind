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
import { deleteUserData } from '@/lib/user-db';

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.CLERK_WEBHOOK_SECRET;

  const correlationId = crypto.randomUUID();

  if (!webhookSecret) {
    console.error(`[clerk-webhook][${correlationId}] CLERK_WEBHOOK_SECRET is not set.`);
    return NextResponse.json({ error: 'Server misconfiguration', correlationId }, { status: 500 });
  }

  // ── Verify webhook signature ─────────────────────────────────────────────
  const svixId        = req.headers.get('svix-id');
  const svixTimestamp = req.headers.get('svix-timestamp');
  const svixSignature = req.headers.get('svix-signature');

  if (!svixId || !svixTimestamp || !svixSignature) {
    return NextResponse.json({ error: 'Missing svix headers', correlationId }, { status: 400 });
  }

  const body = await req.text();

  interface ClerkWebhookEvent {
    type: string;
    data: {
      id: string;
      email_addresses?: Array<{ email_address: string }>;
    };
  }

  let event: ClerkWebhookEvent;
  try {
    const wh = new Webhook(webhookSecret);
    event = wh.verify(body, {
      'svix-id':        svixId,
      'svix-timestamp': svixTimestamp,
      'svix-signature': svixSignature,
    }) as ClerkWebhookEvent;
  } catch (err) {
    console.error(`[clerk-webhook][${correlationId}] Signature verification failed:`, err);
    return NextResponse.json({ error: 'Invalid signature', correlationId }, { status: 401 });
  }

  // ── Handle user.created ──────────────────────────────────────────────────
  if (event.type === 'user.created') {
    const userId: string = event.data.id;
    console.log(`[clerk-webhook] User registered and ready: ${userId}`);
    return NextResponse.json({ ok: true, status: 'user_registered' });
  }

  // ── Handle user.deleted (Data Deletion Compliance) ───────────────────────
  if (event.type === 'user.deleted') {
    const userId: string = event.data.id;
    console.log(`[clerk-webhook] User deletion requested for: ${userId}`);

    try {
      await deleteUserData(userId);
      console.log(`[clerk-webhook] Cleaned up all user data for ${userId}`);
      return NextResponse.json({ ok: true, status: 'user_data_deleted' });
    } catch (err) {
      console.error(`[clerk-webhook] Error deleting user data for ${userId}:`, err);
      return NextResponse.json({ ok: false, status: 'deletion_failed' });
    }
  }

  // Acknowledge other event types
  return NextResponse.json({ ok: true, status: 'ignored' });
}

