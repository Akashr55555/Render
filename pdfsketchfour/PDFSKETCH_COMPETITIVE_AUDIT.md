# PDFSketch competitive audit & upgrade report

## Scope

- **Product under modification:** PDFSketch ZIP supplied by the user.
- **Reference competitor:** iLovePDF ZIP supplied by the user.
- Competitor code, text, branding, assets, and proprietary implementation are not copied.

## Snapshot findings

The PDFSketch source contains **43 tool definitions** and **38 SEO routes**. The supplied iLovePDF snapshot contains **71 top-level HTML pages**, including core PDF tools plus pricing, business, education, desktop/mobile, accounts, and many localized entry pages.

### Strong PDFSketch areas

- Broad PDF tool coverage, including workflows and AI-oriented tools.
- Dedicated SEO landing-page architecture.
- Firebase authentication integration already exists.
- Native DOCX/XLSX/PPTX generation libraries are present.
- Temporary-file cleanup infrastructure already exists.
- Modern responsive React/Tailwind interface.

### Highest-priority gaps

1. Production authentication/session handling and server-side account entitlements.
2. Payment provider + webhook-backed premium entitlements.
3. Upload hardening and command-execution safety.
4. SSRF protection for URL-to-PDF functionality.
5. Production job/worker architecture for expensive conversions.
6. Conversion fidelity testing for difficult PDFs.
7. International SEO with crawlable localized URLs and hreflang.
8. Business/education account architecture.

## Changes applied in this upgrade

### Security

- Centralized Multer upload configuration.
- Per-file upload limit: 50 MB.
- Request file count limit: 50.
- Allowed-extension and blocked-MIME filtering.
- Randomized temporary upload filenames.
- PDF magic-header validation for sensitive PDF operations.
- Ghostscript calls migrated away from shell-string execution to `execFile` argument arrays.
- Command execution timeouts added to expensive Ghostscript operations.
- HTML-to-PDF URL fetching now blocks localhost, private/link-local IPs and internal hostnames.
- URL redirects are revalidated and capped.
- Explicit CORS allowlist via `CORS_ORIGINS`.
- Security response headers added.
- API rate limit tightened from 120 to 90 requests/minute.
- API request timeout added.

### Authentication

- Removed the previous fake-authentication fallback: Firebase authentication failures no longer create synthetic users.
- Application login state now follows Firebase's authenticated session state.
- Logout now calls Firebase `signOut` rather than only deleting a localStorage record.

### Premium / monetization safety

- Removed the client-side behavior that immediately changed `isPremium` to `true` after clicking a plan.
- Premium checkout messaging no longer claims a real payment transaction when no payment provider is configured.
- This is intentionally not a fake payment implementation. A production payment provider and verified webhook must be connected before premium entitlements are granted.

### UX

- Homepage hero text now wraps naturally on phones instead of using `nowrap`/ellipsis.
- Added a compact **Popular** tools row for Merge, Compress, PDF to Word, Split, and Edit.
- This reduces time-to-tool for common workflows while preserving PDFSketch branding.

### SEO / trust copy

- Removed several unsupported claims such as exact/pixel-perfect conversion guarantees and absolute privacy claims.
- Security copy now describes HTTPS transport and temporary-file cleanup rather than promising architecture that has not been demonstrated.

## Competitor-informed product priorities

The iLovePDF snapshot demonstrates a mature ecosystem around the core tools: pricing, business, education, account pages, desktop/mobile experiences and a large localization footprint. PDFSketch should compete through **reliability + AI document workflows + strong privacy engineering**, rather than copying the competitor's presentation.

## Recommended next implementation stage

### Stage 1 — finish production security

- Add per-route rate limits for authentication, OCR, AI and expensive conversions.
- Add antivirus/content scanning where operationally appropriate.
- Add process/container isolation for Ghostscript and other document parsers.
- Add memory/CPU/page-count limits.
- Add structured security logging and request IDs.

### Stage 2 — PDF engine

Test every tool against normal, scanned, large, image-heavy, table-heavy, malformed, encrypted, Unicode and rotated documents. Prioritize PDF→Word, PDF→Excel, PDF→PPT, PDF/A, Organize and Sign.

### Stage 3 — SaaS

Connect Firebase users to a database-backed account model, then add provider-agnostic subscription records and verified payment webhooks. Premium authorization must remain server-side.

### Stage 4 — SEO + UX

Add localized crawlable URLs, hreflang, localized metadata/content, guides/help content, accessibility audits, Core Web Vitals measurement and richer result/progress states.

## Verification status

The workspace did not contain installed `node_modules`, and package installation could not complete within the available execution window. Therefore `npm run lint`/`npm run build` could not be truthfully reported as passing. The source changes were made directly and the original test/build artifacts were preserved.
