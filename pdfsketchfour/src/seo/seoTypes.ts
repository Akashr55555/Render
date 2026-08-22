export interface FAQItem {
  question: string;
  answer: string;
}

export interface HowToStep {
  step: number;
  title: string;
  desc: string;
}

export interface FeatureItem {
  title: string;
  desc: string;
}

export interface SeoRouteConfig {
  slug: string;
  path: string;
  toolId?: string; // Maps to toolsData.ts tool ID if applicable
  title: string;
  description: string;
  h1: string;
  subtitle: string;
  quickAnswer: string;
  howTo: HowToStep[];
  features: FeatureItem[];
  securityText: string;
  faqs: FAQItem[];
  relatedToolIds: string[];
  breadcrumbs: { name: string; path: string }[];
  isGuide?: boolean;
  isCommercial?: boolean;
  locale?: string;
  localizedFrom?: string;
  author?: string;
  publishedDate?: string;
  lastmod?: string;
  contentMarkdown?: string;
}
