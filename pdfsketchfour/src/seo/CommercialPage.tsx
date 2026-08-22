import React from 'react';
import { SeoRouteConfig } from './seoTypes';
import { CheckCircle2, ArrowRight, Building2, ShieldCheck, Code2, GraduationCap, CreditCard, Users } from 'lucide-react';

interface CommercialPageProps {
  config: SeoRouteConfig;
  onNavigate: (path: string) => void;
}

const iconFor = (slug: string) => {
  if (slug.includes('business') || slug.includes('teams')) return Building2;
  if (slug.includes('education')) return GraduationCap;
  if (slug.includes('security')) return ShieldCheck;
  if (slug.includes('api') || slug.includes('developers')) return Code2;
  if (slug.includes('pricing')) return CreditCard;
  return Users;
};

export const CommercialPage: React.FC<CommercialPageProps> = ({ config, onNavigate }) => {
  const Icon = iconFor(config.slug);
  const bullets = config.features || [];
  return (
    <article className="max-w-6xl mx-auto px-4 py-10 text-slate-800">
      <nav aria-label="Breadcrumb" className="mb-7">
        <ol className="flex items-center gap-2 text-xs font-semibold text-slate-500">
          {config.breadcrumbs.map((crumb, idx) => (
            <li key={idx} className="flex items-center gap-2">
              {idx > 0 && <span aria-hidden="true">/</span>}
              {idx === config.breadcrumbs.length - 1 ? <span className="text-slate-900">{crumb.name}</span> : (
                <a href={crumb.path} onClick={(e) => { e.preventDefault(); onNavigate(crumb.path); }} className="hover:text-indigo-600">{crumb.name}</a>
              )}
            </li>
          ))}
        </ol>
      </nav>

      <header className="max-w-4xl mx-auto text-center mb-12">
        <div className="mx-auto mb-5 w-14 h-14 rounded-2xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
          <Icon className="w-7 h-7" />
        </div>
        <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-slate-900 mb-4">{config.h1}</h1>
        <p className="text-base sm:text-lg leading-8 text-slate-600">{config.subtitle}</p>
        <div className="mt-7 flex flex-wrap justify-center gap-3">
          <a href="/" onClick={(e) => { e.preventDefault(); onNavigate('/'); }} className="inline-flex items-center gap-2 rounded-xl bg-indigo-600 text-white px-5 py-3 font-bold text-sm hover:bg-indigo-700">
            Explore PDFly <ArrowRight className="w-4 h-4" />
          </a>
          <a href="/guides/" onClick={(e) => { e.preventDefault(); onNavigate('/guides/'); }} className="inline-flex items-center rounded-xl border border-slate-300 bg-white px-5 py-3 font-bold text-sm text-slate-700 hover:border-indigo-300">
            Read the Knowledge Hub
          </a>
        </div>
      </header>

      <section className="grid md:grid-cols-3 gap-5 mb-12">
        {bullets.map((feature, index) => (
          <div key={index} className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 mb-3" />
            <h2 className="font-bold text-slate-900 mb-2">{feature.title}</h2>
            <p className="text-sm leading-6 text-slate-600">{feature.desc}</p>
          </div>
        ))}
      </section>

      {config.quickAnswer && (
        <section className="bg-slate-900 text-white rounded-3xl p-7 sm:p-10 mb-12">
          <h2 className="text-xl font-bold mb-3">Why PDFly?</h2>
          <p className="text-slate-300 leading-7">{config.quickAnswer}</p>
        </section>
      )}

      {config.faqs?.length > 0 && (
        <section className="max-w-4xl mx-auto">
          <h2 className="text-2xl font-black text-slate-900 mb-6">Frequently Asked Questions</h2>
          <div className="space-y-4">
            {config.faqs.map((faq, i) => (
              <details key={i} className="group bg-white border border-slate-200 rounded-2xl p-5">
                <summary className="cursor-pointer font-bold text-slate-900">{faq.question}</summary>
                <p className="mt-3 text-sm leading-6 text-slate-600">{faq.answer}</p>
              </details>
            ))}
          </div>
        </section>
      )}
    </article>
  );
};
