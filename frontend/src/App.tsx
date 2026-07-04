import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf, AlertCircle, Send, RotateCcw, Compass,
  MessageCircle
} from 'lucide-react';
import ProductAnalysisCard from './components/ProductAnalysisCard';
import AlternativesGrid from './components/AlternativesGrid';
import ComparisonTable from './components/ComparisonTable';
import BestChoiceBanner from './components/BestChoiceBanner';
import GreenTipsList from './components/GreenTipsList';
import LoadingState from './components/LoadingState';
import { analyzeProduct, chatWithEco } from './api/client';
import { ProductAnalysis } from './types/product';

// ── Detect if input is a general question vs a product description ─────────────
function isQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  // Starts with a question word or ends with '?'
  const questionStarters = [
    'what', 'which', 'how', 'why', 'when', 'where', 'who', 'is', 'are',
    'can', 'could', 'should', 'do', 'does', 'will', 'would', 'tell me',
    'explain', 'describe', 'give me', 'list', 'i need to know', 'i want to know',
  ];
  if (t.endsWith('?')) return true;
  return questionStarters.some(w => t.startsWith(w));
}

// ── Message types ─────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: 'user' | 'analysis' | 'answer' | 'error';
  content: string;
  analysis?: ProductAnalysis;
}

// ── App ───────────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'structured'>('simple');

  // Structured form state
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCountry, setProdCountry] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  const buildStructuredDescription = () => {
    if (!prodName.trim() || !prodCategory.trim()) return null;
    return `Analyze this product:\n- Product Name: ${prodName.trim()}\n- Category: ${prodCategory.trim()}${prodMaterial.trim() ? `\n- Material: ${prodMaterial.trim()}` : ''}${prodBrand.trim() ? `\n- Brand: ${prodBrand.trim()}` : ''}${prodCountry.trim() ? `\n- Country of Manufacture: ${prodCountry.trim()}` : ''}`;
  };

  const clearStructuredForm = () => {
    setProdName(''); setProdCategory(''); setProdMaterial('');
    setProdBrand(''); setProdCountry('');
  };

  // ── Core submit handler ────────────────────────────────────────────────────
  const handleSubmit = async (e?: React.FormEvent, overrideText?: string) => {
    e?.preventDefault();

    let rawText = '';
    let displayText = '';

    if (activeTab === 'structured') {
      const built = buildStructuredDescription();
      if (!built) return;
      rawText = built;
      displayText = `${prodName} (${prodCategory})${prodBrand ? ` by ${prodBrand}` : ''}`;
      clearStructuredForm();
    } else {
      const text = overrideText ?? inputValue;
      if (!text.trim()) return;
      rawText = text.trim();
      displayText = rawText.length > 100 ? rawText.slice(0, 100) + '…' : rawText;
      setInputValue('');
    }

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    setMessages(prev => [...prev, { id: userMsgId, type: 'user', content: displayText }]);
    setIsLoading(true);

    // Decide: general eco question or product analysis
    const treatAsQuestion = activeTab === 'simple' && isQuestion(rawText);

    try {
      if (treatAsQuestion) {
        const answer = await chatWithEco(rawText);
        setMessages(prev => [...prev, { id: aiMsgId, type: 'answer', content: answer }]);
      } else {
        const result = await analyzeProduct(rawText);
        setMessages(prev => [...prev, { id: aiMsgId, type: 'analysis', content: '', analysis: result }]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        { id: aiMsgId, type: 'error', content: err.message || 'Something went wrong. Please try again.' },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleClearConversation = () => {
    setMessages([]);
    setInputValue('');
    clearStructuredForm();
  };

  const isEmpty = messages.length === 0 && !isLoading;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-[#f6fcf8]">

      {/* ── Header ──────────────────────────────────────────────────────────── */}
      <header className="z-50 glass-panel border-b border-emerald-100/30 backdrop-blur-md px-4 md:px-6 py-3 shadow-sm flex-shrink-0">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer select-none" onClick={handleClearConversation}>
            <div className="bg-emerald-600 p-2 rounded-xl text-white shadow-md shadow-emerald-600/25">
              <Leaf className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-extrabold tracking-tight text-slate-800">
                Eco<span className="text-emerald-600">Pick</span>
              </h1>
              <p className="text-[9px] font-bold text-emerald-700 tracking-widest uppercase -mt-0.5">
                AI Sustainability Agent
              </p>
            </div>
          </div>

          {messages.length > 0 && (
            <button
              onClick={handleClearConversation}
              title="Clear conversation"
              className="flex items-center gap-1.5 px-3 py-1.5 border border-emerald-200 hover:bg-emerald-50 text-emerald-700 text-xs font-bold rounded-xl transition-all shadow-sm"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              New Chat
            </button>
          )}
        </div>
      </header>

      {/* ── Scrollable conversation area ────────────────────────────────────── */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-4xl mx-auto px-4 md:px-6 py-6 space-y-6">

          {/* Welcome hero – clean, no chips */}
          {isEmpty && (
            <div className="flex flex-col items-center justify-center min-h-[50vh] space-y-5 text-center px-4">
              <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-600/30">
                <Leaf className="w-10 h-10" />
              </div>

              <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                Ask me anything about{' '}
                <span className="text-emerald-600 bg-gradient-to-r from-emerald-600 to-teal-500 bg-clip-text text-transparent">
                  sustainability
                </span>
              </h2>

              <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-lg">
                Type a question about eco-friendly products, carbon footprint, sustainable materials, or describe a product to get a full environmental analysis.
              </p>
            </div>
          )}

          {/* ── Message thread ─────────────────────────────────────────────── */}
          {messages.map((msg) => (
            <div key={msg.id}>

              {/* User bubble */}
              {msg.type === 'user' && (
                <div className="flex justify-end">
                  <div className="max-w-[80%] bg-emerald-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm font-medium leading-relaxed">
                    {msg.content}
                  </div>
                </div>
              )}

              {/* Error bubble */}
              {msg.type === 'error' && (
                <div className="flex justify-start">
                  <div className="max-w-[80%] glass-panel border-l-4 border-rose-500 bg-rose-50/60 p-4 rounded-2xl rounded-tl-sm flex items-start gap-3 shadow-sm">
                    <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                    <div>
                      <p className="text-xs font-bold text-rose-800">Something went wrong</p>
                      <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{msg.content}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* ── General eco answer ─────────────────────────────────────── */}
              {msg.type === 'answer' && (
                <div className="flex justify-start animate-fade-in">
                  <div className="max-w-[90%] space-y-3">
                    {/* Badge */}
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">EcoPick Answer</span>
                    </div>

                    {/* Answer card */}
                    <div className="glass-panel border border-emerald-100/60 rounded-2xl rounded-tl-sm p-5 shadow-md">
                      {/* Render paragraphs and bullet lists from the answer */}
                      {msg.content.split('\n').map((line, i) => {
                        const trimmed = line.trim();
                        if (!trimmed) return <div key={i} className="h-2" />;
                        if (trimmed.startsWith('- ') || trimmed.startsWith('• ') || trimmed.startsWith('* ')) {
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                              <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                              <span>{trimmed.replace(/^[-•*]\s+/, '')}</span>
                            </div>
                          );
                        }
                        if (/^\d+\.\s/.test(trimmed)) {
                          const num = trimmed.match(/^(\d+)\.\s/)?.[1];
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                              <span className="text-emerald-600 font-bold w-5 flex-shrink-0 mt-0.5">{num}.</span>
                              <span>{trimmed.replace(/^\d+\.\s+/, '')}</span>
                            </div>
                          );
                        }
                        if (trimmed.startsWith('**') && trimmed.endsWith('**')) {
                          return <p key={i} className="text-sm font-bold text-slate-800 mt-2">{trimmed.replace(/\*\*/g, '')}</p>;
                        }
                        return <p key={i} className="text-sm text-slate-700 leading-relaxed">{trimmed}</p>;
                      })}
                    </div>
                  </div>
                </div>
              )}

              {/* ── Product analysis result ────────────────────────────────── */}
              {msg.type === 'analysis' && msg.analysis && (
                <div className="space-y-6 animate-fade-in">
                  <div className="flex items-center gap-2">
                    <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow">
                      <Leaf className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">EcoPick Analysis</span>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-stretch">
                    <div className="lg:col-span-1">
                      <ProductAnalysisCard analysis={msg.analysis.productAnalysis} />
                    </div>
                    <div className="lg:col-span-2">
                      <BestChoiceBanner
                        productName={msg.analysis.bestChoice.productName}
                        explanation={msg.analysis.bestChoice.explanation}
                      />
                    </div>
                  </div>

                  <AlternativesGrid alternatives={msg.analysis.alternatives} />

                  <ComparisonTable
                    productAnalysis={msg.analysis.productAnalysis}
                    alternatives={msg.analysis.alternatives}
                    bestChoiceName={msg.analysis.bestChoice.productName}
                  />

                  <GreenTipsList aiTips={msg.analysis.greenShoppingTips} />

                  {msg.analysis.dataDisclaimer && (
                    <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 flex items-start gap-2.5">
                      <Compass className="w-4 h-4 text-slate-400 flex-shrink-0 mt-0.5" />
                      <p className="text-xs text-slate-500 leading-relaxed">
                        <strong>Verification Notice:</strong> {msg.analysis.dataDisclaimer} Please verify prices, ratings, and availability directly with sellers before purchasing.
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}

          {/* Loading state */}
          {isLoading && (
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow">
                  <Leaf className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">EcoPick is thinking…</span>
              </div>
              <LoadingState />
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* ── Fixed chat input ─────────────────────────────────────────────────── */}
      <div className="flex-shrink-0 border-t border-emerald-100/40 bg-white/80 backdrop-blur-md shadow-[0_-4px_20px_-4px_rgba(16,185,129,0.08)] px-4 md:px-6 py-4">
        <div className="max-w-4xl mx-auto space-y-3">
          {/* Tab switcher */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('simple')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'simple'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Ask / Describe
            </button>
            <button
              type="button"
              onClick={() => setActiveTab('structured')}
              className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                activeTab === 'structured'
                  ? 'bg-emerald-600 text-white shadow'
                  : 'text-emerald-700 hover:bg-emerald-50 border border-emerald-200'
              }`}
            >
              Product Form
            </button>
          </div>

          {activeTab === 'simple' ? (
            <form onSubmit={handleSubmit} className="flex gap-3 items-end">
              <div className="flex-1">
                <textarea
                  ref={textareaRef}
                  rows={2}
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder="Ask an eco question or describe a product… (Enter to send)"
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-2xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-white outline-none transition-all placeholder-slate-400 resize-none text-sm leading-relaxed shadow-sm"
                />
              </div>
              <button
                type="submit"
                disabled={!inputValue.trim() || isLoading}
                className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl shadow-md transition-all ${
                  inputValue.trim() && !isLoading
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                    : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                }`}
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                <input type="text" placeholder="Product name *" value={prodName}
                  onChange={(e) => setProdName(e.target.value)} disabled={isLoading} required
                  className="px-3 py-2 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 bg-white outline-none text-sm placeholder-slate-400" />
                <input type="text" placeholder="Category *" value={prodCategory}
                  onChange={(e) => setProdCategory(e.target.value)} disabled={isLoading} required
                  className="px-3 py-2 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 bg-white outline-none text-sm placeholder-slate-400" />
                <input type="text" placeholder="Material (optional)" value={prodMaterial}
                  onChange={(e) => setProdMaterial(e.target.value)} disabled={isLoading}
                  className="px-3 py-2 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 bg-white outline-none text-sm placeholder-slate-400" />
                <input type="text" placeholder="Brand (optional)" value={prodBrand}
                  onChange={(e) => setProdBrand(e.target.value)} disabled={isLoading}
                  className="px-3 py-2 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 bg-white outline-none text-sm placeholder-slate-400" />
                <input type="text" placeholder="Country of manufacture (optional)" value={prodCountry}
                  onChange={(e) => setProdCountry(e.target.value)} disabled={isLoading}
                  className="px-3 py-2 rounded-xl border border-emerald-200 focus:ring-2 focus:ring-emerald-500 bg-white outline-none text-sm placeholder-slate-400 md:col-span-2" />
              </div>
              <div className="flex justify-end">
                <button type="submit"
                  disabled={!prodName.trim() || !prodCategory.trim() || isLoading}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all ${
                    prodName.trim() && prodCategory.trim() && !isLoading
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                      : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                  }`}>
                  <Sparkles className="w-4 h-4" />
                  Analyze Sustainability
                </button>
              </div>
            </form>
          )}

          <p className="text-[10px] text-slate-400 text-center font-medium">
            EcoPick uses AI to estimate environmental impact. Always verify prices and availability with sellers.
          </p>
        </div>
      </div>
    </div>
  );
};

export default App;
