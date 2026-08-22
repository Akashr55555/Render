import React, { useState } from 'react';
import { SeoRouteConfig } from './seoTypes';
import { tools } from '../toolsData';
import { EmbeddedToolWorkspace } from '../components/EmbeddedToolWorkspace';
import { 
  ChevronRight, 
  Sparkles, 
  ShieldCheck, 
  HelpCircle, 
  CheckCircle2, 
  ArrowRight,
  ChevronDown,
  Layers
} from 'lucide-react';
import { routeConfigs } from './seoConfig';

interface ToolLandingPageProps {
  config: SeoRouteConfig;
  onNavigate: (path: string) => void;
}

export const ToolLandingPage: React.FC<ToolLandingPageProps> = ({ config, onNavigate }) => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  // Find matching tool object from toolsData
  const activeTool = tools.find(t => t.id === config.toolId) || tools[0];

  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>, href: string) => {
    e.preventDefault();
    onNavigate(href);
  };

  return (
    <article className="max-w-6xl mx-auto px-4 py-8 text-slate-800">
      {/* Breadcrumb Navigation */}
      <nav aria-label="Breadcrumb" className="mb-6">
        <ol className="flex items-center flex-wrap gap-2 text-xs font-semibold text-slate-500">
          {config.breadcrumbs.map((crumb, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {idx > 0 && <ChevronRight className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
              {idx === config.breadcrumbs.length - 1 ? (
                <span className="text-slate-900 font-bold" aria-current="page">{crumb.name}</span>
              ) : (
                <a
                  href={crumb.path}
                  onClick={(e) => handleLinkClick(e, crumb.path)}
                  className="hover:text-indigo-600 transition-colors"
                >
                  {crumb.name}
                </a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      {/* Header & Intro */}
      <header className="text-center max-w-3xl mx-auto mb-8">
        <h1 className="text-2xl sm:text-3xl md:text-4xl font-black font-heading text-slate-900 tracking-tight leading-tight mb-3">
          {config.h1}
        </h1>
        <p className="text-slate-600 text-sm sm:text-base leading-relaxed">
          {config.subtitle}
        </p>
      </header>

      {/* Embedded Interactive PDF Tool Workspace */}
      <section className="mb-12" aria-label="Interactive PDF Tool">
        <EmbeddedToolWorkspace tool={activeTool} />
      </section>

      {/* AIO / GEO Answer Engine Summary Block */}
      {config.quickAnswer && (
        <section className="bg-gradient-to-r from-indigo-50/90 via-purple-50/50 to-sky-50/80 border border-indigo-100 rounded-2xl p-6 mb-12 shadow-xs">
          <div className="flex items-center gap-2 text-xs font-extrabold uppercase tracking-wider text-indigo-700 mb-2">
            <Sparkles className="w-4 h-4 text-purple-600" />
            <span>Quick Answer & Summary</span>
          </div>
          <p className="text-sm text-slate-700 leading-relaxed font-medium">
            {config.quickAnswer}
          </p>
        </section>
      )}

      {/* Step-by-Step How To Use Section */}
      {config.howTo && config.howTo.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 mb-6 text-center">
            How to Use {config.h1}
          </h2>
          <div className="grid md:grid-cols-3 gap-6">
            {config.howTo.map((item) => (
              <div key={item.step} className="bg-white border border-slate-200/90 rounded-2xl p-6 shadow-xs relative">
                <div className="w-8 h-8 bg-indigo-600 text-white rounded-xl flex items-center justify-center font-bold text-sm mb-4">
                  {item.step}
                </div>
                <h3 className="font-bold text-slate-900 text-base mb-2">{item.title}</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Key Features Section */}
      {config.features && config.features.length > 0 && (
        <section className="mb-14">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 mb-6 text-center">
            Key Features & Capabilities
          </h2>
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {config.features.map((feat, idx) => (
              <div key={idx} className="bg-slate-50/80 border border-slate-200/80 rounded-2xl p-5">
                <div className="flex items-center gap-2 text-indigo-600 font-bold mb-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <h3 className="text-sm text-slate-900 font-bold">{feat.title}</h3>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.desc}</p>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* Privacy & Security Guarantee */}
      {config.securityText && (
        <section className="bg-emerald-50/80 border border-emerald-200/80 rounded-2xl p-6 mb-14 flex items-start gap-4">
          <ShieldCheck className="w-6 h-6 text-emerald-600 shrink-0 mt-0.5" />
          <div>
            <h3 className="font-bold text-emerald-950 text-sm mb-1">Privacy & Security Guarantee</h3>
            <p className="text-xs sm:text-sm text-emerald-800 leading-relaxed">{config.securityText}</p>
          </div>
        </section>
      )}

      {/* Frequently Asked Questions */}
      {config.faqs && config.faqs.length > 0 && (
        <section className="mb-14 max-w-4xl mx-auto">
          <h2 className="text-xl sm:text-2xl font-bold font-heading text-slate-900 mb-6 text-center flex items-center justify-center gap-2">
            <HelpCircle className="w-5 h-5 text-indigo-600" />
            <span>Frequently Asked Questions</span>
          </h2>
          <div className="space-y-3">
            {config.faqs.map((faq, idx) => {
              const isOpen = openFaq === idx;
              return (
                <div key={idx} className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-2xs">
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setOpenFaq(isOpen ? null : idx)}
                    className="w-full text-left p-4.5 flex items-center justify-between gap-4 font-bold text-sm text-slate-900 hover:text-indigo-600 transition-colors"
                  >
                    <span>{faq.question}</span>
                    <ChevronDown className={`w-4 h-4 text-slate-400 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  <div
                    aria-hidden={!isOpen}
                    className={`px-4.5 pb-4 text-xs sm:text-sm text-slate-600 leading-relaxed border-t border-slate-100 pt-3 ${isOpen ? '' : 'hidden'}`}
                  >
                    {faq.answer}
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

      {/* Related Tools Internal Links Grid */}
      {config.relatedToolIds && config.relatedToolIds.length > 0 && (
        <section className="border-t border-slate-200 pt-10">
          <h2 className="text-lg font-bold font-heading text-slate-900 mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-indigo-600" />
            <span>Related PDF Tools</span>
          </h2>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {config.relatedToolIds.map((rId) => {
              const rTool = tools.find(t => t.id === rId);
              if (!rTool) return null;

              // Match routeConfig by toolId
              const matchConfig = Object.values(routeConfigs).find(rc => rc.toolId === rId);
              const path = matchConfig ? matchConfig.path : '/';

              return (
                <a
                  key={rId}
                  href={path}
                  onClick={(e) => handleLinkClick(e, path)}
                  className="p-3 bg-white hover:bg-indigo-50/50 border border-slate-200/90 hover:border-indigo-300 rounded-xl transition-all flex items-center justify-between group shadow-2xs"
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
