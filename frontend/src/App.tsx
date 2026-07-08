import React, { useState, useRef, useEffect } from 'react';
import {
  Leaf, Sparkles, AlertCircle, Send, Compass,
  MessageCircle, Plus, Clock, Settings, Upload,
  Leaf as LeafIcon, Trash2
} from 'lucide-react';
import ProductAnalysisCard from './components/ProductAnalysisCard';
import AlternativesGrid from './components/AlternativesGrid';
import ComparisonTable from './components/ComparisonTable';
import BestChoiceBanner from './components/BestChoiceBanner';
import GreenTipsList from './components/GreenTipsList';
import LoadingState from './components/LoadingState';
import {
  analyzeProduct,
  chatWithEco,
  analyzeProductImage,
  fetchHistory,
  deleteHistoryItem,
  clearAllHistory
} from './api/client';

import { ProductAnalysis } from './types/product';

// ── Detect question vs product description ────────────────────────────────────
function isQuestion(text: string): boolean {
  const t = text.trim().toLowerCase();
  const starters = [
    'what', 'which', 'how', 'why', 'when', 'where', 'who', 'is', 'are',
    'can', 'could', 'should', 'do', 'does', 'will', 'would', 'tell me',
    'explain', 'describe', 'give me', 'list', 'i need to know', 'i want to know',
  ];
  if (t.endsWith('?')) return true;
  return starters.some(w => t.startsWith(w));
}

// ── Format Date/Time for History ──────────────────────────────────────────────
function formatTimeLabel(dateStr: string): string {
  try {
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMins / 60);
    
    if (diffMins < 1) return 'just now';
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    
    const days = Math.floor(diffHours / 24);
    if (days === 1) return 'yesterday';
    if (days < 7) return `${days}d ago`;
    
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  } catch (_) {
    return 'some time ago';
  }
}

// ── Types ─────────────────────────────────────────────────────────────────────
interface Message {
  id: string;
  type: 'user' | 'analysis' | 'answer' | 'error';
  content: string;
  analysis?: ProductAnalysis;
}

interface Session {
  id: string;
  title: string;
  timeLabel: string;
  messages: Message[];
}

