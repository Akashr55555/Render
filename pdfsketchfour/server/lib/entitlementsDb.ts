/**
 * server/lib/entitlementsDb.ts
 * ----------------------------
 * Server-side source of truth for premium entitlements.
 *
 * Why this exists: before this change, `isPremium` only ever lived in
 * client state (see the removed fast-path in App.tsx) and there was no
 * payment provider at all — so "Premium" was cosmetic. Real premium
 * gating has to be checked on the SERVER, from a record that only a
 * verified Stripe webhook can write. This file is that record.
 *
 * Storage: a single-file SQLite database (better-sqlite3 — synchronous,
 * zero network dependency, no extra infra to stand up). This is a
 * legitimate, common choice for a single-instance Node deployment.
 * If PDFSketch later runs multiple server instances behind a load
 * balancer, swap this module's internals for Postgres/MySQL — the
 * function signatures below are the contract the rest of the app
 * relies on, so callers (billing.ts, requireEntitlement middleware)
 * don't need to change.
 */
import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';

const DATA_DIR = path.join(process.cwd(), 'data');
fs.mkdirSync(DATA_DIR, { recursive: true });

const db = new Database(path.join(DATA_DIR, 'entitlements.sqlite3'));
db.pragma('journal_mode = WAL');

db.exec(`
  CREATE TABLE IF NOT EXISTS entitlements (
    uid TEXT PRIMARY KEY,
    email TEXT,
    plan TEXT NOT NULL DEFAULT 'free',        -- 'free' | 'monthly' | 'annual'
    status TEXT NOT NULL DEFAULT 'inactive',  -- 'active' | 'past_due' | 'canceled' | 'inactive'
    stripe_customer_id TEXT,
    stripe_subscription_id TEXT,
    current_period_end INTEGER,               -- unix seconds
    updated_at INTEGER NOT NULL
  );

  CREATE INDEX IF NOT EXISTS idx_entitlements_customer
    ON entitlements (stripe_customer_id);
`);

export interface Entitlement {
  uid: string;
  email: string | null;
  plan: 'free' | 'monthly' | 'annual';
  status: 'active' | 'past_due' | 'canceled' | 'inactive';
  stripeCustomerId: string | null;
  stripeSubscriptionId: string | null;
  currentPeriodEnd: number | null;
  updatedAt: number;
}

function rowToEntitlement(row: any): Entitlement {
  return {
    uid: row.uid,
    email: row.email,
    plan: row.plan,
    status: row.status,
    stripeCustomerId: row.stripe_customer_id,
    stripeSubscriptionId: row.stripe_subscription_id,
    currentPeriodEnd: row.current_period_end,
    updatedAt: row.updated_at,
  };
}

export function getEntitlement(uid: string): Entitlement {
  const row = db.prepare('SELECT * FROM entitlements WHERE uid = ?').get(uid);
  if (!row) {
    return {
      uid, email: null, plan: 'free', status: 'inactive',
      stripeCustomerId: null, stripeSubscriptionId: null,
      currentPeriodEnd: null, updatedAt: 0,
    };
  }
  return rowToEntitlement(row);
}

export function getEntitlementByCustomerId(customerId: string): Entitlement | null {
  const row = db.prepare('SELECT * FROM entitlements WHERE stripe_customer_id = ?').get(customerId);
  return row ? rowToEntitlement(row) : null;
}

/** Ensures a row exists and links it to a Stripe customer (called right before checkout). */
export function linkStripeCustomer(uid: string, email: string, customerId: string): void {
  db.prepare(`
    INSERT INTO entitlements (uid, email, plan, status, stripe_customer_id, updated_at)
    VALUES (@uid, @email, 'free', 'inactive', @customerId, @now)
    ON CONFLICT(uid) DO UPDATE SET
      email = @email,
      stripe_customer_id = @customerId,
      updated_at = @now
  `).run({ uid, email, customerId, now: Date.now() });
}

/** Called from the Stripe webhook once a subscription is created/updated/canceled. */
export function upsertSubscriptionByCustomerId(params: {
  customerId: string;
  subscriptionId: string;
  plan: 'monthly' | 'annual';
  status: Entitlement['status'];
  currentPeriodEnd: number | null;
}): void {
  const existing = getEntitlementByCustomerId(params.customerId);
  if (!existing) {
    // Webhook arrived before we could locally link uid<->customer (rare race);
    // store it keyed by customer id so /billing/status can still reconcile
    // once the frontend calls it, matching on stripe_customer_id.
    console.warn('[billing] webhook for unknown customer, no uid link yet:', params.customerId);
    return;
  }
  db.prepare(`
    UPDATE entitlements SET
      plan = @plan,
      status = @status,
      stripe_subscription_id = @subscriptionId,
      current_period_end = @currentPeriodEnd,
      updated_at = @now
    WHERE stripe_customer_id = @customerId
  `).run({
    plan: params.plan,
    status: params.status,
    subscriptionId: params.subscriptionId,
    currentPeriodEnd: params.currentPeriodEnd,
    now: Date.now(),
    customerId: params.customerId,
  });
}

export function isPremiumActive(ent: Entitlement): boolean {
  return ent.status === 'active' && ent.plan !== 'free';
}

export default db;
