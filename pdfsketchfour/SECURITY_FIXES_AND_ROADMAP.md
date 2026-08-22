# PDFSketch — fixes applied + prioritized roadmap

Based on the forensic comparison report against iLovePDF. This pass focused on
the concrete, described security gaps that could be fixed correctly without
guessing at your infra (Stripe keys, Firebase project, Postgres instance,
etc.). The larger items are scoped below with recommended next steps.

## Fixed in this pass

### 1. Firebase demo-credential fallback removed (`src/lib/firebase.ts`)
Previously, any missing `VITE_FIREBASE_*` env var silently fell back to a
placeholder project (`applet-b5650`, `AIzaSy_demo_key`, etc.). That means a
misconfigured deployment would boot "successfully" with broken auth instead
of failing loudly. Now the module throws immediately at load time listing
exactly which env vars are missing — fail closed, not silent. No behavior
change if your env vars are already set correctly.

### 2. SSRF DNS-rebinding hardened (`server/lib/urlSecurity.ts`)
The old flow validated a URL's IP via `dns.lookup()`, then called `fetch(url)`
separately — which does its **own** DNS lookup. Between those two lookups, an
attacker-controlled DNS record can flip from a safe public IP to a private
one ("DNS rebinding"), and the validation would never see it. Fixed by:
- Pinning the actual socket connection to the exact IP that was validated
  (via an `undici` `Agent` with a custom `lookup`), so re-resolution can't
  happen — while Host header / TLS SNI still use the real hostname, so
  virtual hosting and cert validation are unaffected.
- Added a hard response-size cap (25MB default) enforced by reading the
  stream directly, since a malicious server can lie about `Content-Length`.
- Redirects are re-validated (and re-pinned) hop by hop, as before.

Added `undici` as an explicit dependency (Node bundles it internally, but
pinning via a custom `Agent` needs it as an importable package).

`server/routes/html-to-pdf.ts` was updated for the new return shape.

### 3. Rate limiting is now identity-aware (`server.ts`, `server/lib/firebaseAdmin.ts`)
Added `optionalAuth` — decodes a Firebase ID token when present but never
rejects the request (unlike `requireAuth`). Both the baseline and strict
rate limiters now key on `uid` when the caller is signed in, falling back to
IP otherwise. This closes two gaps: a signed-in abuser can't reset their
budget by rotating IPs, and legitimate users behind one shared IP (office
NAT, campus wifi) no longer draw down a single shared bucket.

**Not done yet:** cost-aware limiting (weighting by file size / page count,
not just request count) — flagged in the roadmap below.

## What wasn't touched, and why

The rest of the report describes real, multi-day engineering projects, not
line fixes — implementing them here would mean guessing at infrastructure
decisions (which Postgres host, which queue broker, which of 18 languages to
localize first) rather than giving you something you can actually merge.
Prioritized as the report suggests:

1. **Conversion fidelity (PDF→Word/Excel/PPT)** — biggest score gap (7.0 →
   target 9.0). Current extraction is heuristic (tabs/spaces/pipes → cells).
   Needs geometry-aware extraction (character/word bounding boxes from
   `pdfjs-dist`, column/row clustering) before DOCX/XLSX generation.
2. **Background job queue** (BullMQ + Redis) — decouple OCR/conversion/AI
   from the request/response cycle so large files don't hold an Express
   worker hostage. Upload → 202 Accepted → poll/webhook → download.
3. **Postgres for entitlements** — `better-sqlite3` works for one instance;
   breaks under multiple containers/autoscaling. Swap `entitlementsDb.ts`
   for Postgres before scaling past one server.
4. **International SEO pages** — you already have 18 language *strings*;
   iLovePDF's edge is crawlable localized HTML pages
   (`/hi/merge-pdf/`, `/fr/merge-pdf/`, etc.) with hreflang + localized
   metadata. High ROI per the report, but it's a content-generation project
   (potentially hundreds of pages), not a code fix.
5. **Cost-aware rate limiting** — extend today's identity-aware limiter with
   weighting by file size / page count so large jobs cost more budget.
6. **Accessibility pass** — keyboard nav, focus trapping in modals, ARIA
   labels on tool cards, upload/progress announcements.

Recommend tackling #2 and #3 together (they're both "server infrastructure")
in a focused session — likely a good fit for Claude Code given the file
count involved, rather than this chat interface.
