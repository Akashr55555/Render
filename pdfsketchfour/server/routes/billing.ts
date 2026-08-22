/**
 * server/routes/billing.ts
 * -------------------------
 * Real Stripe Checkout + Billing Portal + entitlement status.
 *
 * Every route here requires a verified Firebase session (requireAuth)
 * so a checkout session can only ever be created for the actual
 * signed-in user — never trusting a uid/email the client just sends
 * in the request body.
 *
 * This does NOT grant premium directly. Checkout only redirects the
 * user to Stripe; premium is granted exclusively by the webhook
 * handler (billingWebhook.ts) after Stripe confirms payment. That
 * separation is what makes entitlements trustworthy.
 */
import express, { Response } from 'express';
import Stripe from 'stripe';
import { requireAuth, AuthedRequest } from '../lib/firebaseAdmin';
import { getEntitlement, linkStripeCustomer, isPremiumActive } from '../lib/entitlementsDb';

const router = express.Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured on the server');
  return new Stripe(key);
}

const PRICE_IDS: Record<'monthly' | 'annual', string | undefined> = {
  monthly: process.env.STRIPE_PRICE_MONTHLY,
  annual: process.env.STRIPE_PRICE_ANNUAL,
};

router.use(requireAuth);

/** Current, server-verified entitlement for the signed-in user. */
router.get('/status', (req: AuthedRequest, res: Response) => {
  const ent = getEntitlement(req.uid!);
  res.json({
    plan: ent.plan,
    status: ent.status,
    isPremium: isPremiumActive(ent),
    currentPeriodEnd: ent.currentPeriodEnd,
  });
});

/** Starts a Stripe Checkout session for the requested plan. */
router.post('/create-checkout-session', async (req: AuthedRequest, res: Response) => {
  try {
    const plan = req.body?.plan as 'monthly' | 'annual';
    if (plan !== 'monthly' && plan !== 'annual') {
      return res.status(400).json({ error: "plan must be 'monthly' or 'annual'" });
    }
    const priceId = PRICE_IDS[plan];
    if (!priceId) {
      return res.status(503).json({
        error: `Checkout is not configured yet for the ${plan} plan (missing Stripe price ID).`,
      });
    }

    const stripe = getStripe();
    const uid = req.uid!;
    const email = req.userEmail || undefined;

    const existing = getEntitlement(uid);
    let customerId = existing.stripeCustomerId || undefined;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email,
        metadata: { firebase_uid: uid },
      });
      customerId = customer.id;
      linkStripeCustomer(uid, email || '', customerId);
    }

    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer: customerId,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${appUrl}/?checkout=success`,
      cancel_url: `${appUrl}/?checkout=cancel`,
      client_reference_id: uid,
      subscription_data: {
        metadata: { firebase_uid: uid },
      },
      allow_promotion_codes: true,
    });

    res.json({ url: session.url });
  } catch (e: any) {
    console.error('[billing] create-checkout-session failed', e);
    res.status(500).json({ error: 'Could not start checkout. Please try again.' });
  }
});

/** Lets an existing subscriber manage/cancel billing via Stripe's hosted portal. */
router.post('/create-portal-session', async (req: AuthedRequest, res: Response) => {
  try {
    const ent = getEntitlement(req.uid!);
    if (!ent.stripeCustomerId) {
      return res.status(400).json({ error: 'No billing account found for this user yet.' });
    }
    const stripe = getStripe();
    const appUrl = process.env.APP_URL || 'http://localhost:3000';
    const session = await stripe.billingPortal.sessions.create({
      customer: ent.stripeCustomerId,
      return_url: `${appUrl}/`,
    });
    res.json({ url: session.url });
  } catch (e: any) {
    console.error('[billing] create-portal-session failed', e);
    res.status(500).json({ error: 'Could not open billing portal. Please try again.' });
  }
});

export default router;
