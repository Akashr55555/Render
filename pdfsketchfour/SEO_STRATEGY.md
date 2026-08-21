# PDFSketch SEO Strategy — iLovePDF Competitive Teardown & Action Plan

## 1. How iLovePDF is structured (reverse-engineered from the supplied snapshot)

Inspecting the supplied `www.ilovepdf.com` export shows a consistent, repeatable pattern across all 30+ tool pages:

- **One URL per tool, keyword-matched to search intent**: `/merge_pdf.html`, `/split_pdf.html`, `/compress_pdf.html`, etc. Titles follow the formula `"[Verb] PDF [files] online. Free [service] to [verb] PDF"` — front-loading the exact phrase a user types into Google.
- **Full meta stack on every page**: unique `<title>`, `<meta name="description">`, `<meta name="keywords">`, `rel="canonical"`, Open Graph (`og:title`, `og:description`, `og:image`, `og:url`, `og:type`), and Twitter Card tags, each populated with page-specific copy (not templated boilerplate repeated site-wide).
- **Mega internal linking**: every tool page links to *every other tool page* plus every localized homepage (`de.html`, `fr.html`, `ja.html`, etc.) in the global nav/footer. This concentrates internal PageRank across the whole tool catalog rather than isolating pages.
- **Heavy localization footprint**: ~20 language home pages (`ar`, `bg`, `ca`, `de`, `el`, `es`, `fr`, `hi`, `id`, `it`, `ja`, `ko`, `ms`, `nl`, `pl`, `pt`, `ru`, `sv`, `sw`, `th`, `tr`, `uk`, `vi`, `zh-cn`, `zh-tw`) — each a crawlable, indexable URL rather than a client-side toggle.
- **Long-tail/commercial pages beyond the tools**: `pricing.html`, `business.html`, `education.html`, `desktop.html`, `mobile.html`, `features.html`, `compare-pdf.html` — these capture buyer-intent and B2B searches that pure tool pages miss.
- **Substantial on-page body copy** (~28k characters of rendered text on `merge_pdf.html`) — well beyond a thin tool widget, giving Google's crawler enough unique content to rank the page for informational queries too.
- **`robots.txt`** simply disallows `/upload/` and otherwise allows full crawl; no sitemap directive was present in the saved snapshot, but the site relies on strong internal linking and Search Console submission instead.

## 2. Where PDFSketch already matched or beat this (found in the existing codebase)

PDFSketch already had a genuinely strong SEO foundation before this pass:

- Server-side–injected `<title>`, description, canonical, Open Graph, Twitter Card, and **JSON-LD structured data** (`WebSite`, `Organization`, `SoftwareApplication`, `BreadcrumbList`, `FAQPage`, `HowTo`, `Article`) for every route — this is *more* structured data than iLovePDF exposes in its static HTML.
- Dynamic `/robots.txt` and `/sitemap.xml` generated from a single source of truth (`routeConfigs`), so every new route is automatically indexable without manual sitemap edits.
- 33 individual tool landing pages, each with unique title/description/H1/FAQ/HowTo content (matching iLovePDF's one-URL-per-tool pattern).
- A Knowledge Hub (`/guides/`) for long-form tutorial content, which iLovePDF does not appear to have as a dedicated content hub.

## 3. Gaps closed in this update

| Gap | Fix applied |
|---|---|
| Footer only linked ~11 of 33 tools, weakening internal link equity to the rest | Rebuilt the footer into a 5-column mega-footer (Convert / Organize & Edit / Security & Signing / Resources / Guides) linking **every** tool page and **every** guide, matching iLovePDF's full cross-linking pattern |
| Guides hub had only 3 articles | Added 4 new long-form guides targeting high-intent queries: **password-protect a PDF**, **JPG to PDF**, **e-sign a PDF online**, and a **PDFSketch vs iLovePDF comparison** page |
| No page capturing "iLovePDF alternative" search demand | New `/guides/pdfsketch-vs-ilovepdf-comparison/` page targets that query set factually, without disparaging the competitor, and cross-links into PDFSketch's differentiators (in-browser editor, AI summarizer, workflows) |
| Sitemap coverage | Verified `/sitemap.xml` now emits 42 URLs (was 38) including all new guides, confirmed via a direct run of `getSitemapXml()` |
| Build/type safety | Ran `tsc --noEmit` and a full `vite build` after all edits — both pass clean |

## 4. Recommended next stage (not yet implemented — needs product decisions)

1. **Localized, crawlable URLs** (`/de/merge-pdf/`, `/fr/merge-pdf/`, etc.) with `hreflang` alternates. PDFSketch's language switcher is currently client-side (`localStorage`), so there is nothing to point `hreflang` at yet — this needs a routing change before hreflang tags can be added truthfully. Adding hreflang without real per-language URLs would create duplicate-canonical confusion, so it was intentionally left out of this pass.
2. **Commercial/buyer-intent pages**: `/pricing/`, `/business/`, `/education/` — iLovePDF captures B2B and procurement search volume PDFSketch currently has no page for.
3. **Backlink & authority building** (off-page, cannot be done from inside the codebase):
   - Submit to PDF/software directories (AlternativeTo, Product Hunt, Slant, SaaSHub, G2, Capterra).
   - Publish the comparison guide as a Reddit/Quora-friendly resource in r/software or PDF-help threads (organic, disclosed, not spammy).
   - Guest posts / resource-page outreach to productivity and remote-work blogs, pitching the free-tool angle.
   - Developer-community backlinks: publish a short write-up of the AI summarizer or workflow engine on Dev.to / Hashnode, linking back to the relevant tool page.
4. **Indexing hygiene**: submit `/sitemap.xml` in Google Search Console and Bing Webmaster Tools, and use the URL Inspection / IndexNow API to fast-track newly published guide URLs.
5. **Core Web Vitals**: the production JS bundle is currently ~1.37 MB (388 KB gzipped) in a single chunk — code-splitting the tool workspace (`build.rollupOptions.output.manualChunks` or dynamic `import()`) would improve LCP/INP on first load, which is itself a ranking factor.
6. **Reviews/UGC schema**: only add `AggregateRating`/`Review` structured data once real user ratings exist — do not fabricate rating data, as that violates Google's structured-data guidelines and risks a manual action.

## 5. Notes on scope

Per Anthropic's policy, this pass reverse-engineers iLovePDF's *SEO architecture and patterns* (URL structure, meta strategy, internal linking, content depth) — no iLovePDF code, copy, or brand assets were copied into PDFSketch.
