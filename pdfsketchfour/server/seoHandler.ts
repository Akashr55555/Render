import { Request, Response } from 'express';
import { routeConfigs, SITE_DOMAIN, SITE_NAME, DEFAULT_OG_IMAGE, SUPPORTED_LOCALES } from '../src/seo/seoConfig';
import { generateStructuredData } from '../src/seo/schemaGenerator';

export function getRobotsTxt(): string {
  return `User-agent: *
Allow: /
Disallow: /api/
Disallow: /checkout/
Disallow: /admin/
Disallow: /tmp/

Sitemap: ${SITE_DOMAIN}/sitemap.xml
`;
}

export function getSitemapXml(): string {
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n`;

  Object.values(routeConfigs).forEach(config => {
    const isRoot = config.path === '/';
    const basePath = isRoot ? '' : config.path;
    const priority = isRoot ? '1.0' : (config.isCommercial ? '0.8' : (config.isGuide ? '0.7' : '0.9'));
    const changefreq = isRoot ? 'daily' : 'weekly';
    const lastmod = config.lastmod || config.publishedDate || '2026-08-20';

    // Base canonical url
    xml += `  <url>\n`;
    xml += `    <loc>${SITE_DOMAIN}${config.path}</loc>\n`;
    xml += `    <lastmod>${lastmod}</lastmod>\n`;
    xml += `    <changefreq>${changefreq}</changefreq>\n`;
    xml += `    <priority>${priority}</priority>\n`;

    // Localized hreflang alternates
    SUPPORTED_LOCALES.forEach(locale => {
      const locUrl = `${SITE_DOMAIN}/${locale}${basePath}`;
      xml += `    <xhtml:link rel="alternate" hreflang="${locale}" href="${locUrl}"/>\n`;
    });
    xml += `    <xhtml:link rel="alternate" hreflang="x-default" href="${SITE_DOMAIN}${config.path}"/>\n`;
    xml += `  </url>\n`;
  });

  xml += `</urlset>`;
  return xml;
}

export function handleRobotsTxt(_req: Request, res: Response): void {
  res.setHeader('Content-Type', 'text/plain');
  res.send(getRobotsTxt());
}

export function handleSitemapXml(_req: Request, res: Response): void {
  res.setHeader('Content-Type', 'application/xml');
  res.send(getSitemapXml());
}

export function injectSeoMetaData(template: string, reqPath: string): { html: string; isNotFound: boolean } {
  let norm = reqPath;
  if (norm !== '/' && !norm.endsWith('/')) {
    norm += '/';
  }

  // Check for localized route prefix like /es/merge-pdf/
  let detectedLocale = 'en';
  let cleanPath = norm;
  for (const loc of SUPPORTED_LOCALES) {
    if (norm.startsWith(`/${loc}/`)) {
      detectedLocale = loc;
      cleanPath = norm.replace(`/${loc}`, '');
      break;
    }
  }

  const matchedConfig = routeConfigs[cleanPath] ||
    Object.values(routeConfigs).find(rc => rc.path === cleanPath || rc.slug === cleanPath.replace(/\//g, ''));

  if (!matchedConfig) {
    // 404 Route injection
    let html404 = template;
    html404 = html404.replace(/<title>.*?<\/title>/i, `<title>404 Page Not Found – ${SITE_NAME}</title>`);
    return { html: html404, isNotFound: true };
  }

  const fullUrl = `${SITE_DOMAIN}${matchedConfig.path}`;
  const structuredData = generateStructuredData(matchedConfig);

  // Generate Hreflang Tags
  let hreflangTags = '';
  SUPPORTED_LOCALES.forEach(loc => {
    const locHref = `${SITE_DOMAIN}/${loc}${matchedConfig.path === '/' ? '' : matchedConfig.path}`;
    hreflangTags += `\n    <link rel="alternate" hreflang="${loc}" href="${locHref}" data-pdfsketch-hreflang="true" />`;
  });
  hreflangTags += `\n    <link rel="alternate" hreflang="x-default" href="${fullUrl}" data-pdfsketch-hreflang="true" />`;

  const headInjection = `
    <title>${matchedConfig.title}</title>
    <meta name="description" content="${matchedConfig.description}" />
    <link rel="canonical" href="${fullUrl}" />${hreflangTags}
    <!-- Open Graph / Facebook -->
    <meta property="og:type" content="${matchedConfig.isGuide ? 'article' : 'website'}" />
    <meta property="og:url" content="${fullUrl}" />
    <meta property="og:title" content="${matchedConfig.title}" />
    <meta property="og:description" content="${matchedConfig.description}" />
    <meta property="og:image" content="${DEFAULT_OG_IMAGE}" />
    <meta property="og:site_name" content="${SITE_NAME}" />
    <!-- Twitter -->
    <meta name="twitter:card" content="summary_large_image" />
    <meta name="twitter:url" content="${fullUrl}" />
    <meta name="twitter:title" content="${matchedConfig.title}" />
    <meta name="twitter:description" content="${matchedConfig.description}" />
    <meta name="twitter:image" content="${DEFAULT_OG_IMAGE}" />
    <!-- Structured Data JSON-LD -->
    <script type="application/ld+json" id="json-ld-schema">
${JSON.stringify(structuredData, null, 2)}
    </script>
  `;

  let modifiedHtml = template;

  // Replace title if exists
  if (/<title>.*?<\/title>/i.test(modifiedHtml)) {
    modifiedHtml = modifiedHtml.replace(/<title>.*?<\/title>/i, '');
  }

  // Inject before </head>
  if (modifiedHtml.includes('</head>')) {
    modifiedHtml = modifiedHtml.replace('</head>', `${headInjection}\n  </head>`);
  } else {
    modifiedHtml = `${headInjection}\n${modifiedHtml}`;
  }

  // Update html lang attribute if present
  if (detectedLocale !== 'en') {
    modifiedHtml = modifiedHtml.replace(/<html([^>]*)lang="[^"]*"/i, `<html$1lang="${detectedLocale}"`);
  }

  return { html: modifiedHtml, isNotFound: false };
}
