import React from 'react';
import { SeoRouteConfig } from './seoTypes';
import { routeConfigs } from './seoConfig';
import { tools } from '../toolsData';
import { ChevronRight, BookOpen, Clock, User, ArrowRight, Layers } from 'lucide-react';

interface GuidesPageProps {
  config: SeoRouteConfig;
  onNavigate: (path: string) => void;
}

const renderInlineMarkdown = (text: string, onNavigate: (path: string) => void) => {
  const regex = /(\*\*(.*?)\*\*)|(\[(.*?)\]\((.*?)\))/g;
  const elements: React.ReactNode[] = [];
  let lastIndex = 0;
  let match: RegExpExecArray | null;

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      elements.push(text.substring(lastIndex, match.index));
    }

    if (match[1]) {
      // Bold text **content**
      elements.push(<strong key={match.index} className="font-bold text-slate-900">{match[2]}</strong>);
    } else if (match[3]) {
      // Link [text](url)
      const linkText = match[4];
      const linkUrl = match[5];
      elements.push(
        <a
          key={match.index}
          href={linkUrl}
          onClick={(e) => {
            if (linkUrl.startsWith('/')) {
              e.preventDefault();
              onNavigate(linkUrl);
            }
          }}
          className="text-indigo-600 hover:text-indigo-800 font-semibold underline"
        >
          {linkText}
        </a>
      );
    }
    lastIndex = regex.lastIndex;
  }

  if (lastIndex < text.length) {
    elements.push(text.substring(lastIndex));
  }

  return elements;
};

