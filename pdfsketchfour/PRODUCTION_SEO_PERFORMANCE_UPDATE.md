# PDFSketch Production SEO + Localization + B2B + Performance Update

This update builds on the existing PDFSketch production application without replacing its PDF tools, authentication, Firebase, billing, workflows, or hardened security model.

## Implemented

### Crawlable international SEO
- Added crawlable locale URL routes for Chinese, Hindi, Spanish, French, Arabic, Portuguese, German, Japanese, and Marathi.
- Added localized home routes and localized versions of the tools that have maintained translations in the existing translation catalog.
- Added canonical URLs and `hreflang`/`x-default` alternate links during server-side SEO injection.
- Added document `lang` and RTL direction for Arabic.
- Localized routes are generated from the existing tool translation catalog instead of inventing a second translation system.
- Sitemap automatically includes the new localized routes.

### Commercial / B2B SEO
Added crawlable product pages:
- `/pricing/`
- `/business/`
- `/teams/`
- `/education/`
- `/security/`

Each page has unique metadata, structured WebPage data, breadcrumbs, useful content, FAQs, and internal links.

### Internal linking
Added the new commercial pages to the main footer so they are discoverable from the application UI and crawler navigation.

### Core Web Vitals / bundle strategy
Added Vite manual chunking for major dependency groups:
- React
- icons
- motion
- Firebase
- PDF libraries
- Gemini/AI

This reduces the amount of unrelated application code that must be downloaded and evaluated together on initial navigation and creates a better foundation for further route-level lazy loading.

### SEO head correctness
- Removed duplicate client-side `SeoHead` rendering in the router.
- Preserved server-side SEO injection.
- Added localized alternate links for international pages.
- Added explicit language metadata for localized documents.

### Security preserved
No changes were made to the hardened Firebase fail-closed behavior, strict exact-match CORS model, security headers, billing entitlement verification, or production `PORT` handling.

## Backlinks / domain authority
Backlinks cannot be honestly manufactured by modifying source code. The codebase now has stronger commercial and international landing pages plus link-worthy guide infrastructure that can be used for legitimate outreach, directory listings, developer articles, and product-community promotion.

Do not use automated spam backlink generation.

## Validation note
The source package was inspected and modified directly. A full `npm ci` could not complete within the execution environment time limit, so a clean production dependency install/build could not be independently completed here. Do not interpret that limitation as a build failure in the source itself. Run `npm ci`, `npm run lint`, and `npm run build` in the deployment environment before release.
