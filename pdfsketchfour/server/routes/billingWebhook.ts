/**
 * server/routes/billingWebhook.ts
 * ---------------------------------
 * The ONLY code path in the whole app allowed to grant premium.
 *
 * Must be mounted with `express.raw({ type: 'application/json' })`
 * and BEFORE the global `express.json()` body parser in server.ts —
 * Stripe signs the *raw* request body, so if it's already been
 * parsed into an object by the time it gets here, signature
 * verification will fail. See server.ts for the mount order.
 */
import express, { Request, Response } from 'express';
import Stripe from 'stripe';
import { upsertSubscriptionByCustomerId } from '../lib/entitlementsDb';

const router = express.Router();

function getStripe(): Stripe {
  const key = process.env.STRIPE_SECRET_KEY;
  if (!key) throw new Error('STRIPE_SECRET_KEY is not configured on the server');
  return new Stripe(key);
}

function planFromPriceId(priceId: string): 'monthly' | 'annual' {
  if (priceId === process.env.STRIPE_PRICE_ANNUAL) return 'annual';
  return 'monthly';
}

router.post('/', async (req: Request, res: Response) => {
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    console.error('[billing webhook] STRIPE_WEBHOOK_SECRET not configured; rejecting event');
    return res.status(503).send('Webhook not configured');
  }

  const signature = req.headers['stripe-signature'];
  let event: Stripe.Event;
  try {
    const stripe = getStripe();
    event = stripe.webhooks.constructEvent(req.body, signature as string, webhookSecret);
  } catch (e: any) {
    console.error('[billing webhook] signature verification failed', e.message);
    return res.status(400).send(`Webhook signature verification failed: ${e.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session;
        if (session.mode === 'subscription' && session.subscription && session.customer) {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(session.subscription as string);
          const priceId = subscription.items.data[0]?.price.id || '';
          upsertSubscriptionByCustomerId({
            customerId: session.customer as string,
            subscriptionId: subscription.id,
            plan: planFromPriceId(priceId),
            status: subscription.status === 'active' ? 'active' : 'inactive',
            currentPeriodEnd: (subscription as any).current_period_end ?? null,
          });
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.created': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id || '';
        const status = subscription.status === 'active' || subscription.status === 'trialing'
          ? 'active'
          : subscription.status === 'past_due'
          ? 'past_due'
          : 'canceled';
        upsertSubscriptionByCustomerId({
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
          plan: planFromPriceId(priceId),
          status,
          currentPeriodEnd: (subscription as any).current_period_end ?? null,
        });
        break;
      }

      case 'customer.subscription.deleted': {
        const subscription = event.data.object as Stripe.Subscription;
        const priceId = subscription.items.data[0]?.price.id || '';
        upsertSubscriptionByCustomerId({
          customerId: subscription.customer as string,
          subscriptionId: subscription.id,
          plan: planFromPriceId(priceId),
          status: 'canceled',
          currentPeriodEnd: (subscription as any).current_period_end ?? null,
        });
        break;
      }

      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice;
        if (invoice.customer && invoice.subscription) {
          const stripe = getStripe();
          const subscription = await stripe.subscriptions.retrieve(invoice.subscription as string);
          const priceId = subscription.items.data[0]?.price.id || '';
          upsertSubscriptionByCustomerId({
            customerId: invoice.customer as string,
            subscriptionId: subscription.id,
            plan: planFromPriceId(priceId),
            status: 'past_due',
            currentPeriodEnd: (subscription as any).current_period_end ?? null,
          });
        }
        break;
      }

      default:
        // Unhandled event types are fine to ignore.
        break;
    }
    res.json({ received: true });
  } catch (e: any) {
    console.error('[billing webhook] handler failed', e);
    // Return 500 so Stripe retries — we want failed handling to be retried,
    // not silently dropped.
    res.status(500).send('Webhook handler failed');
  }
});

export default router;
