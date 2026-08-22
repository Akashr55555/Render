import React, { useEffect } from 'react';
import { SeoRouteConfig } from './seoTypes';
import { SITE_DOMAIN, SITE_NAME, DEFAULT_OG_IMAGE } from './seoConfig';
import { generateStructuredData } from './schemaGenerator';

interface SeoHeadProps {
  config: SeoRouteConfig;
}

export const SeoHead: React.FC<SeoHeadProps> = ({ config }) => {
  useEffect(() => {
    // 1. Update Title
    document.title = config.title;
    document.documentElement.lang = config.locale || 'en';
    if (config.locale === 'ar') document.documentElement.dir = 'rtl';
    else document.documentElement.dir = 'ltr';

    // Helper to set meta tag
    const setMeta = (selector: string, attrName: string, attrVal: string, contentVal: string) => {
      let el = document.querySelector(selector);
      if (!el) {
        el = document.createElement('meta');
        el.setAttribute(attrName, attrVal);
        document.head.appendChild(el);
      }
      el.setAttribute('content', contentVal);
    };

    // Helper to set link tag
    const setCanonical = (hrefVal: string) => {
      let el = document.querySelector('link[rel="canonical"]') as HTMLLinkElement | null;
      if (!el) {
        el = document.createElement('link');
        el.setAttribute('rel', 'canonical');
        document.head.appendChild(el);
      }
      el.setAttribute('href', hrefVal);
    };

    const fullUrl = `${SITE_DOMAIN}${config.path}`;

    // Keep localized SEO routes discoverable through the same alternate links used by SSR.
    document.querySelectorAll('link[data-pdfsketch-hreflang]').forEach((node) => node.remove());
    if (config.locale || config.localizedFrom) {
      const basePath = config.localizedFrom || config.path;
      const locales = ['zh', 'hi', 'es', 'fr', 'ar', 'pt', 'de', 'ja', 'mr'];
      const links = locales.map((locale) => ({ locale, href: `${SITE_DOMAIN}/${locale}${basePath}` }));
      links.push({ locale: 'x-default', href: `${SITE_DOMAIN}${basePath}` });
      for (const item of links) {
        const link = document.createElement('link');
        link.rel = 'alternate';
        link.hreflang = item.locale;
        link.href = item.href;
        link.setAttribute('data-pdfsketch-hreflang', 'true');
        document.head.appendChild(link);
      }
    }

    // Meta Description
    setMeta('meta[name="description"]', 'name', 'description', config.description);

    // Canonical
    setCanonical(fullUrl);

    // Open Graph
    setMeta('meta[property="og:title"]', 'property', 'og:title', config.title);
    setMeta('meta[property="og:description"]', 'property', 'og:description', config.description);
    setMeta('meta[property="og:url"]', 'property', 'og:url', fullUrl);
    setMeta('meta[property="og:type"]', 'property', 'og:type', config.isGuide ? 'article' : 'website');
    setMeta('meta[property="og:site_name"]', 'property', 'og:site_name', SITE_NAME);
    setMeta('meta[property="og:image"]', 'property', 'og:image', DEFAULT_OG_IMAGE);

    // Twitter Card
    setMeta('meta[name="twitter:card"]', 'name', 'twitter:card', 'summary_large_image');
    setMeta('meta[name="twitter:title"]', 'name', 'twitter:title', config.title);
    setMeta('meta[name="twitter:description"]', 'name', 'twitter:description', config.description);
    setMeta('meta[name="twitter:image"]', 'name', 'twitter:image', DEFAULT_OG_IMAGE);

    // JSON-LD Structured Data
    const schemas = generateStructuredData(config);
    let scriptEl = document.getElementById('json-ld-schema');
    if (!scriptEl) {
      scriptEl = document.createElement('script');
      scriptEl.id = 'json-ld-schema';
      scriptEl.setAttribute('type', 'application/ld+json');
      document.head.appendChild(scriptEl);
    }
    scriptEl.textContent = JSON.stringify(schemas, null, 2);

  }, [config]);

  return null;
};
