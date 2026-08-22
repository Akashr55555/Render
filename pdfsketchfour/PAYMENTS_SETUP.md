# Enabling real payments (Stripe)

This build adds working Stripe Checkout, a billing portal, and
server-verified premium entitlements. Nothing is charged and no one
becomes "Premium" until you complete the steps below — until then the
Premium button will show a real error ("Checkout is not configured
yet…") instead of silently pretending to work.

## 1. Firebase Admin (server-side auth verification)

Payments require the server to know *for certain* who's asking, not
just trust what the browser claims. Firebase Console → Project
Settings → Service Accounts → **Generate new private key**. Set the
downloaded JSON file's full contents as `FIREBASE_SERVICE_ACCOUNT_JSON`.

## 2. Stripe account setup

1. Create a Stripe account (or use your existing one) and switch to
   **test mode** first.
2. **Products & Prices**: Product catalog → New product → add two
   recurring **Prices**: one monthly, one annual. Copy each Price ID
   (`price_...`) into `STRIPE_PRICE_MONTHLY` / `STRIPE_PRICE_ANNUAL`.
3. **API key**: Developers → API keys → copy the secret key into
   `STRIPE_SECRET_KEY`.
4. **Webhook**: Developers → Webhooks → Add endpoint →
   `https://yourdomain.com/api/billing/webhook`. Select events:
   `checkout.session.completed`, `customer.subscription.created`,
   `customer.subscription.updated`, `customer.subscription.deleted`,
   `invoice.payment_failed`. Copy the signing secret into
   `STRIPE_WEBHOOK_SECRET`.
5. Test locally with the Stripe CLI: `stripe listen --forward-to
   localhost:3000/api/billing/webhook` — it prints a webhook secret
   you can use for local dev.

## 3. Try it end-to-end (test mode)

1. Set all the env vars above, `npm install`, `npm run dev`.
2. Sign in, click **Get Premium**, choose a plan → you're redirected
   to a real Stripe Checkout page.
3. Use Stripe's test card `4242 4242 4242 4242`, any future expiry,
   any CVC.
4. You're redirected back with `?checkout=success`; the app polls
   `/api/billing/status` and the Premium badge appears once the
   webhook has landed (usually under a second).
5. Open the account menu → **Manage billing** to reach the Stripe
   Billing Portal (cancel, update card, view invoices).

## 4. Go live

Switch your Stripe dashboard out of test mode, repeat steps 2–4 with
live keys/prices/webhook, and update the env vars in production.

## Architecture notes (why it's built this way)

- **Entitlements live in SQLite** (`server/lib/entitlementsDb.ts`),
  not in the browser or in a JWT claim. Only the Stripe webhook
  handler is allowed to write to it. This is what makes "Premium"
  actually mean something — a user editing their own browser state
  can't grant themselves access.
- If you deploy multiple server instances behind a load balancer,
  swap the internals of `entitlementsDb.ts` for a real networked
  database (Postgres is the natural choice) — the function signatures
  it exports are the contract the rest of the app depends on, so nothing
  else needs to change. Note also that `better-sqlite3` is a native
  module; confirm your deployment target (e.g. AI Studio's Cloud Run
  build) compiles native dependencies during `npm install`, or move to
  Postgres if it doesn't.
- The webhook route is intentionally mounted **before**
  `express.json()` in `server.ts`, with its own `express.raw()`
  parser — Stripe signs the raw request bytes, so if the body were
  already parsed into an object, signature verification would fail
  and every webhook would be silently rejected.
