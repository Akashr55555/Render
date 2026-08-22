import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Terminal, Code2, Copy, Check, ExternalLink, ShieldCheck, Zap, Layers } from 'lucide-react';

interface ApiDocsModalProps {
  onClose: () => void;
}

export const ApiDocsModal: React.FC<ApiDocsModalProps> = ({ onClose }) => {
  const [activeTab, setActiveTab] = useState<'curl' | 'nodejs' | 'python'>('curl');
  const [copied, setCopied] = useState<string | null>(null);

  const copyToClipboard = (code: string, id: string) => {
    navigator.clipboard.writeText(code);
    setCopied(id);
    setTimeout(() => setCopied(null), 2000);
  };

  const curlExample = `# 1. Merge PDF documents
curl -X POST https://pdfsketch.com/api/v1/merge \\
  -F "files=@document1.pdf" \\
  -F "files=@document2.pdf" \\
  --output merged.pdf

# 2. Compress PDF
curl -X POST https://pdfsketch.com/api/v1/compress \\
  -F "file=@large_document.pdf" \\
  -F "level=medium" \\
  --output compressed.pdf

# 3. Watermark Document
curl -X POST https://pdfsketch.com/api/v1/watermark \\
  -F "file=@contract.pdf" \\
  -F "text=CONFIDENTIAL" \\
  --output watermarked.pdf`;

  const nodeExample = `import fs from 'fs';
import FormData from 'form-data';
import axios from 'axios';

async function mergePdfs() {
  const form = new FormData();
  form.append('files', fs.createReadStream('file1.pdf'));
  form.append('files', fs.createReadStream('file2.pdf'));

  const response = await axios.post('https://pdfsketch.com/api/v1/merge', form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer',
  });

  fs.writeFileSync('output.pdf', response.data);
  console.log('PDF merged successfully!');
}

mergePdfs();`;

  const pythonExample = `import requests

def merge_pdfs():
    files = [
        ('files', open('doc1.pdf', 'rb')),
        ('files', open('doc2.pdf', 'rb'))
    ]
    response = requests.post('https://pdfsketch.com/api/v1/merge', files=files)
    
    with open('output.pdf', 'wb') as f:
        f.write(response.content)
    print("PDF merged successfully!")

merge_pdfs()`;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 15 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 15 }}
          className="bg-white rounded-3xl max-w-3xl w-full p-6 sm:p-8 shadow-2xl relative border border-slate-100 z-10 my-auto max-h-[90vh] overflow-y-auto text-left"
        >
          <button
            onClick={onClose}
            className="sticky top-0 float-right z-20 p-2 text-slate-400 hover:text-slate-600 rounded-full hover:bg-slate-100 transition-colors bg-white/90 backdrop-blur-xs"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="mb-6 pr-8">
            <span className="inline-flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full mb-2">
              <Terminal className="w-3.5 h-3.5" />
              Developer API v1
            </span>
            <h2 className="text-2xl font-bold font-heading text-slate-900 mb-1">
              Programmatic PDF Automation API
            </h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Integrate high-speed PDF operations directly into your applications, microservices, and CI/CD pipelines.
            </p>
          </div>

          {/* Feature Highlights */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-6">
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Zap className="w-4 h-4 text-amber-500 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-800">Ultra Fast</h4>
              <p className="text-[11px] text-slate-500">Sub-second execution with streaming binary responses.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <ShieldCheck className="w-4 h-4 text-emerald-600 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-800">Secure by Design</h4>
              <p className="text-[11px] text-slate-500">Automated ephemeral cleanup with zero retention.</p>
            </div>
            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-100">
              <Layers className="w-4 h-4 text-indigo-600 mb-1.5" />
              <h4 className="text-xs font-bold text-slate-800">Chained Pipelines</h4>
              <p className="text-[11px] text-slate-500">Execute multi-stage workflow actions in a single HTTP call.</p>
            </div>
          </div>

          {/* Code Tabs */}
          <div className="rounded-2xl bg-slate-950 text-slate-100 border border-slate-800 overflow-hidden mb-6">
            <div className="flex items-center justify-between px-4 py-2.5 bg-slate-900 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setActiveTab('curl')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    activeTab === 'curl' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  cURL
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('nodejs')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    activeTab === 'nodejs' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Node.js
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('python')}
                  className={`px-3 py-1 text-xs font-mono rounded-lg transition-colors ${
                    activeTab === 'python' ? 'bg-indigo-600 text-white font-bold' : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Python
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  const code = activeTab === 'curl' ? curlExample : activeTab === 'nodejs' ? nodeExample : pythonExample;
                  copyToClipboard(code, 'tab-code');
                }}
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-white px-2 py-1 rounded-md hover:bg-slate-800 transition-colors font-mono"
              >
                {copied === 'tab-code' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Copied</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 text-xs font-mono leading-relaxed overflow-x-auto text-emerald-400">
              <code>
                {activeTab === 'curl' && curlExample}
                {activeTab === 'nodejs' && nodeExample}
                {activeTab === 'python' && pythonExample}
              </code>
            </pre>
          </div>

          {/* Endpoints Table */}
          <div className="space-y-2 mb-6">
            <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Available v1 Endpoints</h4>
            <div className="border border-slate-200 rounded-xl divide-y divide-slate-100 overflow-hidden text-xs">
              <div className="p-2.5 flex items-center justify-between bg-slate-50 font-semibold text-slate-600">
                <span>Endpoint</span>
                <span>Method / Format</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="font-mono font-medium text-indigo-600">/api/v1/merge</div>
                <span className="text-slate-500">POST multipart/form-data (files[])</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="font-mono font-medium text-indigo-600">/api/v1/compress</div>
                <span className="text-slate-500">POST multipart/form-data (file, level)</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="font-mono font-medium text-indigo-600">/api/v1/watermark</div>
                <span className="text-slate-500">POST multipart/form-data (file, text)</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="font-mono font-medium text-indigo-600">/api/v1/workflow</div>
                <span className="text-slate-500">POST multipart/form-data (files[], options)</span>
              </div>
              <div className="p-2.5 flex items-center justify-between">
                <div className="font-mono font-medium text-indigo-600">/api/v1/docs</div>
                <span className="text-slate-500">GET application/json (OpenAPI 3.0)</span>
              </div>
            </div>
          </div>

          <div className="flex justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-5 py-2.5 bg-slate-900 text-white font-semibold rounded-xl hover:bg-slate-800 transition-colors text-sm shadow-md"
            >
              Done
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