// ── App ───────────────────────────────────────────────────────────────────────
export const App: React.FC = () => {
  const [sessions, setSessions] = useState<Session[]>([]);
  const [activeSessionId, setActiveSessionId] = useState<string | null>(null);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [activeTab, setActiveTab] = useState<'simple' | 'structured'>('simple');
  const [showAllHistory, setShowAllHistory] = useState(false);
  const [imageFile, setImageFile] = useState<File | null>(null);

  // Structured form
  const [prodName, setProdName] = useState('');
  const [prodCategory, setProdCategory] = useState('');
  const [prodMaterial, setProdMaterial] = useState('');
  const [prodBrand, setProdBrand] = useState('');
  const [prodCountry, setProdCountry] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  const activeSession = sessions.find(s => s.id === activeSessionId) ?? null;
  const messages = activeSession?.messages ?? [];
  const isEmpty = messages.length === 0 && !isLoading;

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // ── DB History loader on mount ──────────────────────────────────────────────
  useEffect(() => {
    async function loadHistory() {
      try {
        const historyData = await fetchHistory();
        const mappedSessions: Session[] = historyData.map((doc: any) => {
          const title = doc.productName || doc.productDescription.slice(0, 30);
          return {
            id: doc._id,
            title: title.length > 30 ? title.slice(0, 30) + '…' : title,
            timeLabel: formatTimeLabel(doc.createdAt),
            messages: [
              {
                id: `user-${doc._id}`,
                type: 'user',
                content: doc.productDescription,
              },
              {
                id: `analysis-${doc._id}`,
                type: 'analysis',
                content: '',
                analysis: doc.rawAnalysis,
              },
            ],
          };
        });
        setSessions(mappedSessions);
      } catch (err: any) {
        console.error('Failed to load history from database:', err);
      }
    }
    loadHistory();
  }, []);

  // ── Handle Deleting a Session from DB and state ─────────────────────────────
  const handleDeleteSession = async (e: React.MouseEvent, sessionId: string) => {
    e.stopPropagation();
    const confirmDelete = window.confirm("Are you sure you want to delete this analysis permanently?");
    if (!confirmDelete) return;

    try {
      await deleteHistoryItem(sessionId);
      setSessions(prev => prev.filter(s => s.id !== sessionId));
      if (activeSessionId === sessionId) {
        setActiveSessionId(null);
      }
    } catch (err: any) {
      alert(`Failed to delete session: ${err.message || err}`);
    }
  };

  // ── Handle Clearing All History from DB and state ───────────────────────────
  const handleClearAllHistory = async () => {
    const confirmClear = window.confirm("Are you sure you want to clear all analysis history permanently?");
    if (!confirmClear) return;

    try {
      await clearAllHistory();
      setSessions([]);
      setActiveSessionId(null);
    } catch (err: any) {
      alert(`Failed to clear history: ${err.message || err}`);
    }
  };


  // ── Session helpers ───────────────────────────────────────────────────────
  const createNewSession = () => {
    const id = `session-${Date.now()}`;
    const session: Session = { id, title: 'New Chat', timeLabel: 'just now', messages: [] };
    setSessions(prev => [session, ...prev]);
    setActiveSessionId(id);
    setInputValue('');
    clearStructuredForm();
    setImageFile(null);
    return id;
  };

  const updateSession = (sessionId: string, msgs: Message[], firstUserMsg: string) => {
    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, messages: msgs, title: firstUserMsg.slice(0, 40) + (firstUserMsg.length > 40 ? '…' : '') }
        : s
    ));
  };

  const buildStructuredDescription = () => {
    if (!prodName.trim() || !prodCategory.trim()) return null;
    return `Analyze this product:\n- Product Name: ${prodName.trim()}\n- Category: ${prodCategory.trim()}${prodMaterial.trim() ? `\n- Material: ${prodMaterial.trim()}` : ''}${prodBrand.trim() ? `\n- Brand: ${prodBrand.trim()}` : ''}${prodCountry.trim() ? `\n- Country of Manufacture: ${prodCountry.trim()}` : ''}`;
  };

  const clearStructuredForm = () => {
    setProdName(''); setProdCategory(''); setProdMaterial('');
    setProdBrand(''); setProdCountry('');
  };

  // ── Submit ────────────────────────────────────────────────────────────────
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
      if (!text.trim() && !imageFile) return;

      if (imageFile && !text.trim()) {
        rawText = `image-upload`;
        displayText = `📷 ${imageFile.name}`;
      } else if (imageFile && text.trim()) {
        rawText = `image-upload`;
        displayText = `📷 ${imageFile.name}${text.trim() ? ` — ${text.trim()}` : ''}`;
      } else {
        rawText = text.trim();
        displayText = rawText.length > 100 ? rawText.slice(0, 100) + '…' : rawText;
      }
      setInputValue('');
      setImageFile(null);
    }

    // Ensure active session
    let sessionId = activeSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
    }

    const userMsgId = `user-${Date.now()}`;
    const aiMsgId = `ai-${Date.now()}`;

    const userMsg: Message = { id: userMsgId, type: 'user', content: displayText };
    const currentMsgs = [...(sessions.find(s => s.id === sessionId)?.messages ?? []), userMsg];

    setSessions(prev => prev.map(s =>
      s.id === sessionId
        ? { ...s, messages: currentMsgs, title: displayText.slice(0, 40) }
        : s
    ));
    setActiveSessionId(sessionId);
    setIsLoading(true);

    const treatAsQuestion = activeTab === 'simple' && isQuestion(rawText) && !imageFile;

    try {
      let aiMsg: Message;
      let finalSessionId = sessionId;

      if (imageFile) {
        // Send actual image bytes to Gemini vision
        const capturedFile = imageFile;
        setImageFile(null);
        const result = await analyzeProductImage(capturedFile, inputValue.trim());
        aiMsg = { id: aiMsgId, type: 'analysis', content: '', analysis: result };
        if (result._id) {
          finalSessionId = result._id;
        }
      } else if (treatAsQuestion) {
        const answer = await chatWithEco(rawText);
        aiMsg = { id: aiMsgId, type: 'answer', content: answer };
      } else {
        const result = await analyzeProduct(rawText);
        aiMsg = { id: aiMsgId, type: 'analysis', content: '', analysis: result };
        if (result._id) {
          finalSessionId = result._id;
        }
      }
      const updatedMsgs = [...currentMsgs, aiMsg];
      
      // Update session title & ID mapping
      setSessions(prev => prev.map(s => {
        if (s.id === sessionId) {
          const finalTitle = aiMsg.analysis?.productAnalysis.product || displayText;
          return {
            ...s,
            id: finalSessionId,
            messages: updatedMsgs,
            title: finalTitle.length > 30 ? finalTitle.slice(0, 30) + '…' : finalTitle
          };
        }
        return s;
      }));
      setActiveSessionId(finalSessionId);
    } catch (err: any) {
      const errMsg: Message = { id: aiMsgId, type: 'error', content: err.message || 'Something went wrong. Please try again.' };
      updateSession(sessionId, [...currentMsgs, errMsg], displayText);
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

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) setImageFile(file);
    e.target.value = '';
  };

  const visibleSessions = showAllHistory ? sessions : sessions.slice(0, 5);

  return (
    <div className="flex h-screen overflow-hidden bg-[#f0faf4]">

      {/* ── LEFT SIDEBAR ──────────────────────────────────────────────────── */}
      <aside className="w-56 flex-shrink-0 bg-white border-r border-emerald-100 flex flex-col py-4 px-3 gap-3">

        {/* Logo */}
        <div className="flex items-center gap-2 px-1 mb-1 cursor-pointer select-none" onClick={() => { setActiveSessionId(null); }}>
          <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-sm">
            <LeafIcon className="w-4 h-4" />
          </div>
          <div>
            <span className="text-base font-extrabold tracking-tight text-slate-800">
              Eco<span className="text-emerald-600">Pick</span>
            </span>
            <p className="text-[8px] font-bold text-emerald-600 tracking-widest uppercase leading-none">
              AI SUSTAINABILITY AGENT
            </p>
          </div>
        </div>

        {/* New Chat */}
        <button
          onClick={createNewSession}
          className="flex items-center justify-center gap-2 w-full py-2.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-all shadow-sm"
        >
          <Plus className="w-4 h-4" />
          New Chat
        </button>

        {/* Recent history */}
        <div className="flex-1 overflow-y-auto space-y-1 min-h-0">
          {sessions.length > 0 && (
            <div className="flex items-center justify-between px-1 pt-1 pb-0.5">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                Recent
              </span>
              <button
                onClick={handleClearAllHistory}
                className="text-[9px] font-semibold text-rose-500 hover:text-rose-700 hover:underline transition-all"
              >
                Clear all
              </button>
            </div>
          )}
          {visibleSessions.map(session => (
            <div
              key={session.id}
              onClick={() => setActiveSessionId(session.id)}
              className={`group w-full text-left px-2.5 py-2 rounded-lg text-xs transition-all flex items-start gap-2 cursor-pointer ${
                activeSessionId === session.id
                  ? 'bg-emerald-50 text-emerald-800 font-semibold'
                  : 'text-slate-600 hover:bg-slate-50'
              }`}
            >
              <Compass className="w-3.5 h-3.5 text-emerald-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1 min-w-0">
                <p className="truncate font-medium">{session.title}</p>
                <p className="text-[10px] text-slate-400 mt-0.5">{session.timeLabel}</p>
              </div>
              <button
                onClick={(e) => handleDeleteSession(e, session.id)}
                className="opacity-0 group-hover:opacity-100 text-slate-400 hover:text-rose-500 p-0.5 rounded transition-all flex-shrink-0"
                title="Delete this analysis"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}

          {sessions.length > 5 && (
            <button
              onClick={() => setShowAllHistory(v => !v)}
              className="w-full flex items-center gap-2 px-2.5 py-2 text-xs text-slate-500 hover:text-emerald-700 rounded-lg hover:bg-slate-50 transition-all"
            >
              <Clock className="w-3.5 h-3.5" />
              {showAllHistory ? 'Show less' : 'View all history'}
            </button>
          )}
        </div>

        {/* Settings */}
        <button className="flex items-center gap-2 px-2.5 py-2 rounded-lg text-xs text-slate-500 hover:bg-slate-50 hover:text-slate-700 transition-all mt-auto">
          <Settings className="w-3.5 h-3.5" />
          Settings
        </button>
      </aside>

      {/* ── MAIN AREA ─────────────────────────────────────────────────────── */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">

        {/* Scrollable conversation */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-5xl mx-auto px-6 py-8 space-y-8">

            {/* Welcome hero */}
            {isEmpty && (
              <div className="flex flex-col items-center justify-center min-h-[55vh] space-y-5 text-center">
                <div className="bg-emerald-600 p-4 rounded-2xl text-white shadow-lg shadow-emerald-600/20">
                  <Leaf className="w-10 h-10" />
                </div>
                <h2 className="text-3xl md:text-4xl font-extrabold tracking-tight text-slate-800">
                  Ask me anything about{' '}
                  <span className="text-emerald-600">sustainability</span>
                </h2>
                <p className="text-slate-500 text-sm md:text-base leading-relaxed max-w-md">
                  Type a question about eco-friendly products, carbon footprint, sustainable materials, or describe a product to get a full environmental analysis.
                </p>
              </div>
            )}

            {/* Message thread */}
            {messages.map((msg) => (
              <div key={msg.id}>

                {/* User bubble */}
                {msg.type === 'user' && (
                  <div className="flex justify-end">
                    <div className="max-w-[75%] bg-emerald-600 text-white px-4 py-3 rounded-2xl rounded-tr-sm shadow-md text-sm font-medium leading-relaxed">
                      {msg.content}
                    </div>
                  </div>
                )}

                {/* Error */}
                {msg.type === 'error' && (
                  <div className="flex justify-start">
                    <div className="max-w-[80%] bg-rose-50 border border-rose-200 border-l-4 border-l-rose-500 p-4 rounded-2xl rounded-tl-sm flex items-start gap-3 shadow-sm">
                      <AlertCircle className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-rose-800">Something went wrong</p>
                        <p className="text-xs text-rose-700 mt-0.5 leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Eco answer */}
                {msg.type === 'answer' && (
                  <div className="animate-fade-in space-y-2">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-sm">
                        <MessageCircle className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">EcoPick Answer</span>
                    </div>
                    <div className="bg-white border border-emerald-100 rounded-2xl rounded-tl-sm p-5 shadow-sm space-y-2">
                      {msg.content.split('\n').map((line, i) => {
                        const t = line.trim();
                        if (!t) return <div key={i} className="h-1.5" />;
                        if (t.startsWith('- ') || t.startsWith('• ') || t.startsWith('* ')) {
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                              <span className="text-emerald-500 font-bold mt-0.5 flex-shrink-0">•</span>
                              <span>{t.replace(/^[-•*]\s+/, '')}</span>
                            </div>
                          );
                        }
                        if (/^\d+\.\s/.test(t)) {
                          const num = t.match(/^(\d+)\.\s/)?.[1];
                          return (
                            <div key={i} className="flex items-start gap-2 text-sm text-slate-700 leading-relaxed">
                              <span className="text-emerald-600 font-bold w-5 flex-shrink-0 mt-0.5">{num}.</span>
                              <span>{t.replace(/^\d+\.\s+/, '')}</span>
                            </div>
                          );
                        }
                        if (/^\*\*(.+)\*\*$/.test(t)) {
                          return <p key={i} className="text-sm font-bold text-slate-800">{t.replace(/\*\*/g, '')}</p>;
                        }
                        return <p key={i} className="text-sm text-slate-700 leading-relaxed">{t}</p>;
                      })}
                    </div>
                  </div>
                )}

                {/* Product analysis */}
                {msg.type === 'analysis' && msg.analysis && (
                  <div className="space-y-6 animate-fade-in">
                    <div className="flex items-center gap-2">
                      <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-sm">
                        <Leaf className="w-4 h-4" />
                      </div>
                      <span className="text-xs font-bold text-emerald-700 uppercase tracking-wider">EcoPick Analysis</span>
                    </div>

                    <div className="grid grid-cols-1 xl:grid-cols-5 gap-6 items-stretch">
                      <div className="xl:col-span-2">
                        <ProductAnalysisCard analysis={msg.analysis.productAnalysis} />
                      </div>
                      <div className="xl:col-span-3">
                        <BestChoiceBanner
                          productName={msg.analysis.bestChoice.productName}
                          explanation={msg.analysis.bestChoice.explanation}
                        />
                      </div>
                    </div>

                    <AlternativesGrid
                      alternatives={msg.analysis.alternatives}
                      bestChoiceName={msg.analysis.bestChoice.productName}
                    />

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
                          <strong>Verification Notice:</strong> {msg.analysis.dataDisclaimer}
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Loading */}
            {isLoading && (
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <div className="bg-emerald-600 p-1.5 rounded-lg text-white shadow-sm">
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

        {/* ── Fixed input bar ──────────────────────────────────────────────── */}
        <div className="flex-shrink-0 border-t border-emerald-100 bg-white px-6 py-4 shadow-[0_-2px_12px_-2px_rgba(16,185,129,0.06)]">
          <div className="max-w-5xl mx-auto space-y-2.5">

            {/* Tab row + Image Upload */}
            <div className="flex items-center justify-between">
              <div className="flex gap-1.5">
                <button
                  type="button"
                  onClick={() => setActiveTab('simple')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'simple'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-emerald-50 border border-slate-200'
                  }`}
                >
                  Ask / Describe
                </button>
                <button
                  type="button"
                  onClick={() => setActiveTab('structured')}
                  className={`px-4 py-1.5 rounded-lg text-xs font-semibold transition-all ${
                    activeTab === 'structured'
                      ? 'bg-emerald-600 text-white shadow-sm'
                      : 'text-slate-600 hover:bg-emerald-50 border border-slate-200'
                  }`}
                >
                  Product Form
                </button>
              </div>

              {/* Image Upload button */}
              <button
                type="button"
                onClick={() => imageInputRef.current?.click()}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                  imageFile
                    ? 'border-emerald-400 bg-emerald-50 text-emerald-700'
                    : 'border-slate-200 text-slate-500 hover:bg-slate-50'
                }`}
              >
                <Upload className="w-3.5 h-3.5" />
                {imageFile ? `📷 ${imageFile.name.slice(0, 15)}…` : 'Image Upload'}
              </button>
              <input
                ref={imageInputRef}
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleImageChange}
              />
            </div>

            {/* Input area */}
            {activeTab === 'simple' ? (
              <form onSubmit={handleSubmit} className="flex gap-2 items-end">
                <div className="flex-1">
                  <textarea
                    ref={textareaRef}
                    rows={2}
                    value={inputValue}
                    onChange={(e) => setInputValue(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Ask an eco question or describe a product… (Enter to send)"
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-2xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 bg-white outline-none transition-all placeholder-slate-400 resize-none text-sm leading-relaxed shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={(!inputValue.trim() && !imageFile) || isLoading}
                  className={`flex-shrink-0 flex items-center justify-center w-11 h-11 rounded-2xl shadow-sm transition-all ${
                    (inputValue.trim() || imageFile) && !isLoading
                      ? 'bg-emerald-600 hover:bg-emerald-700 text-white cursor-pointer'
                      : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-2">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <input type="text" placeholder="Product name *" value={prodName}
                    onChange={(e) => setProdName(e.target.value)} disabled={isLoading} required
                    className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 bg-white outline-none text-sm placeholder-slate-400" />
                  <input type="text" placeholder="Category *" value={prodCategory}
                    onChange={(e) => setProdCategory(e.target.value)} disabled={isLoading} required
                    className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 bg-white outline-none text-sm placeholder-slate-400" />
                  <input type="text" placeholder="Material (optional)" value={prodMaterial}
                    onChange={(e) => setProdMaterial(e.target.value)} disabled={isLoading}
                    className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 bg-white outline-none text-sm placeholder-slate-400" />
                  <input type="text" placeholder="Brand (optional)" value={prodBrand}
                    onChange={(e) => setProdBrand(e.target.value)} disabled={isLoading}
                    className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 bg-white outline-none text-sm placeholder-slate-400" />
                  <input type="text" placeholder="Country of manufacture (optional)" value={prodCountry}
                    onChange={(e) => setProdCountry(e.target.value)} disabled={isLoading}
                    className="px-3 py-2 rounded-xl border border-slate-200 focus:ring-2 focus:ring-emerald-400 bg-white outline-none text-sm placeholder-slate-400 md:col-span-2" />
                </div>
                <div className="flex justify-end">
                  <button type="submit"
                    disabled={!prodName.trim() || !prodCategory.trim() || isLoading}
                    className={`flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-sm transition-all ${
                      prodName.trim() && prodCategory.trim() && !isLoading
                        ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                        : 'bg-slate-100 text-slate-400 cursor-not-allowed'
                    }`}>
                    <Sparkles className="w-4 h-4" />
                    Analyze Sustainability
                  </button>
                </div>
              </form>
            )}

            <p className="text-[10px] text-slate-400 text-center">
              EcoPick uses AI to estimate environmental impact. Always verify prices and availability with sellers.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default App;
