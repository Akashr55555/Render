/**
 * server/lib/firebaseAdmin.ts
 * ----------------------------
 * Verifies Firebase ID tokens SERVER-SIDE.
 *
 * Why this matters: the app previously only had client-side Firebase
 * auth (src/lib/firebase.ts). That tells the browser who's logged in,
 * but the server never checked it — so nothing server-side could be
 * trusted as "this request really is from this user," which is a
 * prerequisite for real billing/entitlement checks (you can't sell a
 * subscription to an identity you can't verify). This module is the
 * missing server half: it verifies the Firebase ID token the client
 * sends in `Authorization: Bearer <token>` using the Firebase Admin
 * SDK, which validates the token's signature against Google's public
 * keys — it is not just decoding the JWT.
 */
import admin from 'firebase-admin';
import type { Request, Response, NextFunction } from 'express';

let initialized = false;

function ensureInitialized(): void {
  if (initialized) return;

  const raw = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
  if (!raw) {
    throw new Error(
      'FIREBASE_SERVICE_ACCOUNT_JSON is not set. Generate a service account key ' +
      '(Firebase Console -> Project Settings -> Service Accounts -> Generate new ' +
      'private key) and set its JSON contents as this env var on the server.'
    );
  }

  const serviceAccount = JSON.parse(raw);
  admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
  });
  initialized = true;
}

export interface AuthedRequest extends Request {
  uid?: string;
  userEmail?: string | null;
}

/** Rejects the request unless a valid Firebase ID token is present. */
export async function requireAuth(req: AuthedRequest, res: Response, next: NextFunction) {
  try {
    ensureInitialized();
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) {
      return res.status(401).json({ error: 'Missing Authorization: Bearer <idToken> header' });
    }
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.uid = decoded.uid;
    req.userEmail = decoded.email ?? null;
    next();
  } catch (e: any) {
    console.error('[auth]', e.message);
    return res.status(401).json({ error: 'Invalid or expired session. Please sign in again.' });
  }
}

export function getAdmin() {
  ensureInitialized();
  return admin;
}

/**
 * Like requireAuth, but never rejects the request. If a valid Firebase ID
 * token is present, req.uid is populated; otherwise the request continues
 * anonymously. Used ahead of rate limiting so limits can be keyed by
 * authenticated user (uid) instead of only by IP — a single user can't
 * dodge their budget by rotating source IPs, and one shared IP (office
 * NAT, mobile carrier) doesn't get one limit split across many people.
 */
export async function optionalAuth(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const header = req.headers.authorization || '';
    const match = header.match(/^Bearer (.+)$/);
    if (!match) return next();
    ensureInitialized();
    const decoded = await admin.auth().verifyIdToken(match[1]);
    req.uid = decoded.uid;
    req.userEmail = decoded.email ?? null;
  } catch {
    // Invalid/expired token on a route that doesn't require auth: treat as
    // anonymous rather than failing the request.
  }
  next();
}
