import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Check, Zap, ShieldCheck, Sparkles, FileText, Crown, ArrowRight } from 'lucide-react';

interface PremiumModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPlan: (plan: 'monthly' | 'annual') => void;
}

export const PremiumModal: React.FC<PremiumModalProps> = ({
  isOpen,
  onClose,
  onSelectPlan,
}) => {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('annual');

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-100 p-6 sm:p-8"
        >
          {/* Close button */}
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Header */}
          <div className="text-center mb-6">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-50 text-amber-700 text-xs font-bold uppercase tracking-wider mb-2 border border-amber-200">
              <Crown className="w-4 h-4 fill-amber-500 text-amber-500" /> PDFSketch Premium
            </div>
            <h2 className="text-2xl sm:text-3xl font-black font-heading text-slate-900 tracking-tight">
              Supercharge your PDF workflow
            </h2>
            <p className="text-slate-600 text-xs sm:text-sm mt-1 max-w-md mx-auto">
              Get full access to all PDF tools, unlimited file sizes, OCR text recognition, and batch processing.
            </p>
          </div>

          {/* Billing Cycle Selector */}
          <div className="flex justify-center mb-6">
            <div className="bg-slate-100 p-1 rounded-2xl flex items-center border border-slate-200">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-white text-slate-900 shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Monthly Billing
              </button>
              <button
                onClick={() => setBillingCycle('annual')}
                className={`px-4 py-1.5 rounded-xl text-xs sm:text-sm font-bold transition-all relative ${
                  billingCycle === 'annual'
                    ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Annual Billing
                <span className="ml-1.5 px-1.5 py-0.5 bg-amber-400 text-slate-950 text-[10px] font-black rounded-full uppercase">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Price Tag */}
          <div className="bg-gradient-to-br from-indigo-50/80 via-purple-50/40 to-slate-50 border border-indigo-100 rounded-2xl p-5 mb-6 text-center relative overflow-hidden">
            <div className="text-3xl sm:text-4xl font-black text-slate-900 mb-0.5">
              {billingCycle === 'annual' ? '$3.99' : '$4.99'}
              <span className="text-xs font-semibold text-slate-500">/month</span>
            </div>
            <p className="text-xs text-slate-500 font-medium">
              {billingCycle === 'annual' ? 'Billed annually ($47.88/yr)' : 'Billed monthly, cancel anytime'}
            </p>
          </div>

          {/* Features Checklist */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 mb-6 text-xs sm:text-sm text-slate-700">
            <div className="flex items-center gap-2 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Unlimited file size & pages</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Batch multi-file conversions</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>High-accuracy OCR Extraction</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Zero waiting queue times</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>100% Ad-free experience</span>
            </div>
            <div className="flex items-center gap-2 font-medium">
              <div className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <Check className="w-3.5 h-3.5" />
              </div>
              <span>Dedicated 24/7 priority support</span>
            </div>
          </div>

          {/* Call To Action */}
          <button
            onClick={() => {
              onSelectPlan(billingCycle);
              onClose();
            }}
            className="w-full bg-gradient-to-r from-indigo-600 via-purple-600 to-sky-500 hover:from-indigo-700 hover:to-purple-700 text-white font-bold text-base py-3.5 px-6 rounded-2xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 group"
          >
            <span>Upgrade to Premium Now</span>
            <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
          </button>

          <p className="text-[11px] text-center text-slate-400 mt-3">
            Secure 256-bit SSL encrypted checkout. 14-day money-back guarantee.
          </p>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
