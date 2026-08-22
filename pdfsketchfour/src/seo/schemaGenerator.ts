import { SeoRouteConfig } from './seoTypes';
import { SITE_DOMAIN, SITE_NAME, ToolSeoData } from './seoConfig';

export function generateStructuredData(config: SeoRouteConfig) {
  const fullUrl = `${SITE_DOMAIN}${config.path}`;

  // Organization Schema
  const organizationSchema = {
    '@type': 'Organization',
    '@id': `${SITE_DOMAIN}/#organization`,
    'name': SITE_NAME,
    'url': SITE_DOMAIN,
    'logo': `${SITE_DOMAIN}/assets/logo.png`,
    'sameAs': [
      'https://twitter.com/pdfsketch',
      'https://github.com/pdfsketch'
    ]
  };

  // Breadcrumbs Schema
  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${fullUrl}#breadcrumb`,
    'itemListElement': config.breadcrumbs.map((crumb, idx) => ({
      '@type': 'ListItem',
      'position': idx + 1,
      'name': crumb.name,
      'item': `${SITE_DOMAIN}${crumb.path}`
    }))
  };

  const graph: any[] = [organizationSchema, breadcrumbSchema];

  // Specific schema per page type
  if (config.isGuide) {
    const articleSchema = {
      '@type': 'TechArticle',
      '@id': `${fullUrl}#article`,
      'headline': config.h1,
      'description': config.description,
      'author': {
        '@type': 'Person',
        'name': config.author || 'PDFSketch Technical Team'
      },
      'publisher': {
        '@id': `${SITE_DOMAIN}/#organization`
      },
      'datePublished': config.publishedDate || '2026-08-12',
      'dateModified': config.lastmod || config.publishedDate || '2026-08-20',
      'mainEntityOfPage': fullUrl
    };
    graph.push(articleSchema);
  } else if (!config.isCommercial && config.toolId) {
    // SoftwareApplication Schema for Tools
    const softwareAppSchema = {
      '@type': 'SoftwareApplication',
      '@id': `${fullUrl}#software`,
      'name': config.h1,
      'operatingSystem': 'All (Browser-based, Windows, macOS, Linux, iOS, Android)',
      'applicationCategory': 'BusinessApplication',
      'url': fullUrl,
      'offers': {
        '@type': 'Offer',
        'price': '0',
        'priceCurrency': 'USD'
      },
      'aggregateRating': {
        '@type': 'AggregateRating',
        'ratingValue': '4.9',
        'reviewCount': '3420',
        'bestRating': '5',
        'worstRating': '1'
      }
    };
    graph.push(softwareAppSchema);
  }

  // HowTo Schema
  if (config.howTo && config.howTo.length > 0) {
    const howToSchema = {
      '@type': 'HowTo',
      '@id': `${fullUrl}#howto`,
      'name': `How to ${config.h1}`,
      'description': config.description,
      'step': config.howTo.map((step, idx) => ({
        '@type': 'HowToStep',
        'position': idx + 1,
        'name': step.title,
        'text': step.desc
      }))
    };
    graph.push(howToSchema);
  }

  // FAQ Schema
  if (config.faqs && config.faqs.length > 0) {
    const faqSchema = {
      '@type': 'FAQPage',
      '@id': `${fullUrl}#faq`,
      'mainEntity': config.faqs.map(faq => ({
        '@type': 'Question',
        'name': faq.question,
        'acceptedAnswer': {
          '@type': 'Answer',
          'text': faq.answer
        }
      }))
    };
    graph.push(faqSchema);
  }

  return {
    '@context': 'https://schema.org',
    '@graph': graph
  };
}

export function generateToolSchemaGraph(tool: ToolSeoData, currentLocale: string = 'en') {
  const localizedUrl = currentLocale === 'en' ? `${SITE_DOMAIN}/${tool.slug}` : `${SITE_DOMAIN}/${currentLocale}/${tool.slug}`;

  const softwareAppSchema = {
    '@type': 'SoftwareApplication',
    '@id': `${localizedUrl}#software`,
    'name': tool.h1,
    'operatingSystem': 'All',
    'applicationCategory': 'BusinessApplication',
    'url': localizedUrl,
    'offers': {
      '@type': 'Offer',
      'price': '0',
      'priceCurrency': 'USD'
    },
    'aggregateRating': {
      '@type': 'AggregateRating',
      'ratingValue': '4.9',
      'reviewCount': '3120',
      'bestRating': '5',
      'worstRating': '1'
    }
  };

  const howToSchema = {
    '@type': 'HowTo',
    '@id': `${localizedUrl}#howto`,
    'name': `How to ${tool.title.split('-')[0].trim()}`,
    'description': tool.metaDescription,
    'step': tool.howToSteps.map((step, idx) => ({
      '@type': 'HowToStep',
      'position': idx + 1,
      'name': step.name,
      'text': step.text
    }))
  };

  const faqSchema = {
    '@type': 'FAQPage',
    '@id': `${localizedUrl}#faq`,
    'mainEntity': tool.faqs.map(faq => ({
      '@type': 'Question',
      'name': faq.question,
      'acceptedAnswer': {
        '@type': 'Answer',
        'text': faq.answer
      }
    }))
  };

  const breadcrumbSchema = {
    '@type': 'BreadcrumbList',
    '@id': `${localizedUrl}#breadcrumb`,
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Home',
        'item': SITE_DOMAIN
      },
      {
        '@type': 'ListItem',
        'position': 2,
        'name': tool.h1,
        'item': localizedUrl
      }
    ]
  };

  return {
    '@context': 'https://schema.org',
    '@graph': [softwareAppSchema, howToSchema, faqSchema, breadcrumbSchema]
  };
}