export const GuidesPage: React.FC<GuidesPageProps> = ({ config, onNavigate }) => {
  const isIndex = config.path === '/guides/';

  // Get all individual guides
  const guideList = Object.values(routeConfigs).filter(rc => rc.isGuide && rc.path !== '/guides/');

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };

  if (isIndex) {
    return (
      <article className="max-w-6xl mx-auto px-4 py-8 text-slate-800">
        {/* Breadcrumbs */}
        <nav aria-label="Breadcrumb" className="mb-6">
          <ol className="flex items-center gap-2 text-xs font-semibold text-slate-500">
            <li><a href="/" onClick={(e) => handleLinkClick(e, '/')} className="hover:text-indigo-600">Home</a></li>
            <li><ChevronRight className="w-3.5 h-3.5 text-slate-400" /></li>
            <li className="text-slate-900 font-bold" aria-current="page">Knowledge Hub & Guides</li>
          </ol>
        </nav>

        <header className="text-center max-w-3xl mx-auto mb-10">
          <div className="w-12 h-12 bg-indigo-50 text-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-3">
            <BookOpen className="w-6 h-6" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black font-heading text-slate-900 mb-3">
            PDF Knowledge Hub & Tutorials
          </h1>
          <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
            Step-by-step technical guides, tutorials, and practical tips on optimizing, converting, editing, and securing PDF documents.
          </p>
        </header>

        <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {guideList.map((guide) => (
            <a
              key={guide.path}
              href={guide.path}
              onClick={(e) => handleLinkClick(e, guide.path)}
              className="bg-white border border-slate-200/90 rounded-2xl p-6 hover:border-indigo-300 hover:shadow-md transition-all flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-slate-400 mb-3">
                  <User className="w-3.5 h-3.5 text-indigo-600" />
                  <span>{guide.author || 'PDFSketch Team'}</span>
                  <span>•</span>
                  <Clock className="w-3.5 h-3.5" />
                  <span>{guide.publishedDate || '2026-08-12'}</span>
                </div>
                <h2 className="font-bold text-slate-900 text-lg group-hover:text-indigo-600 transition-colors mb-2 leading-snug">
                  {guide.h1}
                </h2>
                <p className="text-xs text-slate-600 leading-relaxed line-clamp-3 mb-4">
                  {guide.description}
                </p>
              </div>
              <div className="flex items-center text-xs font-bold text-indigo-600 group-hover:translate-x-1 transition-transform">
                <span>Read Full Tutorial</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </a>
          ))}
        </section>
      </article>
    );
  }

  return (
    <article className="max-w-4xl mx-auto px-4 py-8 text-slate-800">
      {/* Breadcrumbs */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-500">
          {config.breadcrumbs.map((crumb, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {idx === config.breadcrumbs.length - 1 ? (
                <span className="text-slate-900 font-bold" aria-current="page">{crumb.name}</span>
              ) : (
                <a href={crumb.path} onClick={(e) => handleLinkClick(e, crumb.path)} className="hover:text-indigo-600">
                  {crumb.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-slate-900 leading-tight mb-3">
          {config.h1}
        </h1>
        <div className="flex items-center gap-3 text-xs text-slate-500 mb-4 pb-4 border-b border-slate-200">
          <span>By <strong className="text-slate-800">{config.author || 'PDFSketch Technical Team'}</strong></span>
          <span>•</span>
          <span>Published {config.publishedDate || '2026-08-12'}</span>
        </div>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {config.subtitle}
        </p>
      </header>

      {/* Quick Answer Block */}
      {config.quickAnswer && (
        <section className="bg-indigo-50/80 border border-indigo-100 rounded-2xl p-5 mb-8">
          <h2 className="text-xs font-extrabold uppercase tracking-wider text-indigo-700 mb-1">Quick Tutorial Summary</h2>
          <p className="text-sm text-slate-800 font-medium leading-relaxed">
            {renderInlineMarkdown(config.quickAnswer, onNavigate)}
          </p>
        </section>
      )}

      {/* Markdown / Main Article Content */}
      {config.contentMarkdown && (
        <section className="prose prose-slate max-w-none text-sm leading-relaxed space-y-4 mb-10">
          {config.contentMarkdown.split('\n\n').map((paragraph, idx) => {
            const trimmed = paragraph.trim();
            if (trimmed.startsWith('### ')) {
              return (
                <h3 key={idx} className="text-lg font-bold text-slate-900 pt-3">
                  {renderInlineMarkdown(trimmed.replace('### ', ''), onNavigate)}
                </h3>
              );
            }
            if (/^[0-9]+\.\s+/.test(trimmed)) {
              const lines = trimmed.split('\n');
              return (
                <ol key={idx} className="list-decimal pl-5 space-y-1.5 text-slate-700">
                  {lines.map((item, i) => (
                    <li key={i}>
                      {renderInlineMarkdown(item.replace(/^[0-9]+\.\s+/, ''), onNavigate)}
                    </li>
                  ))}
                </ol>
              );
            }
            if (/^(\*|-)\s+/.test(trimmed)) {
              const lines = trimmed.split('\n');
              return (
                <ul key={idx} className="list-disc pl-5 space-y-1.5 text-slate-700">
                  {lines.map((item, i) => (
                    <li key={i}>
                      {renderInlineMarkdown(item.replace(/^(\*|-)\s+/, ''), onNavigate)}
                    </li>
                  ))}
                </ul>
              );
            }
            return (
              <p key={idx} className="text-slate-700 leading-relaxed">
                {renderInlineMarkdown(trimmed, onNavigate)}
              </p>
            );
          })}
        </section>
      )}

      {/* Step-by-Step */}
      {config.howTo && config.howTo.length > 0 && (
        <section className="mb-10 bg-slate-50 border border-slate-200/80 rounded-2xl p-6">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Step-by-Step Instructions</h2>
          <div className="space-y-3">
            {config.howTo.map((step) => (
              <div key={step.step} className="flex items-start gap-3">
                <div className="w-6 h-6 bg-indigo-600 text-white rounded-full flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                  {step.step}
                </div>
                <div>
                  <h3 className="font-bold text-sm text-slate-900">{step.title}</h3>
                  <p className="text-xs text-slate-600">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* FAQs */}
      {config.faqs && config.faqs.length > 0 && (
        <section className="mb-10">
          <h2 className="text-lg font-bold text-slate-900 mb-4">Frequently Asked Questions</h2>
          <div className="space-y-3">
            {config.faqs.map((faq, idx) => (
              <div key={idx} className="bg-white border border-slate-200 rounded-xl p-4">
                <h3 className="font-bold text-sm text-slate-900 mb-1">{faq.question}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{faq.answer}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Related Tools Internal Links Grid */}
      {config.relatedToolIds && config.relatedToolIds.length > 0 && (
        <section className="border-t border-slate-200 pt-8 mt-10">
          <h2 className="text-lg font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Related PDF Tools</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {config.relatedToolIds.map((rId) => {
              const rTool = tools.find(t => t.id === rId);
              if (!rTool) return null;

              const matchConfig = Object.values(routeConfigs).find(rc => rc.toolId === rId);
              const path = matchConfig ? matchConfig.path : '/';

              return (
                <a
                  key={rId}
                  href={path}
                  onClick={(e) => handleLinkClick(e, path)}
                  className="p-3 bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-300 rounded-xl transition-all flex items-center justify-between group shadow-2xs text-left"
                >
                  <span className="text-xs font-bold text-slate-800 group-hover:text-indigo-600 truncate">{rTool.title}</span>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-600 shrink-0 ml-1" />
                </a>
              );
            })}
          </div>
        </section>
      )}
    </article>
  );
};
