import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { tools, categories } from './toolsData';
import { Tool } from './types';
import { ToolIcon } from './components/ToolIcon';
import { ToolModal } from './components/ToolModal';
import { PdfSketchLogo } from './components/PdfSketchLogo';
import { 
  Heart, 
  Grid, 
  Sparkles, 
  ShieldCheck, 
  Smartphone, 
  Monitor, 
  Briefcase, 
  ArrowUpRight,
  Globe,
  Menu,
  X,
  Search,
  Star,
  Zap,
  Lock,
  Layers,
  CheckCircle2
} from 'lucide-react';

export default function App() {
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeTool, setActiveTool] = useState<Tool | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [favorites, setFavorites] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('pdfsketch_favorites');
      return saved ? JSON.parse(saved) : ['merge', 'compress', 'split', 'watermark'];
    } catch {
      return ['merge', 'compress', 'split', 'watermark'];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('pdfsketch_favorites', JSON.stringify(favorites));
    } catch (e) {
      console.error(e);
    }
  }, [favorites]);

  const toggleFavorite = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setFavorites(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const filteredTools = tools.filter(t => {
    const matchesFilter = selectedFilter === 'all' || 
      (selectedFilter === 'favorites' ? favorites.includes(t.id) : t.cat === selectedFilter);
    const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          t.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.keywords?.some(k => k.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesFilter && matchesSearch;
  });

  const favoriteTools = tools.filter(t => favorites.includes(t.id));

  return (
    <div className="min-h-screen bg-slate-50/70 text-slate-800 flex flex-col font-sans selection:bg-indigo-100 selection:text-indigo-700">
      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 bg-white/90 backdrop-blur-md border-b border-slate-200/80 z-40 px-4 md:px-8 flex items-center justify-between shadow-xs">
        <div className="flex items-center gap-8">
          <a href="#" className="flex items-center group">
            <PdfSketchLogo size="md" />
          </a>

          <nav className="hidden lg:flex items-center gap-6 text-xs font-bold tracking-wider uppercase text-slate-600">
            <button 
              onClick={() => { setSelectedFilter('organize'); setSearchQuery(''); }} 
              className={`hover:text-indigo-600 transition-colors ${selectedFilter === 'organize' ? 'text-indigo-600 font-extrabold' : ''}`}
            >
              Merge & Split
            </button>
            <button 
              onClick={() => { setSelectedFilter('optimize'); setSearchQuery(''); }} 
              className={`hover:text-indigo-600 transition-colors ${selectedFilter === 'optimize' ? 'text-indigo-600 font-extrabold' : ''}`}
            >
              Compress PDF
            </button>
            <button 
              onClick={() => { setSelectedFilter('convert'); setSearchQuery(''); }} 
              className={`hover:text-indigo-600 transition-colors ${selectedFilter === 'convert' ? 'text-indigo-600 font-extrabold' : ''}`}
            >
              Convert PDF
            </button>
            <button 
              onClick={() => { setSelectedFilter('security'); setSearchQuery(''); }} 
              className={`hover:text-indigo-600 transition-colors ${selectedFilter === 'security' ? 'text-indigo-600 font-extrabold' : ''}`}
            >
              Security
            </button>
            <button 
              onClick={() => { setSelectedFilter('all'); setSearchQuery(''); }} 
              className={`hover:text-indigo-600 transition-colors ${selectedFilter === 'all' ? 'text-indigo-600 font-extrabold' : ''}`}
            >
              All Tools
            </button>
          </nav>
        </div>

        <div className="flex items-center gap-2.5">
          <button className="hidden sm:inline-flex items-center text-xs font-bold text-slate-700 hover:text-indigo-600 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-colors">
            Login
          </button>
          <button className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-xs px-4 py-2 rounded-full transition-all shadow-sm hover:shadow-md">
            Get Premium
          </button>
          <button 
            onClick={() => { setSelectedFilter('favorites'); setSearchQuery(''); }}
            className={`p-2 rounded-xl transition-colors relative ${selectedFilter === 'favorites' ? 'bg-amber-100 text-amber-700' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'}`}
            title="Your Favorites"
          >
            <Star className="w-4 h-4 fill-amber-400 text-amber-500" />
            {favorites.length > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-indigo-600 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                {favorites.length}
              </span>
            )}
          </button>
          <button 
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 text-slate-700 hover:text-indigo-600"
            aria-label="Toggle Navigation"
          >
            {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* Mobile Navigation Drawer */}
      <AnimatePresence>
        {mobileMenuOpen && (
          <motion.div 
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="fixed top-16 left-0 right-0 bg-white border-b border-slate-200 z-30 p-4 flex flex-col gap-2 lg:hidden shadow-xl"
          >
            {categories.map(c => (
              <button
                key={c.id}
                onClick={() => { setSelectedFilter(c.id); setSearchQuery(''); setMobileMenuOpen(false); }}
                className={`text-left py-2.5 px-4 text-sm font-semibold rounded-xl transition-colors ${selectedFilter === c.id ? 'bg-indigo-50 text-indigo-600' : 'text-slate-700 hover:bg-slate-50'}`}
              >
                {c.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content */}
      <main className="mt-16 flex-1">
        {/* Background Ambient Glow */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-96 bg-gradient-to-b from-indigo-50/80 via-purple-50/30 to-transparent pointer-events-none -z-10" />

        {/* Hero Section */}
        <section className="max-w-5xl mx-auto text-center px-4 pt-10 pb-6">
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
          >
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-purple-50 text-purple-700 text-xs font-bold uppercase tracking-wider mb-4 border border-purple-200/80">
              <Zap className="w-3.5 h-3.5 fill-purple-600 text-purple-600" /> 100% Client-Safe Online PDF Suite
            </span>
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black font-heading text-slate-900 tracking-tight leading-[1.15] mb-4">
              Every PDF tool you need, <br className="hidden sm:inline" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500">
                simplified in one place.
              </span>
            </h1>
            <p className="text-slate-600 text-sm sm:text-base md:text-lg max-w-2xl mx-auto font-normal leading-relaxed mb-8">
              Merge, split, compress, convert, rotate, watermark, and protect your PDF documents in seconds with high precision.
            </p>

            {/* Instant Search Bar */}
            <div className="max-w-xl mx-auto relative group">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-indigo-600 transition-colors">
                <Search className="w-5 h-5" />
              </div>
              <input 
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search tools... (e.g. merge, compress, watermark, protect)"
                className="w-full pl-11 pr-10 py-3.5 bg-white border border-slate-200 rounded-2xl text-slate-800 placeholder-slate-400 text-sm font-medium shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all"
              />
              {searchQuery && (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </motion.div>
        </section>

        {/* Category Filter Pills */}
        <section className="max-w-7xl mx-auto px-4 mb-8">
          <div className="flex flex-wrap justify-center gap-2">
            {categories.map(cat => (
              <button
                key={cat.id}
                onClick={() => { setSelectedFilter(cat.id); setSearchQuery(''); }}
                className={`px-4 py-2 text-xs sm:text-sm font-bold rounded-full border transition-all ${
                  selectedFilter === cat.id
                    ? 'bg-slate-900 text-white border-slate-900 shadow-sm scale-105'
                    : cat.id === 'workflows'
                    ? 'bg-gradient-to-r from-indigo-50 via-purple-50 to-sky-50 text-purple-700 border-purple-200 hover:border-purple-300'
                    : 'bg-white text-slate-700 border-slate-200 hover:border-slate-300 hover:bg-slate-50'
                }`}
              >
                {cat.id === 'favorites' && <Star className="w-3.5 h-3.5 inline mr-1 fill-amber-400 text-amber-500" />}
                {cat.label}
              </button>
            ))}
          </div>
        </section>

        {/* Search / Filter Counter Header */}
        <section className="max-w-7xl mx-auto px-4 mb-4 flex justify-between items-center text-xs font-semibold text-slate-500">
          <div>
            Showing <span className="text-slate-900 font-bold">{filteredTools.length}</span> tools
            {searchQuery && <span> matching "<span className="text-indigo-600">{searchQuery}</span>"</span>}
          </div>
          {favorites.length > 0 && selectedFilter !== 'favorites' && (
            <button 
              onClick={() => setSelectedFilter('favorites')}
              className="text-amber-600 hover:underline flex items-center gap-1 font-bold"
            >
              <Star className="w-3 h-3 fill-amber-400" />
              <span>View Saved Favorites ({favorites.length})</span>
            </button>
          )}
        </section>

        {/* Tools Grid */}
        <section className="max-w-7xl mx-auto px-4 mb-16">
          <motion.div 
            layout
            className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4"
          >
            <AnimatePresence>
              {filteredTools.map(tool => {
                const isFav = favorites.includes(tool.id);
                return (
                  <motion.div
                    key={tool.id}
                    layout
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ duration: 0.2 }}
                    onClick={() => setActiveTool(tool)}
                    className="glow-card bg-white border border-slate-200/90 hover:border-indigo-300 rounded-2xl p-5 flex flex-col justify-between cursor-pointer transition-all relative group min-h-[190px]"
                  >
                    {/* Top Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <ToolIcon name={tool.icon} />
                      
                      <div className="flex items-center gap-1.5">
                        {tool.isNew && (
                          <span className="text-[10px] font-extrabold bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full uppercase tracking-wider">
                            New
                          </span>
                        )}
                        <button
                          onClick={(e) => toggleFavorite(e, tool.id)}
                          className="p-1.5 text-slate-300 hover:text-amber-400 rounded-full transition-colors"
                          title={isFav ? "Remove favorite" : "Bookmark tool"}
                        >
                          <Star className={`w-4 h-4 ${isFav ? 'fill-amber-400 text-amber-400' : ''}`} />
                        </button>
                      </div>
                    </div>

                    <div>
                      <h3 className="text-base font-bold font-heading text-slate-900 group-hover:text-indigo-600 transition-colors mb-1.5">
                        {tool.title}
                      </h3>
                      <p className="text-xs text-slate-500 leading-relaxed line-clamp-3 font-normal">
                        {tool.desc}
                      </p>
                    </div>
                  </motion.div>
                );
              })}
            </AnimatePresence>

            {/* Empty Search Result Fallback */}
            {filteredTools.length === 0 && (
              <div className="col-span-full py-12 text-center bg-white rounded-2xl border border-slate-200 p-8">
                <Search className="w-12 h-12 text-slate-300 mx-auto mb-3" />
                <h3 className="text-lg font-bold text-slate-800 mb-1">No tools matched your search</h3>
                <p className="text-slate-500 text-sm mb-4">Try searching for generic terms like "pdf", "convert", or "merge"</p>
                <button 
                  onClick={() => { setSearchQuery(''); setSelectedFilter('all'); }}
                  className="px-4 py-2 bg-indigo-600 text-white font-bold text-xs rounded-xl hover:bg-indigo-700 transition-colors"
                >
                  Clear Filters
                </button>
              </div>
            )}
          </motion.div>
        </section>

        {/* Feature Highlights Section */}
        <section className="bg-white py-16 border-y border-slate-200/80">
          <div className="max-w-7xl mx-auto px-4">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-extrabold font-heading text-slate-900 mb-3">
                Built for security, speed, and precision
              </h2>
              <p className="text-slate-600 text-sm sm:text-base">
                Your privacy is paramount. Files are processed locally or securely handled with end-to-end encryption and auto-deleted after processing.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-6">
              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 transition-all hover:bg-white hover:shadow-md">
                <div className="w-12 h-12 bg-indigo-100/80 text-indigo-600 rounded-xl flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold font-heading text-lg text-slate-900 mb-2">TLS Encryption & Auto-Cleanup</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  All communications use SSL/TLS encryption. Documents are automatically wiped from servers shortly after processing.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 transition-all hover:bg-white hover:shadow-md">
                <div className="w-12 h-12 bg-purple-100/80 text-purple-600 rounded-xl flex items-center justify-center mb-4">
                  <Zap className="w-6 h-6" />
                </div>
                <h3 className="font-bold font-heading text-lg text-slate-900 mb-2">High-Speed Processing</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Optimized serverless node workers split, compress, and render high-resolution PDFs in milliseconds.
                </p>
              </div>

              <div className="bg-slate-50/70 border border-slate-200/80 rounded-2xl p-6 transition-all hover:bg-white hover:shadow-md">
                <div className="w-12 h-12 bg-sky-100/80 text-sky-600 rounded-xl flex items-center justify-center mb-4">
                  <Monitor className="w-6 h-6" />
                </div>
                <h3 className="font-bold font-heading text-lg text-slate-900 mb-2">Cross-Platform Ready</h3>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  Works seamlessly on Chrome, Safari, Firefox, iOS, Android, macOS, and Windows with no plugin setup required.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Premium Callout Section */}
        <section className="max-w-7xl mx-auto px-4 py-16">
          <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-600 rounded-3xl p-8 sm:p-12 text-white shadow-xl relative overflow-hidden flex flex-col md:flex-row items-center justify-between gap-8">
            <div className="max-w-xl relative z-10">
              <span className="inline-flex items-center gap-1 bg-white/20 text-white text-[11px] font-extrabold uppercase tracking-wider px-3 py-1 rounded-full mb-3 backdrop-blur-md">
                <Sparkles className="w-3.5 h-3.5" /> PDFSketch Pro Workspace
              </span>
              <h2 className="text-2xl sm:text-3xl font-black font-heading mb-3">
                Unlock Unlimited Batch Processing & OCR
              </h2>
              <p className="text-indigo-100 text-sm leading-relaxed mb-6">
                Process thousands of files simultaneously, apply custom watermark signatures, OCR scanned documents, and store templates safely.
              </p>
              <div className="flex flex-wrap gap-4 items-center">
                <button className="bg-white text-indigo-700 hover:bg-indigo-50 font-extrabold text-sm px-6 py-3 rounded-xl shadow-md transition-all hover:scale-105">
                  Start 14-Day Free Trial
                </button>
                <span className="text-xs text-indigo-200">No credit card required</span>
              </div>
            </div>

            <div className="relative z-10 flex flex-col gap-2.5 bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl shrink-0 w-full md:w-auto">
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Batch merge up to 500 files</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Unlimited OCR Text Recognition</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-semibold">
                <CheckCircle2 className="w-4 h-4 text-sky-300" />
                <span>Desktop & Offline Access</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-900 text-slate-400 text-xs py-12 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 grid grid-cols-1 md:grid-cols-6 gap-8 mb-8">
          <div className="md:col-span-2 space-y-4">
            <PdfSketchLogo size="lg" className="bg-white/95 p-3 rounded-xl inline-flex border border-slate-700/50 shadow-md" />
            <p className="text-slate-400 text-xs leading-relaxed max-w-sm">
              PDFSketch is the intuitive, browser-based online PDF toolkit for merging, splitting, compressing, converting, and editing document workflows effortlessly.
            </p>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3">Solutions</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Merge PDF</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Split PDF</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Compress PDF</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Convert to Word</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3">Security</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Terms of Service</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Security Architecture</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">GDPR Compliance</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3">Apps</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition-colors">PDFSketch Desktop</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">PDFSketch Mobile</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Chrome Extension</a></li>
            </ul>
          </div>
          <div>
            <h4 className="text-white font-bold uppercase tracking-wider mb-3">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="hover:text-purple-400 transition-colors">About PDFSketch</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Careers</a></li>
              <li><a href="#" className="hover:text-purple-400 transition-colors">Support Center</a></li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-slate-500 text-[11px]">
          <div className="flex items-center gap-2">
            <Globe className="w-4 h-4 text-slate-500" />
            <span>English (US)</span>
          </div>
          <div className="text-center md:text-right space-y-1">
            <p>© PDFSketch 2026 — Professional Online PDF Utility Suite. All rights reserved.</p>
            <p className="text-[10px] text-slate-600">PDFSketch is an independent software product. All third-party trademarks and brand names are property of their respective owners.</p>
          </div>
        </div>
      </footer>

      {/* Active Tool Processing Modal */}
      {activeTool && (
        <ToolModal tool={activeTool} onClose={() => setActiveTool(null)} />
      )}
    </div>
  );
}

