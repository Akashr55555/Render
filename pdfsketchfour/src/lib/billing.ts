/**
 * src/lib/billing.ts
 * -------------------
 * Thin client for the /api/billing/* endpoints. Every call attaches
 * the current Firebase ID token so the server can verify who's
 * actually asking (see server/lib/firebaseAdmin.ts) — the plan choice
 * itself is just a hint; the server decides prices from its own
 * STRIPE_PRICE_* config, never from anything the client sends beyond
 * which plan was picked.
 */
import { auth } from './firebase';

async function authedFetch(path: string, options: RequestInit = {}) {
  const user = auth.currentUser;
  if (!user) throw new Error('You need to be signed in first.');
  const token = await user.getIdToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      ...(options.headers || {}),
      Authorization: `Bearer ${token}`,
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
    },
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed');
  return data;
}

export interface EntitlementStatus {
  plan: 'free' | 'monthly' | 'annual';
  status: 'active' | 'past_due' | 'canceled' | 'inactive';
  isPremium: boolean;
  currentPeriodEnd: number | null;
}

export async function fetchEntitlementStatus(): Promise<EntitlementStatus> {
  return authedFetch('/api/billing/status');
}

export async function startCheckout(plan: 'monthly' | 'annual'): Promise<void> {
  const { url } = await authedFetch('/api/billing/create-checkout-session', {
    method: 'POST',
    body: JSON.stringify({ plan }),
  });
  if (url) window.location.href = url;
}

export async function openBillingPortal(): Promise<void> {
  const { url } = await authedFetch('/api/billing/create-portal-session', { method: 'POST' });
  if (url) window.location.href = url;
}
